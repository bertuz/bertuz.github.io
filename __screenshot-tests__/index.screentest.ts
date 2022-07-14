describe('Google', () => {
  it('the home page should be shown according to the design', async () => {
    await page.setViewport({ width: 1024, height: 768 });
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
    await page.goto(`http://${process.env.TEST_URL}:3000`);
    await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise((res) => {
      setTimeout(res, 2000);
    });

    let image = await page.screenshot();
    expect(image).toMatchImageSnapshot();

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });
    image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});

export default {};
