# Face Fighter

**Face Fighter** is a responsive browser-based boxing mini-game built with **React**, **Tailwind CSS**, and **Vite**. Players can upload and align an opponent portrait, enter a first-person boxing ring, and use keyboard, mouse, or touch controls to throw punches.

The project focuses on fast interaction, responsive design, local image handling, progressive visual damage effects, and an Apple-inspired interface that works across desktop, laptop, tablet, and mobile devices.

> Face Fighter is intended as a fictional entertainment and stress-relief game. Use only images you have permission or the right to use, and avoid using the game to harass, threaten, or target real people.

## Live Link:## https://face-fighter.vercel.app/
---

## Table of Contents

- [Features](#features)
- [Game Modes](#game-modes)
- [Controls](#controls)
- [Face Upload and Alignment](#face-upload-and-alignment)
- [Damage and Visual Effects](#damage-and-visual-effects)
- [Responsive and Mobile Support](#responsive-and-mobile-support)
- [Privacy](#privacy)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [How to Play](#how-to-play)
- [Design Notes](#design-notes)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### First-Person Boxing Gameplay

- First-person player perspective with two boxing gloves.
- Separate left- and right-hand punches.
- Opponent counter-punch animations that move toward the camera.
- Screen-impact feedback when the opponent attacks.
- Animated hit reactions and floating hit/damage indicators.
- Instant rematch support using the keyboard.

### Custom Opponent Face

- Upload an opponent portrait directly from the device.
- Uploaded images remain local to the browser session in this starter project.
- Built-in face alignment editor.
- Drag the portrait to reposition it.
- Pinch with two fingers on mobile to zoom in or out.
- Zoom and X/Y position sliders are available as precise alternatives.
- Face guide includes eye, center, and face-shape indicators.

### Progressive Facial Damage

Visual damage develops as the player continues landing punches:

- Randomized bruise positions for each round.
- Bruises can appear across the forehead, temples, cheeks, and jaw.
- Randomized bruise size, rotation, intensity, and color variation.
- Eye swelling remains aligned with the eye area.
- Nose bruising remains aligned with the nose.
- Nosebleed effects progressively appear as damage increases.
- Lower-face and lip swelling can become more visible at high damage levels.
- Bruise positions remain stable during a round instead of moving after every hit.
- A new random bruise pattern is generated for the next round.

### Professional Boxing Arena Presentation

- Four-ring-rope presentation.
- Corner posts.
- Perspective canvas and ring apron.
- Arena crowd depth.
- Overhead spotlights.
- Event-style scoreboard and HUD.
- Red player gloves and blue opponent gloves for visual distinction.

### Interface and Appearance

- Apple-inspired minimal UI.
- Glass-style panels and soft depth effects.
- Light mode and dark mode.
- Theme preference is stored in `localStorage`.
- Responsive layout for desktop, laptop, tablet, and mobile screens.
- Touch-friendly controls and safe-area-aware mobile layout.

---

## Game Modes

Face Fighter includes two separate gameplay modes.

### Classic Mode

Classic Mode uses traditional health-based boxing rules.

- Player HP is displayed.
- Opponent HP is displayed.
- Punches reduce the opponent's health.
- Opponent counterattacks can reduce player health.
- The round ends when either fighter reaches zero HP.
- After the round ends, a fight key can immediately begin a rematch.

### Time Limit Mode

Time Limit Mode is an endurance-style free-hitting mode.

- No player HP.
- No opponent HP.
- No knockout condition.
- The timer is the only condition that ends the round.
- The player can keep hitting the opponent for the entire round.
- A live **Hits** counter records successful punches.
- Facial damage continues to build visually throughout the round.
- Opponent counter-punch animations remain active but do not reduce health or end the round.
- When time reaches `0:00`, the result screen displays the total number of hits landed.

The player can set a custom duration from **10 to 600 seconds**. Quick presets are also available for:

- 30 seconds
- 1 minute
- 2 minutes

---

## Controls

### Keyboard

| Action | Key |
|---|---|
| Left punch | `A` or `Left Arrow` |
| Right punch | `D` or `Right Arrow` |
| Start round | `Enter` or `Space` |
| Restart after round | `Enter` or `Space` |
| Instant rematch + punch | `A`, `D`, `Left Arrow`, or `Right Arrow` |

### Mouse / Trackpad

Use the on-screen punch areas/buttons to attack with the corresponding hand.

### Mobile / Touch

- Tap the left or right punch controls to attack.
- In the face editor, use **one finger** to move the image.
- Use **two fingers** to pinch and zoom.
- Sliders can also be used for fine adjustment.

---

## Face Upload and Alignment

The face editor is designed to make uploaded portraits fit the opponent model more naturally.

For best results:

1. Upload a clear, front-facing portrait.
2. Position the eyes along the horizontal eye guide.
3. Keep the nose near the vertical center guide.
4. Keep the chin inside the lower portion of the face outline.
5. Use one-finger drag or mouse drag to reposition the image.
6. Use two-finger pinch on touch devices to adjust zoom.
7. Use the Zoom, X, and Y sliders for precise control.
8. Select **Use this fit** when finished.

The same face alignment is used by the visual-damage system so eye swelling, nose bruising, nose bleeding, and other anchored effects remain positioned relative to the fitted portrait.

---

## Damage and Visual Effects

Face Fighter uses two types of visual damage placement.

### Anchored Damage

Some effects stay attached to facial landmarks so they remain visually coherent:

- Eye swelling
- Eye-area discoloration
- Nose bruising
- Nose bleeding
- Mouth and lower-face swelling

### Randomized Bruises

Surface bruises are generated randomly at the beginning of each round. The system varies:

- Position
- Width and height
- Rotation
- Color palette
- Opacity/intensity
- Damage threshold at which the bruise becomes visible

The generated pattern stays fixed during that round. This creates visual variety without making bruises jump around every time a punch lands.

---

## Responsive and Mobile Support

The interface is designed to work on a wide range of screen sizes.

Mobile-specific improvements include:

- Scrollable face-adjustment window.
- Reduced portrait-editor footprint on smaller displays.
- Sticky confirmation controls.
- Touch-friendly buttons and sliders.
- Safe-area padding for devices with display cutouts or browser chrome.
- Pointer-event handling for single-finger dragging and two-finger pinch zoom.
- Safe cleanup for pointer cancel/lost-capture events to reduce gesture-related crashes.

For the smoothest mobile experience, use an up-to-date version of Safari, Chrome, Edge, or another modern browser with Pointer Events support.

---

## Privacy

Face Fighter does not require a backend for the current opponent-photo workflow.

The uploaded portrait is used through a browser-local object URL and is not intentionally uploaded to a remote server by this starter project.

Important considerations:

- Reloading or closing the page may remove the selected image from the current session.
- Do not add analytics, storage, cloud upload, or multiplayer features without updating the privacy behavior and documentation.
- If the project is deployed publicly, review any hosting-provider logs, analytics, third-party scripts, or future backend services separately.

---

## Technology Stack

- **React** — component-based game UI and state management
- **React DOM** — browser rendering
- **Tailwind CSS 3** — utility-first responsive styling
- **Vite** — local development and production build tooling
- **PostCSS** — CSS transformation pipeline
- **Autoprefixer** — browser CSS prefix handling
- **JavaScript / JSX** — game and interaction logic
- **CSS animations** — punch, hit, arena, and impact effects
- **Pointer Events API** — touch drag and pinch gestures
- **Web Audio / browser audio behavior** — optional game sound behavior

No backend or database is required for the current version.

---

## Project Structure

```text
face-fighter/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── README.md
└── src/
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

### Important Files

#### `src/App.jsx`

Contains the main game logic and UI, including:

- Game state
- Classic and Time Limit modes
- Health and hit tracking
- Timer logic
- Opponent photo upload
- Face alignment controls
- Mobile pinch/drag gestures
- Random bruise generation
- Progressive facial-damage rendering
- Opponent attack behavior
- Keyboard controls
- Light/dark mode behavior

#### `src/index.css`

Contains custom visual styles and animations, including:

- Boxing animations
- Opponent attack effects
- Screen shake and impact feedback
- Arena presentation
- Damage animations
- Responsive/mobile refinements

#### `src/main.jsx`

Initializes the React application and mounts the main component.

---

## Getting Started

### Prerequisites

Install a currently supported **Node.js LTS** release with `npm`.

Check your installation:

```bash
node --version
npm --version
```

### Installation

Clone or download the project, then open a terminal in the project directory.

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will display a local URL in the terminal, typically similar to:

```text
http://localhost:5173
```

Open that address in a browser.

---

## Available Scripts

### Development

```bash
npm run dev
```

Starts the Vite development server with hot module replacement.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Preview Production Build

```bash
npm run preview
```

Runs a local server for previewing the production build.

---

## How to Play

### Classic Mode

1. Upload an opponent portrait.
2. Adjust the portrait using the face-alignment editor.
3. Select **Classic**.
4. Start the round with `Enter`, `Space`, or a punch key.
5. Use left and right attacks to reduce the opponent's HP.
6. Watch the opponent's bruising and swelling progressively increase.
7. Avoid being reduced to zero HP by opponent counterattacks.
8. After a KO, press a fight key to immediately start another round.

### Time Limit Mode

1. Upload and align an opponent portrait.
2. Select **Time Limit**.
3. Enter a custom duration from 10 to 600 seconds, or choose a preset.
4. Start the round.
5. Land as many hits as possible before the timer reaches zero.
6. There is no HP and no knockout in this mode.
7. Continue punching for the entire duration.
8. When the bell sounds, review the final hit count.
9. Press a fight key to begin another timed round.

---

## Design Notes

The interface takes inspiration from modern Apple-style product design principles such as:

- Strong visual hierarchy
- Generous spacing
- Large rounded surfaces
- Soft shadows and translucent panels
- Minimal control clutter
- Responsive typography
- Light and dark appearance modes
- Consistent touch targets

The project does not attempt to reproduce Apple's website or proprietary assets directly.

---

## Troubleshooting

### The uploaded face is not positioned correctly

Open **Adjust face fit** and align the portrait again. Use the eye line, center line, face outline, zoom slider, and X/Y sliders for precise positioning.

### Pinch-to-zoom does not work

Make sure you are using two fingers directly on the portrait preview. Use a modern browser with Pointer Events support. The Zoom slider can be used as a fallback.

### The face editor does not scroll on mobile

Swipe outside the portrait preview. The portrait area intentionally captures touch gestures for moving and pinching the photo, while the surrounding editor area remains scrollable.

### Keyboard controls do not respond

Click or tap the page once to ensure the browser window has focus, then use `A`, `D`, the arrow keys, `Enter`, or `Space`.

### The opponent image disappears after refreshing

This is expected in the current version. The image is session-local and is not persisted to a database or cloud service.

### `npm install` fails

Confirm that Node.js and npm are installed correctly, verify your internet connection, and try again with a currently supported Node.js LTS release.

---

## Future Improvements

Potential future development ideas include:

- Face-landmark detection for automatic alignment.
- More advanced bruise and swelling masks.
- Additional blood and recovery effects.
- More opponent body and defensive animations.
- Blocking and dodging mechanics.
- Combo system.
- Punch accuracy statistics.
- Best-score tracking for Time Limit Mode.
- Multiple arena themes.
- Round/bell sound design.
- Adjustable opponent difficulty.
- Accessibility settings for reduced motion and effects.
- Gamepad support.
- Persistent local settings.
- Optional local-only score history.
- PWA/offline support.

---

## Contributing

Contributions are welcome if you are developing the project collaboratively.

A suggested workflow is:

1. Create a new branch for the feature or fix.
2. Keep changes focused and clearly named.
3. Test desktop and mobile behavior.
4. Verify both light and dark modes.
5. Check keyboard, mouse, and touch interactions.
6. Run a production build before merging.
7. Document any new gameplay controls or privacy behavior in this README.

Example:

```bash
git checkout -b feature/my-feature
npm install
npm run dev
npm run build
```

---

## Responsible Use

Face Fighter is a fictional game mechanic intended for entertainment. If an uploaded photo depicts a real person, make sure you have appropriate permission or rights to use that image. Do not use the application to threaten, harass, intimidate, or encourage real-world violence toward another person.

---

## License

No open-source license has been specified for this project yet.

If you plan to publish or distribute the project publicly, add an appropriate `LICENSE` file and update this section with the selected license terms.

---

**Face Fighter** — React + Tailwind CSS browser boxing mini-game.
