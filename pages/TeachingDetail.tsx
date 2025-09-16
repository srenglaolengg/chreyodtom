import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Language, Teaching } from '../types';
import PageMeta from '../components/PageMeta';
import { ArrowLeft } from 'lucide-react';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { DharmaWheelIcon } from '../components/icons/DharmaWheelIcon';
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
             {/* UI UPGRADE: Standardized vertical padding and background. */}
             <section className="py-20 md:py-28 bg-gray-100">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <PostSkeleton />
                    ) : error || !teaching ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-500 mb-4">{error || 'Could not load teaching.'}</h2>
                             <Link to="/teachings" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentLangContent.backLink}</span>
                            </Link>
                        </div>
                    ) : (
                        <article className="max-w-4xl mx-auto">
                             <Link to="/teachings" className={`inline-flex items-center space-x-2 text-amber-600 font-semibold hover:underline mb-8 ${language === 'km' ? 'font-khmer' : ''}`}>
                                <ArrowLeft className="w-5 h-5"/>
                                <span>{currentLangContent.backLink}</span>
                            </Link>

                            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg border border-gray-200">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center space-x-4">
                                        <DharmaWheelIcon className="w-8 h-8 text-amber-600" />
                                        <h1 className={`text-3xl md:text-4xl font-bold text-amber-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                                            {currentTitle}
                                        </h1>
                                        <DharmaWheelIcon className="w-8 h-8 text-amber-600" />
                                    </div>
                                </div>

                                <p className={`text-lg text-gray-700 leading-relaxed whitespace-pre-line ${language === 'km' ? 'font-khmer' : ''}`}>
                                    {currentContent}
                                </p>
                                
                                {teaching.imageUrls && teaching.imageUrls.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-200 my-8"></div>
                                        <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                                            {language === 'km' ? 'រូបភាពបន្ថែម' : 'Related Images'}
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {teaching.imageUrls.map((url, index) => (
                                                <div key={index} className="group relative overflow-hidden rounded-lg shadow-md">
                                                    <img src={url} alt={`${currentTitle} - Image ${index + 1}`} className="w-full h-full object-cover aspect-square transform group-hover:scale-110 transition-transform duration-500" />
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

export default TeachingDetail;