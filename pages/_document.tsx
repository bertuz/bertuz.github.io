import colors from '../assets/styles/colors';

import breakpoints from '../assets/styles/breakpoints';

import { css, Global } from '@emotion/react';
import { Html, Head, Main, NextScript } from 'next/document';

const fontStyles = css(`
@font-face {
  font-family: "Alegreya";
  src: url("/fonts/alegreya.woff") format("woff");
  font-display: swap;
}

@font-face {
  font-family: "Indie Flower";
  src: url("/fonts/indie-flower.woff2") format("woff2");
  font-display: swap;
}
`);

const globalStyles = css({
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: colors.pastelViolet,
    [breakpoints.tablet]: {
      backgroundColor: colors.senape,
    },
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
        <link rel="icon" href="/public/logo.ico" type="image/x-icon" />
      </Head>
      <Global styles={[globalStyles, fontStyles]} />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
