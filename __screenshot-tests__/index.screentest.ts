import { closePage, Device, openPage } from '../utils/testUtils';

jest.setTimeout(15000);

describe('The Home page', () => {
  beforeEach(async () => {
    await closePage();
  });

  it('should be shown according to the design', async () => {
    await openPage('/', Device.desktop);
    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    expect(await page.screenshot()).toMatchImageSnapshot();

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it('should be shown according to the mobile design', async () => {
    await openPage('/', Device.iPhone13Mini);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    // in order to load the lazy photos
    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    expect(await page.screenshot({ fullPage: true })).toMatchImageSnapshot();
  });

  it('clicking the pic the gallery popup is opened', async () => {
    await openPage('/', Device.iPhone13Mini);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    await page.click('img[alt="Image number 1"]');
    await page.waitForNetworkIdle({ idleTime: 10000 });

    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});

export default {};
