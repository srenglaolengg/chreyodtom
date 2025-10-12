
import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
import { GitHubIcon } from './icons/GitHubIcon';
import { Search as SearchIcon, Menu, X } from 'lucide-react';

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
      await auth.signInWithPopup(githubProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
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
      ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "ព្រះធម៌", path: "/teachings" },
      { label: "មតិយោបល់", path: "/comments" },
      { label: "ទំនាក់ទំនង", path: "/contact" },
      ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
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
      <header className="bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50 border-b border-gray-200">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`font-bold text-lg text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
          >
            {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
          </Link>

          {/* Desktop Links + Auth */}
          <div className="hidden md:flex items-center space-x-6">
            {currentLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-gray-600 hover:text-gray-900 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
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
                    className="w-32 bg-gray-100 border border-gray-300 rounded-md py-1 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:w-40 transition-all duration-300"
                    aria-label="Search site"
                />
                <button type="submit" aria-label="Submit search" className="absolute right-0 top-0 mt-1.5 mr-2.5 text-gray-400 hover:text-gray-800">
                    <SearchIcon className="w-4 h-4" />
                </button>
            </form>

            <button
              onClick={toggleLanguage}
              className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {language === 'km' ? 'EN' : 'KM'}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />}
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="inline-flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm">
                <GitHubIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-gray-800 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 right-0 p-6">
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-800" aria-label="Close menu">
            <X className="h-8 w-8" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <input
                  type="search"
                  placeholder={language === 'km' ? 'ស្វែងរក...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md py-3 px-5 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Search site"
              />
              <button type="submit" aria-label="Submit search" className="absolute right-0 top-0 mt-3 mr-4 text-gray-500 hover:text-gray-800">
                  <SearchIcon className="w-6 h-6" />
              </button>
          </form>

          {currentLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`text-3xl text-gray-800 hover:text-black transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {link.label}
            </Link>
          ))}

            <button
              onClick={toggleLanguage}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-lg font-medium mt-4"
            >
              {language === 'km' ? 'Switch to English' : 'ប្តូរទៅជាភាសាខ្មែរ'}
            </button>

          {user ? (
            <div className="flex items-center space-x-3 mt-4">
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />}
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 text-lg">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="inline-flex items-center space-x-2 bg-gray-900 text-white px-5 py-3 rounded-md hover:bg-gray-700 transition-colors mt-4 text-lg">
              <GitHubIcon className="w-5 h-5" />
              <span>Login with GitHub</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;