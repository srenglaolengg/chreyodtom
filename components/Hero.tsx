
import React from 'react';
import { Language } from '../types';
import { LotusIcon } from './icons/LotusIcon';

interface HeroProps {
  language: Language;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  return (
    <section 
      className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-center text-white bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.postimg.cc/02xqb4Yy/photo-2025-09-08-23-20-58.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-amber-900/50 to-transparent"></div>
      <div className="relative z-10 p-8">
        <div className="flex justify-center mb-4">
            <LotusIcon className="w-20 h-20 text-yellow-300/80" />
        </div>
        <h1 className="font-khmer text-5xl md:text-7xl font-bold tracking-wide text-shadow" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
          វត្តសិរីមង្គលហៅជ្រៃឧត្តម
        </h1>
        <p className="mt-4 text-xl md:text-2xl font-light text-yellow-100" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
            {language === 'km' ? 'ភូមិជ្រៃឧត្តម ឃុំក្រាំងតាយ៉ង ស្រុកពាមជរ ខេត្តព្រៃវែង' : 'Chray Ut Dom village, Krang Tayong commune, Peam Chor district, Prey Veng province'}
        </p>
      </div>
    </section>
  );
};

export default Hero;
