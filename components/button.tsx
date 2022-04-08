import { dimensionInRem } from '../assets/styles/dimensions';

import breakpoints from '../assets/styles/breakpoints';

import colors from '../assets/styles/colors';

import { css } from '@emotion/react';

type ButtonProperties = {
  caption: string;
  iconPath?: string;
};

const Button = ({ caption, iconPath }: ButtonProperties) => {
  return (
    <span
      css={css({
        display: 'inline-block',
        boxSizing: 'border-box',
        border: `0px solid ${colors.almostBlack}`,
        borderBottom: `3px solid ${colors.almostBlack}`,
        borderTop: '3px solid transparent',
        backgroundColor: colors.grey,
        color: colors.almostWhite,
        fontFamily: 'Alegreya-Sans',
        fontSize: dimensionInRem(-1),
        borderRadius: dimensionInRem(-8),
        padding: `0.2rem 0.5rem`,
        '&:hover': {
          cursor: 'pointer',
        },
        '&:active': {
          border: `0px solid ${colors.totalBlack}`,
          borderTop: `3px solid ${colors.totalBlack}`,
          borderBottom: '3px solid transparent',
          paddingTop: '0.3rem',
          paddingBottom: '0.1rem',
          backgroundColor: colors.darkerGrey,
        },
        [breakpoints.maxMobile]: {
          fontSize: dimensionInRem(0),
          padding: `0.3rem 0.6rem`,
          '&:active': {
            paddingTop: '0.4rem',
            paddingBottom: '0.2rem',
          },
        },
      })}
    >
      {iconPath && (
        <img
          alt="download"
          role="presentation"
          src={iconPath}
          style={{
            height: dimensionInRem(-1),
            paddingRight: '0.3rem',
            display: 'inline-block',
            verticalAlign: 'middle',
            [breakpoints.maxMobile]: {
              height: dimensionInRem(0),
            },
          }}
        />
      )}
      {caption}
    </span>
  );
};

export default Button;
