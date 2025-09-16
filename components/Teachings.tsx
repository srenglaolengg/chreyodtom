import React, { useMemo } from 'react';
import { Language, Teaching } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import PageMeta from './PageMeta';
// import { db } from '../firebase'; // Removed Firestore
// import { collection, query, orderBy, limit, QueryConstraint } from 'firebase/firestore'; // Removed Firestore
import CardSkeleton from './skeletons/CardSkeleton';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { useCollection } from '../hooks/useCollection';
// @ts-ignore
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardImage } from './ui/Card';


interface TeachingsProps {
  language: Language;
  isHomePage?: boolean; // BUGFIX/UPGRADE: Added prop to control content for homepage view
}

const metaContent = {
  en: {
    title: 'Buddhist Teachings | Wat Serei Mongkol',
    description: 'Explore core Buddhist teachings such as The Four Noble Truths and The Eightfold Path, as shared at Wat Serei Mongkol.',
    keywords: 'Buddhist Teachings, Dharma, Four Noble Truths, Eightfold Path, Metta',
  },
  km: {
    title: 'ព្រះធម៌ | វត្តសិរីមង្គល',
    description: 'ស្វែងយល់ពីគោលคำสอนសំខាន់ៗក្នុងព្រះពុទ្ធសាសនា ដូចជា អរិយសច្ច៤ និងមគ្គ៨ ដែលត្រូវបានចែករំលែកនៅវត្តសិរីមង្គល។',
    keywords: 'ពុទ្ធឱវាទ, ព្រះធម៌, អរិយសច្ច៤, មគ្គ៨, មេត្តា',
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

const Teachings: React.FC<TeachingsProps> = ({ language, isHomePage = false }) => {
    // UPGRADE: Conditionally limit the number of teachings fetched for the homepage.
    // This now uses the refactored useCollection hook for Supabase.
    const collectionOptions = useMemo(() => ({
        orderBy: { column: 'order', ascending: true },
        ...(isHomePage && { limit: 3 })
    }), [isHomePage]);

    const { data: teachings, loading } = useCollection<Teaching>('teachings', collectionOptions);
    const currentMeta = metaContent[language];

    const content = {
        en: {
            title: 'Buddhist Teachings',
            viewMore: 'Read More',
            viewAll: 'View All Teachings'
        },
        km: {
            title: 'ពុទ្ធឱវាទ',
            viewMore: 'អានបន្ថែម',
            viewAll: 'មើលព្រះធម៌ទាំងអស់'
        }
    }
    const currentContent = content[language];


    return (
        <>
            {/* Only render PageMeta on the dedicated teachings page */}
            {!isHomePage && (
                <PageMeta 
                    title={currentMeta.title}
                    description={currentMeta.description}
                    keywords={currentMeta.keywords}
                />
            )}
            {/* UI UPGRADE: Standardized vertical padding for consistent spacing. */}
            <section id="teachings" className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center space-x-4">
                            <DharmaWheelIcon className="w-10 h-10 text-amber-600" />
                            <h2 className={`text-4xl md:text-5xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.title}
                            </h2>
                            <DharmaWheelIcon className="w-10 h-10 text-amber-600" />
                        </div>
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
                          teachings.map((item) => (
                            <motion.div key={item.id} variants={itemVariants} className="flex">
                              {/* The Card component uses enhanced styling from components/ui/Card.tsx */}
                              <Card className="flex flex-col h-full w-full group">
                                <CardImage src={item.thumbnailUrl} alt={language === 'km' ? item.title_km : item.title_en} />
                                <CardContent className="flex flex-col flex-grow">
                                  <h3 className={`text-xl font-bold text-gray-900 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.title_km : item.title_en}</h3>
                                  <p className={`text-gray-500 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.excerpt_km : item.excerpt_en}</p>
                                  <Link to={`/teachings/${item.id}`} className={`inline-flex items-center space-x-2 mt-4 text-amber-600 font-semibold hover:underline group ${language === 'km' ? 'font-khmer' : ''}`}>
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
                            <Link to="/teachings" className={`inline-flex items-center space-x-2 bg-amber-600 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-amber-700 transform hover:scale-105 transition-all duration-300 ${language === 'km' ? 'font-khmer' : ''}`}>
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

export default Teachings;