const getConfig = require('jest-puppeteer-docker/lib/config');
const path = require('path');

const baseConfig = getConfig();
const customConfig = Object.assign({}, baseConfig);

customConfig.connect.defaultViewport = {
  width: 800,
  height: 600,
};

customConfig.useDockerBuild = {
  dockerFile: 'Dockerfile',
  contextPath: path.join(__dirname, 'dev', 'dockerbuild-test'),
};

customConfig.server = {
  command: 'yarn start',
  port: 3000,
  launchTimeout: 90000,
};

customConfig.chromiumFlags = ['–ignore-certificate-errors'];

module.exports = customConfig;
