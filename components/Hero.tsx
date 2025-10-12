
import React from 'react';
import { Language } from '../types';
import PageMeta from './PageMeta';
import { Link } from 'react-router-dom';

interface HeroProps {
  language: Language;
}

const metaContent = {
  en: {
    title: 'Wat Serei Mongkol | Official Website',
    description: 'Welcome to the official website of Wat Serei Mongkol Hou Chray Ut Dom. Discover our history, teachings, events, and community.',
    keywords: 'Wat Serei Mongkol, Cambodian Pagoda, Buddhism, Prey Veng, Khmer Temple, Buddhist Teachings',
  },
  km: {
    title: 'វត្តសិរីមង្គល | គេហទំព័រផ្លូវការ',
    description: 'សូមស្វាគមន៍មកកាន់គេហទំព័រផ្លូវការរបស់វត្តសិរីមង្គលហៅជ្រៃឧត្តម។ ស្វែងយល់ពីប្រវត្តិ ការបង្រៀន កម្មវិធីបុណ្យ និងសហគមន៍របស់យើង។',
    keywords: 'វត្តសិរីមង្គល, វត្តខ្មែរ, ព្រះពុទ្ធសាសនា, ខេត្តព្រៃវែង, ព្រះធម៌',
  }
};

const Hero: React.FC<HeroProps> = ({ language }) => {
  const currentMeta = metaContent[language];
  
  const content = {
    en: {
      subtitle: 'Chray Ut Dom village, Krang Tayong commune, Peam Chor district, Prey Veng province',
      ctaExplore: 'Explore Feed',
      ctaLearn: 'Learn More'
    },
    km: {
      subtitle: 'ភូមិជ្រៃឧត្តម ឃុំក្រាំងតាយ៉ង ស្រុកពាមជរ ខេត្តព្រៃវែង',
      ctaExplore: 'ព័ត៌មាន',
      ctaLearn: 'អំពីវត្ត'
    }
  };
  const currentContent = content[language];

  return (
    <>
      <PageMeta 
        title={currentMeta.title}
        description={currentMeta.description}
        keywords={currentMeta.keywords}
      />
      <section 
        className="bg-gray-50 flex items-center justify-center text-center"
      >
        <div className="container mx-auto px-6 py-24 md:py-32">
          <h1 className="font-khmer text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
            វត្តសិរីមង្គលហៅជ្រៃឧត្តម
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {currentContent.subtitle}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/feed"
                className={`w-full sm:w-auto bg-gray-900 text-white font-semibold text-base px-6 py-3 rounded-md shadow-sm hover:bg-gray-700 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
              >
                  {currentContent.ctaExplore}
              </Link>
              <Link
                to="/about"
                className={`w-full sm:w-auto bg-white border border-gray-300 text-gray-800 font-semibold text-base px-6 py-3 rounded-md shadow-sm hover:bg-gray-100 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
              >
                  {currentContent.ctaLearn}
              </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;