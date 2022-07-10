// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import initExtensions from 'puppeteer-extensions';

import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

jest.setTimeout(10000);

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThreshold: 0.0,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });

global.extensions = initExtensions(global.page);
