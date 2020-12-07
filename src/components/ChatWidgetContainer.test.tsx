import React from 'react';
import ReactDOM from 'react-dom';
// functional tests
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
// unit tests (instance tests)
import renderer from 'react-test-renderer';
import request from 'superagent';
import {tzDate} from '../utils';
import 'jest';

import {
  WidgetSettings,
  WorkingHours,
} from '../types';
import {
  mockDate,
  resetDate,
} from '../test_utils';

jest.mock('../api', () => ({
  fetchWidgetSettings: jest.fn(() => Promise.resolve({})),
  updateWidgetSettingsMetadata: jest.fn(() => Promise.resolve({}))
}))
import * as mockApi from '../api';
import ChatWidgetContainer from './ChatWidgetContainer';

const WORKING_HOURS_MONDAY = {
  day: 'monday',
  start_minute: 8*60, // 8am
  end_minute: 20*60   // 8pm
}
const WORKING_HOURS_TUESDAY = {
  day: 'tuesday',
  start_minute: 8*60, // 8am
  end_minute: 20*60   // 8pm
}
const WORKING_HOURS_WEEKDAYS = {
  day: 'weekdays',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
}
const WORKING_HOURS_WEEKENDS = {
  day: 'weekends',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
}
const WORKING_HOURS_EVERYDAY = {
  day: 'everyday',
  start_minute: 8 * 60,
  end_minute: 20 * 60,
}

describe('ChatWidgetContainer unit', () => {
  describe('getWorkingHours', () => {
    it('converts a single workingHour to day-of-week dicts', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_MONDAY])
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        // indexed by JS-day-of-week
        1: {
          start_minute: 8*60,
          end_minute: 20*60,
        }
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })

    it('converts multiple workingHours to day-of-week-dicts', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_MONDAY, WORKING_HOURS_TUESDAY])
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        1: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        2: {
          start_minute: 8*60,
          end_minute: 20*60,
        }
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })

    it('converts "everyday" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_EVERYDAY])
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        0: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        1: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        2: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        3: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        4: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        5: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        6: {
          start_minute: 8*60,
          end_minute: 20*60,
        }
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })

    it('converts "weekdays" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_WEEKDAYS])
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        1: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        2: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        3: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        4: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        5: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })


    it('converts "weekends" to days-of-week', () => {
      const config = {
        workingHours: JSON.stringify([WORKING_HOURS_WEEKENDS])
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        5: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        6: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })

    it('overrides multi-day stretches with single-days if single-days are provided', () => {
      const workingHoursJson = JSON.stringify([WORKING_HOURS_EVERYDAY, {
        day: 'sunday',
        start_minute: 12*60, // start at 12noon Sunday
        end_minute: 17*60,   // end at 5pm Sunday
      }, {
        day: 'monday',
        start_minute: 10*60, // start at 10am Monday
        end_minute: 14*60,   // end at 2pm Monday
      }])
      const config = {
        workingHours: workingHoursJson,
      }
      const widgetContainer = renderer.create(
        <ChatWidgetContainer
          accountId={1}
        />
      )

      const convertedHours = {
        // Sunday
        0: {
          start_minute: 12*60,
          end_minute: 17*60,
        },
        // Monday
        1: {
          start_minute: 10*60,
          end_minute: 14*60,
        },
        2: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        3: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        4: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        5: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
        6: {
          start_minute: 8*60,
          end_minute: 20*60,
        },
      }

      expect(widgetContainer.getInstance().getWorkingHours(config)).toEqual(convertedHours)
    })
  })

  describe.only('isWorkingHours', () => {
    let widgetContainer = renderer.create(
      <ChatWidgetContainer
        accountId={1}
      />
    )

    beforeEach(() => {
      // https://github.com/facebook/jest/issues/2234
      const mondayDec7 = tzDate({
        year: 2020,
        month: 12,
        day: 7,
        hour: 8,
        tz: "America/New_York"
      })
      jest.useFakeTimers('modern');
      jest.setSystemTime(mondayDec7.valueOf())
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when there are no working hours for the day', () => {
      it('returns false', () => {
        const config = {
          workingHours: JSON.stringify([WORKING_HOURS_TUESDAY]),
          timezone: "America/New_York",
        }

        expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(false)
      })
    })

    describe('when there are working hours for the day', () => {
      describe('and it is within the working hours', () => {
        it('returns true', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: "America/New_York",
          }
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(true)
        })
      })

      describe('and it is outside the working hours', () => {
        beforeEach(() => {
          const mondayDec7 = tzDate({
            year: 2020,
            month: 12,
            day: 7,
            hour: 5,
            tz: "America/New_York"
          })
      jest.useFakeTimers('modern');
          jest.setSystemTime(mondayDec7.valueOf())
        })

        it('returns false', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: "America/New_York",
          }
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(false)
        })
      })

      describe('when the timezone puts it into working hours', () => {
        beforeEach(() => {
          const eightAmInNY = tzDate({
            year: 2020,
            month: 12,
            day: 7,
            hour: 5,
            tz: "America/Los_Angeles"
          })
      jest.useFakeTimers('modern');
          jest.setSystemTime(eightAmInNY.valueOf())
        })

        it('returns true', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: "America/New_York",
          }
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(true)
        })
      })

      describe('when the timezone puts it outside working hours', () => {
        beforeEach(() => {
          const tenPmInNY = tzDate({
            year: 2020,
            month: 12,
            day: 7,
            hour: 19,  // 7pm in LA
            tz: "America/Los_Angeles"
          })
      jest.useFakeTimers('modern');
          jest.setSystemTime(tenPmInNY.valueOf())
        })

        it('returns false', () => {
          const config = {
            workingHours: JSON.stringify([WORKING_HOURS_MONDAY]),
            timezone: "America/New_York",
          }
          expect(widgetContainer.getInstance().isWorkingHours(config)).toEqual(false)
        })
      })
    })
  })
})

describe('ChatWidgetContainer scenario', () => {

  beforeEach(() => {
    mockApi.fetchWidgetSettings.mockResolvedValue({})
    mockApi.updateWidgetSettingsMetadata.mockResolvedValue({})
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <ChatWidgetContainer
        accountId={1}
      />
    );
  });

  describe('when hideOutsideWorkingHours is turned on', () => {
    beforeEach(() => {
      const workingHours: Array<WorkingHours> = [
      ]
      const widgetSettings: WidgetSettings = {
        hide_outside_working_hours: true,
        account: {
          working_hours: [...workingHours]
        },
      }

      mockApi.fetchWidgetSettings.mockResolvedValueOnce(widgetSettings)
    });

    describe('when outside working hours', () => {
      beforeEach(() => {
        const fourAM = new Date(2020, 1, 1, 4)
        mockDate(fourAM.toISOString())
      })
      afterEach(() => {
        resetDate()
      })

      it('renders null widget', async () => {
        render(
          <ChatWidgetContainer
            accountId={1}
          >
          </ChatWidgetContainer>
        );
        await waitFor(() => screen.getByTestId('widget-null'));

        expect(screen.getByTestId('widget-null')).toExist();
      });
    });

    describe('when during working hours', () => {
      it('renders widget', async () => {
        render(
          <ChatWidgetContainer
            accountId={1}
          >
          </ChatWidgetContainer>
        );
        await waitFor(() => screen.getByTestId('widget-null'));

        expect(screen.getByTestId('widget-null')).toExist();
      });
    });
  });
});
