import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {tzDate} from '../utils';
import 'jest';

// mock api before import
jest.mock('../api', () => ({
  fetchWidgetSettings: jest.fn(() => Promise.resolve({})),
  updateWidgetSettingsMetadata: jest.fn(() => Promise.resolve({})),
}));
import * as mockApi from '../api';

import ChatWidgetContainer from './ChatWidgetContainer';

const WORKING_HOURS_MONDAY = {
  day: 'monday',
  start_minute: 8 * 60, // 8am
  end_minute: 20 * 60, // 8pm
};
const WORKING_HOURS_TUESDAY = {
  day: 'tuesday',
  start_minute: 8 * 60, // 8am
  end_minute: 20 * 60, // 8pm
};
const WORKING_HOURS_WEEKDAYS = {
  day: 'weekdays',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
};
const WORKING_HOURS_WEEKENDS = {
  day: 'weekends',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
};
export const WORKING_HOURS_EVERYDAY = {
  day: 'everyday',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
};

describe('ChatWidgetContainer unit', () => {
  beforeEach(() => {
    mockApi.fetchWidgetSettings.mockReturnValue(Promise.resolve({}));
    mockApi.updateWidgetSettingsMetadata.mockReturnValue(Promise.resolve({}));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getWorkingHours', () => {
    it.only('converts a single workingHour to day-of-week dicts', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        // indexed by JS-day-of-week
        1: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });

    it('converts multiple workingHours to day-of-week-dicts', () => {
      const config = {
        workingHours: JSON.stringify([
          WORKING_HOURS_MONDAY,
          WORKING_HOURS_TUESDAY,
        ]),
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        1: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        2: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });

    it('converts "everyday" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_EVERYDAY]),
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        0: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        1: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        2: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        3: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        4: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        5: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        6: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });

    it('converts "weekdays" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_WEEKDAYS]),
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        1: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        2: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        3: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        4: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        5: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });

    it('converts "weekends" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_WEEKENDS]),
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        5: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        6: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });

    it('overrides multi-day stretches with single-days if single-days are provided', () => {
      const workingHoursJson = JSON.stringify([
        WORKING_HOURS_EVERYDAY,
        {
          day: 'sunday',
          start_minute: 12 * 60, // start at 12noon Sunday
          end_minute: 17 * 60, // end at 5pm Sunday
        },
        {
          day: 'monday',
          start_minute: 10 * 60, // start at 10am Monday
          end_minute: 14 * 60, // end at 2pm Monday
        },
      ]);
      const config = {
        workingHours: workingHoursJson,
      };
      const widgetContainer = renderer.create(
        <ChatWidgetContainer accountId={1} />
      );

      const convertedHours = {
        // Sunday
        0: {
          start_minute: 12 * 60,
          end_minute: 17 * 60,
        },
        // Monday
        1: {
          start_minute: 10 * 60,
          end_minute: 14 * 60,
        },
        2: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        3: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        4: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        5: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
        6: {
          start_minute: 8 * 60,
          end_minute: 20 * 60,
        },
      };

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(
        convertedHours
      );
    });
  });

  describe('isWorkingHours', () => {
    let widgetContainer = renderer.create(
      <ChatWidgetContainer accountId={1} />
    );

    beforeEach(() => {
      // https://github.com/facebook/jest/issues/2234
      const mondayDec7 = tzDate({
        year: 2020,
        month: 11,
        day: 7,
        hour: 8,
        tz: 'America/New_York',
      });
      jest.useFakeTimers('modern');
      jest.setSystemTime(mondayDec7.valueOf());
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    describe('when there are no working hours for the day', () => {
      it('returns false', () => {
        const config = {
          workingHours: JSON.stringify([WORKING_HOURS_TUESDAY]),
          timezone: 'America/New_York',
        };

        expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(
          false
        );
      });
    });

    describe('when there are working hours for the day', () => {
      describe('and it is within the working hours', () => {
        it('returns true', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: 'America/New_York',
          };
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(
            true
          );
        });
      });

      describe('and it is outside the working hours', () => {
        beforeEach(() => {
          const mondayDec7 = tzDate({
            year: 2020,
            month: 11,
            day: 7,
            hour: 5,
            tz: 'America/New_York',
          });
          jest.useFakeTimers('modern');
          jest.setSystemTime(mondayDec7.valueOf());
        });

        it('returns false', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: 'America/New_York',
          };
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(
            false
          );
        });
      });

      describe('when the timezone puts it into working hours', () => {
        beforeEach(() => {
          const elevenPmInNY = tzDate({
            year: 2020,
            month: 11,
            day: 7,
            hour: 23,
            tz: 'America/New_York',
          });
          jest.useFakeTimers('modern');
          jest.setSystemTime(elevenPmInNY.valueOf());
        });

        it('returns true', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: 'America/Los_Angeles',
          };
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(
            true
          );
        });
      });

      describe('when the timezone puts it outside working hours', () => {
        beforeEach(() => {
          const eightAmInNY = tzDate({
            year: 2020,
            month: 11,
            day: 7,
            hour: 8,
            tz: 'America/New_York',
          });
          jest.useFakeTimers('modern');
          jest.setSystemTime(eightAmInNY.valueOf());
        });

        it('returns false', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: 'America/Los_Angeles',
          };
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(
            false
          );
        });
      });
    });
  });
});
