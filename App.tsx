import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
import { ADMIN_U_IDS } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';

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
const Search = lazy(() => import('./pages/Search'));

interface MainLayoutProps {
  children: React.ReactNode;
  language: Language;
  toggleLanguage: () => void;
  user: FirebaseUser | null;
  isAdmin: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, language, toggleLanguage, user, isAdmin }) => (
  <>
    <Header language={language} toggleLanguage={toggleLanguage} user={user} isAdmin={isAdmin} />
    <main>{children}</main>
    <Footer language={language} />
  </>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.Khmer);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
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
      <Suspense fallback={<div className="container text-center">Loading...</div>}>
        <Routes>
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
          <Route path="/search" element={<MainLayout {...mainLayoutProps}><Search language={language} /></MainLayout>} />

          <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;