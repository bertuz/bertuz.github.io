import { isRunningAcceptanceTest } from './testUtils';

import { useEffect, useState } from 'react';

const useShouldAnimate = (): boolean => {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);

  useEffect(() => {
    if (isRunningAcceptanceTest()) {
      setShouldAnimate(false);
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleMedia = (e: MediaQueryListEventMap['change']) =>
      setShouldAnimate(!e.matches);
    mediaQuery.addEventListener('change', handleMedia);

    return () => {
      mediaQuery.removeEventListener('change', handleMedia);
    };
  }, []);

  return shouldAnimate;
};

export default useShouldAnimate;
