// Letters of SAY HI get heavier as the pointer gets close.
import { gsap } from './scroll';
import { qa, rich } from './prefs';
export function initSayHi() {
  const chars = qa<HTMLElement>('#sayhi-chars .ch:not(.sp)');
  if (!chars.length || !rich) return;
  const weights = chars.map(() => ({ w: 300 }));
  let px = -1e4, py = -1e4;
  window.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    chars.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      const target = 300 + 400 * Math.max(0, 1 - d / 300);
      weights[i].w += (target - weights[i].w) * 0.12;
      c.style.fontVariationSettings = `'wght' ${weights[i].w.toFixed(0)}`;
    });
  });
}
