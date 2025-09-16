import React from 'react';
import { Language, AboutContent } from '../types';
import { LotusIcon } from './icons/LotusIcon';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
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
      {/* Styling Change: Increased vertical padding (py-24) for more breathing room. */}
      <section id="about" className="py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-4">
                <LotusIcon className="w-10 h-10 text-primary/80" />
                <h2 className={`text-4xl md:text-5xl font-bold text-primary ${language === 'km' ? 'font-khmer' : ''}`}>
                  {currentContent.title}
                </h2>
                <DharmaWheelIcon className="w-10 h-10 text-primary/80" />
            </div>
          </div>
          <div className={`max-w-4xl mx-auto text-lg text-foreground/90 leading-relaxed space-y-6 text-center ${language === 'km' ? 'font-khmer' : ''}`}>
            {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-full mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-full mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-4/6 mx-auto"></div>
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
