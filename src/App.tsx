import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import {
  COLUMNS,
  ROWS,
  WIN_VALUE,
  createGame,
  hardDrop,
  move,
  tick,
  type GameState,
} from './game.ts'

const cells = Array.from({ length: COLUMNS * ROWS })

export default function App() {
  const [game, setGame] = useState<GameState>(() => createGame())
  const [bestScore, setBestScore] = useState(0)

  const moveLeft = useCallback(() => setGame((current) => move(current, -1)), [])
  const moveRight = useCallback(() => setGame((current) => move(current, 1)), [])
  const moveDown = useCallback(() => setGame((current) => tick(current)), [])
  const drop = useCallback(() => setGame((current) => hardDrop(current)), [])

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setGame((current) => tick(current))
    }, 650)

    return () => globalThis.clearInterval(timer)
  }, [])

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
    setBestScore((current) => Math.max(current, game.score))
  }, [game.score])

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
          style={{ '--columns': COLUMNS, '--rows': ROWS } as CSSProperties}
        >
          {cells.map((_, index) => (
            <span className="board-cell" role="gridcell" key={index} />
          ))}
          {game.board.map((value, index) =>
            value === null ? null : (
              <div
                className={`number-tile tile-${value} settled-tile`}
                aria-label={`Settled tile ${value}`}
                key={`tile-${index}`}
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

      <p className="prototype-note">Arrow keys to move · space or ↑ to drop</p>
    </main>
  )
}
