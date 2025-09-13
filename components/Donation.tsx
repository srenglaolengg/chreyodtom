
import React from 'react';
import { Language } from '../types';
import { LotusIcon } from './icons/LotusIcon';

interface DonationProps {
  language: Language;
}

const Donation: React.FC<DonationProps> = ({ language }) => {
    const content = {
        en: {
            title: "Support the Pagoda",
            description: "Your generous contributions help maintain the temple, support our monks, and preserve our shared cultural heritage for future generations.",
            button: "Donate Now"
        },
        km: {
            title: "គាំទ្រវត្ត",
            description: "ការរួមចំណែកដ៏សប្បុរសរបស់អ្នកជួយថែរក្សាវត្តអារាម គាំទ្រដល់ព្រះសង្ឃ និងថែរក្សាបេតិកភណ្ឌវប្បធម៌រួមរបស់យើងសម្រាប់មនុស្សជំនាន់ក្រោយ។",
            button: "បរិច្ចាគឥឡូវនេះ"
        }
    }
    const currentContent = content[language];
  return (
    <section id="donation" className="py-20 bg-gradient-to-b from-amber-100/50 to-amber-200/50">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
            <LotusIcon className="w-16 h-16 text-amber-500" />
        </div>
        <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
          {currentContent.title}
        </h2>
        <p className={`max-w-2xl mx-auto text-stone-600 mb-8 ${language === 'km' ? 'font-khmer' : ''}`}>
          {currentContent.description}
        </p>
        <button className={`bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${language === 'km' ? 'font-khmer' : ''}`}>
          {currentContent.button}
        </button>
      </div>
    </section>
  );
};

export default Donation;
