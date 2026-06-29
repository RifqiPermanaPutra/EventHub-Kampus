import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(userId: string) {
    try {
      const path = `users/${userId}/notifications`;
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
      return [];
    }
  },

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    try {
      const path = `users/${notification.userId}/notifications`;
      await addDoc(collection(db, path), {
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  },

  async markAsRead(userId: string, notificationId: string) {
    try {
      const docRef = doc(db, `users/${userId}/notifications`, notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const path = `users/${userId}/notifications`;
      const q = query(collection(db, path), where('isRead', '==', false));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.update(doc(db, path, document.id), { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  subscribe(userId: string, callback: (notifications: Notification[]) => void) {
    const path = `users/${userId}/notifications`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      callback(notifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
