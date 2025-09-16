import React, { useEffect } from 'react';

const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-black rounded-full h-9 w-9 flex items-center justify-center text-2xl font-bold shadow-lg hover:scale-110 transition-transform"
          aria-label="Close lightbox"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
