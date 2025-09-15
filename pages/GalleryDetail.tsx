
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, GalleryAlbum } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import PageMeta from '../components/PageMeta';
import { ArrowLeft } from 'lucide-react';
import PostSkeleton from '../components/skeletons/PostSkeleton';

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


const GalleryDetail: React.FC<{ language: Language }> = ({ language }) => {
    const { id } = useParams<{ id: string }>();
    const [album, setAlbum] = useState<GalleryAlbum | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Album ID is missing.');
            setLoading(false);
            return;
        }
        const fetchAlbum = async () => {
            try {
                const docRef = doc(db, "gallery", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // FIX: Replaced spread syntax with Object.assign to resolve potential TypeScript type inference issues with Firestore's doc.data().
                    setAlbum(Object.assign({ id: docSnap.id }, docSnap.data()) as GalleryAlbum);
                } else {
                    setError("Album not found.");
                }
            } catch(e) {
                console.error("Error fetching document:", e);
                setError("Failed to fetch album data.");
            }
            setLoading(false);
        };
        fetchAlbum();
    }, [id]);
    
    const currentAlbumTitle = album ? (language === 'km' ? album.title_km : album.title_en) : '';
    const currentAlbumContent = album ? (language === 'km' ? album.content_km : album.content_en) : '';

    const content = {
      en: { backLink: "Back to Gallery" },
      km: { backLink: "ត្រឡប់ទៅកម្រងរូបភាព" }
    }
    const currentContent = content[language];
    
    return (
        <>
            <PageMeta 
                title={loading ? 'Loading...' : `${currentAlbumTitle} | Wat Serei Mongkol`}
                description={album ? (language === 'km' ? album.description_km : album.description_en) : ''}
            />
             <section className="py-20 bg-amber-50/30">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !album ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Could not load album.'}</h2>
                             <Link to="/gallery" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentContent.backLink}</span>
                            </Link>
                        </div>
                    ) : (
                        <article className="max-w-4xl mx-auto">
                             <Link to="/gallery" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline mb-8 ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentContent.backLink}</span>
                            </Link>

                            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg">
                                <h1 className={`text-3xl md:text-4xl font-bold text-amber-800 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentAlbumTitle}
                                </h1>
                                <p className={`text-stone-600 leading-relaxed whitespace-pre-line ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentAlbumContent}
                                </p>
                                
                                <div className="border-t border-amber-200 my-8"></div>
                                
                                <h2 className={`text-2xl font-bold text-stone-700 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {language === 'km' ? 'រូបភាពបន្ថែម' : 'Images'}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {album.imageUrls.map((url, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer" onClick={() => setSelectedImage(url)}>
                                            <img src={url} alt={`${currentAlbumTitle} - Image ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </section>
            {selectedImage && <Lightbox src={selectedImage} alt="Enlarged view" onClose={() => setSelectedImage(null)} />}
        </>
    );
};

export default GalleryDetail;