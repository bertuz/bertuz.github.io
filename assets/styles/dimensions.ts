// inspired by https://spencermortensen.com/articles/typographic-scale/
const f0 = 1;
// music ratio
const r = 2;
// tritonic scale
const n = 3;

export const PITCH_IN_PX = 20;
const dimensionRatio = (i: number) => {
  if (i > n) {
    throw new Error(
      `dimension number more than the limit of the scale: ${n}, given: ${i}`
    );
  }

  return Math.pow(f0 * r, i / n);
};

export const dimensionInRem = (dimension: number) =>
  `${dimensionRatio(dimension)}rem`;
