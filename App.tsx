import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Language } from './types';

import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Teachings from './components/Teachings';
import Events from './components/Events';
import Contact from './components/Contact';
import Comments from './components/Comments';
import Feed from './components/Feed';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.Khmer);

  const toggleLanguage = () => {
    setLanguage(prev =>
      prev === Language.Khmer ? Language.English : Language.Khmer
    );
  };

  return (
    <Router>
      <div className="bg-stone-50 text-stone-700 min-h-screen flex flex-col">
        <Header language={language} toggleLanguage={toggleLanguage} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <>
                <Hero language={language} />
                <About language={language} />
                <Gallery language={language} />
                <Events language={language} />
                <Feed language={language} />
                <Teachings language={language} />
                <Comments language={language} />
                <Contact language={language} />
              </>
            } />
            <Route path="/about" element={<About language={language} />} />
            <Route path="/gallery" element={<Gallery language={language} />} />
            <Route path="/events" element={<Events language={language} />} />
            <Route path="/feed" element={<Feed language={language} />} />
            <Route path="/teachings" element={<Teachings language={language} />} />
            <Route path="/comments" element={<Comments language={language} />} />
            <Route path="/contact" element={<Contact language={language} />} />
          </Routes>
        </main>

        <Footer language={language} />
      </div>
    </Router>
  );
};

export default App;
