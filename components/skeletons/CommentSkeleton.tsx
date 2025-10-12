import React from 'react';

const CommentSkeleton: React.FC = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem 0' }}>
            <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '1rem', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '1rem', width: '33%', marginBottom: '0.75rem' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', width: '100%', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ height: '0.8rem', width: '80%' }}></div>
            </div>
        </div>
    );
};

export default CommentSkeleton;