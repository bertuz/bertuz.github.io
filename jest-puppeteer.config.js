// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS,
    ignoreHTTPSErrors: true,
    slowMo: process.env.HEADLESS ? 0 : 50,
  },
  server: {
    command: 'yarn dev',
    port: 3000,
  },
};
