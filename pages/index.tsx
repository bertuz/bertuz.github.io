import colors from '../assets/styles/colors';

import breakpoints from '../assets/styles/breakpoints';

import { dimensionInRem } from '../assets/styles/dimensions';

import Button from '../components/button';

import CVExperienceItem from '../components/CVExperienceItem';

import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';

import Link from 'next/link';

import type { NextPage } from 'next';

// todo adopt csslint when available https://github.com/emotion-js/emotion/issues/2695
const getClasses = (showMac: boolean) => ({
  asideColumn: css({
    position: 'fixed',
    bottom: 0,
    left: 0,
    top: 0,
    width: '50vw',
    backgroundColor: colors.pastelViolet,
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
  },
  laptop: css({
    position: 'absolute',
    width: '100%',
    transform: showMac
      ? 'translate(-450px, 200px)'
      : 'translate(-100vw, 100vh)',
    transition: 'all 0.2s ease-in-out',
  }),
  mainContent: css({
    padding: 0,
    margin: 0,
    paddingLeft: '50vw',
    [breakpoints.maxMobile]: {
      paddingLeft: 0,
    },
  }),
  presentationCard: css({
    height: '80vh',
    minHeight: 230,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: '',
    backgroundColor: colors.senape,
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
    padding: 24,
    backgroundColor: colors.mountainGrey,
    fontFamily: "'Alegreya', serif",
  }),
  presentationDescription: css({
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  workCard: css({
    backgroundColor: colors.sugarPaperBlue,
    padding: 24,
    fontFamily: "'Alegreya', serif",
  }),
  downloadCV: css({ marginBottom: 0 }),
  cvExperienceItem: css({
    paddingTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'justify',
    textjustify: 'inter-word',
    hyphens: 'auto',
  }),
  cvExperienceItemHeader: css({
    flex: '0 0 150px',
    paddingRight: '1rem',
    textAlign: 'right',
    fontFamily: 'Alegreya-Sans SC',
    ['@media (max-width: 1235px)']: {
      textAlign: 'left',
    },
  }),
  cvExperienceCompany: css({ fontSize: dimensionInRem(1) }),
  footer: css({
    display: 'block',
    backgroundColor: colors.senape,
  }),
  cvExperienceDescription: css({
    flex: '1 0 400px',
    '& > div': {
      maxWidth: 614,
    },
  }),

  footerContent: css({
    textAlign: 'center',
    fontFamily: "'Alegreya', serif",
    textTransform: 'uppercase',
    margin: 0,
    padding: 24,
  }),
});

const Home: NextPage = () => {
  const [showMac, setShowMac] = useState(false);
  const classes = useMemo(() => {
    return getClasses(showMac);
  }, [showMac]);

  useEffect(() => {
    function updatePosition() {
      if ((window.scrollY ?? 0) > 200) {
        setShowMac(true);
        return;
      }

      setShowMac(false);
    }

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return (
    <>
      <aside css={classes.asideColumn} role="presentation">
        {/* todo https://stackoverflow.com/questions/71719915/how-to-make-next-js-load-images-from-public-source-with-default-img-element */}
        <div css={classes.centralScene}>
          <div>
            <img
              css={classes.smileyFace}
              src="/smiley-face.svg"
              alt="Presentation logo"
              role="presentation"
            />
            <img
              css={classes.laptop}
              src="/mac.svg"
              alt="mac"
              role="presentation"
            />
          </div>
        </div>
      </aside>
      <main css={classes.mainContent}>
        <article css={classes.presentationCard}>
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
        </article>
        <article css={classes.descriptionCard}>
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
        <article css={classes.workCard}>
          <h2>Work Experience</h2>
          <p css={classes.downloadCV}>
            <CVExperienceItem headerInfo={null}>
              <Link href="api/cv" prefetch>
                <a role="link" download="Curriculum-Matteo-Bertamini.pdf">
                  <Button caption="Download CV" iconPath="/download.svg" />
                </a>
              </Link>
            </CVExperienceItem>
          </p>
          <CVExperienceItem
            headerInfo={{
              companyName: 'Telefónica',
              experienceDates: '2017 - Present',
            }}
          >
            I&apos;m part of a multidisciplinary team that aims to fully
            digitalize the customer care experience, from solving technical
            issues remotely to support{' '}
            <Link href="https://www.movistar.es/citaprevia" prefetch={false}>
              <a target="_blank" rel="noreferrer">
                their visit
              </a>
            </Link>{' '}
            in physical shops. Our work is visible on Vivo Brasil, Movistar
            (worldwide), O2 (worldwide) and Tuenti&apos;s apps.
            <ul>
              <li>Frontend: Typescript, React, Next.JS, Jest (and more!)</li>
              <li>Backend: Kotlin and Node, PHP8 and Java8 on legacy</li>
              <li>Kubernetes for our 52 environment 🤪</li>
              <li>
                We work in CI/CD, depending on the environment/product we are
              </li>
              <li>Clean architectures</li>
              <li>DDD: evangelizing the adoption</li>
            </ul>
          </CVExperienceItem>
        </article>
        {/*<article css={classes.descriptionCard}>*/}
        {/*  <h2>Contacts</h2>*/}
        {/*</article>*/}
        <div css={classes.footer}>
          <p css={classes.footerContent}>Matteo Bertamini 2022</p>
        </div>
        {/*<article style="height: 70vh; background-color: #DDF4C8; flex-shrink: 0; padding: 20px;">*/}
        {/*    <p style="font-family: 'Alegreya', serif; font-size: 1.2em;">*/}
        {/*        Come near, ladies and gentlemen!*/}
        {/*    </p>*/}
        {/*</article>*/}
      </main>
    </>
  );
};

export default Home;
