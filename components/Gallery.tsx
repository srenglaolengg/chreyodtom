
import React, { useState } from 'react';
import { Language } from '../types';
import { GALLERY_IMAGES } from '../constants';

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
        >
          &times;
        </button>
      </div>
    </div>
  );
};

const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const title = language === 'km' ? 'ទស្សនាវត្ត' : 'Pagoda Tour';

  return (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
              onClick={() => setSelectedImage(image.src)}
            >
              <img src={image.src} alt={image.alt} className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
            </div>
          ))}
        </div>
      </div>
      {selectedImage && <Lightbox src={selectedImage} alt="Enlarged view" onClose={() => setSelectedImage(null)} />}
    </section>
  );
};

export default Gallery;
