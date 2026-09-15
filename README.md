# Face Fighter

A responsive React + Tailwind CSS browser boxing mini-game with an Apple-inspired UI.

## Features

- Upload an opponent portrait locally in the browser
- Face alignment editor with one-finger drag, two-finger pinch-to-zoom, and slider-based position/zoom adjustment
- Mobile-safe face editor with independent scrolling, safe-area padding and touch-friendly controls
- First-person left/right punch controls
- Keyboard controls: A / D, Left / Right Arrow
- Enter / Space to start or restart a round
- Instant keyboard rematch after KO or time-up
- Blue opponent boxing gloves with counter-punch animations and screen impact feedback
- Progressive face-mapped eye swelling, nose bruising and nosebleeds as HP drops
- Randomized bruise locations every round across the fitted face; the pattern stays stable during that round
- **Classic mode** with no round clock
- **Time Limit mode** with a user-defined 10–600 second countdown and 30s / 1m / 2m quick presets
- Time-limit HUD and arena scoreboard countdown
- Professional arena presentation with four ring ropes, corner posts, canvas/apron branding, spotlights and crowd depth
- Light and dark mode
- Responsive desktop, laptop, tablet and mobile layout

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Controls

- **A / Left Arrow** — left punch
- **D / Right Arrow** — right punch
- **Enter / Space** — start or restart the round
- **Touch / click left or right half of ring** — punch

In Time Limit mode, knock out the opponent before the countdown reaches zero. Uploaded photos are used through a local browser object URL and are not sent to a server by this starter project.
