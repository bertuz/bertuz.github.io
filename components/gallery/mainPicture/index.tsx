import Loading from '../../../public/loading.svg';

import colors from '../../../assets/styles/colors';

import useShouldAnimate from '../../../utils/useShouldAnimate';

import { useEffect, useMemo, useState } from 'react';

import { css } from '@emotion/react';

import Image from 'next/image';

import type { GalleryPic } from '../index';

import type { AriaRole } from 'react';

const transitionValue = 'all 0.4s ease-in-out';

const getClasses = (shouldAnimate: boolean) => ({
  galleryMainPicWrapper: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& *': {
      transition: shouldAnimate ? transitionValue : undefined,
    },
    '& > span': {
      display: 'block !important',
      transition: shouldAnimate ? transitionValue : undefined,
    },
    boxShadow: '0px 0px 25px 15px rgba(0,0,0,0.3)',
  }),
  imageWrapper: css({
    '& > span': {
      display: 'block !important',
    },
  }),
  loadingPicFeedback: css({
    position: 'absolute',
    margin: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
    display: 'flex',
  }),
  loadingPic: css({
    fill: colors.almostWhite,
    height: '20%',
    width: '20%',
  }),
  mainPictureImage: css({
    display: 'block',
    border: `7px solid ${colors.almostWhite} !important`,
    borderRadius: 5,
  }),
  mainPictureImageAnimating: css({
    transition: shouldAnimate ? transitionValue : undefined,
    '& *': {
      transition: shouldAnimate ? transitionValue : undefined,
    },
  }),
  mainPictureImageLoading: css({
    opacity: 0.5,
  }),
  preloadSelectedPicWrapper: css({
    display: 'none',
  }),
});

