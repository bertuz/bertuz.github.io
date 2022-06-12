import 'expect-puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(300000);

describe('Google', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('Matteo Bertamini');

    const image = await page.screenshot({ fullPage: true }); // Compare the taken screenshot with the baseline screenshot (if exists), or create it (else)
    expect(image).toMatchImageSnapshot();

    // await jestPuppeteer.debug();
  });
});
