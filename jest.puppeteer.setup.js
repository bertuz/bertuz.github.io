const { setup: setupPuppeteer } = require('jest-puppeteer-docker');
// const expectPuppeteer = require('expect-puppeteer');
// const { toMatchImageSnapshot } = require('jest-image-snapshot');

module.exports = async (jestConfig) => {
  // any stuff you need to do can go here
  await setupPuppeteer(jestConfig);
};
