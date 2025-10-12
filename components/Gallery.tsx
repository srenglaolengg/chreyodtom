import React, { useMemo } from 'react';
import { Language, GalleryAlbum } from '../types';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { useCollection } from '../hooks/useCollection';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardImage } from './ui/Card';

interface GalleryProps {
  language: Language;
  isHomePage?: boolean;
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

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 1, 0.5, 1]
    },
  },
};

const Gallery: React.FC<GalleryProps> = ({ language, isHomePage = false }) => {
  const collectionOptions = useMemo(() => ({
    orderBy: { column: 'order', ascending: true },
    ...(isHomePage && { limit: 3 })
  }), [isHomePage]);
  
  const { data: albums, loading } = useCollection<GalleryAlbum>('gallery', collectionOptions);

  const content = {
    en: {
      title: 'Gallery Albums',
      subtitle: 'Explore the tranquility within',
      viewMore: 'View Album',
      viewAll: 'View All Albums'
    },
    km: {
      title: 'អាល់ប៊ុមរូបភាព',
      subtitle: 'ស្វែងយល់ពីភាពស្ងប់ស្ងាត់នៅខាងក្នុង',
      viewMore: 'មើលអាល់ប៊ុម',
      viewAll: 'មើលអាល់ប៊ុមទាំងអស់'
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
      <motion.section 
        id="gallery" 
        className="py-20 md:py-28 bg-gray-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.title}
            </h2>
            <p className={`mt-4 text-lg text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>
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
                <motion.div key={album.id} variants={itemVariants} className="flex">
                  <Card className="flex flex-col h-full w-full group">
                    <CardImage src={album.thumbnailUrl} alt={language === 'km' ? album.title_km : album.title_en} />
                    <CardContent className="flex flex-col flex-grow">
                      <h3 className={`text-xl font-bold text-gray-900 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.title_km : album.title_en}</h3>
                      <p className={`text-gray-600 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.description_km : album.description_en}</p>
                      <Link to={`/gallery/${album.id}`} className={`inline-flex items-center space-x-2 mt-4 text-gray-800 font-semibold hover:underline group ${language === 'km' ? 'font-khmer' : ''}`}>
                        <span>{currentContent.viewMore}</span>
                        <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {isHomePage && (
            <div className="text-center mt-16">
              <Link to="/gallery" className={`inline-flex items-center space-x-2 bg-gray-900 text-white font-semibold text-base px-6 py-3 rounded-md shadow-sm hover:bg-gray-700 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                <span>{currentContent.viewAll}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </motion.section>
    </>
  );
};

export default Gallery;