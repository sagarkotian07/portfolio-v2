import { gsap, lenis } from './scroll';
import { q } from './prefs';
import { preloaderRun } from '../game/idle';

/** Resolves when the hero may start its intro. */
export function runPreloader(): Promise<void> {
  const root = document.documentElement;
  const pre = q('#preloader');
  if (root.dataset.preload !== 'show') { pre.hidden = true; return Promise.resolve(); }
  try { sessionStorage.setItem('seen', '1'); } catch {}
  lenis?.stop();
  const count = q('#pre-count');
  const o = { p: 0 };
  const stop = preloaderRun(q<HTMLCanvasElement>('#pre-canvas'), () => o.p);
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: () => { stop(); pre.hidden = true; root.dataset.preload = 'skip'; lenis?.start(); } })
      .to(o, { p: 1, duration: 1.0, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.p * 100)).padStart(2, '0')) })
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.65, ease: 'power4.inOut', onStart: resolve }, '+=0.1');
  });
}
