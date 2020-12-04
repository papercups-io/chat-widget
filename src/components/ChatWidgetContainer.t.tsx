import React from 'react';
import ReactDOM from 'react-dom';
import ChatWidgetContainer from './ChatWidgetContainer';
import { render, fireEvent, screen } from '@testing-library/react';
import 'jest';

describe('ChatWidgetContainer', () => {
  it('renders without crashing', () => {
    render(<ChatWidgetContainer />)
  });

  describe('hideIfOutsideHours', () => {
  })

  describe('when hideOutsideWorkingHours is turned on', async () => {
    before(() => {
      jest.mock('../api', () => ({
        fetchWidgetSettings: jest.fn(() => Promise.resolve({
          account: {
            working_hours: [
              {
                day: 'weekdays',
                start_minute: 8*60, // 8am
                end_minute: 20*60,  // 8pm
              }
            ],
          },
          hide_outside_working_hours: true,
        })
      })
    })
    describe('when outside working hours', async () => {
      it('renders null widget', () => {
        render(<ChatWidgetContainer />)
        await waitFor(() => {
          screen.getByTestId('widget-null').to.exist()
        })

        expect(screen.getByTestId('widget-null')).toExist()
      })
    })

    describe('when during working hours', () => {
      it('renders widget', () => {
        render(<ChatWidgetContainer />)
        await waitFor(() => {
          screen.getByTestId('widget-null').to.exist()
        })

        expect(screen.getByTestId('widget-null')).toExist()
      })
    })
  })
})
