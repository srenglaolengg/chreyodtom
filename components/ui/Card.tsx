import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    /* Styling Change: Upgraded card design with a subtle border, softer shadows, and a more pronounced hover effect. */
    <motion.article
      className={`bg-card rounded-lg shadow-md hover:shadow-xl border border-border transition-all duration-300 overflow-hidden ${className}`}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
    >
      {children}
    </motion.article>
  );
};

interface CardImageProps {
  src: string;
  alt: string;
}

export const CardImage: React.FC<CardImageProps> = ({ src, alt }) => {
  return (
    <div className="aspect-video overflow-hidden">
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    /* Styling Change: Increased default padding for card content. */
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
