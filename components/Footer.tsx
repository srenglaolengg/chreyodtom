import React from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link, useLocation } from 'react-router-dom';
import { FacebookIcon } from './icons/FacebookIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { LocationPinIcon } from './icons/LocationPinIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { EmailIcon } from './icons/EmailIcon';

interface FooterProps {
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const year = new Date().getFullYear();
  const location = useLocation();

  // Sharing functionality
  const siteUrl = window.location.origin + location.pathname;
  const shareText = language === 'km' 
    ? 'សូមទស្សនាគេហទំព័រវត្តសិរីមង្គល' 
    : 'Visit the Wat Serei Mongkol Website';
  const encodedUrl = encodeURIComponent(siteUrl);
  const encodedText = encodeURIComponent(shareText);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  const content = {
    en: {
      about: "A beacon of spiritual heritage and tranquility, serving as a center for Buddhist teachings and cultural preservation.",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      address: "Chray Ut Dom village, Krang Tayong commune, Peam Chor district, Prey Veng province, Cambodia",
      phone: "+855 12 345 678",
      email: "contact@watsereimongkol.org",
      copyright: `© ${year} Wat Serei Mongkol Hou Chray Ut Dom. All Rights Reserved.`,
    },
    km: {
      about: "ជាប្រទីបនៃបេតិកភណ្ឌខាងវិញ្ញាណ និងភាពស្ងប់ស្ងាត់ បម្រើជាមជ្ឈមណ្ឌលអប់រំព្រះពុទ្ធសាសនា និងការអភិរក្សវប្បធម៌។",
      quickLinks: "តំណររហ័ស",
      contactUs: "ទំនាក់ទំនង",
      address: "ភូមិជ្រៃឧត្តម ឃុំក្រាំងតាយ៉ង ស្រុកពាមជរ ខេត្តព្រៃវែង",
      phone: "+៨៥៥ ១២ ៣៤៥ ៦៧៨",
      email: "contact@watsereimongkol.org",
      copyright: `© ${year} វត្តសិរីមង្គលហៅជ្រៃឧត្តម. រក្សាសិទ្ធិគ្រប់យ៉ាង។`,
    }
  };
  
  const currentContent = content[language];

  const navLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Feed", path: "/feed" },
      { label: "Events", path: "/events" },
      { label: "Gallery", path: "/gallery" },
      { label: "Comments", path: "/comments" },
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "មតិយោបល់", path: "/comments" },
    ]
  };
  const currentLinks = navLinks[language];

  return (
    <footer className="bg-amber-50/50 border-t border-amber-200 text-stone-600">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <DharmaWheelIcon className="w-7 h-7 text-amber-600"/>
              <Link to="/" className={`font-bold text-lg text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
              </Link>
            </div>
            <p className={`text-sm ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.about}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold text-amber-800 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.quickLinks}
            </h3>
            <ul className="space-y-2">
              {currentLinks.map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className={`text-sm hover:text-amber-700 hover:underline transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className={`text-lg font-semibold text-amber-800 mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
              {currentContent.contactUs}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start justify-center md:justify-start space-x-3">
                <LocationPinIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className={`${language === 'km' ? 'font-khmer' : ''}`}>{currentContent.address}</span>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <a href={`tel:${content.en.phone}`} className="hover:text-amber-700 hover:underline">{currentContent.phone}</a>
              </li>
              <li className="flex items-center justify-center md:justify-start space-x-3">
                <EmailIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <a href={`mailto:${content.en.email}`} className="hover:text-amber-700 hover:underline">{currentContent.email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between">
          <p className={`text-xs text-stone-500 ${language === 'km' ? 'font-khmer' : ''}`}>
            {currentContent.copyright}
          </p>
          <div className="flex items-center space-x-5 mt-4 sm:mt-0">
            <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-stone-500 hover:text-blue-600 transition-colors">
              <FacebookIcon className="w-6 h-6" />
            </a>
            <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram" className="text-stone-500 hover:text-sky-500 transition-colors">
              <TelegramIcon className="w-6 h-6" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;