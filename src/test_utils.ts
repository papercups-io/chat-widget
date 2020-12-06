let RealDate = Date

export function mockDate(targetIsoDate) {
  /* eslint no-global-assign:off */
  Date = class extends Date {
    constructor() {
      return new RealDate(targetIsoDate)
    }
  }
}

export function resetDate() {
  global.Date = RealDate
}
