
import { Timestamp } from 'firebase/firestore';

export enum Language {
  Khmer = 'km',
  English = 'en',
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  order?: number;
}

export interface Teaching {
  id: string;
  order: number;
  title_en: string;
  content_en: string;
  title_km: string;
  content_km: string;
}

export interface Event {
  id: string;
  order: number;
  imgSrc: string;
  date_en: string;
  title_en: string;
  description_en: string;
  date_km: string;
  title_km: string;
  description_km: string;
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

export interface Schedule {
  time: string;
  activity: string;
}

export interface AboutContent {
  paragraph1_en: string;
  paragraph2_en: string;
  paragraph1_km: string;
  paragraph2_km: string;
}

export interface ContactInfo {
  address_en: string;
  address_km: string;
  phone: string;
  email: string;
}
