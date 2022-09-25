import useSelectedPicDims from './useSelectedPicDims';

import useShouldAnimate from '../../../utils/useShouldAnimate';

import useDimensions from '../../../utils/useDimensions';

import colors from '../../../assets/styles/colors';

import Loading from '../../../public/loading.svg';

import BareButton from '../../BareButton';

import { dimensionInRem } from '../../../assets/styles/dimensions';

import Image from 'next/image';
import { css } from '@emotion/react';

import { useEffect, useRef, useState } from 'react';

import type { SerializedStyles } from '@emotion/utils';

import type { GalleryPic } from '../index';

type PopupProps = {
  onClose: () => void;
  galleryPics: Array<GalleryPic>;
  selectedPicIndex: number;
};

const getClasses = (): Record<string, SerializedStyles> => ({
  popup: css({
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1,
    position: 'fixed',
    height: '100%',
    width: '100%',
    overscrollBehavior: 'contain',
  }),
  closeButton: css({
    position: 'absolute',
    right: dimensionInRem(-1),
    top: dimensionInRem(-1),
  }),
  imageSpace: css({
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  image: css({
    border: `5px solid ${colors.almostWhite} !important`,
    borderRadius: 5,
  }),
  loadingPicFeedback: css({
    position: 'absolute',
    margin: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    display: 'flex',
  }),
  loadingPic: css({
    fill: colors.almostWhite,
    height: '20%',
    width: '20%',
  }),
  closeButtonImg: css({
    stroke: colors.almostWhite,
  }),
  title: css({
    display: 'none',
  }),
});

const IMAGE_VERTICAL_PADDING_IN_PX = 5;

const Popup = ({
  onClose,
  galleryPics,
  selectedPicIndex,
}: PopupProps): JSX.Element => {
  const shouldAnimate = useShouldAnimate();
  const classes = getClasses();
  const [isLoading, setIsLoading] = useState(true);
  const imageSpaceRef = useRef<HTMLDivElement | null>(null);
  const availableImageSpace = useDimensions(imageSpaceRef);
  const picSelectedDims = useSelectedPicDims({
    availableSpace: {
      width:
        availableImageSpace.width !== undefined
          ? availableImageSpace.width
          : undefined,
      height:
        availableImageSpace.height !== undefined
          ? availableImageSpace.height - IMAGE_VERTICAL_PADDING_IN_PX
          : undefined,
    },
    picIndex: selectedPicIndex,
    galleryPics,
  });
  const stopPropagationRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const closeModalListener = (e: MouseEvent): void => {
      if (imageSpaceRef?.current === e.target) {
        onClose();
      }
    };
    window.addEventListener('click', closeModalListener);

    return () => {
      window.removeEventListener('click', closeModalListener);
    };
  }, [onClose]);

  useEffect(() => {
    const handleEscPressed = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscPressed);

    return () => {
      window.removeEventListener('keydown', handleEscPressed);
    };
  }, [onClose]);

  useEffect(() => {
    const popupWrapper = stopPropagationRef.current;
    const avoidScrollingBelow = (e: Event): void => {
      e.preventDefault();
    };

    if (popupWrapper === null) {
      return;
    }

    popupWrapper.addEventListener('wheel', avoidScrollingBelow);
    popupWrapper.addEventListener('scroll', avoidScrollingBelow);
    stopPropagationRef.current?.addEventListener(
      'touchmove',
      avoidScrollingBelow
    );

    return () => {
      if (popupWrapper === null) {
        return;
      }

      popupWrapper.removeEventListener('wheel', avoidScrollingBelow);
      popupWrapper.removeEventListener('scroll', avoidScrollingBelow);
    };
  });

  useEffect(() => {
    const popupWrapper = stopPropagationRef.current;
    const closeOnSwipe = (e: TouchEvent): void => {
      if (e.touches.length > 1) {
        return;
      }
      e.preventDefault();
      onClose();
    };

    if (popupWrapper === null) {
      return;
    }

    stopPropagationRef.current?.addEventListener('touchmove', closeOnSwipe);

    return () => {
      if (popupWrapper === null) {
        return;
      }

      popupWrapper.removeEventListener('touchmove', closeOnSwipe);
    };
  });

  return (
    <div
      role="dialog"
      aria-labelledby="modalTitle"
      css={classes.popup}
      ref={stopPropagationRef}
    >
      <h1 css={classes.title} id="modalTitle">
        Selected photo
      </h1>
      <div css={classes.closeButton}>
        <BareButton
          caption="Close"
          iconPath="close.svg"
          onClick={onClose}
          onKeyDown={onClose}
        />
      </div>
      <div css={classes.imageSpace} ref={imageSpaceRef}>
        {isLoading && shouldAnimate && (
          <figure css={classes.loadingPicFeedback}>
            <Loading css={classes.loadingPic} />
          </figure>
        )}
        <Image
          height={picSelectedDims[0]}
          width={picSelectedDims[1]}
          css={classes.image}
          loading="eager"
          onLoadingComplete={() => {
            setIsLoading(false);
          }}
          layout="fixed"
          src={galleryPics[selectedPicIndex].src}
          sizes="50vw"
          alt={isLoading ? 'Loading' : "Selected photo's big version"}
          quality={100}
        />
      </div>
    </div>
  );
};

export default Popup;
