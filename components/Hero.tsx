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
      subtitle: 'A sanctuary of peace and spiritual heritage in Prey Veng, Cambodia.',
      ctaExplore: 'Explore Feed',
      ctaLearn: 'Learn More'
    },
    km: {
      subtitle: 'ដែនជម្រកនៃសន្តិភាព និងបេតិកភណ្ឌខាងវិញ្ញាណនៅខេត្តព្រៃវែង។',
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
      <section className="hero-section">
        <div className="container">
          <h1 className="font-khmer">
            វត្តសិរីមង្គលហៅជ្រៃឧត្តម
          </h1>
          <p>
              {currentContent.subtitle}
          </p>
          
          <div style={{ marginTop: '2rem' }}>
              <Link 
                to="/feed"
                className={`btn btn-primary ${language === 'km' ? 'font-khmer' : ''}`}
              >
                  {currentContent.ctaExplore}
              </Link>
              <Link
                to="/about"
                className={`btn btn-secondary ${language === 'km' ? 'font-khmer' : ''}`}
                style={{ marginLeft: '1rem' }}
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