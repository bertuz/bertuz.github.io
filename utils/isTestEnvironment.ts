export default () => {
  return (
    global.window?.navigator?.userAgent?.endsWith('test-jest-puppeteer') ??
    (process.env.TEST_ENV === 'acceptance' ||
      process.env.TEST_ENV === 'acceptance')
  );
};
