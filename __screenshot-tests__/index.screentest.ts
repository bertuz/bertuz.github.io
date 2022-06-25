describe('Google', () => {
  beforeAll(async () => {
    await page.goto('http://host.docker.internal:3000');
  });

  it('should display "google" text on page', async () => {
    // await expect(page).toMatch('google');
    const image = await global.page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});
