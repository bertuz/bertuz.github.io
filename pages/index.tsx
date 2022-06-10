import colors from '../assets/styles/colors';

import breakpoints, { MAX_MOBILE_WIDTH_PX } from '../assets/styles/breakpoints';

import { dimensionInRem } from '../assets/styles/dimensions';

import Button from '../components/button';

import CVExperienceItem from '../components/CVExperienceItem';
import * as ga from '../lib/google-analytics';

import TextLink from '../components/TextLink';

import Camera from '../public/camera.svg';

import Chat from '../components/chat';

import Face from '../public/smiley-face.svg';
import Laptop from '../public/mac.svg';
import Balloon from '../public/balloon.svg';

import { useEffect, useMemo, useRef, useState } from 'react';
import { css, keyframes } from '@emotion/react';

import Link from 'next/link';

import type { NextPage } from 'next';

const backgroundColors: Record<string, [string, string, string]> = {
  presentation: [colors.pastelViolet, colors.senape, colors.pastelVioletDark],
  description: [colors.vividBlue, colors.mountainGrey, colors.almostWhite],
  work: [colors.vividRed, colors.sugarPaperBlue, colors.almostWhite],
  chat: [colors.vividBlue, colors.mountainGrey, colors.almostWhite],
};

const nodFaceKeyframes = keyframes({
  from: { marginTop: 0 },
  to: { marginTop: '10px' },
});

