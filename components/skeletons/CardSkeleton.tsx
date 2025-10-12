import React from 'react';

const CardSkeleton: React.FC = () => {
    return (
        <div className="card">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }}></div>
            <div className="card-content">
                <div className="skeleton" style={{ height: '1.25rem', width: '75%', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', width: '100%', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', width: '100%', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', width: '66%' }}></div>
            </div>
        </div>
    );
};

export default CardSkeleton;