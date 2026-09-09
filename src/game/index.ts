import { Game } from './engine';
import { game as copy } from '../content';
import { q } from '../modules/prefs';

export function mountGame(opts: { onPlay(): void; onStop(): void }) {
  const canvas = q<HTMLCanvasElement>('#game-canvas');
  const start = q('#game-start'), over = q('#game-over'), leave = q<HTMLButtonElement>('#game-leave');
  const hud = { coffee: q('#hud-coffee'), dist: q('#hud-dist'), best: q('#hud-best') };
  const stage = q('#game-stage');
  let active = false, inView = false;
  new IntersectionObserver(([e]) => (inView = e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] }).observe(stage);

  const g = new Game(canvas, {
    onStart() { start.hidden = true; over.hidden = true; leave.hidden = false; },
    onScore(c, m) { hud.coffee.textContent = String(c); hud.dist.textContent = copy.distance(m); },
    onOver(c, m, best) {
      hud.best.textContent = String(best);
      q('#game-result').textContent = copy.result(c, m);
      q('#game-compare').textContent = copy.verdict(c);
      over.hidden = false; leave.hidden = true;
      stage.classList.add('is-shaking'); setTimeout(() => stage.classList.remove('is-shaking'), 300);
      deactivate();
    },
  });
  hud.best.textContent = String(g.best);
  (window as unknown as { __coffeeRun?: Game }).__coffeeRun = g;

  function activate() { if (active) return; active = true; opts.onPlay(); canvas.focus({ preventScroll: true }); }
  function deactivate() { if (!active) return; active = false; opts.onStop(); }
  function play() { activate(); g.start(); }

  q('#game-play').addEventListener('click', play);
  q('#game-again').addEventListener('click', play);
  leave.addEventListener('click', () => { deactivate(); if (g.state === 'running') { g.state = 'idle'; start.hidden = false; leave.hidden = true; } });

  const down = (e: Event) => { e.preventDefault(); if (g.state === 'running') g.jumpDown(); else if (g.state === 'over' && over.hidden === false) play(); else if (g.state === 'idle') play(); };
  const up = () => g.jumpUp();
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  window.addEventListener('keydown', (e) => {
    if (!active && !inView) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { if (!e.repeat) down(e); else e.preventDefault(); }
    if (e.code === 'Escape') leave.click();
  });
  window.addEventListener('keyup', (e) => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') up(); });

  return { play, isActive: () => active, game: g };
}
