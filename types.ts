
import { Timestamp } from 'firebase/firestore';

export enum Language {
  Khmer = 'km',
  English = 'en',
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

export interface Teaching {
  id: number;
  title: string;
  content: string;
}

export interface Event {
  id: number;
  date: string;
  title: string;
  description: string;
  imgSrc: string;
}

export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: Timestamp; // Firestore Timestamp
  user: FirebaseUser;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Timestamp; // Firestore Timestamp
  imageUrl?: string;
}

// FIX: Add Schedule interface for type safety.
export interface Schedule {
  time: string;
  activity: string;
}
