
import React, { useState, useEffect } from 'react';
import { Language, GalleryImage } from '../types';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface GalleryProps {
  language: Language;
}

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white text-black rounded-full h-10 w-10 flex items-center justify-center text-2xl font-bold"
          aria-label="Close lightbox"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const metaContent = {
  en: {
    title: 'Gallery | Wat Serei Mongkol',
    description: 'Explore the beauty and tranquility of Wat Serei Mongkol through our photo gallery. View images of the pagoda, statues, and serene environment.',
    keywords: 'Pagoda Photos, Buddhist Temple Images, Wat Serei Mongkol Gallery, Khmer Architecture',
  },
  km: {
    title: 'រូបភាព | វត្តសិរីមង្គល',
    description: 'ទស្សនារូបភាពដែលបង្ហាញពីភាពស្រស់ស្អាតនិងភាពស្ងប់ស្ងាត់នៃវត្តសិរីមង្គល។ មើលរូបភាពវត្ត ព្រះពុទ្ធរូប និងបរិយាកាសដ៏ស្ងប់ស្ងាត់។',
    keywords: 'រូបភាពវត្ត, រូបថតវត្តអារាម, វិចិត្រសាលវត្តសិរីមង្គល, ស្ថាបត្យកម្មខ្មែរ',
  }
};

const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const imagesData: GalleryImage[] = [];
        querySnapshot.forEach((doc) => {
            imagesData.push({ id: doc.id, ...doc.data() } as GalleryImage);
        });
        setImages(imagesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching gallery images: ", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const title = language === 'km' ? 'ទស្សនាវត្ត' : 'Pagoda Tour';
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
              {title}
            </h2>
            <p className={`mt-2 text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'ស្វែងយល់ពីភាពស្ងប់ស្ងាត់នៅខាងក្នុង' : 'Explore the tranquility within'}
            </p>
          </div>
          {loading ? (
             <div className="text-center">Loading gallery...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <img src={image.src} alt={image.alt} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-end p-4">
                    <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedImage && <Lightbox src={selectedImage} alt="Enlarged view" onClose={() => setSelectedImage(null)} />}
      </section>
    </>
  );
};

export default Gallery;
