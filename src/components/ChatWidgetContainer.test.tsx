import React from 'react';
import ReactDOM from 'react-dom';
import ChatWidgetContainer from './ChatWidgetContainer';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import 'jest';

import {
  WidgetSettings,
  WorkingHours,
} from '../types';

describe('ChatWidgetContainer', () => {
  it('renders without crashing', () => {
    render(
      <ChatWidgetContainer
        accountId={1}
      />
    );
  });

  describe('hideIfOutsideHours', () => {});

  describe('when hideOutsideWorkingHours is turned on', () => {
    beforeEach(() => {
      jest.mock('../api', () => {
        const workingHours: Array<WorkingHours> = [
          {
            day: 'weekdays',
            start_minute: 8 * 60, // 8am
            end_minute: 20 * 60, // 8pm
          }
        ]
        const widgetSettings: WidgetSettings = {
          hide_outside_working_hours: true,
          account: {
            working_hours: [...workingHours]
          },
        }

        return {
          fetchWidgetSettings: jest.fn(() => Promise.resolve(widgetSettings))
        }
      });
    });

    describe('when outside working hours', () => {
      it.only('renders null widget', async () => {
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
