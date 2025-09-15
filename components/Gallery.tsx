
import React, { useState, useEffect } from 'react';
import { Language, GalleryAlbum } from '../types';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

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

const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const albumsData: GalleryAlbum[] = [];
        querySnapshot.forEach((doc) => {
            // FIX: Replaced spread syntax with Object.assign to resolve potential TypeScript type inference issues with Firestore's doc.data().
            albumsData.push(Object.assign({ id: doc.id }, doc.data()) as GalleryAlbum);
        });
        setAlbums(albumsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching gallery albums: ", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
      <section id="gallery" className="py-20 bg-stone-50">
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
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <article key={album.id} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                  <img src={album.thumbnailUrl} alt={language === 'km' ? album.title_km : album.title_en} className="w-full aspect-video object-cover" />
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className={`text-xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.title_km : album.title_en}</h3>
                    <p className={`text-stone-600 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? album.description_km : album.description_en}</p>
                    <Link to={`/gallery/${album.id}`} className={`inline-flex items-center space-x-2 mt-4 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
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

export default Gallery;