
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

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  user: FirebaseUser;
}