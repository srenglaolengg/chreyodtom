import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Event as EventType } from '../types';
import PageMeta from '../components/PageMeta';
import { ArrowLeft, Calendar } from 'lucide-react';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { useDocument } from '../hooks/useDocument';

const EventDetail: React.FC<{ language: Language }> = ({ language }) => {
    const { id } = useParams<{ id: string }>();
    const { data: event, loading, error } = useDocument<EventType>('events', id!);
    
    const currentEventTitle = event ? (language === 'km' ? event.title_km : event.title_en) : '';
    const currentEventDescription = event ? (language === 'km' ? event.description_km : event.description_en) : '';
    const currentEventContent = event ? (language === 'km' ? event.content_km : event.content_en) : '';
    const currentEventDate = event ? (language === 'km' ? event.date_km : event.date_en) : '';

    const meta = {
        en: {
            title: loading ? 'Loading Event...' : `${currentEventTitle} | Events | Wat Serei Mongkol`,
            description: event ? `Details about the ${currentEventTitle} festival. ${currentEventDescription}` : 'Upcoming events and festivals at Wat Serei Mongkol.',
            keywords: `Wat Serei Mongkol, ${currentEventTitle}, Buddhist Festivals, Pagoda Events, Cambodian Holidays, ${currentEventDate}`
        },
        km: {
            title: loading ? 'កំពុងផ្ទុក...' : `${currentEventTitle} | ពិធីបុណ្យ | វត្តសិរីមង្គល`,
            description: event ? `ព័ត៌មានលម្អិតអំពីពិធីបុណ្យ ${currentEventTitle}។ ${currentEventDescription}` : 'ពិធីបុណ្យនាពេលខាងមុខនៅវត្តសិរីមង្គល។',
            keywords: `វត្តសិរីមង្គល, ${currentEventTitle}, ពិធីបុណ្យសាសនា, កម្មវិធីបុណ្យ, បុណ្យជាតិខ្មែរ, ${currentEventDate}`
        }
    }
    const currentMeta = meta[language];

    const content = {
      en: { backLink: "Back to Events" },
      km: { backLink: "ត្រឡប់ទៅពិធីបុណ្យ" }
    }
    const currentContent = content[language];
    
    return (
        <>
            <PageMeta 
                title={currentMeta.title}
                description={currentMeta.description}
                keywords={currentMeta.keywords}
            />
             {/* UI UPGRADE: Standardized vertical padding and background. */}
             <section className="py-20 md:py-28 bg-gray-100">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !event ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-500 mb-4">{error || 'Could not load event.'}</h2>
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

                            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg border border-gray-200">
                                <img src={event.imgSrc} alt={currentEventTitle} className="w-full aspect-video object-cover rounded-lg mb-6" />

                                <div className="flex items-center space-x-3 text-amber-600 mb-4">
                                    <Calendar className="w-5 h-5" />
                                    <p className={`font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>{currentEventDate}</p>
                                </div>

                                <h1 className={`text-3xl md:text-4xl font-bold text-amber-600 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentEventTitle}
                                </h1>
                                <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentEventContent}
                                </p>
                                
                                {event.imageUrls && event.imageUrls.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-200 my-8"></div>
                                        <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? 'រូបភាពបន្ថែម' : 'More Images'}
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {event.imageUrls.map((url, index) => (
                                                <div key={index} className="group relative overflow-hidden rounded-lg shadow-md">
                                                    <img src={url} alt={`${currentEventTitle} - Image ${index + 1}`} className="w-full h-full object-cover aspect-square transform group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors"></div>
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
        </>
    );
};

export default EventDetail;