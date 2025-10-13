import React from 'react';
import { Language } from '../types';
import { motion } from 'framer-motion';

import Hero from '../components/Hero';
import About from '../components/About';
import Gallery from '../components/Gallery';
import Events from '../components/Events';
import Teachings from '../components/Teachings';
import Contact from '../components/Contact';

interface HomeProps {
    language: Language;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={sectionVariants}
  >
    {children}
  </motion.div>
);


const Home: React.FC<HomeProps> = ({ language }) => {
    return (
        <>
            <Hero language={language} />
            
            <SectionWrapper>
              <About language={language} />
            </SectionWrapper>

            <SectionWrapper>
              <Gallery language={language} isHomePage />
            </SectionWrapper>
            
            <SectionWrapper>
              <Events language={language} isHomePage />
            </SectionWrapper>

            <SectionWrapper>
              <Teachings language={language} isHomePage />
            </SectionWrapper>

            <SectionWrapper>
              <Contact language={language} />
            </SectionWrapper>
        </>
    );
};

export default Home;