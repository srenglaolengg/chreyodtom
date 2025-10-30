import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';
import { Language, FirebaseUser } from './types';
import { ADMIN_U_IDS } from './constants';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import About from './components/About';
import Gallery from './components/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Events from './components/Events';
import EventDetail from './pages/EventDetail';
import Feed from './components/Feed';
import Teachings from './components/Teachings';
import TeachingDetail from './pages/TeachingDetail';
import Comments from './components/Comments';
import Contact from './components/Contact';
import Admin from './pages/Admin';
import Search from './pages/Search';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.English);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const toggleLanguage = () => {
    setLanguage(prev => prev === Language.English ? Language.Khmer : Language.English);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const { uid, displayName, photoURL } = firebaseUser;
        const currentUser = { uid, displayName, photoURL };
        setUser(currentUser);
        setIsAdmin(ADMIN_U_IDS.includes(uid));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Header language={language} toggleLanguage={toggleLanguage} user={user} isAdmin={isAdmin} />
      <main>
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/about" element={<About language={language} />} />
          <Route path="/gallery" element={<Gallery language={language} />} />
          <Route path="/gallery/:id" element={<GalleryDetail language={language} />} />
          <Route path="/events" element={<Events language={language} />} />
          <Route path="/events/:id" element={<EventDetail language={language} />} />
          <Route path="/feed" element={<Feed language={language} user={user} isAdmin={isAdmin} />} />
          <Route path="/teachings" element={<Teachings language={language} />} />
          <Route path="/teachings/:id" element={<TeachingDetail language={language} />} />
          <Route path="/comments" element={<Comments language={language} user={user} />} />
          <Route path="/contact" element={<Contact language={language} />} />
          <Route path="/search" element={<Search language={language} />} />
          <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
        </Routes>
      </main>
      <Footer language={language} />
    </Router>
  );
};

export default App;
