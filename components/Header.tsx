import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUserType } from 'firebase/auth';
import { GitHubIcon } from './icons/GitHubIcon';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUserType | null) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation
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
  const currentLinks = language === 'km' ? navLinks.km : navLinks.en;

  // Disable body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-gradient-to-b from-stone-50 to-amber-50/50 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <DharmaWheelIcon className="h-8 w-8 text-amber-600" />
            <Link
              to="/"
              className={`font-bold text-lg text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
            </Link>
          </div>

          {/* Desktop Links + Auth */}
          <div className="hidden md:flex items-center space-x-6">
            {currentLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-stone-600 hover:text-amber-700 ${language === 'km' ? 'font-khmer' : ''}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Login/Logout */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />}
                <span className="font-semibold text-stone-700">{user.displayName}</span>
                <button onClick={handleLogout} className="bg-stone-500 text-white px-3 py-1 rounded-full hover:bg-stone-600 transition-colors text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="inline-flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-900 transition-colors">
                <GitHubIcon className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600 transition-colors text-sm"
            >
              {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-amber-800 focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-stone-50/95 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 right-0 p-6">
          <button onClick={() => setIsMenuOpen(false)} className="text-amber-800" aria-label="Close menu">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {currentLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`text-3xl text-stone-700 hover:text-amber-700 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Login/Logout */}
          {user ? (
            <div className="flex items-center space-x-3 mt-4">
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />}
              <span className="font-semibold text-stone-700">{user.displayName}</span>
              <button onClick={handleLogout} className="bg-stone-500 text-white px-3 py-1 rounded-full hover:bg-stone-600 transition-colors text-sm">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="inline-flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-900 transition-colors mt-4">
              <GitHubIcon className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
