// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS,
    ignoreHTTPSErrors: true,
    slowMo: process.env.HEADLESS ? 0 : 50,
    args: [
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning',
      '--force-color-profile=generic-rgb',
      '--enable-font-antialiasing=false',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
  server: {
    command: 'yarn start',
    port: 3000,
  },
};
