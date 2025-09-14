import React from 'react';
import { Language } from '../types';

import Hero from '../components/Hero';

interface HomeProps {
    language: Language;
}

const Home: React.FC<HomeProps> = ({ language }) => {
    return (
        <>
            <Hero language={language} />
        </>
    );
};

export default Home;
