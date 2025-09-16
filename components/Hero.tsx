
import React from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
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
        className="relative h-[90vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden"
      >
        {/* Background Image with Ken Burns Effect */}
        <div 
            className="absolute inset-0 bg-cover bg-center animate-kenburns-top"
            style={{ backgroundImage: "url('https://i.postimg.cc/02xqb4Yy/photo-2025-09-08-23-20-58.jpg')" }}
        ></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 p-8 max-w-4xl mx-auto animate-fade-in-up">
          <div className="flex justify-center mb-6">
              <DharmaWheelIcon className="w-24 h-24 text-yellow-300/90 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
          </div>
          <h1 className="font-khmer text-5xl md:text-7xl font-bold tracking-wide" style={{textShadow: '2px 3px 8px rgba(0,0,0,0.8)'}}>
            វត្តសិរីមង្គលហៅជ្រៃឧត្តម
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light text-yellow-50 max-w-2xl mx-auto" style={{textShadow: '1px 2px 4px rgba(0,0,0,0.7)'}}>
              {currentContent.subtitle}
          </p>
          
          {/* Call to Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/feed"
                className={`w-full sm:w-auto bg-amber-500 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 ${language === 'km' ? 'font-khmer' : ''}`}
              >
                  {currentContent.ctaExplore}
              </Link>
              <Link
                to="/about"
                className={`w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-300 ${language === 'km' ? 'font-khmer' : ''}`}
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