import { useEffect, useState } from 'react'

const COLUMNS = 6
const ROWS = 10
const START_COLUMN = 2
const cells = Array.from({ length: COLUMNS * ROWS })

export default function App() {
  const [row, setRow] = useState(0)

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setRow((current) => (current === ROWS - 1 ? 0 : current + 1))
    }, 450)

    return () => globalThis.clearInterval(timer)
  }, [])

  return (
    <main className="app-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Working title</p>
          <h1>Power Drop</h1>
        </div>
        <button type="button" disabled>
          New game
        </button>
      </header>

      <section className="game-stats" aria-label="Game information">
        <div>
          <span>Score</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Best</span>
          <strong>0</strong>
        </div>
        <div className="next-tile">
          <span>Next</span>
          <strong>4</strong>
        </div>
      </section>

      <div className="board-wrap">
        <div
          className="game-board"
          role="grid"
          aria-label={`${COLUMNS} by ${ROWS} game board`}
          style={{ '--columns': COLUMNS, '--rows': ROWS } as React.CSSProperties}
        >
          {cells.map((_, index) => (
            <span className="board-cell" role="gridcell" key={index} />
          ))}
          <div
            className="number-tile tile-2"
            aria-label={`Falling tile 2, row ${row + 1}, column ${START_COLUMN + 1}`}
            style={{ gridColumn: START_COLUMN + 1, gridRow: row + 1 }}
          >
            2
          </div>
        </div>
      </div>

      <p className="prototype-note">Phase one prototype · the tile is only falling for now</p>
    </main>
  )
}

