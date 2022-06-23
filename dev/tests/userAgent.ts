export const TEST_EXTENSION_USER_AGENT = ' test-platform';

export const isRunningAcceptanceTest = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator?.userAgent ?? '';
    return userAgent.endsWith(TEST_EXTENSION_USER_AGENT);
  }

  return process.env.TEST_ENV === 'acceptance';
};

export default (userAgent: string): string =>
  `${userAgent} ${TEST_EXTENSION_USER_AGENT}`;
