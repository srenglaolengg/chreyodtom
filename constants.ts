
import { Schedule } from './types';

// Add the Firebase UIDs of authorized admin users here.
// You can get a user's UID after they log in from the Firebase Authentication console.
export const ADMIN_U_IDS = ['cy7nCO3gFnPXCuZ8pGrGYNvWx2B3', 'another-admin-uid'];

// Data for Gallery, Teachings, and Events has been migrated to Firestore
// to be managed by the Admin Dashboard.

// FIX: Add SCHEDULE_DATA to resolve import error in Schedule.tsx.
export const SCHEDULE_DATA: { [key: string]: Schedule[] } = {
  en: [
    { time: "5:00 AM", activity: "Morning Chanting & Meditation" },
    { time: "7:00 AM", activity: "Breakfast" },
    { time: "9:00 AM", activity: "Dharma Talk" },
    { time: "11:00 AM", activity: "Lunch" },
    { time: "1:00 PM", activity: "Walking Meditation" },
    { time: "3:00 PM", activity: "Pagoda Chores" },
    { time: "5:00 PM", activity: "Evening Chanting & Meditation" },
    { time: "7:00 PM", activity: "Personal Practice & Rest" },
  ],
  km: [
    { time: "៥:០០ ព្រឹក", activity: "សូត្រមន្ត និងសមាធិពេលព្រឹក" },
    { time: "៧:០០ ព្រឹក", activity: "អាហារពេលព្រឹក" },
    { time: "៩:០០ ព្រឹក", activity: "ធម្មទេសនា" },
    { time: "១១:០០ ព្រឹក", activity: "អាហារថ្ងៃត្រង់" },
    { time: "១:០០ រសៀល", activity: "ដើរសមាធិ" },
    { time: "៣:០០ រសៀល", activity: "កិច្ចការវត្ត" },
    { time: "៥:០០ ល្ងាច", activity: "សូត្រមន្ត និងសមាធិពេលល្ងាច" },
    { time: "៧:០០ យប់", activity: "ការប្រតិបត្តិផ្ទាល់ខ្លួន និងសម្រាក" },
  ]
};
