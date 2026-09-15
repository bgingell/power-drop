import { COLUMNS, ROWS, cellIndex, createGame, emptyBoard, hardDrop, move, tick, type GameState } from './game.ts'

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
    status: 'playing',
  }

  const result = tick(game, alwaysTwo)
  expect(result.status).toBe('game-over')
  expect(result.active).toBeNull()
})

test('board dimensions stay aligned with the cell array', () => {
  expect(emptyBoard()).toHaveLength(COLUMNS * ROWS)
})
