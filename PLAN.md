# Power Drop project plan

## Goal

Build a polished, ad-free falling-number game for desktop and mobile browsers. A single power-of-two tile falls at a time; orthogonally connected tiles with the same value collapse together, and every merge can trigger a gravity-driven cascade.

`Power Drop` is a working title.

## Approach

This is a small personal game, not production software. Keep the code direct and easy to change:

- Prefer a few clear modules over layers, frameworks, or generalized systems.
- Test the merge and cascade rules where subtle bugs are likely; do not chase exhaustive coverage.
- Keep state local to the app and avoid a backend, accounts, telemetry, or deployment machinery.
- Add abstractions only when the game actually needs them.
- Optimize for enjoyable play and quick iteration rather than hypothetical scale.

## Core rules

- The board is a portrait-oriented rectangular grid.
- One numbered tile falls at a time. There are no multi-cell pieces and no rotation.
- Every tile value is a power of two.
- The player moves the active tile left or right, drops it faster, or hard-drops it.
- A landed tile settles when the cell below it is occupied or it reaches the floor.
- Matching is orthogonal: up, down, left, and right count; diagonals do not.
- A complete connected group of two or more equal tiles merges into one tile.
- Each additional tile in a group doubles the result:

  `result = starting value × 2^(group size - 1)`

  Examples: two `2`s become `4`, three `2`s become `8`, and four `2`s become `16`.
- The initial group collapses into the newly landed tile. During a cascade, a group collapses into the tile whose movement created the match. Any remaining tie is resolved deterministically by choosing the lowest cell and then the leftmost cell.
- After each merge wave, unsupported tiles fall. Newly formed groups then merge, and the process repeats until the board is stable.
- Merge waves are resolved consistently so the result never depends on animation timing.
- The game ends when the next tile cannot enter the board.

## Version-one experience

- Reach `2048` to win, with score-chasing along the way
- Current score and locally saved best score
- Next-tile preview
- New-game control
- Keyboard controls: left, right, soft drop, and hard drop
- Touch controls designed for one-handed phone play
- Clear landing, merge, cascade, and game-over animations
- Reduced-motion support
- Responsive layout with safe-area handling
- Static deployment without accounts, ads, analytics, or a backend

Initial tuning assumptions:

- Start with a 6-column by 8-row board and adjust only if playtesting exposes a problem.
- Spawn values from `2` through `64`, weighted toward the smaller tiles; adjust the distribution through playtesting.
- Keep the opening and middle steady: start at 525 ms and remove 5 ms per 1,000 points through 7,000. Then remove 12 ms per 1,000 points, capped at 375 ms.
- Award points for merge results and apply a visible cascade multiplier.

## Technical shape

- React and TypeScript for the interface
- Vite for development and production builds
- A small rules module for the grid, merges, gravity, and scoring
- Seeded random generation if it proves useful for debugging
- A focused set of Vitest tests for merge and cascade behavior
- CSS-driven board and animation layer; no canvas unless profiling shows a need
- Local storage only for preferences and best score

Suggested source layout:

- `src/engine/` — grid, movement, group detection, merge resolution, gravity, scoring, and seeded generation
- `src/components/` — game board, tile, controls, score, preview, and overlays
- `src/test/` — shared test setup
- `public/` — icons and static assets

## Implementation stages

1. [x] **Get a board on screen** — scaffold from the same lightweight React, TypeScript, and Vite setup as Solitaire; render a responsive empty grid and one falling tile.
2. [x] **Make it playable** — implement left/right movement, falling, collision, landing, the next tile, restart, and game over.
3. [x] **Add the core mechanic** — implement connected-group detection, exponential merging, gravity, and multi-wave cascades. Add focused tests for these rules.
4. [x] **Make it feel good** — add touch controls and clear fall, merge, cascade, score, and game-over feedback; tune board size, tile distribution, and speed by playing it.
5. [x] **Finish the small conveniences** — save the best score, handle reduced motion and common screen sizes, and keep offline installation out of the simple first version.
6. [ ] **Publish it** — build static assets, publish under `/power-drop/` in `bgingell.github.io`, and add a homepage feature or project card.

## Early decisions to validate through playtesting

- Whether the initial 6-by-8 board needs adjustment
- Touch-control scheme
- Starting fall speed and acceleration curve
- Tile spawn distribution
- Whether winning at `2048` should offer a continue-playing option
- Exact score and cascade-multiplier formula
- Whether a preview queue needs more than one tile
- Final name and visual theme

## Definition of done

A complete game is fun and comfortable with touch or keyboard, merges and cascades behave consistently, reaching `2048` wins, restart and game over work, the best score persists locally, and the static build runs under the personal website.
