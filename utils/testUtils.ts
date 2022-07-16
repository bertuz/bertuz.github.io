import type { Viewport } from 'puppeteer/lib/cjs/puppeteer/common/PuppeteerViewport';

const BASE_TEST_URL = `http://${process.env.TEST_URL}:3000`;
const SUFFIX_USER_AGENT_TEST = 'test-jest-puppeteer';

const overrideAnimationCssToStatic = () => {
  const content = `
    *,
    *::after,
    *::before {
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        animation-delay: -0.0001s !important;
        animation-duration: 0s !important;
        animation-play-state: paused !important;
        caret-color: transparent !important;
    }`;

  page.addStyleTag({ content });
};

export enum Device {
  iPhone13Mini,
  android,
  desktop,
}

const deviceDetails: Partial<
  Record<Device, { userAgent: string; viewPort: Viewport }>
> = {
  [Device.iPhone13Mini]: {
    userAgent: `Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1 ${SUFFIX_USER_AGENT_TEST}`,
    viewPort: {
      height: 812,
      width: 375,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
    },
  },
  [Device.desktop]: {
    userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0 ${SUFFIX_USER_AGENT_TEST}`,
    viewPort: {
      height: 768,
      width: 1024,
      deviceScaleFactor: 3,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
  },
};

const openPage = async (path: string, device: Device) => {
  await page.close();
  global.page = await page.browser().newPage();

  await page.setUserAgent(
    `Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0 ${SUFFIX_USER_AGENT_TEST}`
  );

  if (deviceDetails[device]?.viewPort !== undefined) {
    await page.setViewport(deviceDetails[device]?.viewPort as Viewport);
  }
  await page.goto(`${BASE_TEST_URL}/${path}`, {
    waitUntil: 'domcontentloaded',
  });
  overrideAnimationCssToStatic();

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
};

const closePage = async () => {
  // page.off('load', overrideAnimationCssToStatic);
  // await page.close({ runBeforeUnload: true });
  await page.browser().newPage();
};

const isRunningAcceptanceTest = () => {
  return (
    global.window?.navigator?.userAgent?.endsWith('test-jest-puppeteer') ??
    (process.env.TEST_ENV === 'acceptance' ||
      process.env.TEST_ENV === 'acceptance')
  );
};

export {
  BASE_TEST_URL,
  SUFFIX_USER_AGENT_TEST,
  openPage,
  closePage,
  isRunningAcceptanceTest,
};
