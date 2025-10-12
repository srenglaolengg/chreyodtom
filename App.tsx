
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
// FIX: Use Firebase v8 compatible auth method and rely on type inference.
// `onAuthStateChanged` is a method on the auth object, not a standalone import.
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

// FIX: Define props for MainLayout to pass down to Header and Footer.
interface MainLayoutProps {
  children: React.ReactNode;
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

// ✅ Layout for normal pages
const MainLayout: React.FC<MainLayoutProps> = ({ children, language, toggleLanguage, user, isAdmin }) => (
  <div className="bg-white text-gray-800 min-h-screen flex flex-col">
    <Header language={language} toggleLanguage={toggleLanguage} user={user} isAdmin={isAdmin} />
    <main className="flex-grow pt-20">{children}</main>
    <Footer language={language} />
  </div>
);

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.Khmer);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // FIX: Use v8 `onAuthStateChanged` method from the `auth` object.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
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
  
  const mainLayoutProps = { language, toggleLanguage, user, isAdmin };

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <Routes>
          {/* Normal pages */}
          {/* FIX: Pass required props to MainLayout component in routes. */}
          <Route path="/" element={<MainLayout {...mainLayoutProps}><Home language={language} /></MainLayout>} />
          <Route path="/about" element={<MainLayout {...mainLayoutProps}><About language={language} /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout {...mainLayoutProps}><Gallery language={language} /></MainLayout>} />
          <Route path="/gallery/:id" element={<MainLayout {...mainLayoutProps}><GalleryDetail language={language} /></MainLayout>} />
          <Route path="/events" element={<MainLayout {...mainLayoutProps}><Events language={language} /></MainLayout>} />
          <Route path="/events/:id" element={<MainLayout {...mainLayoutProps}><EventDetail language={language} /></MainLayout>} />
          <Route path="/feed" element={<MainLayout {...mainLayoutProps}><Feed language={language} user={user} isAdmin={isAdmin} /></MainLayout>} />
          <Route path="/teachings" element={<MainLayout {...mainLayoutProps}><Teachings language={language} /></MainLayout>} />
          <Route path="/teachings/:id" element={<MainLayout {...mainLayoutProps}><TeachingDetail language={language} /></MainLayout>} />
          <Route path="/comments" element={<MainLayout {...mainLayoutProps}><Comments language={language} user={user} /></MainLayout>} />
          <Route path="/contact" element={<MainLayout {...mainLayoutProps}><Contact language={language} /></MainLayout>} />

          {/* Admin isolated (no header/footer) */}
          <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
