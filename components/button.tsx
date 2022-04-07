import { dimensionInRem } from '../assets/styles/dimensions';

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
        border: '0px solid #333',
        borderBottom: '3px solid #333',
        borderTop: '3px solid transparent',
        backgroundColor: '#6e6e6e',
        color: '#e7e7e7',
        fontFamily: 'Alegreya-Sans',
        fontSize: dimensionInRem(-1),
        borderRadius: dimensionInRem(-8),
        padding: `0.2rem 0.5rem`,
        '&:hover': {
          cursor: 'pointer',
        },
        '&:active': {
          border: '0px solid black',
          borderTop: '3px solid black',
          borderBottom: '3px solid transparent',
          paddingTop: '0.3rem',
          paddingBottom: '0.1rem',
          backgroundColor: '#595959',
        },
      })}
    >
      {iconPath && (
        <img
          alt=""
          src={iconPath}
          style={{
            height: dimensionInRem(-1),
            paddingRight: '0.3rem',
            display: 'inline-block',
            verticalAlign: 'middle',
          }}
        />
      )}

      {caption}
    </span>
  );
};

export default Button;
