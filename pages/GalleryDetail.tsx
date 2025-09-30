import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, GalleryAlbum } from '../types';
import PageMeta from '../components/PageMeta';
import { ArrowLeft } from 'lucide-react';
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
            {/* UI UPGRADE: Standardized vertical padding and background. */}
             <section className="py-20 md:py-28 bg-gray-100">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !album ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-500 mb-4">{error || 'Could not load album.'}</h2>
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

                            <div className="p-6 sm:p-8 md:p-10">
                                <h1 className={`text-3xl md:text-4xl font-bold text-amber-600 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentAlbumTitle}
                                </h1>
                                <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentAlbumContent}
                                </p>
                                
                                <div className="border-t border-gray-200 my-8"></div>
                                
                                <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {language === 'km' ? 'រូបភាពបន្ថែម' : 'Images'}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {album.imageUrls.map((url, index) => (
                                        <div key={index} className="group relative overflow-hidden rounded-lg shadow-md">
                                            <img src={url} alt={`${currentAlbumTitle} - Image ${index + 1}`} className="w-full h-full object-cover aspect-square transform group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors"></div>
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