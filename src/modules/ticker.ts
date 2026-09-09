import { gsap, velocity } from './scroll';
import { reducedMotion } from './prefs';
export function initTicker() {
  const track = document.getElementById('ticker');
  if (!track || reducedMotion) return;
  const tween = gsap.to(track, { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
  const speed = { v: 1 };
  gsap.ticker.add(() => {
    const target = 1 + Math.min(Math.abs(velocity) / 18, 5);
    speed.v += (target - speed.v) * 0.08;
    tween.timeScale(speed.v);
  });
}
