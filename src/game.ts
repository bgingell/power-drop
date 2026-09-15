export const COLUMNS = 6
export const ROWS = 8
export const START_COLUMN = 2
export const WIN_VALUE = 2048
export const SPAWN_VALUES = [2, 4, 8, 16, 32, 64] as const
const SPAWN_POOL: TileValue[] = [2, 2, 2, 2, 4, 4, 4, 8, 8, 16, 32, 64]

export type TileValue = number

export type ActiveTile = {
  row: number
  column: number
  value: TileValue
}

export type GameState = {
  board: Array<TileValue | null>
  active: ActiveTile | null
  nextValue: TileValue
  score: number
  cascadeDepth: number
  status: 'playing' | 'game-over' | 'won'
}

export type DrawTile = () => TileValue

export const emptyBoard = () => Array<TileValue | null>(COLUMNS * ROWS).fill(null)

export const cellIndex = (row: number, column: number) => row * COLUMNS + column

export const drawTile: DrawTile = () => SPAWN_POOL[Math.floor(Math.random() * SPAWN_POOL.length)]!

export function createGame(draw: DrawTile = drawTile): GameState {
  return {
    board: emptyBoard(),
    active: { row: 0, column: START_COLUMN, value: draw() },
    nextValue: draw(),
    score: 0,
    cascadeDepth: 0,
    status: 'playing',
  }
}

const neighborOffsets = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const

function findGroups(board: GameState['board']) {
  const visited = new Set<number>()
  const groups: number[][] = []

  for (let start = 0; start < board.length; start += 1) {
    const value = board[start]
    if (value === null || visited.has(start)) continue

    const group: number[] = []
    const queue = [start]
    visited.add(start)

    while (queue.length > 0) {
      const current = queue.shift()
      if (current === undefined) break
      group.push(current)

      const row = Math.floor(current / COLUMNS)
      const column = current % COLUMNS
      for (const [rowOffset, columnOffset] of neighborOffsets) {
        const nextRow = row + rowOffset
        const nextColumn = column + columnOffset
        if (nextRow < 0 || nextRow >= ROWS || nextColumn < 0 || nextColumn >= COLUMNS) continue

        const next = cellIndex(nextRow, nextColumn)
        if (!visited.has(next) && board[next] === value) {
          visited.add(next)
          queue.push(next)
        }
      }
    }

    if (group.length >= 2) groups.push(group)
  }

  return groups
}

function chooseAnchor(group: number[], preferred: Set<number>) {
  const preferredCells = group.filter((index) => preferred.has(index))
  const choices = preferredCells.length > 0 ? preferredCells : group

  return [...choices].sort((left, right) => {
    const rowDifference = Math.floor(right / COLUMNS) - Math.floor(left / COLUMNS)
    return rowDifference || (left % COLUMNS) - (right % COLUMNS)
  })[0]!
}

function applyGravity(board: GameState['board'], preferred: Set<number>) {
  const next = emptyBoard()
  const movedPreferred = new Set<number>()

  for (let column = 0; column < COLUMNS; column += 1) {
    let targetRow = ROWS - 1
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const from = cellIndex(row, column)
      const value = board[from]
      if (value == null) continue

      const to = cellIndex(targetRow, column)
      next[to] = value
      if (preferred.has(from)) movedPreferred.add(to)
      targetRow -= 1
    }
  }

  return { board: next, preferred: movedPreferred }
}

export function resolveMerges(board: GameState['board'], initialAnchor: number) {
  let current = board
  let preferred = new Set([initialAnchor])
  let cascadeDepth = 0
  let score = 0

  while (true) {
    const groups = findGroups(current)
    if (groups.length === 0) return { board: current, score, cascadeDepth }

    cascadeDepth += 1
    const merged = [...current]
    const anchors = new Set<number>()

    for (const group of groups) {
      const anchor = chooseAnchor(group, preferred)
      const startingValue = current[group[0]!]
      if (startingValue == null) continue

      const result = startingValue * 2 ** (group.length - 1)
      for (const index of group) merged[index] = null
      merged[anchor] = result
      anchors.add(anchor)
      score += result * cascadeDepth
    }

    const gravityResult = applyGravity(merged, anchors)
    current = gravityResult.board
    preferred = gravityResult.preferred
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
  const landingCell = cellIndex(state.active.row, state.active.column)
  board[landingCell] = state.active.value
  const resolved = resolveMerges(board, landingCell)

  if (resolved.board.some((value) => value !== null && value >= WIN_VALUE)) {
    return {
      ...state,
      board: resolved.board,
      active: null,
      score: state.score + resolved.score,
      cascadeDepth: resolved.cascadeDepth,
      status: 'won',
    }
  }

  if (!isOpen(resolved.board, 0, START_COLUMN)) {
    return {
      ...state,
      board: resolved.board,
      active: null,
      score: state.score + resolved.score,
      cascadeDepth: resolved.cascadeDepth,
      status: 'game-over',
    }
  }

  return {
    board: resolved.board,
    active: { row: 0, column: START_COLUMN, value: state.nextValue },
    nextValue: draw(),
    score: state.score + resolved.score,
    cascadeDepth: resolved.cascadeDepth,
    status: 'playing',
  }
}

export function move(state: GameState, direction: -1 | 1): GameState {
  if (!state.active || state.status !== 'playing') return state

  const column = state.active.column + direction
  if (!isOpen(state.board, state.active.row, column)) return state

  return { ...state, active: { ...state.active, column } }
}

export function moveToColumn(state: GameState, targetColumn: number): GameState {
  if (!state.active || state.status !== 'playing') return state

  const target = Math.max(0, Math.min(COLUMNS - 1, targetColumn))
  const direction = target < state.active.column ? -1 : 1
  let current = state

  while (current.active && current.active.column !== target) {
    const moved = move(current, direction)
    if (moved === current) break
    current = moved
  }

  return current
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
