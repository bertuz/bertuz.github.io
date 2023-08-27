// todo migrate to app router once this has been fixed https://github.com/emotion-js/emotion/issues/2928#issuecomment-1552963155
import { dimensionInRem } from '../../assets/styles/dimensions';

import { useEffect, useMemo } from 'react';
import { css } from '@emotion/react';

import type { NextPage } from 'next';

const getClasses = () => ({
  openApp: css({
    fontSize: dimensionInRem(3),
    fontFamily: "'Indie Flower', cursive",
    textAlign: 'right',
  }),
  body: css({ position: 'absolute', bottom: 0 }),
});

const Home: NextPage = () => {
  const classes = useMemo(() => {
    return getClasses();
  }, []);

  useEffect(() => {
    document.body.style.background = 'white';
  }, []);

  return (
    <main style={{ height: '100vh', width: '100%', backgroundColor: 'white' }}>
      <div css={classes.openApp}>
        Abre <img src="flecha.png" alt="abre app" />
      </div>
      <article css={classes.body}>
        <img
          alt="imagen representativa"
          style={{ width: '100%' }}
          src="osito.png"
        />
      </article>
    </main>
  );
};

export default Home;
