import React from 'react';
import { Language } from '../types';

import Hero from '../components/Hero';
import About from '../components/About';
import Gallery from '../components/Gallery';
import Events from '../components/Events';
import Teachings from '../components/Teachings';
import Donation from '../components/Donation';
import Contact from '../components/Contact';

interface HomeProps {
    language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
    return (
        <>
            {/* The Hero component is the main visual entry point */}
            <Hero language={language} />
            
            {/* A concise version of the About section */}
            <About language={language} />

            {/* UPGRADE: Displaying featured content from key sections instead of the full list.
                The 'isHomePage' prop instructs these components to show a limited number of items
                and a "View All" link, making the homepage a more effective summary. */}
            <Gallery language={language} isHomePage />
            <Events language={language} isHomePage />
            <Teachings language={language} isHomePage />

            {/* A dedicated section to encourage support for the pagoda */}
            <Donation language={language} />

            {/* The Contact section is retained at the bottom for easy access */}
            <Contact language={language} />
        </>
    );
};

export default Home;