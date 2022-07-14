describe('Google', () => {
  beforeAll(async () => {
    await page.goto(`http://${process.env.TEST_URL}:3000`);
  });

  it('the home page should be shown according to the design', async () => {
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
