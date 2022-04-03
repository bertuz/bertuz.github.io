import colors from '../assets/styles/colors';

import breakpoints from '../assets/styles/breakpoints';

import { useEffect, useState } from 'react';
import { css } from '@emotion/react';

import type { NextPage } from 'next';

// todo adopt csslint when available https://github.com/emotion-js/emotion/issues/2695
const useClasses = (showMac: boolean) => ({
  decorativeDescription: css({
    position: 'fixed',
    bottom: 0,
    left: 0,
    top: 0,
    width: '50vw',
    backgroundColor: colors.pastelViolet,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [breakpoints.tablet]: {
      display: 'none',
    },
  }),
  sideSmileyFace: css({ width: 250, height: 250 }),
  mac: css({
    position: 'absolute',
    display: 'block',
    top: '50vh',
    width: '250px',
    transition: 'all 0.2s ease-in-out',
    marginLeft: showMac ? undefined : '-100vw',
    paddingTop: showMac ? undefined : '50vh',
  }),
  cardSection: css({
    height: '80vh',
    minHeight: 170,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: '',
    backgroundColor: colors.senape,
    [breakpoints.tablet]: {
      height: '35vh',
    },
  }),
  nameTitle: css({
    fontSize: '2rem',
    lineHeight: '1rem',
    fontFamily: "'Indie Flower', cursive",
    margin: '1.5rem 0',
  }),
  jobDescription: css({
    margin: 0,
    textAlign: 'center',
    fontFamily: "'Alegreya', serif",
    textTransform: 'uppercase',
  }),
  presentationSection: css({
    padding: 24,
    backgroundColor: colors.mountainGrey,
    fontFamily: "'Alegreya', serif",
    fontSize: '1.2em',
  }),
  cardSectioinPresentationLogo: css({
    display: 'none',
    width: '2.5rem',
    height: '3rem',
    [breakpoints.tablet]: {
      display: 'inline',
    },
  }),
  presentationDescription: css({
    textAlign: 'justify',
    textjustify: 'inter-word',
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
  content: css({
    padding: 0,
    margin: 0,
    paddingLeft: '50vw',
    [breakpoints.tablet]: {
      paddingLeft: 0,
    },
  }),
});

const Home: NextPage = () => {
  const [showMac, setShowMac] = useState(false);
  // todo use memo so as to not recalculate for each render
  const classes = useClasses(showMac);

  useEffect(() => {
    function updatePosition() {
      if (window.scrollY ?? 0 > 200) {
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
      <aside css={classes.decorativeDescription} role="presentation">
        {/* todo https://stackoverflow.com/questions/71719915/how-to-make-next-js-load-images-from-public-source-with-default-img-element */}
        <img
          src="/smiley-face.svg"
          css={classes.sideSmileyFace}
          alt="Presentation logo"
          role="presentation"
        />
        <img src="/mac.svg" css={classes.mac} alt="mac" role="presentation" />
      </aside>
      <main css={classes.content}>
        <article css={classes.cardSection}>
          <div>
            <img
              src="/smiley-face.svg"
              css={classes.cardSectioinPresentationLogo}
              alt="Presentation logo"
              role="presentation"
            />
          </div>
          <h1 css={classes.nameTitle}>Matteo Bertamini</h1>
          <p css={classes.jobDescription}>Fullstack Developer</p>
        </article>
        <article css={classes.presentationSection}>
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
