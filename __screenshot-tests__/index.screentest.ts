describe('Google', () => {
  beforeAll(async () => {
    console.log(`http://${process.env.TEST_URL}:3000`);

    await page.goto(`http://${process.env.TEST_URL}:3000`);
  });

  it('should display "google" text on page', async () => {
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});

export default {};
