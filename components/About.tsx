import React from 'react';
import { Language, AboutContent } from '../types';
import PageMeta from './PageMeta';
import { useDocument } from '../hooks/useDocument';

interface AboutProps {
  language: Language;
}

const metaContent = {
  en: {
    title: 'About Us | Wat Serei Mongkol',
    description: 'Learn about the history, spiritual heritage, and tranquility of Wat Serei Mongkol Hou Chray Ut Dom, a center for Buddhist teachings and culture in Cambodia.',
    keywords: 'About Wat Serei Mongkol, Pagoda History, Khmer Culture, Buddhist Heritage',
  },
  km: {
    title: 'អំពីវត្ត | វត្តសិរីមង្គល',
    description: 'ស្វែងយល់អំពីប្រវត្តិ បេតិកភណ្ឌខាងវិញ្ញាណ និងភាពស្ងប់ស្ងាត់របស់វត្តសិរីមង្គលហៅជ្រៃឧត្តម ដែលជាមជ្ឈមណ្ឌលសម្រាប់ពុទ្ធឱវាទ និងវប្បធម៌។',
    keywords: 'អំពីវត្តសិរីមង្គល, ប្រវត្តិវត្ត, វប្បធម៌ខ្មែរ, បេតិកភណ្ឌពុទ្ធសាសនា',
  }
};

const About: React.FC<AboutProps> = ({ language }) => {
    const { data: content, loading } = useDocument<AboutContent & { id: string }>('pages', 'about');
    
    const currentContent = {
      title: language === 'km' ? "អំពីវត្តសិរីមង្គល" : "About Wat Serei Mongkol",
      paragraph1: language === 'km' ? content?.paragraph1_km : content?.paragraph1_en,
      paragraph2: language === 'km' ? content?.paragraph2_km : content?.paragraph2_en,
    }
    const currentMeta = metaContent[language];

  return (
    <>
      <PageMeta 
        title={currentMeta.title}
        description={currentMeta.description}
        keywords={currentMeta.keywords}
      />
      <section id="about">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className={language === 'km' ? 'font-khmer' : ''}>
              {currentContent.title}
            </h2>
          </div>
          <div className={`text-center ${language === 'km' ? 'font-khmer' : ''}`} style={{ maxWidth: '800px', margin: '0 auto' }}>
            {loading ? (
                <div>
                  <div className="skeleton" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton" style={{ height: '1rem', width: '80%', marginBottom: '1.5rem' }}></div>
                  <div className="skeleton" style={{ height: '1rem', width: '100%' }}></div>
                </div>
            ) : content ? (
              <>
                <p>{currentContent.paragraph1}</p>
                <p>{currentContent.paragraph2}</p>
              </>
            ) : (
              <p>Content could not be loaded at this time.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;