
import React from 'react';
import { Language } from '../types';
import { LotusIcon } from './icons/LotusIcon';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';

interface AboutProps {
  language: Language;
}

const content = {
    en: {
        title: "About Wat Serei Mongkol",
        paragraph1: "Wat Serei Mongkol Hou Chray Ut Dom stands as a beacon of spiritual heritage and tranquility. Nestled in the heart of Prey Veng province, it has served as a center for Buddhist teachings, community gatherings, and cultural preservation for generations.",
        paragraph2: "The pagoda's architecture is a testament to the rich traditions of Khmer craftsmanship, offering a serene environment for meditation, reflection, and the practice of Dharma. It is a sanctuary where the timeless wisdom of the Buddha is shared and cherished."
    },
    km: {
        title: "អំពីវត្តសិរីមង្គល",
        paragraph1: "វត្តសិរីមង្គលហៅជ្រៃឧត្តម គឺជាប beacon នៃបេតិកភណ្ឌខាងវិញ្ញាណ និងភាពស្ងប់ស្ងាត់។ ស្ថិតនៅចំកណ្តាលខេត្តព្រៃវែង វត្តនេះបានបម្រើជាមជ្ឈមណ្ឌលសម្រាប់ការអប់រំ Phật giáo ការជួបជុំសហគមន៍ និងការអភិរក្សវប្បធម៌ជាច្រើនជំនាន់មកហើយ។",
        paragraph2: "ស្ថាបត្យកម្មរបស់វត្ត គឺជាសក្ខីភាពនៃប្រពៃណីដ៏សម្បូរបែបនៃសិប្បកម្មខ្មែរ ដែលផ្តល់នូវបរិយាកាសស្ងប់ស្ងាត់សម្រាប់ការធ្វើសមាធិ ការឆ្លុះបញ្ចាំង និងការប្រតិបត្តិព្រះធម៌។ វាជាទីសក្ការៈបូជាមួយ ដែលប្រាជ្ញាដ៏អស់កល្បរបស់ព្រះពុទ្ធត្រូវបានចែករំលែក និងស្រឡាញ់។"
    }
};

const About: React.FC<AboutProps> = ({ language }) => {
    const currentContent = content[language];
  return (
    <section id="about" className="py-20 bg-amber-50/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-4">
              <LotusIcon className="w-8 h-8 text-amber-500" />
              <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                {currentContent.title}
              </h2>
              <DharmaWheelIcon className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className={`max-w-3xl mx-auto text-lg text-stone-600 leading-relaxed space-y-6 text-center ${language === 'km' ? 'font-khmer' : ''}`}>
          <p>{currentContent.paragraph1}</p>
          <p>{currentContent.paragraph2}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
