import React, { useMemo } from 'react';
import { Language, Teaching } from '../types';
import PageMeta from './PageMeta';
import CardSkeleton from './skeletons/CardSkeleton';
import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';

interface TeachingsProps {
  language: Language;
  isHomePage?: boolean;
}

const metaContent = {
  en: {
    title: 'Buddhist Teachings | Wat Serei Mongkol',
    description: 'Explore core Buddhist teachings such as The Four Noble Truths and The Eightfold Path, as shared at Wat Serei Mongkol.',
    keywords: 'Buddhist Teachings, Dharma, Four Noble Truths, Eightfold Path, Metta',
  },
  km: {
    title: 'ព្រះធម៌ | វត្តសិរីមង្គល',
    description: 'ស្វែងយល់ពីគោលคำสอนសំខាន់ៗក្នុងព្រះពុទ្ធសាសនា ដូចជា អរិយសច្ច៤ និងមគ្គ៨ ដែលត្រូវបានចែករំលែកនៅវត្តសិរីមង្គល។',
    keywords: 'ពុទ្ធឱវាទ, ព្រះធម៌, អរិយសច្ច៤, មគ្គ៨, មេត្តា',
  }
};


const Teachings: React.FC<TeachingsProps> = ({ language, isHomePage = false }) => {
    const collectionOptions = useMemo(() => ({
        orderBy: { column: 'order', ascending: true },
        ...(isHomePage && { limit: 3 })
    }), [isHomePage]);

    const { data: teachings, loading } = useCollection<Teaching>('teachings', collectionOptions);
    const currentMeta = metaContent[language];

    const content = {
        en: {
            title: 'Buddhist Teachings',
            viewMore: 'Read More',
            viewAll: 'View All Teachings'
        },
        km: {
            title: 'ពុទ្ធឱវាទ',
            viewMore: 'អានបន្ថែម',
            viewAll: 'មើលព្រះធម៌ទាំងអស់'
        }
    }
    const currentContent = content[language];


    return (
        <>
            {!isHomePage && (
                <PageMeta 
                    title={currentMeta.title}
                    description={currentMeta.description}
                    keywords={currentMeta.keywords}
                />
            )}
            <section id="teachings">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <h2 className={language === 'km' ? 'font-khmer' : ''}>
                            {currentContent.title}
                        </h2>
                    </div>
                     
                    <div className="grid grid-cols-3">
                        {loading ? (
                          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                        ) : (
                          teachings.map((item) => (
                            <div key={item.id} className="card">
                                <img src={item.thumbnailUrl} alt={language === 'km' ? item.title_km : item.title_en} className="card-image"/>
                                <div className="card-content">
                                  <h3 className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? item.title_km : item.title_en}</h3>
                                  <p className={language === 'km' ? 'font-khmer' : ''}>{language === 'km' ? item.excerpt_km : item.excerpt_en}</p>
                                  <Link to={`/teachings/${item.id}`} className={language === 'km' ? 'font-khmer' : ''} style={{ marginTop: 'auto' }}>
                                    {currentContent.viewMore} &rarr;
                                  </Link>
                                </div>
                            </div>
                          ))
                        )}
                    </div>

                    {isHomePage && (
                        <div className="text-center" style={{ marginTop: '3rem' }}>
                            <Link to="/teachings" className={`btn btn-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.viewAll}
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Teachings;