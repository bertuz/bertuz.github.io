import colors from '../assets/styles/colors';

import breakpoints from '../assets/styles/breakpoints';

import { dimensionInRem } from '../assets/styles/dimensions';

import { useEffect, useState } from 'react';
import { css } from '@emotion/react';

import Link from 'next/link';

import type { NextPage } from 'next';

// todo adopt csslint when available https://github.com/emotion-js/emotion/issues/2695
const useClasses = (showMac: boolean) => ({
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
    bottom: showMac ? 0 : '-60vh',
    left: showMac ? 0 : '-100%',
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
    hyphens: 'auto',
    textjustify: 'inter-word',
  }),
  workCard: css({
    backgroundColor: colors.sugarPaperBlue,
    padding: 24,
    fontFamily: "'Alegreya', serif",
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
  button: css(`align-self: center;
background-color: #A3BEC4;
background-image: none;
background-position: 0 90%;
background-repeat: repeat no-repeat;
background-size: 4px 3px;
border-radius: 15px 225px 255px 15px 15px 255px 225px 15px;
border-style: solid;
border-width: 2px;
box-shadow: rgba(0, 0, 0, .2) 5px 11px 16px 0px;
box-sizing: border-box;
color: #41403e;
cursor: pointer;
display: inline-block;
font-size: 1rem;
font-family: Alegreya-Sans;
line-height: 23px;
outline: none;
padding: .45rem 2rem;
text-decoration: none;
transition: all 235ms ease-in-out;
border-bottom-left-radius: 15px 255px;
border-bottom-right-radius: 225px 15px;
border-top-left-radius: 255px 15px;
border-top-right-radius: 15px 225px;
user-select: none;
-webkit-user-select: none;
touch-action: manipulation;
font-weight: bold;
:focus {
  box-shadow: rgba(0, 0, 0, .3) 2px 8px 4px -6px;
}
:active {
  box-shadow: rgba(0, 0, 0, .3) 2px 8px 4px -6px;
}
:hover {
transform: translate3d(0, 2px, 0);
}
`),
});

const Home: NextPage = () => {
  const [showMac, setShowMac] = useState(false);

  // todo use memo so as to not recalculate for each render
  const classes = useClasses(showMac);

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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '0 0 auto',
                paddingRight: '1rem',
                textAlign: 'right',
                fontFamily: 'Alegreya-Sans',
              }}
            >
              Telefónica
              <br />
              2017 - Present
            </div>
            <div
              style={{
                flex: '1 1 300px',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid
              architecto consequuntur ea et exercitationem fuga libero minima
              nisi nulla odio, odit pariatur, totam ut, voluptatibus voluptatum.
              Dolorum excepturi hic nobis?
              <ul>
                <li>bla</li>
                <li>bla</li>
                <li>bla</li>
                <li>bla</li>
                <li>bla</li>
                <li>bla</li>
                <li>bla</li>
              </ul>
            </div>
          </div>
        </article>
        <article css={classes.descriptionCard}>
          <h2>Contacts</h2>
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
