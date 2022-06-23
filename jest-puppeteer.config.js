// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS,
    ignoreHTTPSErrors: true,
    slowMo: process.env.HEADLESS ? 0 : 50,
    args: [],
  },
  server: {
    command: 'yarn start',
    port: 3000,
  },
};
