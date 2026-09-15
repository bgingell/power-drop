import { render, screen } from '@testing-library/react'
import App from './App.tsx'

test('renders the phase-one board and falling tile', () => {
  render(<App />)

  expect(screen.getByRole('grid', { name: '6 by 10 game board' })).toBeInTheDocument()
  expect(screen.getAllByRole('gridcell')).toHaveLength(60)
  expect(screen.getByLabelText(/Falling tile 2/)).toBeInTheDocument()
})

