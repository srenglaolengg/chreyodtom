import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Teaching } from '../types';
import PageMeta from '../components/PageMeta';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { useDocument } from '../hooks/useDocument';

const TeachingDetail: React.FC<{ language: Language }> = ({ language }) => {
    const { id } = useParams<{ id: string }>();
    const { data: teaching, loading, error } = useDocument<Teaching>('teachings', id!);

    const currentTitle = teaching ? (language === 'km' ? teaching.title_km : teaching.title_en) : '';
    const currentExcerpt = teaching ? (language === 'km' ? teaching.excerpt_km : teaching.excerpt_en) : '';
    const currentContent = teaching ? (language === 'km' ? teaching.content_km : teaching.content_en) : '';

    const meta = {
        en: {
            title: loading ? 'Loading Teaching...' : `${currentTitle} | Teachings | Wat Serei Mongkol`,
            description: teaching ? `Learn about the Dharma teaching on "${currentTitle}". ${currentExcerpt}` : 'Explore Buddhist teachings from Wat Serei Mongkol.',
            keywords: `Wat Serei Mongkol, ${currentTitle}, Buddhist Teachings, Dharma, Four Noble Truths, Eightfold Path, Khmer Buddhism`
        },
        km: {
            title: loading ? 'កំពុងផ្ទុក...' : `${currentTitle} | ព្រះធម៌ | វត្តសិរីមង្គល`,
            description: teaching ? `ស្វែងយល់អំពីព្រះធម៌ទេសនា «${currentTitle}»។ ${currentExcerpt}` : 'ស្វែងយល់ពីឱវាទព្រះពុទ្ធសាសនានៅវត្តសិរីមង្គល។',
            keywords: `វត្តសិរីមង្គល, ${currentTitle}, ពុទ្ធឱវាទ, ព្រះធម៌, អរិយសច្ច៤, មគ្គ៨, ពុទ្ធសាសនាខ្មែរ`
        }
    }
    const currentMeta = meta[language];

    const content = {
      en: { backLink: "Back to Teachings" },
      km: { backLink: "ត្រឡប់ទៅព្រះធម៌" }
    }
    const currentLangContent = content[language];
    
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
                    ) : error || !teaching ? (
                        <div className="text-center">
                            <h2>{error || 'Could not load teaching.'}</h2>
                             <Link to="/teachings" className={language === 'km' ? 'font-khmer' : ''}>
                                &larr; {currentLangContent.backLink}
                            </Link>
                        </div>
                    ) : (
                        <article style={{ maxWidth: '900px', margin: '0 auto' }}>
                             <Link to="/teachings" className={language === 'km' ? 'font-khmer' : ''} style={{ marginBottom: '2rem', display: 'inline-block' }}>
                                &larr; {currentLangContent.backLink}
                            </Link>

                            <div className="text-center" style={{ marginBottom: '2rem' }}>
                                <h1 className={language === 'km' ? 'font-khmer' : ''}>
                                    {currentTitle}
                                </h1>
                            </div>

                            <p className={`prose ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent}
                            </p>
                            
                            {teaching.imageUrls && teaching.imageUrls.length > 0 && (
                                <>
                                    <hr style={{ margin: '2rem 0' }}/>
                                    <h2 className={language === 'km' ? 'font-khmer' : ''}>
                                        {language === 'km' ? 'រូបភាពបន្ថែម' : 'Related Images'}
                                    </h2>
                                    <div className="grid grid-cols-3">
                                        {teaching.imageUrls.map((url, index) => (
                                            <div key={index}>
                                                <img src={url} alt={`${currentTitle} - Image ${index + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '0.25rem' }}/>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </article>
                    )}
                </div>
            </section>
        </>
    );
};

export default TeachingDetail;