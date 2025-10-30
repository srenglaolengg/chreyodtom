
import React from 'react';

interface IconProps {
    className?: string;
}

export const LotusIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12 2c-3.1 0-5.6 2.5-5.6 5.6 0 3.1 2.5 5.6 5.6 5.6s5.6-2.5 5.6-5.6S15.1 2 12 2z" opacity="0.4" />
        <path d="M12 14c-4.4 0-8 3.6-8 8h16c0-4.4-3.6-8-8-8zm-8-3.5c0-2.8 2.2-5 5-5s5 2.2 5 5c0 2.8-2.2 5-5 5s-5-2.2-5-5z" opacity="0.4" />
        <path d="M21.5 12.8c.3-1.1.5-2.2.5-3.3 0-4.7-3.8-8.5-8.5-8.5S5 4.8 5 9.5c0 1.1.2 2.2.5 3.3C2.8 14.2 1 17.5 1 21.3c0 .4.3.7.7.7h20.6c.4 0 .7-.3.7-.7 0-3.8-1.8-7.1-4.5-8.5z" />
    </svg>
);