import React from 'react';

const PostSkeleton: React.FC = () => {
    return (
        <div className="feed-article" style={{ marginBottom: '2rem' }}>
            <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '1.5rem' }}></div>
            <div className="skeleton" style={{ height: '1.75rem', width: '75%', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '50%', marginBottom: '1.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '100%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '66%' }}></div>
        </div>
    );
};

export default PostSkeleton;