import { dimensionInRem } from '../assets/styles/dimensions';

import breakPoints from '../assets/styles/breakPoints';

import colors from '../assets/styles/colors';

import { css } from '@emotion/react';
import { useMemo } from 'react';

type ButtonProperties = {
  caption: string;
  iconPath?: string;
  disabled?: boolean;
};

const getClasses = (disabled: boolean) => {
  return {
    wrapper: css({
      display: 'inline-block',
      userSelect: 'none',
      boxSizing: 'border-box',
      border: `0 solid ${colors.almostBlack}`,
      borderBottom: `3px solid ${colors.almostBlack}`,
      borderTop: '3px solid transparent',
      backgroundColor: disabled ? colors.greyTransparent : colors.grey,
      color: disabled ? colors.grey : colors.almostWhite,
      fontFamily: 'Alegreya-Sans, sans-serif',
      fontSize: dimensionInRem(-1),
      borderRadius: dimensionInRem(-8),
      padding: `0.2rem 0.5rem`,

      '&:hover': {
        cursor: disabled ? 'not-allowed' : 'pointer',
      },
      '&:active': disabled
        ? {}
        : {
            border: `0px solid ${colors.totalBlack}`,
            borderTop: `3px solid ${colors.totalBlack}`,
            borderBottom: '3px solid transparent',
            paddingTop: '0.3rem',
            paddingBottom: '0.1rem',
            backgroundColor: colors.darkerGrey,
          },

      [breakPoints.maxMobile]: disabled
        ? {}
        : {
            fontSize: dimensionInRem(0),
            padding: `0.3rem 0.6rem`,
            '&:active': {
              paddingTop: '0.4rem',
              paddingBottom: '0.2rem',
            },
          },
    }),
  };
};

const Button = ({ caption, iconPath, disabled = false }: ButtonProperties) => {
  const classes = useMemo(() => {
    return getClasses(disabled);
  }, [disabled]);

  return (
    <span css={css(classes.wrapper)} role="button">
      {/* todo change path with element so as to load svg within the HTML from SSR */}
      {iconPath && (
        <img
          alt="download"
          role="presentation"
          src={iconPath}
          css={css({
            height: dimensionInRem(-1),
            paddingRight: '0.3rem',
            display: 'inline-block',
            verticalAlign: 'middle',

            [breakPoints.maxMobile]: {
              height: dimensionInRem(0),
            },
          })}
        />
      )}
      {caption}
    </span>
  );
};

export default Button;
