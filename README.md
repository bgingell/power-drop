# Power Drop

`Power Drop` is a falling-number puzzle game: powers-of-two tiles drop one at a time, orthogonally connected matches merge as a group, and gravity can trigger cascading merges.

> [!IMPORTANT]
> This project is being generated with AI. I am testing and directing the finished game, but I have not manually reviewed or audited the source code.

The first visual prototype is in place. See [PLAN.md](PLAN.md) for the agreed rules, scope, and implementation stages.

## Development

Node 24 LTS is required.

```bash
npm install
npm run dev
```

Run the local checks with:

```bash
npm run check
```

## Playing

On a touch screen, drag across the board to position the falling tile and swipe down to drop it. Use the left and right arrow keys—or the on-screen arrow buttons—for precise movement. Press the down arrow to move one row, or press space/up arrow (or **Drop**) to drop immediately.

Every orthogonally connected group of equal tiles merges at once. Each additional tile doubles the result, so three `2` tiles become one `8`. Gravity is applied after a merge, and any new matches continue as a cascade.

New tiles range from `2` to `64`, with smaller values appearing more often. Create a `2048` tile to win.

## Playing on a phone

Power Drop is designed to work as a Home Screen game as well as in a browser. On an iPhone, open the published game in Safari, choose **Share**, then **Add to Home Screen**. The icon launches the game in its own full-screen-style window, and the game remains available offline after it has loaded once.
