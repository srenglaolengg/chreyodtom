import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link } from 'react-router-dom';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Gallery", path: "/gallery" },
      { label: "Events", path: "/events" },
      { label: "Feed", path: "/feed" },
      { label: "Teachings", path: "/teachings" },
      { label: "Comments", path: "/comments" },
      { label: "Contact", path: "/contact" },
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ព្រះធម៌", path: "/teachings" },
      { label: "មតិយោបល់", path: "/comments" },
      { label: "ទំនាក់ទំនង", path: "/contact" },
    ],
  };

  const currentLinks = language === Language.Khmer ? navLinks.km : navLinks.en;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-gradient-to-b from-stone-50 to-amber-50/50 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <DharmaWheelIcon className="h-8 w-8 text-amber-600" />
            <Link
              to="/"
              className={`font-bold text-lg text-amber-800 ${
                language === Language.Khmer ? 'font-khmer' : ''
              }`}
            >
              {language === Language.Khmer ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-stone-600 hover:text-amber-700 transition-colors ${
                  language === Language.Khmer ? 'font-khmer' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md text-sm font-semibold"
            >
              {language === Language.Khmer ? 'English' : 'ភាសាខ្មែរ'}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-amber-800 focus:outline-none"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-stone-50/95 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 right-0 p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-amber-800"
            aria-label="Close menu"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {currentLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`text-3xl text-stone-700 hover:text-amber-700 transition-colors ${
                language === Language.Khmer ? 'font-khmer' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;