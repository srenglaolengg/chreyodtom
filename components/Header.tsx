import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { GitHubIcon } from './icons/GitHubIcon';
import { LogIn, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="bg-secondary/50 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, user, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      {/* Styling Change: Upgraded header to a semi-transparent, blurred background ("glassmorphism") for a modern look. */}
      {/* Increased height with h-20 for a more substantial feel. */}
      <header className="bg-background/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-border/80">
        <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <DharmaWheelIcon className="h-9 w-9 text-primary" />
            <Link
              to="/"
              className={`font-bold text-xl text-foreground ${language === 'km' ? 'font-khmer' : ''}`}
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
                className={`text-muted-foreground hover:text-primary transition-colors font-medium ${language === 'km' ? 'font-khmer' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="w-px h-6 bg-border mx-2"></div>

            <ThemeToggleButton />

            <button
              onClick={toggleLanguage}
              className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full hover:bg-secondary transition-colors text-sm font-semibold"
            >
              {language === 'km' ? 'EN' : 'ខ្មែរ'}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-primary/50" />}
                <button onClick={handleLogout} className="bg-secondary/50 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="inline-flex items-center space-x-2 bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/80 transition-colors font-semibold">
                <GitHubIcon className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggleButton />
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-foreground focus:outline-none p-2"
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
        className={`fixed inset-0 z-[60] bg-background/90 backdrop-blur-md transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 right-0 p-6">
          <button onClick={() => setIsMenuOpen(false)} className="text-foreground" aria-label="Close menu">
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
              className={`text-3xl text-foreground/80 hover:text-primary transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-8 flex flex-col items-center gap-6">
            <button
              onClick={toggleLanguage}
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded-full hover:bg-secondary/80 transition-colors text-lg font-semibold"
            >
              {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full border-2 border-primary/50" />}
                <span className="font-semibold text-foreground text-lg">{user.displayName}</span>
                <button onClick={handleLogout} className="bg-secondary/50 text-secondary-foreground p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Logout">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="inline-flex items-center space-x-3 bg-foreground text-background px-6 py-3 rounded-full hover:bg-foreground/80 transition-colors font-semibold">
                <GitHubIcon className="w-6 h-6" />
                <span className="text-lg">Login with GitHub</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
