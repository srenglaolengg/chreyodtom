import React from 'react';
import { Language } from '../types';

import Hero from '../components/Hero';
import About from '../components/About';
import Donation from '../components/Donation';

interface HomeProps {
    language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
    return (
        <>
            <Hero language={language} />
            <About language={language} />
            <Donation language={language} />
        </>
    );
};

export default Home;