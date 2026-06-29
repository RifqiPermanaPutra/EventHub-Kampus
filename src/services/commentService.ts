/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { Comment } from '../types';

export const commentService = {
  async getComments(eventId: string) {
    try {
      const path = `events/${eventId}/comments`;
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'comments');
      return [];
    }
  },

  async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>) {
    try {
      const path = `events/${commentData.eventId}/comments`;
      const docRef = await addDoc(collection(db, path), {
        ...commentData,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  },

  subscribe(eventId: string, callback: (comments: Comment[]) => void) {
    const path = `events/${eventId}/comments`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      callback(comments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
