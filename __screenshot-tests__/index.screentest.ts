import { closePage, Device, openPage } from '../utils/testUtils';

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

    expect(await page.screenshot({ fullPage: true })).toMatchImageSnapshot();
  });
});

export default {};
