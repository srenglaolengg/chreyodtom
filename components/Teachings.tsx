
import React, { useState, useEffect } from 'react';
import { Language, Teaching } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import PageMeta from './PageMeta';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import CardSkeleton from './skeletons/CardSkeleton';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface TeachingsProps {
  language: Language;
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

const Teachings: React.FC<TeachingsProps> = ({ language }) => {
    const [teachings, setTeachings] = useState<Teaching[]>([]);
    const [loading, setLoading] = useState(true);
    const currentMeta = metaContent[language];

    useEffect(() => {
        const q = query(collection(db, "teachings"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const teachingsData: Teaching[] = [];
            querySnapshot.forEach((doc) => {
                teachingsData.push({ id: doc.id, ...doc.data() } as Teaching);
            });
            setTeachings(teachingsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const content = {
        en: {
            title: 'Buddhist Teachings',
            viewMore: 'Read More'
        },
        km: {
            title: 'ពុទ្ធឱវាទ',
            viewMore: 'អានបន្ថែម'
        }
    }
    const currentContent = content[language];


    return (
        <>
            <PageMeta 
                title={currentMeta.title}
                description={currentMeta.description}
                keywords={currentMeta.keywords}
            />
            <section id="teachings" className="py-20 bg-amber-50/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center space-x-4">
                            <DharmaWheelIcon className="w-8 h-8 text-amber-500" />
                            <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                                {currentContent.title}
                            </h2>
                        </div>
                    </div>
                     {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teachings.map((item) => (
                               <article key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                  <img src={item.thumbnailUrl} alt={language === 'km' ? item.title_km : item.title_en} className="w-full aspect-video object-cover bg-amber-100" />
                                  <div className="p-6 flex flex-col flex-grow">
                                    <h3 className={`text-xl font-bold text-stone-800 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.title_km : item.title_en}</h3>
                                    <p className={`text-stone-600 line-clamp-3 flex-grow ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? item.excerpt_km : item.excerpt_en}</p>
                                    <Link to={`/teachings/${item.id}`} className={`inline-flex items-center space-x-2 mt-4 text-amber-600 font-semibold hover:underline ${language === 'km' ? 'font-khmer' : ''}`}>
                                      <span>{currentContent.viewMore}</span>
                                      <ArrowRightIcon className="w-5 h-5"/>
                                    </Link>
                                  </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Teachings;
