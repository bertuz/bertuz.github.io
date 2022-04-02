// Definitions by: Junyoung Clare Jang <https://github.com/Ailrun>
// TypeScript Version: 2.8

import { RegisteredCache, SerializedStyles } from '@emotion/utils';

import type * as CSS from 'csstype';

export { RegisteredCache, SerializedStyles };

export type CSSProperties = CSS.PropertiesFallback<number | string>;
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | Array<Extract<CSSProperties[K], string>>;
};

export type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject };

export type ArrayCSSInterpolation = Array<CSSInterpolation>;

export type InterpolationPrimitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | ComponentSelector
  | Keyframes
  | SerializedStyles
  | CSSObject;

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation;

export interface CSSOthersObject {
  [propertiesName: string]: CSSInterpolation;
}

export interface CSSObject
  extends CSSPropertiesWithMultiValues,
    CSSPseudos,
    // note by uncommenting this I could make the css classes be html-css compliant, but '@media (max-width: 809px)'
    // would not be allowed. Waiting for the style linter
    // https://github.com/emotion-js/emotion/issues/2695
    CSSOthersObject {}

export interface ComponentSelector {
  __emotion_styles: any;
}

export type Keyframes = {
  name: string;
  styles: string;
  anim: number;
  toString: () => string;
} & string;

export type ArrayInterpolation<Props> = Array<Interpolation<Props>>;

export interface FunctionInterpolation<Props> {
  (props: Props): Interpolation<Props>;
}

export type Interpolation<Props> =
  | InterpolationPrimitive
  | ArrayInterpolation<Props>
  | FunctionInterpolation<Props>;

export function serializeStyles<Props>(
  args: Array<TemplateStringsArray | Interpolation<Props>>,
  registered: RegisteredCache,
  props?: Props
): SerializedStyles;
