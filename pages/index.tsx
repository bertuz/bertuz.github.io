// todo migrate to app router once this has been fixed https://github.com/emotion-js/emotion/issues/2928#issuecomment-1552963155
import colors from '../assets/styles/colors';

import breakPoints, { MAX_MOBILE_WIDTH_PX } from '../assets/styles/breakPoints';

import { dimensionInRem } from '../assets/styles/dimensions';

import Button from '../components/Button';

import CVExperienceItem from '../components/CVExperienceItem';
import * as ga from '../lib/google-analytics';

import TextLink from '../components/TextLink';

import Camera from '../public/camera.svg';

import Chat from '../components/chat';

import Face from '../public/smiley-face.svg';
import FaceStatic from '../public/smiley-face-static.svg';
import Laptop from '../public/mac.svg';
import Balloon from '../public/balloon.svg';

import LoadImageSrc from '../assets/image-load.svg';
import useDimensions from '../utils/useDimensions';
import GalleryMainPicture from '../components/gallery/mainPicture';
import GalleryPopup from '../components/gallery/mainPicture/popup';

import useShouldAnimate from '../utils/useShouldAnimate';

import useScreenSize from '../utils/useScreenSize';

import toBase64 from '../utils/toBase64';
import { isRunningAcceptanceTest } from '../utils/testUtils';

import { Transition } from 'react-transition-group';

import { useEffect, useMemo, useRef, useState } from 'react';
import { css, keyframes } from '@emotion/react';

import Link from 'next/link';
import Image from 'next/image';

import * as Transitions from 'react-transition-group/Transition';

import type { GalleryPic } from 'components/gallery';

import type { NextPage } from 'next';

const GALLERY_TRANSITION_DURATION = 300;

const asideBackgroundColors: Record<string, [string, string, string]> = {
  presentation: [colors.senape, colors.senapeMedium, colors.senapeLight],
  description: [
    colors.schiapparelli,
    colors.schiapparelliLight,
    colors.almostWhite,
  ],
  work: [colors.stivoGreen, colors.stivoGreenLight, colors.almostWhite],
  photos: [colors.dawnBlue, colors.dawnBlueLighter, colors.almostWhite],
  chat: [colors.vividBlue, colors.mountainGrey, colors.almostWhite],
};

const bodyBackgroundColors: Record<string, [string, string]> = {
  presentation: [colors.senape, colors.senapeLight],
  description: [colors.schiapparelli, colors.schiapparelliLight],
  work: [colors.stivoGreen, colors.stivoGreenLight],
  photos: [colors.dawnBlue, colors.dawnBlueLighter],
  chat: [colors.vividBlue, colors.senape],
};

const cardBackgroundColors: Record<string, string> = {
  presentation: colors.senapeLight,
  description: colors.schiapparelliLight,
  work: colors.stivoGreenLight,
  photos: colors.dawnBlueLighter,
  chat: colors.mountainGrey,
};

const nodFaceKeyframes = keyframes({
  from: { marginTop: 0 },
  to: { marginTop: '10px' },
});

const TRANSITION_TIME_IN_MS = 400;
const TRANSITION_TIME_IN_SEC = 0.4;

