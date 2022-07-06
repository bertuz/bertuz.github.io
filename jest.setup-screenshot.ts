// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import initExtensions from 'puppeteer-extensions';

import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

jest.setTimeout(10000);

// const testFileName = global.jasmine.testPath;
// const testPath = path.dirname(testFileName);

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.visualCheck = async () => {
  // const element = await global.page.$(selector);
  // const image = await element.screenshot();
  // expect(image).toMatchImageSnapshot({
  //   customSnapshotsDir: path.join(testPath, 'screenshots'),
  // });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.extensions = initExtensions(global.page);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.runSetup = async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await global.page.goto(`http://${process.env.TEST_URL}:3000`);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await global.extensions.turnOffAnimations();
};
