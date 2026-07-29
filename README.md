# junk-land

My personal portfolio site — [bliumkin.com](https://bliumkin.com). Two versions of the same content, one route apart:

- `/` — a clean, modern one-pager
- `/retro` — a junk-drawer desktop throwback with draggable icons, cursors, and gifs

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev/build
- [React Router](https://reactrouter.com/) for the `/` vs `/retro` split
- [Zustand](https://zustand-demo.pmnd.rs/) for state (retro desktop junk)
- [Framer Motion](https://www.framer.com/motion/) for scroll/drag animations
- [Fontsource](https://fontsource.org/) (Barlow Condensed, Bebas Neue) for self-hosted fonts
- Plain CSS Modules, no CSS framework

## Getting started

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.
