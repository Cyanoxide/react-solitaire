# React Solitaire

An authentic replication of Windows XP's Solitaire game, built with **React** and **TypeScript**.

It runs as a standalone full-screen browser game experience, and is also published as a `<Solitaire />` component for embedding in other apps. It was originally built as part of my [React XP](https://github.com/Cyanoxide/react-xp) project before being seperated out into it's own repo.

I've seperated this out to make it easier for others to use it as part of their own projects. For example, if you're building your own OS clone, like my [React XP](https://github.com/Cyanoxide/react-xp), you are welcome to use this.

## Features

- Full Klondike rules: draw, foundations, tableau building, double-click to auto-place, multi-card stack moves.
- Authentic XP card sprites and the classic "bouncing cards" win animation with afterimage trails.

## Usage as a react component

```bash
npm install github:Cyanoxide/react-solitaire
```

```tsx
import { Solitaire } from "react-solitaire";
import "react-solitaire/style.css";

<Solitaire />
```

## Standalone

```bash
npm install
npm run dev      # full-screen game
npm run build    # production app build -> dist-app/
npm run build:lib  # library build -> dist/ (also run automatically on install via "prepare")
```
