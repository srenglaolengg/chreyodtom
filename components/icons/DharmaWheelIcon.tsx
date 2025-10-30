
import React from 'react';

interface IconProps {
    className?: string;
}

export const DharmaWheelIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v2m0 16v2m8.66-12.66l-1.42 1.42M4.76 19.24l-1.42 1.42m0-14.14l1.42 1.42M19.24 19.24l1.42 1.42M2 12h2m16 0h2" />
        <path d="M12 4.1a7.9 7.9 0 010 15.8M4.1 12a7.9 7.9 0 0115.8 0" />
    </svg>
);