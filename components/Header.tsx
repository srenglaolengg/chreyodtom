
import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link, useNavigate } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
// FIX: Remove Firebase v9 modular imports.
import { GitHubIcon } from './icons/GitHubIcon';
import { Search as SearchIcon } from 'lucide-react';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, user, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // FIX: Use v8 `signInWithPopup` method from the `auth` object.
      await auth.signInWithPopup(githubProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // FIX: Use v8 `signOut` method from the `auth` object.
      await auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  const navLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Gallery", path: "/gallery" },
      { label: "Events", path: "/events" },
      { label: "Feed", path: "/feed" },
      { label: "Teachings", path: "/teachings" },
      { label: "Comments", path: "/comments" },
      { label: "Contact", path: "/contact" },
      ...(isAdmin ? [{ label: "Admin Panel", path: "/admin" }] : []),
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ព្រះធម៌", path: "/teachings" },
      { label: "មតិយោបល់", path: "/comments" },
      { label: "ទំនាក់ទំនង", path: "/contact" },
      ...(isAdmin ? [{ label: "ផ្ទៃប្រព័ន្ធគ្រប់គ្រង", path: "/admin" }] : []),
    ],
  };

  const currentLinks = language === 'km' ? navLinks.km : navLinks.en;

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-gradient-to-b from-stone-50 to-amber-50/50 fixed w-full top-0 z-50 shadow-sm">
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

            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="search"
                    placeholder={language === 'km' ? 'ស្វែងរក...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-32 md:w-32 bg-stone-100 border border-stone-300 rounded-full py-1 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:w-48 transition-all duration-300"
                    aria-label="Search site"
                />
                <button type="submit" aria-label="Submit search" className="absolute right-0 top-0 mt-1 mr-2 text-stone-500 hover:text-amber-700">
                    <SearchIcon className="w-5 h-5" />
                </button>
            </form>

            <button
              onClick={toggleLanguage}
              className="bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600 transition-colors text-sm"
            >
              {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
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
        <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                  type="search"
                  placeholder={language === 'km' ? 'ស្វែងរក...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-full py-3 px-5 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Search site"
              />
              <button type="submit" aria-label="Submit search" className="absolute right-0 top-0 mt-3 mr-4 text-stone-600 hover:text-amber-700">
                  <SearchIcon className="w-6 h-6" />
              </button>
          </form>

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
