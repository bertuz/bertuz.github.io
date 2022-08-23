import Loading from '../../../public/loading.svg';

import colors from '../../../assets/styles/colors';

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
  // todo allow -1 in case of empty gallery pics
  selectedPicIndex = 0,
}: GalleryMainPictureProps) => {
  const [changeSelectedPicPhase, setChangeSelectedPicPhase] = useState<
    | 'preChangeAnimation'
    | 'preLoading'
    | 'loaded'
    | 'newPicShowed'
    | 'postChangeAnimation'
    | 'idle'
  >('preChangeAnimation');
  const [preloadSelectedPicIndex, setPreloadSelectedPicIndex] = useState<
    number | null
  >(null);
  const [loadedSelectedPicIndex, setLoadedSelectedPicIndex] =
    useState<number>(0);
  const [alreadyLoadedPicIndexes, setAlreadyLoadedPicIndexes] = useState<
    Array<boolean>
  >([]);

  const picSelectedDims = useMemo<[number, number]>(() => {
    if (!availableMainPictureSpace.height || !availableMainPictureSpace.width) {
      return [0, 0];
    }

    const { height: originalHeight, width: originalWidth } =
      galleryPics[selectedPicIndex].dimensions.original;
    const { ratio } = galleryPics[selectedPicIndex].dimensions;

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
    selectedPicIndex,
    galleryPics,
  ]);

  useEffect(() => {
    setAlreadyLoadedPicIndexes([]);
  }, [galleryPics]);

  useEffect(() => {
    setChangeSelectedPicPhase('preChangeAnimation');
  }, [selectedPicIndex]);

  useEffect(
    function setPreloadingPhase() {
      if (changeSelectedPicPhase !== 'preLoading') {
        return;
      }

      if (alreadyLoadedPicIndexes[selectedPicIndex]) {
        setLoadedSelectedPicIndex(selectedPicIndex);
        // setChangeSelectedPicPhase('newPicShowed');
        return;
      }

      setPreloadSelectedPicIndex(selectedPicIndex);
    },
    [alreadyLoadedPicIndexes, changeSelectedPicPhase, selectedPicIndex]
  );

  useEffect(
    function setLoadedPhase() {
      if (changeSelectedPicPhase !== 'loaded') {
        return;
      }

      setLoadedSelectedPicIndex(preloadSelectedPicIndex as number);
      // setChangeSelectedPicPhase('newPicShowed');
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

      requestAnimationFrame(() => {
        setChangeSelectedPicPhase('postChangeAnimation');
      });
    },
    [changeSelectedPicPhase]
  );

  // useEffect(
  //   function setIdleState() {
  //     if (changeSelectedPicPhase !== 'postChangeAnimation') {
  //       return;
  //     }
  //
  //     setChangeSelectedPicPhase('idle');
  //   },
  //   [changeSelectedPicPhase]
  // );

  // console.log('isPreloading: ', isPreloading);
  // console.log('isLoadedTransitionDone: ', isLoadedTransitionDone);
  // console.log('changePicAnimationStatus: ', changePicPreAnimationStatus);
  console.log('changeSelectedPicPhase: ', changeSelectedPicPhase);
  console.log('preloadSelectedPicIndex: ', preloadSelectedPicIndex);
  console.log('loadedSelectedPicIndex: ', loadedSelectedPicIndex);
  console.log('alreadyLoadedPicIndexes', alreadyLoadedPicIndexes);
  console.log(
    'mainPictureImageLoading: ',
    changeSelectedPicPhase !== 'idle' &&
      changeSelectedPicPhase !== 'postChangeAnimation'
      ? 'yes'
      : 'no'
  );

  // todo should animate
  const classes = getClasses(true);

  return (
    <div className={className} role={role}>
      <div css={classes.galleryMainPicWrapper}>
        {changeSelectedPicPhase !== 'postChangeAnimation' &&
          !alreadyLoadedPicIndexes[selectedPicIndex] && (
            <figure css={classes.loadingPicFeedback}>
              <Loading css={classes.loadingPic} />
            </figure>
          )}

        <Image
          key={`MAIN${galleryPics[loadedSelectedPicIndex].src}`}
          height={picSelectedDims[0]}
          width={picSelectedDims[1]}
          loading="eager"
          onTransitionEnd={() => {
            // todo check if something else has interfered (changed selection of index) and so a new preload cycle has been started
            if (changeSelectedPicPhase === 'preChangeAnimation') {
              setChangeSelectedPicPhase('preLoading');
              return;
            }

            if (changeSelectedPicPhase === 'postChangeAnimation') {
              setChangeSelectedPicPhase('idle');
            }
          }}
          onLoadingComplete={() => {
            setChangeSelectedPicPhase('newPicShowed');
          }}
          css={[
            classes.mainPictureImage,
            classes.mainPictureImageAnimating,
            changeSelectedPicPhase !== 'idle' &&
            changeSelectedPicPhase !== 'postChangeAnimation'
              ? classes.mainPictureImageLoading
              : null,
          ]}
          layout="fixed"
          src={`${galleryPics[loadedSelectedPicIndex].src}`}
          sizes="50vw"
          alt="Selected photo's big version"
          quality={100}
        />
      </div>
      <div css={classes.preloadSelectedPicWrapper} role="none">
        {preloadSelectedPicIndex && (
          <Image
            key={`MAINPRELOAD${galleryPics[preloadSelectedPicIndex].src}`}
            height={picSelectedDims[0]}
            width={picSelectedDims[1]}
            loading="eager"
            layout="fixed"
            src={galleryPics[preloadSelectedPicIndex].src}
            sizes="50vw"
            alt="preloading photo"
            quality={100}
            onLoadingComplete={() => {
              // todo check if something else has interfered (changed selection of index) and so a new preload cycle has been started
              setChangeSelectedPicPhase('loaded');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