const getClasses = (
  showMac: boolean,
  showingSection: 'presentation' | 'description' | 'work' | 'photos' | 'chat',
  shouldAnimate: boolean
) => ({
  imageTest: css({
    width: '100%',
    height: '100%',
    position: 'relative',
  }),
  imageClassLoading: css({
    opacity: 0.5,
  }),
  loadButHide: css({
    display: 'none !important',

    '& > div': {
      display: 'none !important',
    },
  }),
  imageClass: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,

    '& *': {
      transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    },
    display: 'block',
    border: `7px solid ${colors.almostWhite} !important`,
    borderRadius: 5,
  }),
  asideColumn: css({
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    position: 'fixed',
    overflow: 'hidden',
    bottom: 0,
    left: 0,
    top: 0,
    width: '50vw',
    background:
      showingSection !== 'photos'
        ? `transparent radial-gradient(ellipse 220% 95% at 120% center,  ${asideBackgroundColors[showingSection][1]} 2%, ${asideBackgroundColors[showingSection][0]} 40%)`
        : asideBackgroundColors[showingSection][0],

    [breakPoints.maxMobile]: {
      /* stylelint-disable */
      display: 'none',
    },
    /* stylelint-enable */
  }),
  illustrationForSection: css({
    transform: showingSection !== 'photos' ? 'none' : 'translate(-200%, 0%)',
    transition: shouldAnimate ? 'all 0.4s ease-in-out' : undefined,
    // todo wait transform and remove it from the DOM
    position: 'absolute',
    width: showMac ? '35%' : '45%',
    height: showMac ? '35%' : '45%',
    left: showMac ? '33%' : '25%',
    top: '35%',

    '& > div': {
      position: 'relative',
      width: '100%',
      height: '100%',
    },
  }),
  smileyFace: css({
    width: '100%',
    color: colors.almostWhite,
    zIndex: '1',
  }),
  laptop: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: showMac ? 'translate(-100%, 25%)' : 'translate(-100vw, 100vh)',
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,
    stroke: `${asideBackgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: asideBackgroundColors[showingSection][0],
    zIndex: '1',
  }),
  balloon: css({
    position: 'absolute',
    width: '80%',
    height: '80%',
    transition: shouldAnimate
      ? 'all 0.5s cubic-bezier(1,1,.61,1.45)'
      : undefined,
    transform:
      showingSection === 'chat'
        ? 'translate(-10%, -50%) rotate(20deg)'
        : 'translate(-70%, 20%) rotate(90deg) scaleX(0) scaleY(0)',
    stroke: `${asideBackgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: asideBackgroundColors[showingSection][0],
    zIndex: '0',
  }),
  face: css({
    height: '100%',
    width: '100%',
    fill: `${asideBackgroundColors[showingSection][2]} !important`,
    strokeWidth: '3 !important',
    animation: shouldAnimate
      ? `${nodFaceKeyframes} 3s alternate infinite !important`
      : undefined,
  }),
  mainContent: css({
    backgroundColor: colors.white,
    padding: 0,
    margin: 0,
    paddingLeft: '50vw',

    [breakPoints.maxMobile]: {
      paddingLeft: 0,
    },
  }),
  card: css({
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,
    padding: 24,
    paddingLeft: 48,
    opacity: 0.3,
    backgroundColor: colors.white,
  }),
  cardFocused: {
    opacity: 1,
    paddingLeft: 24,
    backgroundColor: cardBackgroundColors[showingSection] ?? colors.senape,
  },
  cardUnfocused: css({
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    paddingRight: 0,
    backgroundColor: colors.almostWhite,
  }),
  presentationCard: css({
    position: 'relative',
    overflow: 'hidden',
    height: '80vh',
    minHeight: 230,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    [breakPoints.maxMobile]: {
      height: '35vh',
    },
  }),
  presentationCardLogo: css({
    display: 'none',
    width: '2.5rem',
    height: '3.4rem',

    [breakPoints.maxMobile]: {
      display: 'inline',
    },
  }),
  nameTitle: css({
    fontFamily: "'Indie Flower', cursive",
  }),
  jobDescription: css({
    fontSize: dimensionInRem(1),
    margin: 0,
    textAlign: 'center',
    fontFamily: "'Alegreya SC', serif",
  }),
  descriptionCard: css({
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    backgroundColor: colors.mountainGrey,
    fontFamily: 'Alegreya, serif',
  }),
  photoCard: css({
    backgroundColor: colors.dawnBlueLight,
    fontFamily: 'Alegreya, serif',
  }),
  presentationDescription: css({
    textAlign: 'justify',
    textJustify: 'inter-word',
    hyphens: 'auto',
  }),
  workCard: css({
    fontFamily: 'Alegreya, serif',
  }),
  gallery: css({
    minHeight: 400,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'auto auto auto',
    gridAutoRows: '150px',
    columnGap: 10,
    rowGap: 10,
    marginTop: dimensionInRem(1),
  }),
  chatCard: css({
    backgroundColor: colors.mountainGrey,
    minHeight: '33vh',
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    fontFamily: 'Alegreya, serif',
  }),
  chatWrapper: css({
    marginTop: dimensionInRem(0),
  }),
  footer: css({
    display: 'block',
    backgroundColor: colors.senape,
  }),
  footerContent: css({
    textAlign: 'center',
    fontFamily: 'Alegreya, serif',
    textTransform: 'uppercase',
    margin: 0,
    padding: 24,
  }),
  polaroid: css({
    position: 'absolute',
    borderRadius: 5,
    height: 45,
    width: 45,
    padding: '20px',
    border: '15px solid ' + colors.mountainGrey,
    borderBottom: '55px solid ' + colors.mountainGrey,
    boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 75%)',
    transition: shouldAnimate ? 'all 0.2s ease-in-out' : undefined,

    [breakPoints.maxMobile]: {
      height: 25,
      width: 25,
      padding: 10,
      border: '5px solid ' + colors.mountainGrey,
      borderBottom: '20px solid ' + colors.mountainGrey,
    },
  }),
  frontPolaroid: css({
    bottom: -10,
    right: 80,
    rotate: '-15deg',

    backgroundColor: colors.pastelViolet,

    '&:hover': shouldAnimate
      ? {
          transform: 'translate(-10px, -10px)',
        }
      : undefined,

    svg: {
      '& > *': {
        stroke: '#795E98FF !important',
      },
    },

    [breakPoints.maxMobile]: {
      top: -10,
      right: -25,

      '&:hover': {
        top: 10,
        rotate: '7deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },

      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },
    },
  }),
  middlePolaroid: css({
    bottom: 0,
    right: 40,
    rotate: '-5deg',
    backgroundColor: colors.sugarPaperBlue,

    '&:hover': shouldAnimate
      ? {
          rotate: '-5deg',
          transform: 'translate(0px, -20px)',
        }
      : undefined,

    svg: {
      '& > *': {
        stroke: '#53777EFF !important',
      },
    },

    [breakPoints.maxMobile]: {
      top: 10,
      right: -5,
      rotate: '-50deg',

      '&:hover': {
        top: 10,
        rotate: '-35deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },

      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },
    },
  }),
  backPolaroid: css({
    bottom: -5,
    right: 0,
    rotate: '10deg',
    backgroundColor: 'grey',

    '&:hover': shouldAnimate
      ? {
          rotate: '5deg',
          transform: 'translate(0px, -20px)',
        }
      : undefined,

    [breakPoints.maxMobile]: {
      top: 45,
      right: -20,
      rotate: '-80deg',

      '&:hover': {
        top: 40,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },

      '&:focus': {
        top: 40,
        right: 5,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgb(0 0 0 / 100%)',
      },
    },
  }),
  pic: {
    height: '100%',
    width: '100%',
  },
  galleryArticle: css({
    position: 'relative',
  }),
  galleryArticleImage: css({
    objectFit: 'cover',
    boxSizing: 'border-box',
    borderRadius: 3,

    '&:hover': {
      cursor: 'pointer',
    },
  }),
  galleryArticleImageSelected: css({
    border: `4px solid ${colors.dawnBlueMedium} !important`,
  }),
  galleryMainPicCanvas: css({
    transition: shouldAnimate
      ? `all ${TRANSITION_TIME_IN_SEC}s ease-in-out`
      : undefined,
    height: 'calc(100% - 60px)',
    width: 'calc(100% - 60px)',
    margin: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  }),
  galleryMainPicCanvasTransitions: {
    [Transitions.ENTERING]: css({
      transform: shouldAnimate ? 'translate(200%, 0%) !important' : 'none',
    }),
    [Transitions.ENTERED]: css({
      // transform: 'translate(0%, 0%) !important',
    }),
    [Transitions.EXITING]: css({
      transform: shouldAnimate ? 'translate(200%, 0%) !important' : 'none',
    }),
    [Transitions.EXITED]: css({
      transform: shouldAnimate ? 'translate(200%, 0%) !important' : 'none',
    }),
    [Transitions.UNMOUNTED]: css({
      // transform: shouldAnimate ? 'translate(200%, 0%) !important' : 'none',
    }),
  },
  galleryPopup: css({
    transition: shouldAnimate
      ? `opacity ${GALLERY_TRANSITION_DURATION}ms ease-in-out`
      : undefined,
    zIndex: 1,
    position: 'fixed',
  }),
  galleryPopupTransitions: {
    [Transitions.ENTERING]: css({ opacity: 1 }),
    [Transitions.ENTERED]: css({ opacity: 1 }),
    [Transitions.EXITING]: css({ opacity: 0 }),
    [Transitions.EXITED]: css({ opacity: 0 }),
    [Transitions.UNMOUNTED]: css({ opacity: 0 }),
  },
});

