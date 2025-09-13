
import React from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const year = new Date().getFullYear();
  const text = {
      en: `© ${year} Wat Serei Mongkol Hou Chray Ut Dom. All Rights Reserved.`,
      km: `© ${year} វត្តសិរីមង្គលហៅជ្រៃឧត្តម. រក្សាសិទ្ធិគ្រប់យ៉ាង។`
  }
  return (
    <footer className="bg-stone-800 text-stone-300 py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
            <DharmaWheelIcon className="w-6 h-6 text-amber-400"/>
            <p className={`font-semibold text-amber-200 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'វត្តសិរីមង្គលហៅជ្រៃឧត្តម' : 'Wat Serei Mongkol Hou Chray Ut Dom'}
            </p>
        </div>
        <p className={`text-sm text-stone-400 ${language === 'km' ? 'font-khmer' : ''}`}>{text[language]}</p>
      </div>
    </footer>
  );
};

export default Footer;
