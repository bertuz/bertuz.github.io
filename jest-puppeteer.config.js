// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: true,
    ignoreHTTPSErrors: true,
    slowMo: true,
  },
  server: {
    command: 'yarn dev',
    port: 3000,
  },
};
