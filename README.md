# Sagar Kotian, v2

Personal site with a game in it. Ink on paper, one accent, Space Grotesk and Instrument Serif.

**Coffee Run** is an endless runner: dodge potholes, autos and the odd cow, collect filter coffee. One canvas, no game engine, keyboard and touch. Nothing in it is about the site owner.

## Stack

Vite + vanilla TypeScript. GSAP + ScrollTrigger and Lenis for the page; the game is plain canvas.

## Run it

```
npm install
npm run dev        # http://localhost:5174
npm run build && npm run preview   # http://localhost:4174
npm run qa         # screenshots at five viewports with the installed Chrome
```

Copy lives in `src/content.ts`. Images come from `assets/src` via `npm run prep`. Fonts are self-hosted latin subsets (`npm run fonts`).
