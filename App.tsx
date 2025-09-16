import React, { useState, useEffect } from 'react';
// Restored import for react-router-dom v6/v7 compatibility.
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUserType } from 'firebase/auth';
import { ADMIN_U_IDS } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';
import About from './components/About';
import Gallery from './components/Gallery';
import Teachings from './components/Teachings';
import Events from './components/Events';
import Contact from './components/Contact';
import Comments from './components/Comments';
import Feed from './components/Feed';
import Admin from './pages/Admin';
import Home from './pages/Home';
import GalleryDetail from './pages/GalleryDetail';
import EventDetail from './pages/EventDetail';
import TeachingDetail from './pages/TeachingDetail';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
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

  return (
    <Router>
      <ScrollToTop />
      {/* Changed background color to use static Tailwind classes for a consistent light theme. */}
      <div className="bg-white text-gray-800 min-h-screen flex flex-col">
        {/* Header always visible */}
        <Header
          language={language}
          toggleLanguage={toggleLanguage}
          user={user}
          isAdmin={isAdmin}
        />

        {/* Page content */}
        <main className="flex-grow pt-20"> {/* Increased top padding to account for taller header */}
          {/* Restored Routes and Route syntax for v6/v7 compatibility. */}
          <Routes>
            <Route path="/about" element={<About language={language} />} />
            <Route path="/gallery/:id" element={<GalleryDetail language={language} />} />
            <Route path="/gallery" element={<Gallery language={language} />} />
            <Route path="/events/:id" element={<EventDetail language={language} />} />
            <Route path="/events" element={<Events language={language} />} />
            <Route path="/feed" element={<Feed language={language} user={user} isAdmin={isAdmin} />} />
            <Route path="/teachings/:id" element={<TeachingDetail language={language} />} />
            <Route path="/teachings" element={<Teachings language={language} />} />
            <Route path="/comments" element={<Comments language={language} user={user} />} />
            <Route path="/contact" element={<Contact language={language} />} />
            <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
            <Route path="/" element={<Home language={language} />} />
          </Routes>
        </main>

        {/* Footer always visible */}
        <Footer language={language} />
      </div>
    </Router>
  );
};

export default App;