
import React, { useState, useEffect } from 'react';
// FIX: Changed import from Routes to Switch for react-router-dom v5 compatibility.
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
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
      <div className="bg-stone-50 text-stone-700 min-h-screen flex flex-col">
        {/* Header always visible */}
        <Header
          language={language}
          toggleLanguage={toggleLanguage}
          user={user}
          isAdmin={isAdmin}
        />

        {/* Page content */}
        <main className="flex-grow pt-14">
          {/* FIX: Replaced Routes with Switch and updated Route syntax for v5 compatibility.
              Routes with more specific paths (e.g., /gallery/:id) are placed before less specific ones (e.g., /gallery). */}
          <Switch>
            <Route path="/about">
              <About language={language} />
            </Route>
            <Route path="/gallery/:id">
              <GalleryDetail language={language} />
            </Route>
            <Route path="/gallery">
              <Gallery language={language} />
            </Route>
            <Route path="/events/:id">
              <EventDetail language={language} />
            </Route>
            <Route path="/events">
              <Events language={language} />
            </Route>
            <Route path="/feed">
              <Feed language={language} user={user} isAdmin={isAdmin} />
            </Route>
            <Route path="/teachings/:id">
              <TeachingDetail language={language} />
            </Route>
            <Route path="/teachings">
              <Teachings language={language} />
            </Route>
            <Route path="/comments">
              <Comments language={language} user={user} />
            </Route>
            <Route path="/contact">
              <Contact language={language} />
            </Route>
            <Route path="/admin">
              <Admin user={user} isAdmin={isAdmin} authLoading={authLoading} />
            </Route>
            <Route path="/" exact>
              <Home language={language} />
            </Route>
          </Switch>
        </main>

        {/* Footer always visible */}
        <Footer language={language} />
      </div>
    </Router>
  );
};

export default App;
