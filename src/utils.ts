// polyfill Intl API used by dayjs, for IE11: https://github.com/formatjs/date-time-format-timezone
import 'date-time-format-timezone';
// tz requires utc: https://day.js.org/docs/en/plugin/timezone
import dayjs from 'dayjs';
const dayjsUtc = require('dayjs/plugin/utc');
const dayjsTz = require('dayjs/plugin/timezone');
dayjs.extend(dayjsUtc)
dayjs.extend(dayjsTz)


export function noop() {}

// TODO: handle this on the server instead
export function now() {
  const date = new Date();

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export function today() {
  const date = new Date();

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0
  );
}

export function utcOffset(tz: string) {
  if (tz === "local") {
    return dayjs().utcOffset()
  }
  return dayjs().tz(tz).utcOffset()
}

export function offsetFromTo(tz1: string, tz2: string) {
  return utcOffset(tz2) - utcOffset(tz1)
}

export function tzDate({
  year, month, day, hour, minute = 0, second = 0, millis = 0, tz
}: {
  year: number, month: number, day: number, hour: number, minute?: number, second?: number, millis?: number, tz: string,
}) {
  const date = dayjs(new Date(year, month, day, hour, minute, second, millis))
  date.tz(tz)
  return date
}
