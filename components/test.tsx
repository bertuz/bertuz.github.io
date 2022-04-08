import { css } from '@emotion/react';

const classes = (color: string) => {
  return {
    classT: css({
      color,
    }),
  };
};

const Test = (prop: { color: string }) => {
  const c = classes(prop.color);
  return <div css={c.classT}>test content</div>;
};

export default Test;
