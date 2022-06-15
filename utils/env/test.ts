export const isRunningAcceptanceTest =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes('acceptance-test');
