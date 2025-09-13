import React, { useState } from 'react';
import { Language } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Teachings from './components/Teachings';
import Events from './components/Events';
import Schedule from './components/Schedule';
import Contact from './components/Contact';
import Donation from './components/Donation';
import Comments from './components/Comments';
import Footer from './components/Footer';
import Feed from './components/Feed';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.Khmer);

  const toggleLanguage = () => {
    setLanguage(prev => prev === Language.Khmer ? Language.English : Language.Khmer);
  };

  return (
    <div className="bg-stone-50 text-stone-700">
      <Header language={language} toggleLanguage={toggleLanguage} />
      <main>
        <Hero language={language} />
        <About language={language} />
        <Gallery language={language} />
        <Teachings language={language} />
        <Events language={language} />
        <Feed language={language} />
        <Schedule language={language} />
        <Contact language={language} />
        <Donation language={language} />
        <Comments language={language} />
      </main>
      <Footer language={language} />
    </div>
  );
};

export default App;