// todo adopt csslint when available https://github.com/emotion-js/emotion/issues/2695
const getClasses = (
  showMac: boolean,
  showingSection: 'presentation' | 'description' | 'work' | 'chat'
) => ({
  asideColumn: css({
    transition: 'all 0.4s ease-in-out',
    position: 'fixed',
    bottom: 0,
    left: 0,
    top: 0,
    width: '50vw',
    backgroundColor: backgroundColors[showingSection][0] ?? colors.senape,
    [breakpoints.maxMobile]: {
      display: 'none',
    },
  }),
  centralScene: css({
    position: 'absolute',
    width: showMac ? '35%' : '45%',
    height: showMac ? '35%' : '45%',
    left: showMac ? '33%' : '25%',
    top: '35%',
    transition: 'all 0.2s ease-in-out',
    '& > div': {
      position: 'relative',
    },
  }),
  smileyFace: {
    width: '100%',
    color: 'white',
  },
  laptop: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: showMac ? 'translate(-100%, 25%)' : 'translate(-100vw, 100vh)',
    transition: 'all 0.2s ease-in-out',
    stroke: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: backgroundColors[showingSection][0],
  }),
  balloon: css({
    position: 'absolute',
    width: '80%',
    height: '80%',
    transform:
      showingSection === 'chat'
        ? 'translate(-10%, -50%) rotate(20deg)'
        : 'translate(-100vw, 100vh)',
    transition: 'all 0.2s ease-in-out',
    stroke: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '2',
    fill: backgroundColors[showingSection][0],
  }),
  face: css({
    height: '100%',
    width: '100%',
    fill: `${backgroundColors[showingSection][2]} !important`,
    strokeWidth: '3 !important',
    animation: `${nodFaceKeyframes} 3s alternate infinite;`,
  }),
  mainContent: css({
    backgroundColor: colors.white,
    padding: 0,
    margin: 0,
    paddingLeft: '50vw',
    [breakpoints.maxMobile]: {
      paddingLeft: 0,
    },
  }),
  card: css({
    transition: 'all 0.2s ease-in-out',
    padding: 24,
    paddingLeft: 48,
    opacity: 0.3,
    backgroundColor: colors.white,
  }),
  cardFocused: {
    opacity: 1,
    paddingLeft: 24,
    backgroundColor: backgroundColors[showingSection][1] ?? colors.senape,
  },
  presentationCard: css({
    position: 'relative',
    overflow: 'hidden',
    height: '80vh',
    minHeight: 230,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [breakpoints.maxMobile]: {
      height: '35vh',
    },
  }),
  presentationCardLogo: css({
    display: 'none',
    width: '2.5rem',
    height: '3.4rem',
    [breakpoints.maxMobile]: {
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
    fontFamily: "'Alegreya', serif",
  }),
  presentationDescription: css({
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  workCard: css({
    fontFamily: "'Alegreya', serif",
  }),
  chatCard: css({
    backgroundColor: colors.mountainGrey,
    minHeight: '33vh',
    opacity: 0.5,
    padding: 24,
    paddingLeft: 48,
    fontFamily: "'Alegreya', serif",
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
    fontFamily: "'Alegreya', serif",
    textTransform: 'uppercase',
    margin: 0,
    padding: 24,
  }),
  polaroid: css({
    position: 'absolute',
    height: 45,
    width: 45,
    padding: '20px',
    border: '15px solid ' + colors.mountainGrey,
    borderBottom: '55px solid ' + colors.mountainGrey,
    boxShadow: '3px 1px 33px -4px rgba(0,0,0,0.75)',
    transition: 'all 0.2s ease-in-out',
    [breakpoints.maxMobile]: {
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
    '&:hover': {
      transform: 'translate(-10px, -10px)',
    },
    svg: {
      '& > *': {
        stroke: '#795E98FF !important',
      },
    },
    [breakpoints.maxMobile]: {
      top: -10,
      right: -25,
      '&:hover': {
        top: 10,
        rotate: '7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  middlePolaroid: css({
    bottom: 0,
    right: 40,
    rotate: '-5deg',
    backgroundColor: colors.sugarPaperBlue,
    '&:hover': {
      rotate: '-5deg',
      transform: 'translate(0px, -20px)',
    },
    svg: {
      '& > *': {
        stroke: '#53777EFF !important',
      },
    },
    [breakpoints.maxMobile]: {
      top: 10,
      right: -5,
      rotate: '-50deg',
      '&:hover': {
        top: 10,
        rotate: '-35deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        rotate: '-7deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  backPolaroid: css({
    bottom: -5,
    right: 0,
    rotate: '10deg',
    backgroundColor: 'grey',
    '&:hover': {
      rotate: '5deg',
      transform: 'translate(0px, -20px)',
    },
    [breakpoints.maxMobile]: {
      top: 45,
      right: -20,
      rotate: '-80deg',
      '&:hover': {
        top: 40,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
      '&:focus': {
        top: 40,
        right: 5,
        rotate: '-50deg',
        boxShadow: '3px 1px 33px -4px rgba(0,0,0,1)',
      },
    },
  }),
  pic: {
    height: '100%',
    width: '100%',
  },
});

const Home: NextPage = () => {
  const [showMac, setShowMac] = useState(false);
  const [showingSection, setShowingSection] = useState<
    'presentation' | 'description' | 'work' | 'chat'
  >('presentation');
  const classes = useMemo(() => {
    return getClasses(showMac, showingSection);
  }, [showMac, showingSection]);
  const descriptionCardRef = useRef<HTMLElement | null>(null);
  const workCardRef = useRef<HTMLElement | null>(null);
  const chatCardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function updatePosition() {
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

  return (
    <>
      <aside css={classes.asideColumn} role="presentation">
        {/*/!* todo https://stackoverflow.com/questions/71719915/how-to-make-next-js-load-images-from-public-source-with-default-img-element *!/*/}
        <div css={classes.centralScene}>
          <div css={{ position: 'relative', width: '100%', height: '100%' }}>
            <Face css={classes.face}></Face>
            <Laptop css={classes.laptop} />
            <Balloon css={classes.balloon} />
          </div>
        </div>
      </aside>
      <main css={classes.mainContent}>
        <article
          css={[
            classes.card,
            classes.presentationCard,
            showingSection === 'presentation' ? classes.cardFocused : null,
          ]}
        >
          <div>
            <img
              src="/smiley-face.svg"
              css={classes.presentationCardLogo}
              alt="Presentation logo"
              role="presentation"
            />
          </div>
          <h1 css={classes.nameTitle}>Matteo Bertamini</h1>
          <p css={classes.jobDescription}>Fullstack Developer</p>
          {/* todo if not on mobile use blank */}
          <a
            href="https://www.amazon.it/photos/share/qFervNlenYwkjdQ1o26YOsWhld5fnsJ0t89xbcv2Vep"
            rel="noreferrer"
            onClick={() => {
              ga.click('photos');
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
            showingSection === 'description' ? classes.cardFocused : null,
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
            showingSection === 'work' ? classes.cardFocused : null,
          ]}
        >
          <h2 id="work-experience">Work Experience</h2>
          <CVExperienceItem>
            <Link href="/api/cv" prefetch>
              <a
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
              </a>
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
          ref={chatCardRef}
          css={[
            classes.card,
            classes.chatCard,
            showingSection === 'chat' ? classes.cardFocused : null,
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

export default Home;
