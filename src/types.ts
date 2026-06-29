/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'panitia' | 'mahasiswa';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  bio?: string;
  // Mahasiswa fields
  npm?: string;
  fakultas?: string;
  jurusan?: string;
  angkatan?: string;
  // Panitia fields
  organisasi?: string;
  jabatan?: string;
  noTelepon?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  posterUrl?: string;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  createdAt: string;
  capacity?: number;
}

export interface RSVP {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  createdAt: string;
  status?: 'registered' | 'checked-in';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
