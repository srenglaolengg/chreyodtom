
import React from 'react';

const CardSkeleton: React.FC = () => {
    return (
        <div role="status" aria-label="Loading item" className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="w-full aspect-video bg-stone-200"></div>
            <div className="p-6">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-stone-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-stone-200 rounded"></div>
                    <div className="h-3 bg-stone-200 rounded"></div>
                    <div className="h-3 bg-stone-200 rounded w-5/6"></div>
                </div>
                 <div className="h-4 bg-stone-200 rounded w-1/4 mt-6"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
