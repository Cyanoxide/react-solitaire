# React Solitaire

An authentic Windows XP-style Klondike Solitaire, built with **React** and **TypeScript**. It runs as a standalone full-screen browser game and is also published as a `<Solitaire />` component for embedding in other apps (it powers the Solitaire window in [React XP](https://github.com/Cyanoxide/react-xp)).

## Features

- Full Klondike rules: draw, foundations, tableau building, double-click to auto-place, multi-card stack moves.
- Authentic XP card sprites and the classic "bouncing cards" win animation with afterimage trails.
- Container-relative layout (`cqw` units) so it fills any size — a window or the whole screen.

## Usage as a component

```bash
npm install github:Cyanoxide/react-solitaire
```

```tsx
import { Solitaire } from "react-solitaire";
import "react-solitaire/style.css";

<Solitaire />;
```

The component fills its parent container, so give it a sized box.

### Sprite asset

The card sprite sheet is referenced from the host's web root at `/spritemap__solitaire-cards.png`. Copy it from this package's `dist/` (or `public/`) into your app's `public/` folder so it is served at that path. (React XP already ships it.)

## Standalone

```bash
npm install
npm run dev      # full-screen game
npm run build    # production app build -> dist-app/
npm run build:lib  # library build -> dist/ (also run automatically on install via "prepare")
```

## Special Thanks

Card sprite sheet and win animation originally built for [React XP](https://github.com/Cyanoxide/react-xp).
