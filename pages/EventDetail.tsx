import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Event as EventType } from '../types';
import PageMeta from '../components/PageMeta';
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
             <section>
                <div className="container">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !event ? (
                        <div className="text-center">
                            <h2>{error || 'Could not load event.'}</h2>
                             <Link to="/events" className={language === 'km' ? 'font-khmer' : ''}>
                                &larr; {currentContent.backLink}
                            </Link>
                        </div>
                    ) : (
                        <article style={{ maxWidth: '900px', margin: '0 auto' }}>
                             <Link to="/events" className={language === 'km' ? 'font-khmer' : ''} style={{ marginBottom: '2rem', display: 'inline-block' }}>
                                &larr; {currentContent.backLink}
                            </Link>

                            <div>
                                <img src={event.imgSrc} alt={currentEventTitle} style={{ width: '100%', height: 'auto', borderRadius: '0.25rem', marginBottom: '1.5rem' }}/>

                                <p className={language === 'km' ? 'font-khmer' : ''} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{currentEventDate}</p>
                                
                                <h1 className={language === 'km' ? 'font-khmer' : ''}>
                                    {currentEventTitle}
                                </h1>
                                <p className={`prose ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentEventContent}
                                </p>
                                
                                {event.imageUrls && event.imageUrls.length > 0 && (
                                    <>
                                        <hr style={{ margin: '2rem 0' }}/>
                                        <h2 className={language === 'km' ? 'font-khmer' : ''}>
                                            {language === 'km' ? 'រូបភាពបន្ថែម' : 'More Images'}
                                        </h2>
                                        <div className="grid grid-cols-3">
                                            {event.imageUrls.map((url, index) => (
                                                <div key={index}>
                                                    <img src={url} alt={`${currentEventTitle} - Image ${index + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '0.25rem' }}/>
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