import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUserType } from 'firebase/auth';
import { ADMIN_U_IDS } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// ✅ Lazy load heavy pages
const About = lazy(() => import('./components/About'));
const Gallery = lazy(() => import('./components/Gallery'));
const GalleryDetail = lazy(() => import('./pages/GalleryDetail'));
const Teachings = lazy(() => import('./components/Teachings'));
const TeachingDetail = lazy(() => import('./pages/TeachingDetail'));
const Events = lazy(() => import('./components/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Contact = lazy(() => import('./components/Contact'));
const Comments = lazy(() => import('./components/Comments'));
const Feed = lazy(() => import('./components/Feed'));
const Admin = lazy(() => import('./pages/Admin'));
const Home = lazy(() => import('./pages/Home'));

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
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <Routes>
          {/* Normal pages */}
          <Route path="/" element={<MainLayout><Home language={language} /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About language={language} /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout><Gallery language={language} /></MainLayout>} />
          <Route path="/gallery/:id" element={<MainLayout><GalleryDetail language={language} /></MainLayout>} />
          <Route path="/events" element={<MainLayout><Events language={language} /></MainLayout>} />
          <Route path="/events/:id" element={<MainLayout><EventDetail language={language} /></MainLayout>} />
          <Route path="/feed" element={<MainLayout><Feed language={language} user={user} isAdmin={isAdmin} /></MainLayout>} />
          <Route path="/teachings" element={<MainLayout><Teachings language={language} /></MainLayout>} />
          <Route path="/teachings/:id" element={<MainLayout><TeachingDetail language={language} /></MainLayout>} />
          <Route path="/comments" element={<MainLayout><Comments language={language} user={user} /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact language={language} /></MainLayout>} />

          {/* Admin isolated (no header/footer) */}
          <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
