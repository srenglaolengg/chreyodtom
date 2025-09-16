import React from 'react';

const CardSkeleton: React.FC = () => {
    return (
        <div role="status" aria-label="Loading item" className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse border border-border">
            <div className="w-full aspect-video bg-muted"></div>
            <div className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
                 <div className="h-4 bg-muted rounded w-1/4 mt-6"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
