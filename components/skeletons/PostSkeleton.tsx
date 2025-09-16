import React from 'react';

const PostSkeleton: React.FC = () => {
    return (
        <div role="status" aria-label="Loading post" className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse border border-gray-200">
            <div className="w-full h-64 bg-gray-200"></div>
            <div className="p-6 md:p-8">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
};

export default PostSkeleton;