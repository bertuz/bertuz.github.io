import { closePage, Device, openPage } from '../utils/testUtils';

describe('The Home page', () => {
  afterEach(async () => {
    await closePage();
  });

  it('should be shown according to the design', async () => {
    await openPage('/', Device.desktop);

    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot();

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

    expect(await page.screenshot()).toMatchImageSnapshot();

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});

export default {};
