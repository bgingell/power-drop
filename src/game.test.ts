import {
  COLUMNS,
  ROWS,
  SPAWN_VALUES,
  WIN_VALUE,
  cellIndex,
  createGame,
  drawTile,
  emptyBoard,
  hardDrop,
  move,
  resolveMerges,
  tick,
  type GameState,
} from './game.ts'

const alwaysTwo = () => 2 as const

test('moves the active tile and stops at the walls', () => {
  let game = createGame(alwaysTwo)
  game = move(game, -1)
  game = move(game, -1)
  game = move(game, -1)

  expect(game.active?.column).toBe(0)
  expect(move(game, -1)).toBe(game)
})

test('ticks downward and lands on the floor', () => {
  let game = createGame(alwaysTwo)
  for (let step = 0; step < ROWS; step += 1) game = tick(game, alwaysTwo)

  expect(game.board[cellIndex(ROWS - 1, 2)]).toBe(2)
  expect(game.active).toEqual({ row: 0, column: 2, value: 2 })
})

test('hard drop lands immediately and spawns the preview tile', () => {
  const values = [2, 4, 8] as const
  let drawIndex = 0
  const game = hardDrop(createGame(() => values[drawIndex++] ?? 2), alwaysTwo)

  expect(game.board[cellIndex(ROWS - 1, 2)]).toBe(2)
  expect(game.active?.value).toBe(4)
  expect(game.nextValue).toBe(2)
})

test('ends the game when a landed tile blocks the spawn cell', () => {
  const board = emptyBoard()
  board[cellIndex(1, 2)] = 4
  const game: GameState = {
    board,
    active: { row: 0, column: 2, value: 2 },
    nextValue: 2,
    score: 0,
    cascadeDepth: 0,
    status: 'playing',
  }

  const result = tick(game, alwaysTwo)
  expect(result.status).toBe('game-over')
  expect(result.active).toBeNull()
})

test('board dimensions stay aligned with the cell array', () => {
  expect(emptyBoard()).toHaveLength(COLUMNS * ROWS)
})

test('merges an entire connected group into the landing tile', () => {
  const board = emptyBoard()
  board[cellIndex(ROWS - 1, 1)] = 2
  board[cellIndex(ROWS - 1, 2)] = 2
  board[cellIndex(ROWS - 1, 3)] = 2

  const result = resolveMerges(board, cellIndex(ROWS - 1, 3))

  expect(result.board[cellIndex(ROWS - 1, 3)]).toBe(8)
  expect(result.board.filter(Boolean)).toEqual([8])
  expect(result.score).toBe(8)
  expect(result.cascadeDepth).toBe(1)
})

test('finds connected matches through all four directions', () => {
  const board = emptyBoard()
  const center = cellIndex(ROWS - 2, 2)
  board[center] = 2
  board[cellIndex(ROWS - 3, 2)] = 2
  board[cellIndex(ROWS - 1, 2)] = 2
  board[cellIndex(ROWS - 2, 1)] = 2
  board[cellIndex(ROWS - 2, 3)] = 2

  const result = resolveMerges(board, center)

  expect(result.board.filter(Boolean)).toEqual([32])
})

test('applies gravity and resolves a multi-wave cascade', () => {
  const board = emptyBoard()
  board[cellIndex(ROWS - 1, 0)] = 4
  board[cellIndex(ROWS - 1, 1)] = 2
  const game: GameState = {
    board,
    active: { row: 0, column: 1, value: 2 },
    nextValue: 2,
    score: 0,
    cascadeDepth: 0,
    status: 'playing',
  }

  const result = hardDrop(game, alwaysTwo)

  expect(result.board[cellIndex(ROWS - 1, 1)]).toBe(8)
  expect(result.board.filter(Boolean)).toEqual([8])
  expect(result.score).toBe(20)
  expect(result.cascadeDepth).toBe(2)
})

test('spawns powers of two no larger than 64', () => {
  const seen = new Set<number>()
  for (let index = 0; index < 500; index += 1) seen.add(drawTile())

  expect([...seen].every((value) => SPAWN_VALUES.includes(value as (typeof SPAWN_VALUES)[number]))).toBe(true)
  expect(Math.max(...seen)).toBeLessThanOrEqual(64)
})

test('wins when a merge creates 2048', () => {
  const board = emptyBoard()
  board[cellIndex(ROWS - 1, 1)] = 1024
  const game: GameState = {
    board,
    active: { row: 0, column: 2, value: 1024 },
    nextValue: 2,
    score: 0,
    cascadeDepth: 0,
    status: 'playing',
  }

  const result = hardDrop(game, alwaysTwo)

  expect(result.board).toContain(WIN_VALUE)
  expect(result.status).toBe('won')
  expect(result.active).toBeNull()
})
