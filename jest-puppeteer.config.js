// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS,
    ignoreHTTPSErrors: true,
    slowMo: process.env.HEADLESS ? 0 : 50,
    args: [
      '--hide-scrollbars',
      '--enable-font-antialiasing',
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
      '--no-sandbox',
      '--disable-setuid-sandbox', // Props for TravisCI
      '--font-render-hinting=medium',
      '--disable-font-subpixel-positioning',
      '--force-color-profile=generic-rgb',
      '--enable-font-antialiasing=true',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  },
  server: {
    command: 'yarn start',
    port: 3000,
  },
};
