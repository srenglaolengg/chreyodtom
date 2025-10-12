import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, GalleryAlbum } from '../types';
import PageMeta from '../components/PageMeta';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { useDocument } from '../hooks/useDocument';

const GalleryDetail: React.FC<{ language: Language }> = ({ language }) => {
    const { id } = useParams<{ id: string }>();
    const { data: album, loading, error } = useDocument<GalleryAlbum>('gallery', id!);
    
    const currentAlbumTitle = album ? (language === 'km' ? album.title_km : album.title_en) : '';
    const currentAlbumDescription = album ? (language === 'km' ? album.description_km : album.description_en) : '';
    const currentAlbumContent = album ? (language === 'km' ? album.content_km : album.content_en) : '';

    const meta = {
        en: {
            title: loading ? 'Loading Album...' : `${currentAlbumTitle} | Gallery | Wat Serei Mongkol`,
            description: album ? `Explore photos from the "${currentAlbumTitle}" album. ${currentAlbumDescription}` : 'View photo albums from Wat Serei Mongkol.',
            keywords: `Wat Serei Mongkol, ${currentAlbumTitle}, Pagoda Photos, Buddhist Temple Images, Khmer Architecture`
        },
        km: {
            title: loading ? 'កំពុងផ្ទុក...' : `${currentAlbumTitle} | រូបភាព | វត្តសិរីមង្គល`,
            description: album ? `ទស្សនារូបភាពពីអាល់ប៊ុម «${currentAlbumTitle}»។ ${currentAlbumDescription}` : 'ទស្សនាអាល់ប៊ុមរូបភាពពីវត្តសិរីមង្គល។',
            keywords: `វត្តសិរីមង្គល, ${currentAlbumTitle}, រូបភាពវត្ត, រូបថតវត្តអារាម, ស្ថាបត្យកម្មខ្មែរ`
        }
    }
    const currentMeta = meta[language];

    const content = {
      en: { backLink: "Back to Gallery" },
      km: { backLink: "ត្រឡប់ទៅកម្រងរូបភាព" }
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
                    ) : error || !album ? (
                        <div className="text-center">
                            <h2>{error || 'Could not load album.'}</h2>
                             <Link to="/gallery" className={language === 'km' ? 'font-khmer' : ''}>
                                &larr; {currentContent.backLink}
                            </Link>
                        </div>
                    ) : (
                        <article style={{ maxWidth: '900px', margin: '0 auto' }}>
                             <Link to="/gallery" className={language === 'km' ? 'font-khmer' : ''} style={{ marginBottom: '2rem', display: 'inline-block' }}>
                                &larr; {currentContent.backLink}
                            </Link>

                            <div>
                                <h1 className={language === 'km' ? 'font-khmer' : ''}>
                                    {currentAlbumTitle}
                                </h1>
                                <p className={`prose ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentAlbumContent}
                                </p>
                                
                                <hr style={{ margin: '2rem 0' }}/>
                                
                                <h2 className={language === 'km' ? 'font-khmer' : ''}>
                                    {language === 'km' ? 'រូបភាព' : 'Images'}
                                </h2>
                                <div className="grid grid-cols-3">
                                    {album.imageUrls.map((url, index) => (
                                        <div key={index}>
                                            <img src={url} alt={`${currentAlbumTitle} - Image ${index + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '0.25rem' }}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </section>
        </>
    );
};

export default GalleryDetail;