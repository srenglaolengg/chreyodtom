
import React, { useState, useEffect } from 'react';
import { Language, Event } from '../types';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface EventsProps {
  language: Language;
}

const metaContent = {
  en: {
    title: 'Events & Festivals | Wat Serei Mongkol',
    description: 'Stay updated on upcoming events, ceremonies, and festivals at Wat Serei Mongkol, including Pchum Ben, Vesak Bochea, and Meak Bochea.',
    keywords: 'Buddhist Festivals, Pagoda Events, Pchum Ben, Vesak Bochea, Cambodian Holidays',
  },
  km: {
    title: 'ពិធីបុណ្យ | វត្តសិរីមង្គល',
    description: 'តាមដានព័ត៌មានអំពីពិធីបុណ្យ និងកម្មវិធីនានាដែលនឹងប្រព្រឹត្តទៅនៅក្នុងវត្តសិរីមង្គល រួមមាន បុណ្យភ្ជុំបិណ្ឌ វិសាខបូជា និងមាឃបូជា។',
    keywords: 'ពិធីបុណ្យសាសនា, កម្មវិធីបុណ្យ, ភ្ជុំបិណ្ឌ, វិសាខបូជា, បុណ្យជាតិខ្មែរ',
  }
};

const Events: React.FC<EventsProps> = ({ language }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData: Event[] = [];
        querySnapshot.forEach((doc) => {
            // FIX: Replaced spread syntax with Object.assign to resolve potential TypeScript type inference issues with Firestore's doc.data().
            eventsData.push(Object.assign({ id: doc.id }, doc.data()) as Event);
        });
        setEvents(eventsData);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const content = {
    en: {
      title: 'Festivals & Events',
      subtitle: 'Join us in celebration',
      viewMore: 'Learn More'
    },
    km: {
      title: 'ពិធីបុណ្យ',
      subtitle: 'ចូលរួមជាមួយពួកយើងក្នុងការប្រារព្ធពិធី',
      viewMore: 'មើលបន្ថែម'
    }
  }

  const currentContent = content[language];
  const currentMeta = metaContent[language];

  return (
    <>
      <PageMeta 
        title={currentMeta.title}
        description={currentMeta.description}
        keywords={currentMeta.keywords}
      />
      <section id="events" className="py-20 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.title}
            </h2>
            <p className={`mt-2 text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.subtitle}
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <article key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                  <img src={event.imgSrc} alt={language === 'km' ? event.title_km : event.title_en} className="w-full aspect-video object-cover" />
                  <div className="p-6 flex flex-col flex-grow">
                    <p className={`text-sm font-semibold text-amber-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.date_km : event.date_en}</p>
                    <h3 className={`text-xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.title_km : event.title_en}</h3>
                    <p className={`text-stone-600 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.description_km : event.description_en}</p>
                    <Link to={`/events/${event.id}`} className={`inline-flex items-center space-x-2 mt-4 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
                      <span>{currentContent.viewMore}</span>
                      <ArrowRightIcon className="w-5 h-5"/>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;