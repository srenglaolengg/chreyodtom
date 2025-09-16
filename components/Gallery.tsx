import React, { useMemo } from 'react';
import { Language, GalleryAlbum } from '../types';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { useCollection } from '../hooks/useCollection';
// @ts-ignore
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardImage } from './ui/Card';

interface GalleryProps {
  language: Language;
}

const metaContent = {
  en: {
    title: 'Gallery | Wat Serei Mongkol',
    description: 'Explore albums of the beauty and tranquility of Wat Serei Mongkol. View images of the pagoda, statues, and serene environment.',
    keywords: 'Pagoda Photos, Buddhist Temple Images, Wat Serei Mongkol Gallery, Khmer Architecture',
  },
  km: {
    title: 'រូបភាព | វត្តសិរីមង្គល',
    description: 'ទស្សនាអាល់ប៊ុមរូបភាពដែលបង្ហាញពីភាពស្រស់ស្អាតនិងភាពស្ងប់ស្ងាត់នៃវត្តសិរីមង្គល។',
    keywords: 'រូបភាពវត្ត, រូបថតវត្តអារាម, វិចិត្រសាលវត្តសិរីមង្គល, ស្ថាបត្យកម្មខ្មែរ',
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

const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const q = useMemo(() => query(collection(db, "gallery"), orderBy("order", "asc")), []);
  const { data: albums, loading } = useCollection<GalleryAlbum>(q);

  const content = {
    en: {
      title: 'Gallery Albums',
      subtitle: 'Explore the tranquility within',
      viewMore: 'View Album'
    },
    km: {
      title: 'អាល់ប៊ុមរូបភាព',
      subtitle: 'ស្វែងយល់ពីភាពស្ងប់ស្ងាត់នៅខាងក្នុង',
      viewMore: 'មើលអាល់ប៊ុម'
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
      <section id="gallery" className="py-20 bg-background dark:bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold text-primary ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.title}
            </h2>
            <p className={`mt-2 text-foreground/70 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.subtitle}
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={loading ? "hidden" : "visible"}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              albums.map((album) => (
                <motion.div key={album.id} variants={itemVariants}>
                  <Card className="flex flex-col h-full">
                    <CardImage src={album.thumbnailUrl} alt={language === 'km' ? album.title_km : album.title_en} />
                    <CardContent className="flex flex-col flex-grow">
                      <h3 className={`text-xl font-bold text-card-foreground mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.title_km : album.title_en}</h3>
                      <p className={`text-foreground/80 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.description_km : album.description_en}</p>
                      <Link to={`/gallery/${album.id}`} className={`inline-flex items-center space-x-2 mt-4 text-primary font-semibold hover:underline group ${language === 'km' ? 'font-khmer' : ''}`}>
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

export default Gallery;