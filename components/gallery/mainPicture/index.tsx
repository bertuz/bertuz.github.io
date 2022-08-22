import Loading from '../../../public/loading.svg';

import colors from '../../../assets/styles/colors';

import { useEffect, useMemo, useState } from 'react';

import { css } from '@emotion/react';

import Image from 'next/image';

import type { GalleryPic } from '../index';

import type { AriaRole } from 'react';

const transitionValue = 'all 0.4s ease-in-out';

const getClasses = (shouldAnimate: boolean) => ({
  imageTest: css({
    width: '100%',
    height: '100%',
    position: 'relative',
  }),
  galleryMainPicWrapper: css({
    '& > div > span': {
      display: 'block !important',
      transition: shouldAnimate ? transitionValue : undefined,
    },
    boxShadow: '0px 0px 25px 15px rgba(0,0,0,0.3)',
  }),
  loadButHide: css({
    display: 'none !important',
    '& > div': {
      display: 'none !important',
    },
  }),
  loadingPicFeedback: css({
    position: 'absolute',
    margin: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
  }),
  loadingPic: css({
    fill: colors.almostWhite,
    height: '20%',
    width: '20%',
  }),
  mainPictureImage: css({
    transition: shouldAnimate ? transitionValue : undefined,
    '& *': {
      transition: shouldAnimate ? transitionValue : undefined,
    },
    display: 'block',
    border: `7px solid ${colors.almostWhite} !important`,
    borderRadius: 5,
  }),
  mainPictureImageLoading: css({
    opacity: 0.5,
  }),
});

const shouldFirstSlotBeInDOM = (
  isFirstPicLoading: boolean,
  currentGalleryPicSlot: 0 | 1,
  isPicInSlotTransitionEnded: [boolean, boolean],
  isPicInSlotLoading: [boolean, boolean]
) => {
  return (
    isFirstPicLoading ||
    (currentGalleryPicSlot === 0 && isPicInSlotTransitionEnded[1]) ||
    (currentGalleryPicSlot === 1 && isPicInSlotLoading[1]) ||
    (currentGalleryPicSlot === 1 && !isPicInSlotTransitionEnded)
  );
};

const shouldSecondSlotBeInDOM = (
  isFirstPicLoading: boolean,
  currentGalleryPicSlot: 0 | 1,
  isPicInSlotTransitionEnded: [boolean, boolean],
  isPicInSlotLoading: [boolean, boolean]
) => {
  if (isFirstPicLoading) return false;

  return (
    (currentGalleryPicSlot === 0 && isPicInSlotLoading[0]) ||
    (currentGalleryPicSlot === 0 && !isPicInSlotTransitionEnded[1]) ||
    (currentGalleryPicSlot === 1 && isPicInSlotTransitionEnded[0])
  );
};

