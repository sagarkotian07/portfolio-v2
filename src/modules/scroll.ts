import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reducedMotion } from './prefs';

gsap.registerPlugin(ScrollTrigger);
export let lenis: Lenis | null = null;
export let velocity = 0;

export function initScroll() {
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, anchors: { offset: -1 } });
    lenis.on('scroll', (e: { velocity: number }) => { velocity = e.velocity; ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
export function initNavTone() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  document.querySelectorAll<HTMLElement>('[data-dark]').forEach((band) => {
    ScrollTrigger.create({ trigger: band, start: 'top 34px', end: 'bottom 34px', toggleClass: { targets: nav, className: 'nav--light' } });
  });
}
export function scrollTo(target: string | HTMLElement, opts: { immediate?: boolean } = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.1, immediate: opts.immediate });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'auto' });
}
export { gsap, ScrollTrigger };
