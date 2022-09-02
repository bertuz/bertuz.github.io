import { useMemo } from 'react';

import type { GalleryPic } from '../index';

type Property = {
  availableSpace: {
    width: number | undefined;
    height: number | undefined;
  };
  picIndex: number;
  galleryPics: Array<GalleryPic>;
};

const useSelectedPicDims = ({
  availableSpace,
  picIndex,
  galleryPics,
}: Property): [number, number] => {
  return useMemo<[number, number]>(() => {
    if (galleryPics.length === 0) {
      return [0, 0];
    }

    if (!availableSpace.height || !availableSpace.width) {
      return [0, 0];
    }

    const { height: originalHeight, width: originalWidth } =
      galleryPics[picIndex].dimensions.original;

    // extra space as a parameter, not magic number
    const maxHeight = availableSpace.height - 60;
    const maxWidth = availableSpace.width - 60;

    if (originalHeight > maxHeight || originalWidth > maxWidth) {
      const { ratio } = galleryPics[picIndex].dimensions;
      const picFitWidth: [number, number] =
        originalWidth > maxWidth
          ? [maxWidth * ratio, maxWidth]
          : [originalHeight, originalWidth];

      return picFitWidth[0] > maxHeight
        ? [maxHeight, maxHeight / ratio]
        : picFitWidth;
    }

    return [originalHeight, originalWidth];
  }, [availableSpace.height, availableSpace.width, picIndex, galleryPics]);
};

export default useSelectedPicDims;
