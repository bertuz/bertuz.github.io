describe('Google', () => {
  it('the home page should be shown according to the design', async () => {
    // page.on('load', () => {
    //   const content = `
    // *,
    // *::after,
    // *::before {
    //     transition-delay: 0s !important;
    //     transition-duration: 0s !important;
    //     animation-delay: -0.0001s !important;
    //     animation-duration: 0s !important;
    //     animation-play-state: paused !important;
    //     caret-color: transparent !important;
    // }`;
    //
    //   page.addStyleTag({ content });
    // });
    await page.setViewport({ width: 1024, height: 768 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0 test-jest-puppeteer'
    );
    await page.goto(`http://${process.env.TEST_URL}:3000`);
    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot();

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });
    image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });

  it('the home page should be shown according to the mobile design', async () => {
    await page.setViewport({ width: 375, height: 812 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0 test-jest-puppeteer'
    );
    await page.goto(`http://${process.env.TEST_URL}:3000`);
    await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    page.on('load', () => {
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
    });

    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot();

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});

export default {};
