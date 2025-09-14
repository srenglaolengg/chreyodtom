import React from 'react';

interface IconProps {
    className?: string;
}

export const TelegramIcon: React.FC<IconProps> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.78l-1.45 6.84c-.13.62-.53.78-.97.48l-2.23-1.64-1.08 1.04c-.12.12-.22.22-.4.22l.15-2.28 4.1-3.72c.18-.16-.05-.25-.3-.1l-5.07 3.19-2.2-.68c-.63-.2-.64-.63.13-.93l8.4-3.27c.53-.2.96.18.79.86z"/>
    </svg>
);