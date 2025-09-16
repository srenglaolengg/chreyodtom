import React from 'react';
import { Language } from '../types';

import Hero from '../components/Hero';
import About from '../components/About';
import Gallery from '../components/Gallery';
import Events from '../components/Events';
import Teachings from '../components/Teachings';
import Schedule from '../components/Schedule';
import Donation from '../components/Donation';
import Contact from '../components/Contact';

interface HomeProps {
    language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
    return (
        <>
            <Hero language={language} />
            <About language={language} />
            <Gallery language={language} />
            <Events language={language} />
            <Teachings language={language} />
            <Schedule language={language} />
            <Donation language={language} />
            <Contact language={language} />
        </>
    );
};

export default Home;