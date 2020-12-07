import React from 'react';
import ReactDOM from 'react-dom';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import {tzDate} from '../utils';
import 'jest';

import {WidgetSettings, WorkingHours} from '../types';

import {WORKING_HOURS_EVERYDAY} from './ChatWidgetContainer.test';

jest.mock('../api', () => ({
  fetchWidgetSettings: jest.fn(() => Promise.resolve({})),
  updateWidgetSettingsMetadata: jest.fn(() => Promise.resolve({})),
}));
import * as mockApi from '../api';
import ChatWidget from './ChatWidget';

describe('ChatWidget behavior', () => {
  beforeEach(() => {
    mockApi.fetchWidgetSettings.mockReturnValue(Promise.resolve({}));
    mockApi.updateWidgetSettingsMetadata.mockReturnValue(Promise.resolve({}));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<ChatWidget accountId={1} />);
  });

  describe('when hideOutsideWorkingHours is turned on', () => {
    beforeEach(() => {
      const widgetSettings: WidgetSettings = {
        hide_outside_working_hours: true,
        account: {
          working_hours: [WORKING_HOURS_EVERYDAY],
          time_zone: 'America/New_York',
        },
      };

      mockApi.fetchWidgetSettings.mockReturnValue(
        Promise.resolve(widgetSettings)
      );
    });

    describe('when outside working hours', () => {
      beforeAll(() => {
        const fourAM = tzDate({
          year: 2020,
          month: 0,
          day: 1,
          hour: 4,
          tz: 'America/New_York',
        });
        jest.useFakeTimers('modern');
        jest.setSystemTime(fourAM.valueOf());
      });
      afterAll(() => {
        jest.useRealTimers();
      });

      it('renders null widget', async () => {
        render(<ChatWidget accountId={1}></ChatWidget>);
        await waitFor(() => screen.getByTestId('widget-null'));

        expect(screen.getByTestId('widget-null')).toBeTruthy();
      });
    });

    describe('when during working hours', () => {
      beforeAll(() => {
        // https://github.com/facebook/jest/issues/2234
        const eightAM = tzDate({
          year: 2020,
          month: 0,
          day: 1,
          hour: 8,
          tz: 'America/New_York',
        });
        jest.useFakeTimers('modern');
        jest.setSystemTime(eightAM.valueOf());
      });
      afterAll(() => {
        jest.useRealTimers();
      });

      it('renders widget', async () => {
        render(<ChatWidget accountId={1}></ChatWidget>);
        await waitFor(() => screen.getByTestId('widget-iframewrapper'));

        expect(screen.getByTestId('widget-iframewrapper')).toBeTruthy();
      });
    });
  });
});
