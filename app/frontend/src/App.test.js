import { render, screen } from '@testing-library/react';
import App from './App';

test('muestra el título en la página', () => {
  render(<App />);
  const titleElement = screen.getByText(/Bienvenido al Rafcetario/i);
  expect(titleElement).toBeInTheDocument();
});
