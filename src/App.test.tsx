import { render, screen } from '@testing-library/react'
import App from './App.tsx'

test('renders the phase-one board and falling tile', () => {
  render(<App />)

  expect(screen.getByRole('grid', { name: '6 by 8 game board' })).toBeInTheDocument()
  expect(screen.getAllByRole('gridcell')).toHaveLength(48)
  expect(screen.getByLabelText(/Falling tile (2|4|8|16|32|64),/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Move left' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Drop' })).toBeInTheDocument()
})
