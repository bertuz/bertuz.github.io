import { dimensionInRem } from '../assets/styles/dimensions';

import breakPoints from '../assets/styles/breakPoints';

import colors from '../assets/styles/colors';

import { css } from '@emotion/react';

import { useMemo } from 'react';

import type { MouseEventHandler, KeyboardEventHandler } from 'react';

type ButtonProperties = {
  caption: string;
  iconPath?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  onKeyDown?: KeyboardEventHandler<HTMLSpanElement>;
};

const getClasses = (disabled: boolean) => {
  return {
    wrapper: css({
      display: 'inline-block',
      userSelect: 'none',
      boxSizing: 'border-box',
      border: `0px solid ${colors.almostBlack}`,
      color: disabled ? colors.grey : colors.almostWhite,
      fontFamily: 'Alegreya-Sans',
      fontSize: dimensionInRem(-1),
      borderRadius: dimensionInRem(-8),
      padding: `0.2rem 0.5rem`,
      '&:hover': {
        cursor: disabled ? 'not-allowed' : 'pointer',
      },
      '&:active': disabled
        ? {}
        : {
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

const BareButton = ({
  caption,
  iconPath,
  disabled = false,
  onClick,
  onKeyDown,
}: ButtonProperties) => {
  const classes = useMemo(() => {
    return getClasses(disabled);
  }, [disabled]);

  return (
    <span
      css={css(classes.wrapper)}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
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

export default BareButton;
