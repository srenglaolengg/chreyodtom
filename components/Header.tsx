import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { Link } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { GitHubIcon } from './icons/GitHubIcon';
import { useTheme } from '../contexts/ThemeContext';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={theme === 'dark' ? 'Activate light mode' : 'Activate dark mode'}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, user, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => await signInWithPopup(auth, githubProvider).catch(err => console.error("Login error:", err));
  const handleLogout = async () => await signOut(auth).catch(err => console.error("Logout error:", err));

  const navLinks = {
    en: [
      { label: "About", path: "/about" }, { label: "Gallery", path: "/gallery" }, { label: "Events", path: "/events" },
      { label: "Feed", path: "/feed" }, { label: "Teachings", path: "/teachings" }, { label: "Comments", path: "/comments" },
      { label: "Contact", path: "/contact" }, ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" }, { label: "រូបភាព", path: "/gallery" }, { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព័ត៌មាន", path: "/feed" }, { label: "ព្រះធម៌", path: "/teachings" }, { label: "មតិយោបល់", path: "/comments" },
      { label: "ទំនាក់ទំនង", path: "/contact" }, ...(isAdmin ? [{ label: "គ្រប់គ្រង", path: "/admin" }] : []),
    ],
  };

  const currentLinks = navLinks[language];
  useEffect(() => { document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset'; }, [isMenuOpen]);
  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2" aria-label="Home">
            <DharmaWheelIcon className="h-8 w-8 text-primary" />
            <span className={`font-bold text-lg text-foreground ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {currentLinks.map(link => (
              <Link key={link.path} to={link.path} className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2">
              <button onClick={toggleLanguage} className="text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors">
                {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
              </button>
              {user ? (
                <div className="flex items-center space-x-3 ml-2">
                  {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />}
                  <button onClick={handleLogout} className="text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors">Logout</button>
                </div>
              ) : (
                <button onClick={handleLogin} className="inline-flex items-center justify-center text-sm font-medium h-10 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors">
                  <GitHubIcon className="w-4 h-4 mr-2" /> Login
                </button>
              )}
            </div>
            <ThemeToggle />
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-foreground p-2" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-foreground p-2" aria-label="Close menu">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {currentLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={handleLinkClick} className={`text-3xl text-foreground hover:text-primary transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-8 flex flex-col items-center space-y-6">
                <button onClick={toggleLanguage} className="text-lg font-medium h-12 px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors">
                  {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
                </button>
                {user ? (
                  <div className="flex flex-col items-center space-y-4">
                    {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full" />}
                    <span className="font-semibold text-foreground">{user.displayName}</span>
                    <button onClick={() => { handleLogout(); handleLinkClick(); }} className="text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors">Logout</button>
                  </div>
                ) : (
                  <button onClick={() => { handleLogin(); handleLinkClick(); }} className="inline-flex items-center justify-center text-lg font-medium h-12 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors">
                    <GitHubIcon className="w-5 h-5 mr-2" /> Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
