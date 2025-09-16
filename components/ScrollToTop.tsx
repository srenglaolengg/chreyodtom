import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A component that scrolls the window to the top on every route change.
 * It should be placed inside the Router component.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This is a browser-only API.
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null; // This component does not render anything.
};

export default ScrollToTop;
