export const COLUMNS = 6
export const ROWS = 8
export const START_COLUMN = 2

export type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048

export type ActiveTile = {
  row: number
  column: number
  value: TileValue
}

export type GameState = {
  board: Array<TileValue | null>
  active: ActiveTile | null
  nextValue: TileValue
  status: 'playing' | 'game-over'
}

export type DrawTile = () => TileValue

export const emptyBoard = () => Array<TileValue | null>(COLUMNS * ROWS).fill(null)

export const cellIndex = (row: number, column: number) => row * COLUMNS + column

export const drawTile: DrawTile = () => (Math.random() < 0.75 ? 2 : 4)

export function createGame(draw: DrawTile = drawTile): GameState {
  return {
    board: emptyBoard(),
    active: { row: 0, column: START_COLUMN, value: draw() },
    nextValue: draw(),
    status: 'playing',
  }
}

function isOpen(board: GameState['board'], row: number, column: number) {
  return (
    row >= 0 &&
    row < ROWS &&
    column >= 0 &&
    column < COLUMNS &&
    board[cellIndex(row, column)] === null
  )
}

function land(state: GameState, draw: DrawTile): GameState {
  if (!state.active) return state

  const board = [...state.board]
  board[cellIndex(state.active.row, state.active.column)] = state.active.value

  if (!isOpen(board, 0, START_COLUMN)) {
    return { ...state, board, active: null, status: 'game-over' }
  }

  return {
    board,
    active: { row: 0, column: START_COLUMN, value: state.nextValue },
    nextValue: draw(),
    status: 'playing',
  }
}

export function move(state: GameState, direction: -1 | 1): GameState {
  if (!state.active || state.status !== 'playing') return state

  const column = state.active.column + direction
  if (!isOpen(state.board, state.active.row, column)) return state

  return { ...state, active: { ...state.active, column } }
}

export function tick(state: GameState, draw: DrawTile = drawTile): GameState {
  if (!state.active || state.status !== 'playing') return state

  const row = state.active.row + 1
  if (isOpen(state.board, row, state.active.column)) {
    return { ...state, active: { ...state.active, row } }
  }

  return land(state, draw)
}

export function hardDrop(state: GameState, draw: DrawTile = drawTile): GameState {
  if (!state.active || state.status !== 'playing') return state

  let row = state.active.row
  while (isOpen(state.board, row + 1, state.active.column)) row += 1

  return land({ ...state, active: { ...state.active, row } }, draw)
}

