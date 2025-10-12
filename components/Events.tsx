import React, { useMemo } from 'react';
import { Language, Event } from '../types';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { useCollection } from '../hooks/useCollection';

interface EventsProps {
  language: Language;
  isHomePage?: boolean;
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


const Events: React.FC<EventsProps> = ({ language, isHomePage = false }) => {
  const collectionOptions = useMemo(() => ({
    orderBy: { column: 'order', ascending: true },
    ...(isHomePage && { limit: 3 })
  }), [isHomePage]);

  const { data: events, loading } = useCollection<Event>('events', collectionOptions);

  const content = {
    en: {
      title: 'Festivals & Events',
      subtitle: 'Join us in celebration',
      viewMore: 'Learn More',
      viewAll: 'View All Events'
    },
    km: {
      title: 'ពិធីបុណ្យ',
      subtitle: 'ចូលរួមជាមួយពួកយើងក្នុងការប្រារព្ធពិធី',
      viewMore: 'មើលបន្ថែម',
      viewAll: 'មើលពិធីបុណ្យទាំងអស់'
    }
  }

  const currentContent = content[language];
  const currentMeta = metaContent[language];

  return (
    <>
      {!isHomePage && (
          <PageMeta 
              title={currentMeta.title}
              description={currentMeta.description}
              keywords={currentMeta.keywords}
          />
      )}
      <section id="events" style={{ backgroundColor: 'var(--surface-color)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className={language === 'km' ? 'font-khmer' : ''}>
              {currentContent.title}
            </h2>
            <p className={language === 'km' ? 'font-khmer' : ''}>
              {currentContent.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              events.map((event) => (
                <div key={event.id} className="card">
                    <img src={event.imgSrc} alt={language === 'km' ? event.title_km : event.title_en} className="card-image"/>
                    <div className="card-content">
                      <p className={language === 'km' ? 'font-khmer' : ''} style={{ fontSize: '0.9rem', color: 'var(--text-muted)'}}>{language === 'km' ? event.date_km : event.date_en}</p>
                      <h3 className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? event.title_km : event.title_en}</h3>
                      <p className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? event.description_km : event.description_en}</p>
                      <Link to={`/events/${event.id}`} className={language === 'km' ? 'font-khmer' : ''} style={{ marginTop: 'auto' }}>
                        {currentContent.viewMore} &rarr;
                      </Link>
                    </div>
                </div>
              ))
            )}
          </div>

          {isHomePage && (
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link to="/events" className={`btn btn-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                <span>{currentContent.viewAll}</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;