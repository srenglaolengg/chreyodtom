import React, { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
}

const PageMeta: React.FC<PageMetaProps> = ({ title, description, keywords, robots }) => {
  useEffect(() => {
    document.title = title;

    const setMetaTag = (name: string, content: string | undefined) => {
        // Find existing tag
        let element = document.querySelector(`meta[name="${name}"]`);
        
        if (content) {
            // If tag doesn't exist, create it
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            // Set content
            element.setAttribute('content', content);
        } else {
            // If content is undefined and tag exists, remove it
            if (element) {
                element.remove();
            }
        }
    };

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', robots);

  }, [title, description, keywords, robots]);

  return null; // This component does not render anything
};

export default PageMeta;