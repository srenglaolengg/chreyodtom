

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Language, FirebaseUser } from './types';
import { auth } from './firebase';
import { AnimatePresence, motion } from 'framer-motion';
// FIX: Use Firebase v8 compatible auth method and rely on type inference.
// `onAuthStateChanged` is a method on the auth object, not a standalone import.
import { ADMIN_U_IDS } from './constants';

import Header from './components/Header';
import Footer from './components/Footer';
// import ScrollToTop from './components/ScrollToTop'; // Removed in favor of onExitComplete in AnimatePresence

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
const Search = lazy(() => import('./pages/Search'));

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

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -15 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const PageWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);


const AppRoutes: React.FC<Omit<MainLayoutProps, 'children'> & { authLoading: boolean }> = ({ language, toggleLanguage, user, isAdmin, authLoading }) => {
  const location = useLocation();
  const mainLayoutProps = { language, toggleLanguage, user, isAdmin };

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        {/* Normal pages */}
        <Route path="/" element={<MainLayout {...mainLayoutProps}><PageWrapper><Home language={language} /></PageWrapper></MainLayout>} />
        <Route path="/about" element={<MainLayout {...mainLayoutProps}><PageWrapper><About language={language} /></PageWrapper></MainLayout>} />
        <Route path="/gallery" element={<MainLayout {...mainLayoutProps}><PageWrapper><Gallery language={language} /></PageWrapper></MainLayout>} />
        <Route path="/gallery/:id" element={<MainLayout {...mainLayoutProps}><PageWrapper><GalleryDetail language={language} /></PageWrapper></MainLayout>} />
        <Route path="/events" element={<MainLayout {...mainLayoutProps}><PageWrapper><Events language={language} /></PageWrapper></MainLayout>} />
        <Route path="/events/:id" element={<MainLayout {...mainLayoutProps}><PageWrapper><EventDetail language={language} /></PageWrapper></MainLayout>} />
        <Route path="/feed" element={<MainLayout {...mainLayoutProps}><PageWrapper><Feed language={language} user={user} isAdmin={isAdmin} /></PageWrapper></MainLayout>} />
        <Route path="/teachings" element={<MainLayout {...mainLayoutProps}><PageWrapper><Teachings language={language} /></PageWrapper></MainLayout>} />
        <Route path="/teachings/:id" element={<MainLayout {...mainLayoutProps}><PageWrapper><TeachingDetail language={language} /></PageWrapper></MainLayout>} />
        <Route path="/comments" element={<MainLayout {...mainLayoutProps}><PageWrapper><Comments language={language} user={user} /></PageWrapper></MainLayout>} />
        <Route path="/contact" element={<MainLayout {...mainLayoutProps}><PageWrapper><Contact language={language} /></PageWrapper></MainLayout>} />
        <Route path="/search" element={<MainLayout {...mainLayoutProps}><PageWrapper><Search language={language} /></PageWrapper></MainLayout>} />

        {/* Admin isolated (no header/footer) */}
        <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />} />
      </Routes>
    </AnimatePresence>
  );
};


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

  return (
    <Router>
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <AppRoutes 
          language={language}
          toggleLanguage={toggleLanguage}
          user={user}
          isAdmin={isAdmin}
          authLoading={authLoading}
        />
      </Suspense>
    </Router>
  );
};

export default App;