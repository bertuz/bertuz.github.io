const getConfig = require('jest-puppeteer-docker/lib/config');

const baseConfig = getConfig();
const customConfig = Object.assign({}, baseConfig);

customConfig.connect.defaultViewport = {
  width: 800,
  height: 600,
};

customConfig.useImage = 'bertuz/docker-chromium:chromium103.0.5060.53';

customConfig.server = {
  command: 'yarn start',
  port: 3000,
};

customConfig.chromiumFlags = ['–ignore-certificate-errors'];

module.exports = customConfig;
