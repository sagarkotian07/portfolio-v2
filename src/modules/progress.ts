import { gsap, ScrollTrigger } from './scroll';
import { reducedMotion } from './prefs';
import { drawRunner } from '../game/runner';
export function initProgress() {
  const bar = document.querySelector<HTMLElement>('.progress__bar');
  const slot = document.getElementById('progress-runner');
  if (!bar || !slot || reducedMotion) return;
  const c = document.createElement('canvas'); c.width = 52; c.height = 52; slot.appendChild(c);
  const ctx = c.getContext('2d')!; ctx.scale(2, 2);
  let phase = 0, moving = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { gsap.set(bar, { scaleX: st.progress }); gsap.set(slot, { x: st.progress * window.innerWidth, opacity: st.progress > 0.005 ? 1 : 0 }); moving = 1; } });
  gsap.ticker.add((_t, dt) => {
    if (moving > 0) { phase += dt * 0.02; moving -= dt / 200; }
    ctx.clearRect(0, 0, 26, 26);
    ctx.strokeStyle = '#0E0E0C';
    drawRunner(ctx, 13, 24, 22, phase, moving > 0 ? 'run' : 'idle', 1.4);
  });
}
