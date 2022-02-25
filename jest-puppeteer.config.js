const PORT = 14560;

module.exports = {
    launch: {
        headless: process.env.CI === 'false',
    },
    browserContext: process.env.INCOGNITO ? 'incognito' : 'default',
    server: {
        command: `yarn run dev --port ${PORT}`,
        port: PORT,
        launchTimeout: 10000,
    },
};
