
import React from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage }) => {
  const navLinks = {
    en: ["About", "Gallery", "Teachings", "Events", "Feed", "Contact", "Comments"],
    km: ["អំពីវត្ត", "រូបភាព", "ព្រះធម៌", "ពិធីបុណ្យ", "ព័ត៌មាន", "ទំនាក់ទំនង", "មតិយោបល់"]
  };

  const navLinksMap: { [key: string]: string } = {
    "About": "#about",
    "Gallery": "#gallery",
    "Teachings": "#teachings",
    "Events": "#events",
    "Feed": "#feed",
    "Contact": "#contact",
    "Comments": "#comments",
    "អំពីវត្ត": "#about",
    "រូបភាព": "#gallery",
    "ព្រះធម៌": "#teachings",
    "ពិធីបុណ្យ": "#events",
    "ព័ត៌មាន": "#feed",
    "ទំនាក់ទំនង": "#contact",
    "មតិយោបល់": "#comments"
  };

  const currentLinks = navLinks[language];

  return (
    <header className="bg-gradient-to-b from-stone-50 to-amber-50/50 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DharmaWheelIcon className="h-8 w-8 text-amber-600" />
          <span className={`font-bold text-lg text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {currentLinks.map(link => (
            <a key={link} href={navLinksMap[link]} className={`text-stone-600 hover:text-amber-700 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{link}</a>
          ))}
        </div>
        <button
          onClick={toggleLanguage}
          className="bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md text-sm font-semibold"
        >
          {language === Language.Khmer ? 'English' : 'ភាសាខ្មែរ'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
