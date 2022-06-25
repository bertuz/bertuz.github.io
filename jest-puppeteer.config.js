const baseConfig = require('jest-puppeteer-docker/lib/config')();

baseConfig.server = {
  command: 'yarn start',
  port: 3000,
};
module.exports = baseConfig;
