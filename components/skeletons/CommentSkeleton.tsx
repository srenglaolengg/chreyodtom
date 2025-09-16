import React from 'react';

const CommentSkeleton: React.FC = () => {
    return (
        <div role="status" aria-label="Loading comment" className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0 mt-1"></div>
            <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
};

export default CommentSkeleton;