type GalleryMainPictureProps = {
  css: any;
  className?: string;
  role: AriaRole | undefined;
  galleryPics: Array<GalleryPic>;
  selectedPicIndex: number;
  availableMainPictureSpace: {
    width: number | undefined;
    height: number | undefined;
  };
};
const Index = ({
  className,
  role,
  availableMainPictureSpace,
  galleryPics,
  selectedPicIndex = 0,
}: GalleryMainPictureProps) => {
  const shouldAnimate = useShouldAnimate();
  const [nextPicToShow, setNextPicToShow] = useState(0);
  const [changeSelectedPicPhase, setChangeSelectedPicPhase] = useState<
    | 'preChangeAnimation'
    | 'preLoading'
    | 'loaded'
    | 'newPicShowed'
    | 'postChangeAnimation'
    | 'idle'
  >('preChangeAnimation');

  // let's ignore the selected until termiated the latter. Then consider the latest changes
  useEffect(() => {
    if (changeSelectedPicPhase !== 'idle') {
      return;
    }
    setNextPicToShow(selectedPicIndex);
  }, [changeSelectedPicPhase, selectedPicIndex]);

  // when selecting a change in the midst of a change pic
  const [preloadSelectedPicIndex, setPreloadSelectedPicIndex] = useState<
    number | null
  >(null);
  const [loadedSelectedPicIndex, setLoadedSelectedPicIndex] =
    useState<number>(0);
  const [alreadyLoadedPicIndexes, setAlreadyLoadedPicIndexes] = useState<
    Array<boolean>
  >([]);

  const picSelectedDims = useMemo<[number, number]>(() => {
    if (galleryPics.length === 0) {
      return [0, 0];
    }

    if (!availableMainPictureSpace.height || !availableMainPictureSpace.width) {
      return [0, 0];
    }

    const { height: originalHeight, width: originalWidth } =
      galleryPics[nextPicToShow].dimensions.original;
    const { ratio } = galleryPics[nextPicToShow].dimensions;

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
  }, [
    availableMainPictureSpace.height,
    availableMainPictureSpace.width,
    nextPicToShow,
    galleryPics,
  ]);

  useEffect(() => {
    setAlreadyLoadedPicIndexes([]);
  }, [galleryPics]);

  useEffect(() => {
    if (galleryPics.length === 0) {
      return;
    }

    setChangeSelectedPicPhase('preChangeAnimation');
  }, [nextPicToShow, galleryPics]);

  useEffect(() => {
    if (changeSelectedPicPhase !== 'preChangeAnimation') {
      return;
    }

    if (shouldAnimate) {
      return;
    }
    setChangeSelectedPicPhase('preLoading');
  }, [shouldAnimate, changeSelectedPicPhase]);

  useEffect(
    function setPreloadingPhase() {
      if (changeSelectedPicPhase !== 'preLoading') {
        return;
      }

      // shortcut: in case it's loaded already we switch to the next phase
      if (alreadyLoadedPicIndexes[selectedPicIndex]) {
        if (loadedSelectedPicIndex === selectedPicIndex) {
          setChangeSelectedPicPhase('newPicShowed');
        }
        setLoadedSelectedPicIndex(selectedPicIndex);
        return;
      }
      setPreloadSelectedPicIndex(nextPicToShow);
    },
    [
      alreadyLoadedPicIndexes,
      changeSelectedPicPhase,
      loadedSelectedPicIndex,
      nextPicToShow,
    ]
  );

  useEffect(
    function setLoadedPhase() {
      if (changeSelectedPicPhase !== 'loaded') {
        return;
      }

      setLoadedSelectedPicIndex(preloadSelectedPicIndex as number);
      setAlreadyLoadedPicIndexes((previousLoadedPixIndexes) => {
        const newArray = [...previousLoadedPixIndexes];
        newArray[preloadSelectedPicIndex as number] = true;

        return newArray;
      });
    },
    [changeSelectedPicPhase, preloadSelectedPicIndex]
  );

  useEffect(
    function setPostChangeAnimation() {
      if (changeSelectedPicPhase !== 'newPicShowed') {
        return;
      }

      setAlreadyLoadedPicIndexes((previousLoadedPixIndexes) => {
        const newArray = [...previousLoadedPixIndexes];
        newArray[loadedSelectedPicIndex] = true;

        return newArray;
      });

      setChangeSelectedPicPhase('postChangeAnimation');
    },
    [changeSelectedPicPhase, loadedSelectedPicIndex]
  );

  const classes = getClasses(shouldAnimate);

  if (galleryPics.length === 0) {
    return null;
  }

  return (
    <div className={className} role={role}>
      <div css={classes.galleryMainPicWrapper}>
        {changeSelectedPicPhase !== 'postChangeAnimation' &&
          changeSelectedPicPhase !== 'idle' &&
          !alreadyLoadedPicIndexes[nextPicToShow] &&
          shouldAnimate && (
            <figure css={classes.loadingPicFeedback}>
              <Loading css={classes.loadingPic} />
            </figure>
          )}
        <div
          style={{
            opacity:
              changeSelectedPicPhase !== 'postChangeAnimation' &&
              changeSelectedPicPhase !== 'idle'
                ? 0.5
                : 1,
          }}
          css={[classes.imageWrapper, classes.mainPictureImageAnimating]}
          onTransitionEnd={(event) => {
            if (changeSelectedPicPhase === 'preChangeAnimation') {
              setChangeSelectedPicPhase('preLoading');
              return;
            }

            if (changeSelectedPicPhase === 'postChangeAnimation') {
              if (event.propertyName !== 'opacity') {
                return;
              }
              setChangeSelectedPicPhase('idle');
              return;
            }
          }}
        >
          <Image
            key={`MAIN${galleryPics[loadedSelectedPicIndex].src}`}
            height={picSelectedDims[0]}
            width={picSelectedDims[1]}
            loading="eager"
            onLoadingComplete={() => {
              if (loadedSelectedPicIndex != nextPicToShow) {
                return;
              }

              setChangeSelectedPicPhase('newPicShowed');
            }}
            css={classes.mainPictureImage}
            layout="fixed"
            src={`${galleryPics[loadedSelectedPicIndex].src}`}
            sizes="50vw"
            alt="Selected photo's big version"
            quality={100}
          />
        </div>
      </div>
      <div css={classes.preloadSelectedPicWrapper} role="none">
        {preloadSelectedPicIndex !== null && (
          <Image
            key={`MAINPRELOAD-${preloadSelectedPicIndex}`}
            height={picSelectedDims[0]}
            width={picSelectedDims[1]}
            loading="eager"
            layout="fixed"
            src={galleryPics[preloadSelectedPicIndex].src}
            sizes="50vw"
            alt={`MAINPRELOAD-${preloadSelectedPicIndex}`}
            quality={100}
            onLoadingComplete={() => {
              setChangeSelectedPicPhase('loaded');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
