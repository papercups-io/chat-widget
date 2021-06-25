import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import App from './App';

test('renders chat widget', async () => {
  render(<App />);
  await waitFor(() => screen.getByTitle('Papercups Chat Widget Container'));
});
