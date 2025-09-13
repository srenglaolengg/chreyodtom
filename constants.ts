
import { GalleryImage, Teaching, Event, ScheduleItem } from './types';

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: "https://picsum.photos/seed/pagoda1/800/600", alt: "Pagoda interior view with golden statues." },
  { id: 2, src: "https://picsum.photos/seed/pagoda2/800/600", alt: "Elaborate carvings on a temple wall." },
  { id: 3, src: "https://picsum.photos/seed/pagoda3/800/600", alt: "A serene courtyard inside the pagoda." },
  { id: 4, src: "https://picsum.photos/seed/pagoda4/800/600", alt: "Close-up of a Buddha statue." },
  { id: 5, src: "https://picsum.photos/seed/pagoda5/800/600", alt: "Khmer traditional architecture details." },
  { id: 6, src: "https://picsum.photos/seed/pagoda6/800/600", alt: "A peaceful meditation hall." },
];

export const TEACHINGS_DATA: { [key: string]: Teaching[] } = {
  en: [
    { id: 1, title: "The Four Noble Truths", content: "The truth of suffering, the truth of the cause of suffering, the truth of the end of suffering, and the truth of the path that leads to the end of suffering." },
    { id: 2, title: "The Eightfold Path", content: "Right understanding, right thought, right speech, right action, right livelihood, right effort, right mindfulness, and right concentration." },
    { id: 3, title: "Metta (Loving-Kindness)", content: "The practice of benevolence, kindness, and amity. It is one of the ten pāramīs of the Theravāda school of Buddhism." },
    { id: 4, title: "Anicca (Impermanence)", content: "The Buddhist doctrine that all of conditioned existence, without exception, is transient, evanescent, and inconstant." },
  ],
  km: [
    { id: 1, title: "អរិយសច្ច៤", content: "សេចក្តីពិត​នៃ​ទុក្ខ, សេចក្តីពិត​នៃ​ហេតុ​នៃ​ទុក្ខ, សេចក្តីពិត​នៃ​ការ​រំលត់​ទុក្ខ, និង​សេចក្តីពិត​នៃ​ផ្លូវ​ដែល​នាំ​ទៅ​កាន់​ការ​រំលត់​ទុក្ខ។" },
    { id: 2, title: "មគ្គ៨", content: "សម្មាទិដ្ឋិ, សម្មាសំកប្បោ, សម្មា​វាចា, សម្មាកម្មន្តោ, សម្មាអាជីវោ, សម្មាវាយាមោ, សម្មាសតិ, និងសម្មាសមាធិ។" },
    { id: 3, title: "មេត្តា", content: "ការ​ប្រតិបត្តិ​នូវ​សេចក្ដី​សប្បុរស សេចក្ដី​សប្បុរស និង​មិត្តភាព។ វា​គឺ​ជា​បារមី​មួយ​ក្នុង​ចំណោម​បារមី​ទាំង​ដប់​របស់​ពុទ្ធសាសនា​និកាយ​ថេរវាទ។" },
    { id: 4, title: "អនិច្ចំ (អនិច្ច)", content: "គោលលទ្ធិ​ពុទ្ធសាសនា​ដែល​ថា អត្ថិភាព​ដែល​មាន​លក្ខខណ្ឌ​ទាំងអស់​គឺ​ជា​បណ្ដោះអាសន្ន មិន​ស្ថិតស្ថេរ និង​មិន​ស្ថិតស្ថេរ។" },
  ]
};

export const EVENTS_DATA: { [key: string]: Event[] } = {
  en: [
    { id: 1, date: "Pchum Ben", title: "Pchum Ben Festival", description: "A 15-day Cambodian religious festival, culminating in celebrations on the 15th day of the tenth month in the Khmer calendar.", imgSrc: "https://picsum.photos/seed/event1/400/300" },
    { id: 2, date: "Vesak Bochea", title: "Vesak Day", description: "Commemorating the birth, enlightenment, and death of Gautama Buddha.", imgSrc: "https://picsum.photos/seed/event2/400/300" },
    { id: 3, date: "Meak Bochea", title: "Magha Puja Day", description: "An important Buddhist festival celebrated on the full moon day of the third lunar month.", imgSrc: "https://picsum.photos/seed/event3/400/300" },
  ],
  km: [
    { id: 1, date: "ភ្ជុំបិណ្ឌ", title: "ពិធីបុណ្យភ្ជុំបិណ្ឌ", description: "ពិធីបុណ្យ​សាសនា​របស់​កម្ពុជា​មាន​រយៈពេល ១៥​ថ្ងៃ ដែល​បញ្ចប់​ដោយ​ការ​ប្រារព្ធ​នៅ​ថ្ងៃ​ទី ១៥ នៃ​ខែ​ទី ១០ ក្នុង​ប្រតិទិន​ចន្ទគតិ​ខ្មែរ។", imgSrc: "https://picsum.photos/seed/event1/400/300" },
    { id: 2, date: "វិសាខបូជា", title: "ថ្ងៃវិសាខបូជា", description: "រំលឹក​ដល់​ការ​ប្រសូត ការ​ត្រាស់​ដឹង និង​ការ​ចូល​បរិនិព្វាន​របស់​ព្រះ​គោតម​សម្មាសម្ពុទ្ធ។", imgSrc: "https://picsum.photos/seed/event2/400/300" },
    { id: 3, date: "មាឃបូជា", title: "ថ្ងៃមាឃបូជា", description: "ពិធីបុណ្យ​ពុទ្ធសាសនា​ដ៏​សំខាន់​មួយ​ដែល​ប្រារព្ធ​ឡើង​នៅ​ថ្ងៃ​ពេញបូណ៌មី​នៃ​ខែ​ទី​បី​តាម​ច័ន្ទគតិ។", imgSrc: "https://picsum.photos/seed/event3/400/300" },
  ]
};

export const SCHEDULE_DATA: { [key: string]: ScheduleItem[] } = {
    en: [
        { time: "5:00 AM", activity: "Morning Chanting & Meditation" },
        { time: "7:00 AM", activity: "Breakfast for Monks" },
        { time: "11:00 AM", activity: "Lunch Offering" },
        { time: "1:00 PM", activity: "Dharma Study" },
        { time: "5:00 PM", activity: "Evening Chanting & Meditation" },
        { time: "8:00 PM", activity: "Pagoda Closes for Visitors" },
    ],
    km: [
        { time: "៥:០០ ព្រឹក", activity: "សូត្រមន្ត និងសមាធិពេលព្រឹក" },
        { time: "៧:០០ ព្រឹក", activity: "ព្រះសង្ឃឆាន់ពេលព្រឹក" },
        { time: "១១:០០ ព្រឹក", activity: "ប្រគេនចង្ហាន់ថ្ងៃត្រង់" },
        { time: "១:០០ រសៀល", activity: "ធម្មសិក្សា" },
        { time: "៥:០០ ល្ងាច", activity: "សូត្រមន្ត និងសមាធិពេលល្ងាច" },
        { time: "៨:០០ យប់", activity: "វត្តបិទទ្វារសម្រាប់ភ្ញៀវ" },
    ]
};
