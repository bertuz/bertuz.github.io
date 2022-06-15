import 'expect-puppeteer';
import puppeteer from 'puppeteer';

const { viewport, userAgent } = puppeteer.devices['iPhone X'];

jest.setTimeout(300000);

describe('Google', () => {
  beforeAll(async () => {
    await page.emulate({ viewport, userAgent });
    await page.goto('http://localhost:3000');
  });

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('Matteo Bertamini');

    const image = await page.screenshot({ fullPage: true }); // Compare the taken screenshot with the baseline screenshot (if exists), or create it (else)
    expect(image).toMatchImageSnapshot();

    // await jestPuppeteer.debug();
  });
});
