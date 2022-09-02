import { useEffect, useState } from 'react';

import type { MutableRefObject } from 'react';

type Dimensions = {
  width: undefined | number;
  height: undefined | number;
};

const useDimensions = (ref: MutableRefObject<Element | null>): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const element = ref?.current;

    if (element) {
      const checkResize = (entries: ResizeObserverEntry[]) => {
        const rect = entries[0].contentRect;

        const w = rect.width;
        const h = rect.height;

        setDimensions({ height: h, width: w });
      };

      const observer = new ResizeObserver(checkResize);
      observer.observe(element);

      return function () {
        observer.disconnect();
      };
    }
  }, [ref]);

  return dimensions;
};

export default useDimensions;
