import React, { useState, useEffect, Fragment } from 'react';
import { Language, FirebaseUser } from '../types';
import { DharmaWheelIcon } from './icons/DharmaWheelIcon';
import { NavLink, Link } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { GitHubIcon } from './icons/GitHubIcon';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, LogIn, Languages } from 'lucide-react';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10"></div>; // Placeholder to prevent layout shift

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Toggle theme"
    >
      <Sun className={`h-6 w-6 transform transition-all duration-500 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-6 w-6 transform transition-all duration-500 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, user, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => await signInWithPopup(auth, githubProvider).catch(err => console.error(err));
  const handleLogout = async () => await signOut(auth).catch(err => console.error(err));

  const navLinks = {
    en: [
      { label: "About", path: "/about" },
      { label: "Gallery", path: "/gallery" },
      { label: "Events", path: "/events" },
      { label: "Teachings", path: "/teachings" },
      { label: "Feed", path: "/feed" },
      { label: "Comments", path: "/comments" },
      { label: "Contact", path: "/contact" },
      ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
    ],
    km: [
      { label: "អំពីវត្ត", path: "/about" },
      { label: "រូបភាព", path: "/gallery" },
      { label: "ពិធីបុណ្យ", path: "/events" },
      { label: "ព្រះធម៌", path: "/teachings" },
      { label: "ព័ត៌មាន", path: "/feed" },
      { label: "មតិយោបល់", path: "/comments" },
      { label: "ទំនាក់ទំនង", path: "/contact" },
      ...(isAdmin ? [{ label: "គ្រប់គ្រង", path: "/admin" }] : []),
    ],
  };

  const currentLinks = navLinks[language];

  const handleLinkClick = () => setIsMenuOpen(false);
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:text-primary ${
      isActive ? 'text-primary after:scale-x-100' : 'text-foreground/70'
    } ${language === 'km' ? 'font-khmer' : ''}`;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <DharmaWheelIcon className="h-8 w-8 text-primary" />
            <span className={`text-xl font-bold text-foreground ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {currentLinks.map(link => (
              <NavLink key={link.path} to={link.path} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <button
              onClick={toggleLanguage}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Toggle language"
            >
              <Languages className="h-5 w-5" />
            </button>

            <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
            
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="group relative">
                  <button className="flex items-center gap-2">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="h-9 w-9 rounded-full border-2 border-border" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 origin-top-right scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                    <div className="rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="p-2">
                        <div className="flex items-center gap-3 px-2 py-2">
                          <UserIcon className="h-5 w-5 text-foreground/70" />
                          <span className="truncate text-sm font-semibold text-card-foreground">{user.displayName}</span>
                        </div>
                        <div className="my-1 h-px bg-border" />
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-red-500 hover:bg-primary/10">
                           <LogOut className="h-5 w-5" />
                           <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={handleLogin} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
                  <GitHubIcon className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground/70 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm lg:hidden transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 h-full w-full max-w-xs bg-card shadow-xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex h-20 items-center justify-between border-b border-border px-4">
              <span className="font-semibold text-card-foreground">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="h-10 w-10 inline-flex items-center justify-center rounded-md" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4">
              {currentLinks.map(link => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  onClick={handleLinkClick}
                  className={({ isActive }) => `rounded-md px-3 py-3 text-base font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-card-foreground/80 hover:bg-primary/10'} ${language === 'km' ? 'font-khmer' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="my-4 h-px bg-border" />
              <div className="px-3">
                {user ? (
                   <div className="space-y-3">
                     <div className="flex items-center gap-3">
                       <img src={user.photoURL || ''} alt={user.displayName || ''} className="h-10 w-10 rounded-full" />
                       <span className="truncate font-semibold">{user.displayName}</span>
                     </div>
                     <button onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-secondary/20 px-4 py-2 font-semibold text-secondary transition-colors hover:bg-secondary/30">
                       <LogOut className="h-5 w-5" />
                       Logout
                     </button>
                   </div>
                ) : (
                   <button onClick={handleLogin} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
                     <GitHubIcon className="h-5 w-5" />
                     <span>Login with GitHub</span>
                   </button>
                )}
              </div>
              <div className="mt-6 flex items-center justify-center gap-4">
                <span className="text-sm font-medium">Toggle Language</span>
                <button
                  onClick={toggleLanguage}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-label="Toggle language"
                >
                  <Languages className="h-5 w-5" />
                </button>
              </div>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;