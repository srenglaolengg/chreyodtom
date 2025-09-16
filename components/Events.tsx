import React, { useMemo } from 'react';
import { Language, Event } from '../types';
import PageMeta from './PageMeta';
// import { db } from '../firebase'; // Removed Firestore
// import { collection, query, orderBy, limit, QueryConstraint } from 'firebase/firestore'; // Removed Firestore
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { useCollection } from '../hooks/useCollection';
// @ts-ignore
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardImage } from './ui/Card';

interface EventsProps {
  language: Language;
  isHomePage?: boolean; // BUGFIX/UPGRADE: Added prop to control content for homepage view
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const Events: React.FC<EventsProps> = ({ language, isHomePage = false }) => {
  // UPGRADE: Conditionally limit the number of events fetched for the homepage.
  // This now uses the refactored useCollection hook for Supabase.
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
      {/* Only render PageMeta on the dedicated events page */}
      {!isHomePage && (
          <PageMeta 
              title={currentMeta.title}
              description={currentMeta.description}
              keywords={currentMeta.keywords}
          />
      )}
      {/* UI UPGRADE: Standardized vertical padding and background for consistent design. */}
      <section id="events" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.title}
            </h2>
            <p className={`mt-4 text-lg text-gray-500 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.subtitle}
            </p>
          </div>
          
          <motion.div 
            // UI UPGRADE: Increased grid gap for better visual separation.
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={loading ? "hidden" : "visible"}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              events.map((event) => (
                <motion.div key={event.id} variants={itemVariants} className="flex">
                  {/* The Card component uses enhanced styling from components/ui/Card.tsx */}
                  <Card className="flex flex-col h-full w-full group">
                    <CardImage src={event.imgSrc} alt={language === 'km' ? event.title_km : event.title_en} />
                    <CardContent className="flex flex-col flex-grow">
                      <p className={`text-sm font-semibold text-amber-600/90 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.date_km : event.date_en}</p>
                      <h3 className={`text-xl font-bold text-gray-900 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.title_km : event.title_en}</h3>
                      <p className={`text-gray-500 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? event.description_km : event.description_en}</p>
                      <Link to={`/events/${event.id}`} className={`inline-flex items-center space-x-2 mt-4 text-amber-600 font-semibold hover:underline group ${language === 'km' ? 'font-khmer' : ''}`}>
                        <span>{currentContent.viewMore}</span>
                        <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* UPGRADE: Conditionally render a "View All" button for the homepage section */}
          {isHomePage && (
            <div className="text-center mt-16">
              <Link to="/events" className={`inline-flex items-center space-x-2 bg-amber-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-amber-700 transform hover:scale-105 transition-all duration-300 ${language === 'km' ? 'font-khmer' : ''}`}>
                <span>{currentContent.viewAll}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;