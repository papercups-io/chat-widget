class Logger {
  debugModeEnabled: boolean;

  constructor(debugModeEnabled?: boolean) {
    this.debugModeEnabled = !!debugModeEnabled;
  }

  debug(...args: any) {
    if (!this.debugModeEnabled) {
      return;
    }

    console.debug(...args);
  }

  log(...args: any) {
    if (!this.debugModeEnabled) {
      return;
    }

    console.log(...args);
  }

  info(...args: any) {
    console.info(...args);
  }

  warn(...args: any) {
    console.warn(...args);
  }

  error(...args: any) {
    console.error(...args);
  }
}

export default Logger;
