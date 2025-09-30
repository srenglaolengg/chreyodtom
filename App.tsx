import React, { useState, useEffect } from 'react';
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

// ✅ Layout for normal pages
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white text-gray-800 min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow pt-20">{children}</main>
    <Footer />
  </div>
);

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
    setLanguage(prev => (prev === Language.Khmer ? Language.English : Language.Khmer));
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Normal pages wrapped in MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/about"
          element={
            <MainLayout>
              <About language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/gallery"
          element={
            <MainLayout>
              <Gallery language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/gallery/:id"
          element={
            <MainLayout>
              <GalleryDetail language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/events"
          element={
            <MainLayout>
              <Events language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/events/:id"
          element={
            <MainLayout>
              <EventDetail language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/feed"
          element={
            <MainLayout>
              <Feed language={language} user={user} isAdmin={isAdmin} />
            </MainLayout>
          }
        />
        <Route
          path="/teachings"
          element={
            <MainLayout>
              <Teachings language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/teachings/:id"
          element={
            <MainLayout>
              <TeachingDetail language={language} />
            </MainLayout>
          }
        />
        <Route
          path="/comments"
          element={
            <MainLayout>
              <Comments language={language} user={user} />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact language={language} />
            </MainLayout>
          }
        />

        {/* Admin page isolated (no header/footer) */}
        <Route
          path="/admin"
          element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
