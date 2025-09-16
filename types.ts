

// import { Timestamp } from 'firebase/firestore'; // Removed Firestore-specific type

export enum Language {
  Khmer = 'km',
  English = 'en',
}

export interface GalleryAlbum {
  id: string;
  order: number;
  title_en: string;
  title_km: string;
  description_en: string; // Excerpt
  description_km: string;
  content_en: string; // Full content
  content_km: string;
  thumbnailUrl: string;
  imageUrls: string[];
}

export interface Teaching {
  id: string;
  order: number;
  title_en: string;
  content_en: string;
  title_km: string;
  content_km: string;
  excerpt_en: string;
  excerpt_km: string;
  thumbnailUrl: string;
  imageUrls?: string[];
}

export interface Event {
  id: string;
  order: number;
  imgSrc: string; // This is the thumbnail
  date_en: string;
  title_en: string;
  description_en: string; // This is the excerpt
  content_en: string; // Full content
  date_km: string;
  title_km: string;
  description_km: string; // This is the excerpt
  content_km: string; // Full content
  imageUrls?: string[];
}

export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string; // Changed from Firestore Timestamp to string
  user: FirebaseUser;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string; // Changed from Firestore Timestamp to string
  imageUrl?: string;
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