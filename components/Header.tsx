import React, { useState, useEffect } from 'react';
import { Language, FirebaseUser } from '../types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth, githubProvider } from '../firebase';

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

  const handleLogin = async () => await auth.signInWithPopup(githubProvider).catch(console.error);
  const handleLogout = async () => await auth.signOut().catch(console.error);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isMenuOpen) setIsMenuOpen(false);
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
    const body = document.body;
    if (isMenuOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'unset';
    }
    return () => { body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLinkClick = () => setIsMenuOpen(false);
  
  const SearchForm: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => (
    <form onSubmit={handleSearchSubmit} style={isMobile ? { width: '100%', marginBottom: '1.5rem' } : {}}>
        <input
            type="search"
            placeholder={language === 'km' ? 'ស្វែងរក...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            aria-label="Search site"
        />
    </form>
  );

  return (
    <>
      <header className="header">
        <div className="container">
          <nav className="header-nav">
            <Link
              to="/"
              className={`header-logo ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {language === 'km' ? 'វត្តសិរីមង្គល' : 'Wat Serei Mongkol'}
            </Link>

            <div className="header-links">
              {currentLinks.map(link => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  className={({ isActive }) => `header-link ${isActive ? 'active' : ''} ${language === 'km' ? 'font-khmer' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="header-actions">
              <SearchForm />
              <button onClick={toggleLanguage} className="btn btn-secondary btn-sm" style={{marginLeft: '1rem'}}>
                {language === 'km' ? 'EN' : 'KM'}
              </button>
              <div style={{marginLeft: '1rem'}}>
                {user ? (
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                ) : (
                    <button onClick={handleLogin} className="btn btn-primary btn-sm">Login</button>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="mobile-menu-button"
              aria-label="Open menu"
            >
              &#9776;
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <button onClick={() => setIsMenuOpen(false)} className="mobile-close-button" aria-label="Close menu">
          &times;
        </button>
        
        <SearchForm isMobile />

        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%'}}>
          {currentLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={({ isActive }) => `header-link ${isActive ? 'active' : ''} ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div style={{ marginTop: 'auto', width: '100%' }}>
          <button onClick={toggleLanguage} className="btn btn-secondary">
            {language === 'km' ? 'Switch to English' : 'ប្តូរទៅជាភាសាខ្មែរ'}
          </button>

          {user ? (
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          ) : (
            <button onClick={handleLogin} className="btn btn-primary">Login with GitHub</button>
          )}
        </div>

      </div>
    </>
  );
};

export default Header;