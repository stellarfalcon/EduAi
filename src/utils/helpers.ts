export const debugLog = (message: string, type: 'log' | 'info' | 'warn' | 'error' | 'debug' = 'log') => {
  const isDebugModeEnabled = window.sessionStorage.getItem('debugEduAI') === 'true';
  if (isDebugModeEnabled) {
    console[type](message);
  }
};