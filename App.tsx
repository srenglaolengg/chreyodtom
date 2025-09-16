import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUserType } from 'firebase/auth';
import { ADMIN_U_IDS } from './constants';
// @ts-ignore
import { AnimatePresence, motion, Transition } from 'framer-motion';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './components/About';
import Gallery from './components/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Events from './components/Events';
import EventDetail from './pages/EventDetail';
import Teachings from './components/Teachings';
import TeachingDetail from './pages/TeachingDetail';
import Feed from './components/Feed';
import Comments from './components/Comments';
import Contact from './components/Contact';
import Admin from './pages/Admin';
import ScrollToTop from './components/ScrollToTop';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(Language.Khmer);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUserType | null) => {
      if (currentUser) {
        const userObj = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
        setUser(userObj);
        setIsAdmin(ADMIN_U_IDS.includes(currentUser.uid));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev =>
      prev === Language.Khmer ? Language.English : Language.Khmer
    );
  };
  
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {!isAdminRoute && (
        <Header
          language={language}
          toggleLanguage={toggleLanguage}
          user={user}
          isAdmin={isAdmin}
        />
      )}
      <main className={`flex-grow ${!isAdminRoute ? 'pt-20' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home language={language} />} />
              <Route path="/about" element={<About language={language} />} />
              <Route path="/gallery" element={<Gallery language={language} />} />
              <Route path="/gallery/:id" element={<GalleryDetail language={language} />} />
              <Route path="/events" element={<Events language={language} />} />
              <Route path="/events/:id" element={<EventDetail language={language} />} />
              <Route path="/teachings" element={<Teachings language={language} />} />
              <Route path="/teachings/:id" element={<TeachingDetail language={language} />} />
              <Route path="/feed" element={<Feed language={language} user={user} isAdmin={isAdmin} />} />
              <Route path="/comments" element={<Comments language={language} user={user} />} />
              <Route path="/contact" element={<Contact language={language} />} />
              <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAdminRoute && <Footer language={language} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;
