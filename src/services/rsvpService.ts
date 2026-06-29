/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { RSVP } from '../types';

export const rsvpService = {
  async rsvpToEvent(rsvpData: Omit<RSVP, 'id' | 'createdAt'>) {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        ...rsvpData,
        createdAt: timestamp,
        status: 'registered' as const,
      };

      // Save to subcollection for event-level queries
      const path = `events/${rsvpData.eventId}/rsvps`;
      await addDoc(collection(db, path), dataWithTimestamp);

      // Also save to top-level rsvps collection for user-level queries
      const docRef = await addDoc(collection(db, 'rsvps'), dataWithTimestamp);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rsvps');
    }
  },

  async getRSVPsForEvent(eventId: string) {
    try {
      const path = `events/${eventId}/rsvps`;
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'rsvps');
      return [];
    }
  },

  async getRSVPsForUser(userId: string) {
    try {
      // Query the top-level rsvps collection (no collectionGroup index needed)
      // Removed orderBy to avoid requiring a composite index in Firestore
      const q = query(
        collection(db, 'rsvps'), 
        where('userId', '==', userId)
      );
      
      let topLevelRsvps: RSVP[] = [];
      try {
        const snapshot = await getDocs(q);
        topLevelRsvps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
      } catch (err) {
        console.warn("Top level rsvps query failed, falling back to scanning all events", err);
      }
      
      if (topLevelRsvps.length > 0) {
        return topLevelRsvps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // FALLBACK for older RSVPs (before top-level collection was added): 
      // scan all events manually since collectionGroup requires an index
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      let oldRsvps: RSVP[] = [];
      for (const eventDoc of eventsSnapshot.docs) {
        const rsvpsPath = `events/${eventDoc.id}/rsvps`;
        const rsvpsQuery = query(collection(db, rsvpsPath), where('userId', '==', userId));
        
        try {
          const rsvpsSnapshot = await getDocs(rsvpsQuery);
          rsvpsSnapshot.forEach(doc => {
            oldRsvps.push({ id: doc.id, ...doc.data() } as RSVP);
          });
        } catch (subErr) {
          console.warn(`Failed to fetch RSVPs for event ${eventDoc.id}`, subErr);
        }
      }
      
      return oldRsvps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'rsvps user query');
      return [];
    }
  },

  async checkUserRSVP(eventId: string, userId: string) {
    try {
      const path = `events/${eventId}/rsvps`;
      const q = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking RSVP:", error);
      return false;
    }
  },

  async cancelRSVP(eventId: string, userId: string) {
    try {
      // 1. Delete from event subcollection
      const subPath = `events/${eventId}/rsvps`;
      const subQ = query(collection(db, subPath), where('userId', '==', userId));
      const subSnap = await getDocs(subQ);
      await Promise.all(subSnap.docs.map((document) =>
        deleteDoc(doc(db, subPath, document.id))
      ));

      // 2. Delete from top-level collection
      const topQ = query(collection(db, 'rsvps'), where('eventId', '==', eventId), where('userId', '==', userId));
      const topSnap = await getDocs(topQ);
      await Promise.all(topSnap.docs.map((document) =>
        deleteDoc(doc(db, 'rsvps', document.id))
      ));

      return true;
    } catch (error) {
      console.error("Error canceling RSVP:", error);
      return false;
    }
  },

  async checkInRSVP(eventId: string, rsvpId: string) {
    try {
      // We don't necessarily know if rsvpId is the subcollection ID or top-level ID.
      // Wait, getRSVPsForEvent returns the subcollection document ID.
      // getRSVPsForUser returns the top-level document ID.
      // So checking in by scanning a ticket means we get the top-level rsvpId OR the subcollection rsvpId.
      // To be safe, we query by eventId and userId.
      
      // Let's get the RSVP doc first to find the userId
      // First try top-level
      let rsvpDocRef = doc(db, 'rsvps', rsvpId);
      let rsvpDoc = await getDocs(query(collection(db, 'rsvps'), where('__name__', '==', rsvpId)));
      let userId = '';
      
      if (!rsvpDoc.empty) {
        userId = rsvpDoc.docs[0].data().userId;
      } else {
        // Try subcollection
        const subPath = `events/${eventId}/rsvps`;
        const subDoc = await getDocs(query(collection(db, subPath), where('__name__', '==', rsvpId)));
        if (!subDoc.empty) {
          userId = subDoc.docs[0].data().userId;
        }
      }

      if (!userId) {
        throw new Error("RSVP not found");
      }

      // Update in subcollection
      const subPath = `events/${eventId}/rsvps`;
      const subQ = query(collection(db, subPath), where('userId', '==', userId));
      const subSnap = await getDocs(subQ);
      await Promise.all(subSnap.docs.map((document) =>
        updateDoc(doc(db, subPath, document.id), { status: 'checked-in' })
      ));

      // Update in top-level collection
      const topQ = query(collection(db, 'rsvps'), where('eventId', '==', eventId), where('userId', '==', userId));
      const topSnap = await getDocs(topQ);
      await Promise.all(topSnap.docs.map((document) =>
        updateDoc(doc(db, 'rsvps', document.id), { status: 'checked-in' })
      ));

      return true;
    } catch (error) {
      console.error("Error checking in RSVP:", error);
      throw error;
    }
  }
};
