import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  COLUMNS,
  ROWS,
  WIN_VALUE,
  createGame,
  hardDrop,
  move,
  moveToColumn,
  tick,
  type GameState,
} from './game.ts'

const cells = Array.from({ length: COLUMNS * ROWS })
const BEST_SCORE_KEY = 'power-drop-best-score'

type DragState = {
  pointerId: number
  startX: number
  startY: number
  startColumn: number
}

function loadBestScore() {
  try {
    const saved = Number.parseInt(globalThis.localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10)
    return Number.isFinite(saved) && saved > 0 ? saved : 0
  } catch {
    return 0
  }
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => createGame())
  const [bestScore, setBestScore] = useState(loadBestScore)
  const drag = useRef<DragState | null>(null)

  const moveLeft = useCallback(() => setGame((current) => move(current, -1)), [])
  const moveRight = useCallback(() => setGame((current) => move(current, 1)), [])
  const moveDown = useCallback(() => setGame((current) => tick(current)), [])
  const drop = useCallback(() => setGame((current) => hardDrop(current)), [])

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      if (!drag.current) setGame((current) => tick(current))
    }, Math.max(220, 550 - Math.floor(game.score / 256) * 30))

    return () => globalThis.clearInterval(timer)
  }, [game.score])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') moveLeft()
      else if (event.key === 'ArrowRight') moveRight()
      else if (event.key === 'ArrowDown') moveDown()
      else if (event.key === ' ' || event.key === 'ArrowUp') drop()
      else return

      event.preventDefault()
    }

    globalThis.addEventListener('keydown', onKeyDown)
    return () => globalThis.removeEventListener('keydown', onKeyDown)
  }, [drop, moveDown, moveLeft, moveRight])

  useEffect(() => {
    setBestScore((current) => {
      const best = Math.max(current, game.score)
      try {
        globalThis.localStorage.setItem(BEST_SCORE_KEY, String(best))
      } catch {
        // The game still works when storage is unavailable.
      }
      return best
    })
  }, [game.score])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!game.active || game.status !== 'playing') return
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startColumn: game.active.column,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = drag.current
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return

    const cellWidth = event.currentTarget.getBoundingClientRect().width / COLUMNS
    const columnsMoved = Math.round((event.clientX - currentDrag.startX) / cellWidth)
    setGame((current) => moveToColumn(current, currentDrag.startColumn + columnsMoved))
  }

  const finishDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const currentDrag = drag.current
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return
    drag.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!cancelled && event.clientY - currentDrag.startY > 45) drop()
  }

  return (
    <main className="app-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Working title</p>
          <h1>Power Drop</h1>
        </div>
        <button type="button" onClick={() => setGame(createGame())}>
          New game
        </button>
      </header>

      <section className="game-stats" aria-label="Game information">
        <div>
          <span>Score</span>
          <strong>{game.score}</strong>
        </div>
        <div>
          <span>Best</span>
          <strong>{bestScore}</strong>
        </div>
        <div className="next-tile">
          <span>Next</span>
          <strong>{game.nextValue}</strong>
        </div>
      </section>

      <div className="board-wrap">
        <div
          className="game-board"
          role="grid"
          aria-label={`${COLUMNS} by ${ROWS} game board`}
          aria-describedby="controls-help"
          style={{ '--columns': COLUMNS, '--rows': ROWS } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={(event) => finishDrag(event, true)}
        >
          {cells.map((_, index) => (
            <span className="board-cell" role="gridcell" key={index} />
          ))}
          {game.board.map((value, index) =>
            value === null ? null : (
              <div
                className={`number-tile tile-${value} settled-tile`}
                aria-label={`Settled tile ${value}`}
                key={`tile-${index}-${value}`}
                style={{ gridColumn: (index % COLUMNS) + 1, gridRow: Math.floor(index / COLUMNS) + 1 }}
              >
                {value}
              </div>
            ),
          )}
          {game.active && (
            <div
              className={`number-tile tile-${game.active.value} active-tile`}
              aria-label={`Falling tile ${game.active.value}, row ${game.active.row + 1}, column ${game.active.column + 1}`}
              style={{ gridColumn: game.active.column + 1, gridRow: game.active.row + 1 }}
            >
              {game.active.value}
            </div>
          )}

          {game.status === 'game-over' && (
            <div className="game-over" role="dialog" aria-label="Game over">
              <p>Stacked out</p>
              <h2>Game over</h2>
              <button type="button" onClick={() => setGame(createGame())}>Play again</button>
            </div>
          )}

          {game.status === 'won' && (
            <div className="game-over win-screen" role="dialog" aria-label="You won">
              <p>{WIN_VALUE}</p>
              <h2>You won!</h2>
              <button type="button" onClick={() => setGame(createGame())}>Play again</button>
            </div>
          )}

          {game.cascadeDepth > 1 && game.status === 'playing' && (
            <div className="cascade-badge" role="status">Chain ×{game.cascadeDepth}</div>
          )}
        </div>
      </div>

      <div className="game-controls" aria-label="Game controls">
        <button type="button" onClick={moveLeft} aria-label="Move left">←</button>
        <button type="button" onClick={moveDown} aria-label="Move down">↓</button>
        <button type="button" onClick={moveRight} aria-label="Move right">→</button>
        <button type="button" className="drop-control" onClick={drop}>Drop</button>
      </div>

      <p className="prototype-note" id="controls-help">Drag to move · swipe down to drop · arrow keys + space also work</p>
    </main>
  )
}
