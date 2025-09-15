
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Event as EventType } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import PageMeta from '../components/PageMeta';
import { ArrowLeft, Calendar } from 'lucide-react';
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


const EventDetail: React.FC<{ language: Language }> = ({ language }) => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Event ID is missing.');
            setLoading(false);
            return;
        }
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, "events", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // FIX: Replaced spread syntax with Object.assign to resolve potential TypeScript type inference issues with Firestore's doc.data().
                    setEvent(Object.assign({ id: docSnap.id }, docSnap.data()) as EventType);
                } else {
                    setError("Event not found.");
                }
            } catch(e) {
                console.error("Error fetching document:", e);
                setError("Failed to fetch event data.");
            }
            setLoading(false);
        };
        fetchEvent();
    }, [id]);
    
    const currentEventTitle = event ? (language === 'km' ? event.title_km : event.title_en) : '';
    const currentEventContent = event ? (language === 'km' ? event.content_km : event.content_en) : '';
    const currentEventDate = event ? (language === 'km' ? event.date_km : event.date_en) : '';


    const content = {
      en: { backLink: "Back to Events" },
      km: { backLink: "ត្រឡប់ទៅពិធីបុណ្យ" }
    }
    const currentContent = content[language];
    
    return (
        <>
            <PageMeta 
                title={loading ? 'Loading...' : `${currentEventTitle} | Wat Serei Mongkol`}
                description={event ? (language === 'km' ? event.description_km : event.description_en) : ''}
            />
             <section className="py-20 bg-stone-50">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !event ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Could not load event.'}</h2>
                             <Link to="/events" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentContent.backLink}</span>
                            </Link>
                        </div>
                    ) : (
                        <article className="max-w-4xl mx-auto">
                             <Link to="/events" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline mb-8 ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentContent.backLink}</span>
                            </Link>

                            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg">
                                <img src={event.imgSrc} alt={currentEventTitle} className="w-full aspect-video object-cover rounded-lg mb-6" />

                                <div className="flex items-center space-x-3 text-amber-700 mb-4">
                                    <Calendar className="w-5 h-5" />
                                    <p className={`font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>{currentEventDate}</p>
                                </div>

                                <h1 className={`text-3xl md:text-4xl font-bold text-amber-800 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentEventTitle}
                                </h1>
                                <p className={`text-stone-600 leading-relaxed whitespace-pre-line ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentEventContent}
                                </p>
                                
                                {event.imageUrls && event.imageUrls.length > 0 && (
                                    <>
                                        <div className="border-t border-amber-200 my-8"></div>
                                        <h2 className={`text-2xl font-bold text-stone-700 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? 'រូបភាពបន្ថែម' : 'More Images'}
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.imageUrls.map((url, index) => (
                                                <div key={index} className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer" onClick={() => setSelectedImage(url)}>
                                                    <img src={url} alt={`${currentEventTitle} - Image ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </article>
                    )}
                </div>
            </section>
            {selectedImage && <Lightbox src={selectedImage} alt="Enlarged view" onClose={() => setSelectedImage(null)} />}
        </>
    );
};

export default EventDetail;