type GalleryMainPictureProps = {
  css: any;
  className?: string;
  role: AriaRole | undefined;
  galleryPics: Array<GalleryPic>;
  galleryPicSelectedIndex: number;
  availableMainPictureSpace: {
    width: number | undefined;
    height: number | undefined;
  };
};
const Index = ({
  // css,
  className,
  role,
  availableMainPictureSpace,
  galleryPics,
  // todo allow -1 in case of empty gallery pics
  galleryPicSelectedIndex = 0,
}: GalleryMainPictureProps) => {
  const [currentGalleryPicSlot, setCurrentGalleryPicSlot] = useState<0 | 1>(0);
  const [galleryPicIndexForSlot, setGalleryPicIndexForSlot] = useState<
    [number, number]
  >([0, 0]);
  const [isPicInSlotLoading, setIsPicInSlotLoading] = useState<
    [boolean, boolean]
  >([true, true]);
  const [isPicInSlotTransitionEnded, setIsPicInSlotTransitionEnded] = useState<
    [boolean, boolean]
  >([true, true]);
  const [firstGalleryPicLoading, setFirstGalleryPicLoading] =
    useState<boolean>(true);

  const galleryPicDimsInSlots = useMemo(() => {
    if (!availableMainPictureSpace.height || !availableMainPictureSpace.width) {
      return [
        [0, 0],
        [0, 0],
      ];
    }
    const dimensions = galleryPicIndexForSlot.map((indexForPicSlot: number) => {
      if (
        !availableMainPictureSpace.height ||
        !availableMainPictureSpace.width
      ) {
        return [0, 0];
      }

      const { height: originalHeight, width: originalWidth } =
        galleryPics[indexForPicSlot].dimensions.original;
      const { ratio } = galleryPics[indexForPicSlot].dimensions;

      const maxHeight = availableMainPictureSpace.height - 60;
      const maxWidth = availableMainPictureSpace.width - 60;

      if (originalHeight > maxHeight || originalWidth > maxWidth) {
        if (maxWidth < maxHeight) {
          return originalWidth < originalHeight
            ? [maxHeight, maxHeight * ratio]
            : [maxWidth * ratio, maxWidth];
        }

        return originalHeight < originalWidth
          ? [maxWidth * ratio, maxWidth]
          : [maxHeight, maxHeight * ratio];
      }

      return [originalHeight, originalWidth];
    });

    return dimensions;
  }, [
    availableMainPictureSpace.height,
    availableMainPictureSpace.width,
    galleryPicIndexForSlot,
    galleryPics,
  ]);
  // console.log('---------');
  // console.log('galleryPicSelectedIndex> ', galleryPicSelectedIndex);
  // console.log('currentGalleryPicSlot> ', currentGalleryPicSlot);
  // console.log('galleryPicIndexForSlot> ', galleryPicIndexForSlot);
  // console.log('isPicInSlotLoading>', isPicInSlotLoading);
  // console.log('isPicInSlotTransitionEnded> ', isPicInSlotTransitionEnded);
  // console.log('firstGalleryPicLoading> ', firstGalleryPicLoading);
  // console.log('galleryPicDimsInSlots', galleryPicDimsInSlots);
  // console.log('----');

  // todo should animate
  const classes = getClasses(true);

  useEffect(() => {
    let newSlot: 0 | 1;

    setCurrentGalleryPicSlot((previousSlot) => {
      newSlot = previousSlot === 0 ? 1 : 0;
      return newSlot;
    });
    setGalleryPicIndexForSlot((prevState) => {
      // todo check if it's sync for real
      console.log('newSlot> ', newSlot);
      if (newSlot === 0) {
        return [galleryPicSelectedIndex, prevState[1]];
      }

      return [prevState[0], galleryPicSelectedIndex];
    });

    setIsPicInSlotLoading((prevState) => {
      return newSlot === 0 ? [true, prevState[1]] : [prevState[0], true];
    });

    setIsPicInSlotTransitionEnded((prevState) => {
      return newSlot === 0 ? [prevState[0], false] : [false, prevState[1]];
    });
  }, [galleryPicSelectedIndex]);

  useEffect(() => {
    if (firstGalleryPicLoading) {
      setIsPicInSlotTransitionEnded([true, true]);
    }
  }, [firstGalleryPicLoading]);

  return (
    <div className={className} role={role}>
      <div css={classes.galleryMainPicWrapper}>
        {shouldFirstSlotBeInDOM(
          firstGalleryPicLoading,
          currentGalleryPicSlot,
          isPicInSlotTransitionEnded,
          isPicInSlotLoading
        ) && (
          <div
            css={[
              !firstGalleryPicLoading &&
              currentGalleryPicSlot === 0 &&
              (isPicInSlotLoading[currentGalleryPicSlot] ||
                !isPicInSlotTransitionEnded[1])
                ? classes.loadButHide
                : null,
            ]}
          >
            <figure
              css={classes.loadingPicFeedback}
              style={{
                height: galleryPicDimsInSlots[currentGalleryPicSlot][0],
                width: galleryPicDimsInSlots[currentGalleryPicSlot][1],
                display:
                  (firstGalleryPicLoading && isPicInSlotLoading[0]) ||
                  (!firstGalleryPicLoading &&
                    currentGalleryPicSlot === 1 &&
                    isPicInSlotLoading[currentGalleryPicSlot])
                    ? 'flex'
                    : 'none',
              }}
            >
              <Loading css={classes.loadingPic} />
            </figure>
            <Image
              key={`MAIN${galleryPics[galleryPicIndexForSlot[0]].src}`}
              height={galleryPicDimsInSlots[currentGalleryPicSlot][0]}
              width={galleryPicDimsInSlots[currentGalleryPicSlot][1]}
              loading="eager"
              onTransitionEnd={() => {
                setIsPicInSlotTransitionEnded((prevState) => {
                  return [true, prevState[1]];
                });
              }}
              css={[
                classes.mainPictureImage,
                (firstGalleryPicLoading && isPicInSlotLoading[0]) ||
                (!firstGalleryPicLoading &&
                  isPicInSlotLoading[currentGalleryPicSlot])
                  ? classes.mainPictureImageLoading
                  : null,
              ]}
              layout="fixed"
              src={`${galleryPics[galleryPicIndexForSlot[0]].src}`}
              sizes="50vw"
              alt="FIRST SLOT IMAGE"
              quality={100}
              onLoadingComplete={() => {
                setIsPicInSlotLoading((prevState) => {
                  return [false, prevState[1]];
                });
                setFirstGalleryPicLoading(false);
              }}
            />
          </div>
        )}
        {shouldSecondSlotBeInDOM(
          firstGalleryPicLoading,
          currentGalleryPicSlot,
          isPicInSlotTransitionEnded,
          isPicInSlotLoading
        ) && (
          <div
            css={[
              firstGalleryPicLoading ||
              (!firstGalleryPicLoading &&
                ((currentGalleryPicSlot === 1 &&
                  isPicInSlotLoading[currentGalleryPicSlot]) ||
                  !isPicInSlotTransitionEnded[0]))
                ? classes.loadButHide
                : null,
            ]}
          >
            <figure
              css={classes.loadingPicFeedback}
              style={{
                height: galleryPicDimsInSlots[currentGalleryPicSlot][0],
                width: galleryPicDimsInSlots[currentGalleryPicSlot][1],
                display:
                  !firstGalleryPicLoading &&
                  currentGalleryPicSlot === 0 &&
                  isPicInSlotLoading[0]
                    ? 'flex'
                    : 'none',
              }}
            >
              <Loading css={classes.loadingPic} />
            </figure>

            <Image
              key={`MAIN${galleryPics[galleryPicIndexForSlot[1]].src}`}
              height={galleryPicDimsInSlots[currentGalleryPicSlot][0]}
              width={galleryPicDimsInSlots[currentGalleryPicSlot][1]}
              loading="eager"
              css={[
                classes.mainPictureImage,
                isPicInSlotLoading[1] || isPicInSlotLoading[0]
                  ? classes.mainPictureImageLoading
                  : null,
              ]}
              layout="fixed"
              src={`${galleryPics[galleryPicIndexForSlot[1]].src}`}
              sizes="50vw"
              alt="SECOND SLOT IMAGE"
              quality={100}
              onLoadingComplete={() => {
                setIsPicInSlotLoading((prevState) => {
                  return [prevState[0], false];
                });
              }}
              onTransitionEnd={() => {
                setIsPicInSlotTransitionEnded((prevState) => {
                  return [prevState[0], true];
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
