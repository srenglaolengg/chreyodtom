
import React from 'react';
import { Language } from '../types';
import { EVENTS_DATA } from '../constants';
import PageMeta from './PageMeta';

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
  const events = EVENTS_DATA[language];
  const title = language === 'km' ? 'ពិធីបុណ្យ' : 'Festivals & Events';
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
              {title}
            </h2>
            <p className={`mt-2 text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'ចូលរួមជាមួយពួកយើងក្នុងការប្រារព្ធពិធី' : 'Join us in celebration'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <article key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
                <img src={event.imgSrc} alt={event.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <p className={`text-sm font-semibold text-amber-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>{event.date}</p>
                  <h3 className={`text-xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{event.title}</h3>
                  <p className={`text-stone-600 ${language === 'km' ? 'font-khmer' : ''}`}>{event.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Events;