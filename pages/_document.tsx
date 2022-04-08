import colors from '../assets/styles/colors';

import breakpoints from '../assets/styles/breakpoints';

import { dimensionInRem, PITCH_IN_PX } from 'assets/styles/dimensions';

import { css, Global } from '@emotion/react';
import { Html, Head, Main, NextScript } from 'next/document';

const fontStyles = css(`
@font-face {
  font-family: "Alegreya";
  src: url("/fonts/Alegreya-Regular.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Alegreya SC";
  src: url("/fonts/AlegreyaSC-Regular.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Alegreya-Sans";
  src: url("/fonts/AlegreyaSans-Regular.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Alegreya-Sans";
  src: url("/fonts/AlegreyaSans-Bold.woff2") format("woff2");
  font-display: swap;
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: "Alegreya-Sans SC";
  src: url("/fonts/AlegreyaSansSC-Regular.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Indie Flower";
  src: url("/fonts/indie-flower.woff2") format("woff2");
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src: url("/fonts/Roboto-Medium.ttf") format("ttf");
  font-display: swap;
}
`);

const globalStyles = css({
  html: {
    fontSize: PITCH_IN_PX,
    color: colors.almostBlack,
  },
  a: {
    color: colors.almostBlack,
  },
  body: {
    fontSize: dimensionInRem(0),
    margin: 0,
    padding: 0,
    backgroundColor: colors.pastelViolet,
    [breakpoints.maxMobile]: {
      backgroundColor: colors.senape,
    },
  },
  p: {
    fontSize: dimensionInRem(0),
  },
  h1: {
    fontSize: dimensionInRem(3),
    lineHeight: '2rem',
    margin: 0,
  },
  h2: {
    margin: 0,
    fontSize: dimensionInRem(2),
    lineHeight: '1.5rem',
  },
});

export default function Document() {
  return (
    <Html lang="en-US">
      <Head>
        <meta charSet="utf-8" />
        <meta name="author" content="Matteo Bertamini" />
        <meta
          name="description"
          content="Matteo Bertamini's web page, fullstack developer. Living between Madrid and Italy."
        />
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
      </Head>
      <Global styles={[globalStyles, fontStyles]} />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
