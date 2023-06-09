import { MAX_MOBILE_WIDTH_PX } from '../assets/styles/breakPoints';

import { useEffect, useState } from 'react';
type ScreenSizes = {
  isDesktopOrBigger: boolean;
  isMobile: boolean;
};

const useScreenSize = (): ScreenSizes => {
  const [screenSizes, setScrenSizes] = useState<ScreenSizes>({
    isDesktopOrBigger: true,
    isMobile: false,
  });

  useEffect(() => {
    function updateScreenSizes() {
      const windowWidth: number = isNaN(window.innerWidth)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.clientWidth
        : window.innerWidth;

      if (windowWidth > MAX_MOBILE_WIDTH_PX) {
        setScrenSizes({ isDesktopOrBigger: true, isMobile: false });
      } else {
        setScrenSizes({ isDesktopOrBigger: false, isMobile: true });
      }
    }

    window.addEventListener('scroll', updateScreenSizes);
    updateScreenSizes();

    return () => {
      window.removeEventListener('resize', updateScreenSizes);
    };
  }, []);

  return screenSizes;
};

export default useScreenSize;
