// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
describe('Google', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await page.goto('http://host.docker.internal:3000');
  });

  it('should display "google" text on page', async () => {
    // await expect(page).toMatch('google');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const image = await global.page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});
