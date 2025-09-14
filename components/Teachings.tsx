
import React, { useState } from 'react';
import { Language } from '../types';
import { TEACHINGS_DATA } from '../constants';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import PageMeta from './PageMeta';

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

const TeachingItem: React.FC<{ title: string; content: string; isOpen: boolean; onClick: () => void, lang: Language }> = ({ title, content, isOpen, onClick, lang }) => {
    return (
        <div className="border-b border-amber-200">
            <button
                onClick={onClick}
                className="w-full text-left py-4 px-6 flex justify-between items-center hover:bg-amber-100/50 transition-colors"
            >
                <h3 className={`text-lg font-semibold text-amber-800 ${lang === 'km' ? 'font-khmer' : ''}`}>{title}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className={`p-6 bg-white text-stone-600 ${lang === 'km' ? 'font-khmer' : ''}`}>{content}</p>
            </div>
        </div>
    );
};


const Teachings: React.FC<TeachingsProps> = ({ language }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const teachings = TEACHINGS_DATA[language];
    const currentMeta = metaContent[language];

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                                {language === 'km' ? 'ពុទ្ធឱវាទ' : 'Buddhist Teachings'}
                            </h2>
                        </div>
                    </div>
                    <div className="max-w-3xl mx-auto bg-amber-50 rounded-lg shadow-lg overflow-hidden">
                        {teachings.map((item, index) => (
                            <TeachingItem 
                                key={item.id} 
                                title={item.title} 
                                content={item.content}
                                isOpen={openIndex === index}
                                onClick={() => handleToggle(index)}
                                lang={language}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Teachings;