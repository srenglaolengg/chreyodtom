import React, { useMemo } from 'react';
import { Language, Teaching } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import CardSkeleton from './skeletons/CardSkeleton';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { useCollection } from '../hooks/useCollection';
// @ts-ignore
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardImage } from './ui/Card';


interface TeachingsProps {
  language: Language;
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

// FIX: Explicitly type `itemVariants` with `Variants` from framer-motion to fix type inference issue.
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

const Teachings: React.FC<TeachingsProps> = ({ language }) => {
    const q = useMemo(() => query(collection(db, "teachings"), orderBy("order", "asc")), []);
    const { data: teachings, loading } = useCollection<Teaching>(q);
    const currentMeta = metaContent[language];

    const content = {
        en: {
            title: 'Buddhist Teachings',
            viewMore: 'Read More'
        },
        km: {
            title: 'ពុទ្ធឱវាទ',
            viewMore: 'អានបន្ថែម'
        }
    }
    const currentContent = content[language];


    return (
        <>
            <PageMeta 
                title={currentMeta.title}
                description={currentMeta.description}
                keywords={currentMeta.keywords}
            />
            <section id="teachings" className="py-20 bg-background dark:bg-card">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center space-x-4">
                            <DharmaWheelIcon className="w-8 h-8 text-primary" />
                            <h2 className={`text-3xl md:text-4xl font-bold text-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.title}
                            </h2>
                            <DharmaWheelIcon className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                     
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      variants={containerVariants}
                      initial="hidden"
                      animate={loading ? "hidden" : "visible"}
                    >
                        {loading ? (
                          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                        ) : (
                          teachings.map((item) => (
                            <motion.div key={item.id} variants={itemVariants}>
                              <Card className="flex flex-col h-full">
                                <CardImage src={item.thumbnailUrl} alt={language === 'km' ? item.title_km : item.title_en} />
                                <CardContent className="flex flex-col flex-grow">
                                  <h3 className={`text-xl font-bold text-card-foreground mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.title_km : item.title_en}</h3>
                                  <p className={`text-foreground/80 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.excerpt_km : item.excerpt_en}</p>
                                  <Link to={`/teachings/${item.id}`} className={`inline-flex items-center space-x-2 mt-4 text-primary font-semibold hover:underline group ${language === 'km' ? 'font-khmer' : ''}`}>
                                    <span>{currentContent.viewMore}</span>
                                    <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
                                  </Link>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))
                        )}
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default Teachings;