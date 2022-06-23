import 'expect-puppeteer';
import testUserAgent from '../dev/tests/userAgent';
import autoScroll from '../dev/tests/autoscroll';

import puppeteer from 'puppeteer';

const { viewport, userAgent } = puppeteer.devices['iPhone X'];

jest.setTimeout(300000);

describe('Google', () => {
  beforeAll(async () => {
    await page.emulate({ viewport, userAgent: userAgent });
    await page.goto('http://localhost:3000');
  });

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('Matteo Bertamini');

    let image = await page.screenshot({ fullPage: false }); // Compare the taken screenshot with the baseline screenshot (if exists), or create it (else)
    expect(image).toMatchImageSnapshot();

    await autoScroll(page);

    image = await page.screenshot({ fullPage: false }); // Compare the taken screenshot with the baseline screenshot (if exists), or create it (else)
    expect(image).toMatchImageSnapshot();
    // await jestPuppeteer.debug();
  });
});