type HomeProperties = {
  galleryPics: Array<GalleryPic>;
};

const Home: NextPage<HomeProperties> = ({ galleryPics }) => {
  const [showMac, setShowMac] = useState(false);
  const [showingSection, setShowingSection] = useState<
    'presentation' | 'description' | 'work' | 'photos' | 'chat'
  >('presentation');
  const shouldAnimate = useShouldAnimate();
  const [showGalleryPopup, setShowGalleryPopup] = useState(false);
  const classes = useMemo(() => {
    return getClasses(showMac, showingSection, shouldAnimate);
  }, [showMac, showingSection, shouldAnimate]);
  const descriptionCardRef = useRef<HTMLElement | null>(null);
  const workCardRef = useRef<HTMLElement | null>(null);
  const chatCardRef = useRef<HTMLElement | null>(null);
  const photoCardRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const asideDims = useDimensions(asideRef);
  const { isDesktopOrBigger, isMobile } = useScreenSize();
  const [galleryPicSelected, setGalleryPicSelected] = useState<number>(0);

  useEffect(() => {
    if (!shouldAnimate) {
      (
        global?.window?.document
          ?.getElementsByClassName(`css-${classes.face.name}`)
          ?.item(0) as SVGSVGElement
      )?.pauseAnimations();

      (
        global?.window?.document
          ?.getElementsByClassName(`css-${classes.smileyFace.name}`)
          ?.item(0) as SVGSVGElement
      )?.pauseAnimations();
    }
  }, [classes.face.name, classes.smileyFace.name, shouldAnimate]);

  useEffect(() => {
    function updatePosition(): void {
      const windowHeight: number = isNaN(window.innerHeight)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.clientHeight
        : window.innerHeight;
      const windowWidth: number = isNaN(window.innerWidth)
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.clientWidth
        : window.innerWidth;

      if (
        windowHeight -
          (chatCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('chat');

        return;
      }

      if (
        windowHeight -
          (photoCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('photos');
        return;
      }

      if (
        windowHeight -
          (workCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        windowHeight / 3
      ) {
        setShowMac(true);
        setShowingSection('work');

        return;
      }

      if (
        windowHeight -
          (descriptionCardRef?.current?.getBoundingClientRect()?.top ?? 0) >
        (windowWidth > MAX_MOBILE_WIDTH_PX
          ? windowHeight / 3
          : (windowHeight * 3) / 4)
      ) {
        setShowMac(true);
        setShowingSection('description');
        return;
      }

      setShowMac(false);
      setShowingSection('presentation');
    }

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  useEffect(() => {
    document.body.style.background =
      bodyBackgroundColors[showingSection][isDesktopOrBigger ? 0 : 1];
  }, [isDesktopOrBigger, showingSection]);

  return (
    <>
      {isDesktopOrBigger && (
        <aside
          css={classes.asideColumn}
          role={showingSection !== 'photos' ? 'presentation' : 'complementary'}
          ref={asideRef}
        >
          <div css={classes.illustrationForSection} role="presentation">
            <div>
              {shouldAnimate && <Face css={classes.face} />}
              {!shouldAnimate && <FaceStatic css={classes.face} />}
              <Laptop css={classes.laptop} />
              <Balloon css={classes.balloon} />
            </div>
          </div>
          <Transition
            enter={shouldAnimate}
            exit={shouldAnimate}
            in={showingSection === 'photos'}
            appear={shouldAnimate}
            mountOnEnter={true}
            unmountOnExit={true}
            timeout={{
              appear: 0,
              enter: 0,
              exit: TRANSITION_TIME_IN_MS,
            }}
          >
            {(state) => (
              <GalleryMainPicture
                css={[
                  classes.galleryMainPicCanvas,
                  classes.galleryMainPicCanvasTransitions[state],
                ]}
                role={showingSection === 'photos' ? 'img' : 'none'}
                aria-label={
                  "Big version of the photo gallery's selected picture"
                }
                galleryPics={galleryPics}
                selectedPicIndex={galleryPicSelected}
                availableMainPictureSpace={asideDims}
              />
            )}
          </Transition>
        </aside>
      )}
      {isMobile && (
        <Transition
          enter={shouldAnimate}
          exit={shouldAnimate}
          in={showGalleryPopup}
          timeout={TRANSITION_TIME_IN_MS}
          mountOnEnter={true}
          unmountOnExit={true}
        >
          {(state) => (
            <div
              css={[
                classes.galleryPopup,
                classes.galleryPopupTransitions[state],
              ]}
            >
              <GalleryPopup
                onClose={() => {
                  setShowGalleryPopup(false);
                  ga.click('gallery-pic-popup-open');
                }}
                galleryPics={galleryPics}
                selectedPicIndex={galleryPicSelected}
              />
            </div>
          )}
        </Transition>
      )}
      <main css={classes.mainContent}>
        <article
          css={[
            classes.card,
            classes.presentationCard,
            showingSection === 'presentation'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <div>
            <img
              src={
                shouldAnimate ? '/smiley-face.svg' : '/smiley-face-static.svg'
              }
              css={classes.presentationCardLogo}
              alt="Presentation logo"
              role="presentation"
            />
          </div>
          <h1 css={classes.nameTitle}>Matteo Bertamini</h1>
          <p css={classes.jobDescription}>Fullstack Developer</p>
          <a
            href="#photos"
            rel="noreferrer"
            onClick={(event) => {
              ga.click('photos');

              if (!shouldAnimate) {
                return;
              }

              event.preventDefault();
              photoCardRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div css={[classes.polaroid, classes.backPolaroid]}>
              <Camera css={classes.pic} />
            </div>
            <div css={[classes.polaroid, classes.middlePolaroid]}>
              <Camera css={classes.pic} />
            </div>
            <div css={[classes.polaroid, classes.frontPolaroid]}>
              <Camera css={classes.pic} />
            </div>
          </a>
        </article>
        <article
          ref={descriptionCardRef}
          css={[
            classes.card,
            classes.descriptionCard,
            showingSection === 'description'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2>Toolbox</h2>
          <p css={classes.presentationDescription}>
            I like the idea of a developer as an artisan who loves and cares its
            product the most. <br />
            Pushed by that mindset, I constantly grow and cover different
            expertises.
          </p>
          <p css={classes.presentationDescription}>
            With that in mind, this is what I currently have in my toolbox 🧑🏽‍💻:
          </p>
          <ul>
            <li>
              Frontend
              <ul>
                <li>ES6: vanilla, Typescript, Flow.js</li>
                <li>React</li>
                <li>Next.JS</li>
              </ul>
            </li>
            <li>
              Backend
              <ul>
                <li>Node</li>
                <li>Java: Kotlin, Groovy</li>
                <li>PHP: symfony</li>
                <li>C++: Qt</li>
              </ul>
            </li>
            <li>
              Cross
              <ul>
                <li>Agile: kanban and scrum</li>
                <li>Kubernetes</li>
                <li>Hexagonal architecture</li>
                <li>DDD</li>
              </ul>
            </li>
          </ul>
        </article>
        <article
          ref={workCardRef}
          css={[
            classes.card,
            classes.workCard,
            showingSection === 'work'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2 id="work-experience">Work Experience</h2>
          <CVExperienceItem>
            <Link
              href="/api/cv"
              prefetch
              role="link"
              download="Curriculum-Matteo-Bertamini.pdf"
              onKeyPress={() => {
                ga.click('cv');
              }}
              onClick={() => {
                ga.click('cv');
              }}
              tabIndex={0}
            >
              <Button caption="Download CV" iconPath="/download.svg" />
            </Link>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Telefónica',
              experienceDates: '2017 - Present',
            }}
          >
            I&apos;m part of a multidisciplinary team that aims to fully
            digitalize the{' '}
            <TextLink href="https://www.movistar.es/particulares/movil/servicios/app-mimovistar/">
              customer care experience
            </TextLink>
            , from solving technical issues remotely to support{' '}
            <TextLink href="https://www.movistar.es/citaprevia">
              their visit
            </TextLink>{' '}
            in physical shops. Our work is visible on Vivo Brasil, Movistar
            (worldwide), O2 (worldwide) and Tuenti&apos;s apps.
            <ul>
              <li>Frontend: Typescript, React, Next.JS, Jest (and more!)</li>
              <li>Backend: Kotlin and Node, PHP8 and Java8 on legacy</li>
              <li>Kubernetes for our 52 environments 🤪</li>
              <li>We work in CI/CD, depending on the environment/product</li>
              <li>Clean architectures</li>
              <li>DDD: evangelizing the adoption</li>
              <li>
                Development of{' '}
                <TextLink href="https://www.npmjs.com/package/ya-google-maps-react">
                  google Maps interfaces
                </TextLink>
              </li>
            </ul>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Belka',
              experienceDates: '2015 - 2017',
            }}
          >
            Evolution of a legacy{' '}
            <TextLink href="https://www.electricautomationnetwork.com/en/carlo-gavazzi/carlo-gavazzi-em2serverstdl1">
              HW-SW platform
            </TextLink>{' '}
            to plan, analyse and monitoring energy and environmental data to cut
            energy-related costs in big and industrial buildings.
            <ul>
              <li>
                Legacy: evolution of an undocumented old back-frontend towards a
                long lasting, future-proof solution
                <ul>
                  <li>Adoption of DDD</li>
                  <li>
                    Progressive transition to{' '}
                    <TextLink href="https://www.reactivemanifesto.org/">
                      Reactive architecture
                    </TextLink>
                  </li>
                  <li>
                    BDD and Acceptance testing in order to cover old a new
                    requisites
                  </li>
                  <li>
                    Evolution in scrum cycles with a tight collaboration with
                    the stakeholders
                  </li>
                </ul>
              </li>
              <li>
                <TextLink href="https://github.com/BelkaLab/react-translatable-input">
                  Multi-lang
                </TextLink>{' '}
                <TextLink href="https://github.com/BelkaLab/i18n-timezones">
                  multi-timezones
                </TextLink>{' '}
                challenging requisites that led to implement tailored solutions
              </li>
              <li>Backend: PHP7, Symfony framework</li>
              <li>Frontend: React</li>
            </ul>
          </CVExperienceItem>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Tembo',
              experienceDates: '2014 - 2015',
            }}
          >
            Evolution and maintenance of Tembo White, an independent e-commerce
            platform based on Prestashop.
            <ul>
              <li>Prestashop</li>
              <li>
                React JS for frontend embedded widgets in products&apos; pages
              </li>
              <li>Continuous deployment</li>
            </ul>
          </CVExperienceItem>
        </article>
        <article
          id="photos"
          ref={photoCardRef}
          css={[
            classes.card,
            classes.photoCard,
            showingSection === 'photos'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2>Photos</h2>
          <div css={classes.gallery}>
            {galleryPics.map((image, index: number) => (
              <article key={image.name} css={classes.galleryArticle}>
                <Image
                  fill
                  loading="lazy"
                  onClick={() => {
                    if (showingSection !== 'photos') {
                      return;
                    }

                    ga.click('gallery-pic-selected');

                    setGalleryPicSelected(index);

                    if (isMobile) {
                      ga.click('gallery-pic-popup-open');
                      setShowGalleryPopup(true);
                    }
                  }}
                  src={image.src}
                  sizes={`(max-width: ${MAX_MOBILE_WIDTH_PX}px) 247px, 17vw`}
                  alt={`Image number ${index + 1}`}
                  quality={50}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    LoadImageSrc
                  )}`}
                  css={[
                    classes.galleryArticleImage,
                    galleryPicSelected === index && isDesktopOrBigger
                      ? classes.galleryArticleImageSelected
                      : null,
                  ]}
                />
              </article>
            ))}
          </div>
        </article>
        <article
          ref={chatCardRef}
          css={[
            classes.card,
            classes.chatCard,
            showingSection === 'chat'
              ? classes.cardFocused
              : classes.cardUnfocused,
          ]}
        >
          <h2 id="chat-with-me">Chat with me</h2>
          <div css={classes.chatWrapper}>
            <Chat />
          </div>
        </article>
        <div css={classes.footer}>
          <p css={classes.footerContent}>Matteo Bertamini 2022</p>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps() {
  try {
    if (isRunningAcceptanceTest()) {
      return {
        props: {
          galleryPics: [
            {
              src: '/test.jpg',
              name: 'photo test',
              dimensions: {
                ratio: 968 / 1500,
                thumbnail: {
                  height: 129.1,
                  width: 200,
                },
                original: {
                  height: 968,
                  width: 1500,
                },
              },
            },
          ],
        },
      };
    }

    const response = await fetch(
      'https://www.amazon.it/drive/v1/nodes/mmVUOJzUS_KqKRykQrzFPA/children?asset=ALL&filters=kind%3A(FILE*+OR+FOLDER*)+AND+contentProperties.contentType%3A(image*)+AND+status%3A(AVAILABLE*)&limit=15&lowResThumbnail=true&searchOnFamily=true&sort=%5B%27contentProperties.contentDate+DESC%27%5D&tempLink=true&shareId=qFervNlenYwkjdQ1o26YOsWhld5fnsJ0t89xbcv2Vep&offset=0&resourceVersion=V2&ContentType=JSON&_=1660508015523'
    );

    if (!response?.body) {
      return [];
    }

    const data = await response.json();

    const images = data.data.map(
      (photo: {
        contentProperties: { image: { height: number; width: number } };
        tempLink: string;
        name: string;
      }) => {
        const { height: originalHeight, width: originalWidth } =
          photo.contentProperties.image;
        const dimensionsRatio = originalHeight / originalWidth;
        const thumbnailFitWidth =
          originalHeight > 200
            ? [200, 200 / dimensionsRatio]
            : [originalHeight, originalWidth];
        const thumbnailFit =
          originalWidth > 150
            ? [thumbnailFitWidth[0] * dimensionsRatio, 150]
            : thumbnailFitWidth;

        return {
          src: photo.tempLink,
          name: photo.name,
          dimensions: {
            ratio: dimensionsRatio,
            thumbnail: {
              height: thumbnailFit[0],
              width: thumbnailFit[1],
            },
            original: {
              height: originalHeight,
              width: originalWidth,
            },
          },
        };
      }
    );

    return {
      props: {
        galleryPics: images,
      },
    };
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default Home;
