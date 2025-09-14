import React from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link } from 'react-router-dom';

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const year = new Date().getFullYear();

  const text = {
    en: `© ${year} Wat Serei Mongkol Hou Chray Ut Dom. All Rights Reserved.`,
    km: `© ${year} វត្តសិរីមង្គលហៅជ្រៃឧត្តម. រក្សាសិទ្ធិគ្រប់យ៉ាង។`
  };

  const quickLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Gallery", path: "/gallery" },
      { label: "Teachings", path: "/teachings" },
      { label: "Events", path: "/events" },
      { label: "Feed", path: "/feed" },
      { label: "Contact", path: "/contact" },
      { label: "Comments", path: "/comments" },
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "វិចិត្រសាល", path: "/gallery" },
      { label: "ទេសនា", path: "/teachings" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ទំនាក់ទំនង", path: "/contact" },
      { label: "មតិយោបល់", path: "/comments" },
    ]
  };

  const currentLinks = language === 'km' ? quickLinks.km : quickLinks.en;

  return (
    <footer className="bg-stone-800 text-stone-300 py-8">
      <div className="container mx-auto px-6 text-center">
        {/* Logo + Title */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <DharmaWheelIcon className="w-6 h-6 text-amber-400"/>
          <p className={`font-semibold text-amber-200 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'វត្តសិរីមង្គលហៅជ្រៃឧត្តម' : 'Wat Serei Mongkol Hou Chray Ut Dom'}
          </p>
        </div>

        {/* Quick Links (always horizontal / wrap on mobile) */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {currentLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className={`text-sm text-stone-400 ${language === 'km' ? 'font-khmer' : ''}`}>
          {text[language]}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
