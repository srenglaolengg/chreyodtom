import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.article
      className={`bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow hover:shadow-md overflow-hidden ${className}`}
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
            className="w-full h-full object-cover" 
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
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};