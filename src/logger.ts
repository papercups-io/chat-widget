class Logger {
  debugModeEnabled: boolean;

  constructor(debugModeEnabled?: boolean) {
    this.debugModeEnabled = !!debugModeEnabled;
  }

  debug(...args: any) {
    if (!this.debugModeEnabled) {
      return;
    }

    console.debug('[Papercups]', ...args);
  }

  log(...args: any) {
    if (!this.debugModeEnabled) {
      return;
    }

    console.log('[Papercups]', ...args);
  }

  info(...args: any) {
    console.info('[Papercups]', ...args);
  }

  warn(...args: any) {
    console.warn('[Papercups]', ...args);
  }

  error(...args: any) {
    console.error('[Papercups]', ...args);
  }
}

export default Logger;
