import React, { useMemo } from 'react';
import { Language, GalleryAlbum } from '../types';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';
import CardSkeleton from './skeletons/CardSkeleton';
import { useCollection } from '../hooks/useCollection';

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
      <section id="gallery" style={{ backgroundColor: 'var(--surface-color)' }}>
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
              albums.map((album) => (
                <div key={album.id} className="card">
                    <div className="card-image-wrapper">
                      <img src={album.thumbnailUrl} alt={language === 'km' ? album.title_km : album.title_en} className="card-image" />
                    </div>
                    <div className="card-content">
                      <h3 className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? album.title_km : album.title_en}</h3>
                      <p className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? album.description_km : album.description_en}</p>
                      <Link to={`/gallery/${album.id}`} className={`font-khmer`} style={{ marginTop: 'auto' }}>
                        {currentContent.viewMore} &rarr;
                      </Link>
                    </div>
                </div>
              ))
            )}
          </div>

          {isHomePage && (
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link to="/gallery" className={`btn btn-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                {currentContent.viewAll}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Gallery;