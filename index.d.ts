import type { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';

declare global {
  // eslint-disable-next-line no-var
  var extensions: any;
  // eslint-disable-next-line no-var
  var page: Page;
}

export {};
