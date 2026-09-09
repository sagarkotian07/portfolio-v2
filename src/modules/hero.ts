import { gsap, ScrollTrigger } from './scroll';
import { q, qa, reducedMotion } from './prefs';
import { mountIdle } from '../game/idle';

export function initHero(onPlay: () => void) {
  const hero = q('.hero');
  const words = qa('.hero__word');
  const meta = q('#hero-meta'), tag = q('#hero-tag'), cta = q('.hero__cta'), hint = q('#hero-hint');
  const img = q<HTMLImageElement>('.hero__frame img');

  if (!reducedMotion) mountIdle(q<HTMLCanvasElement>('#hero-idle'));
  hint.addEventListener('click', onPlay);
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target !== document.body) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom > window.innerHeight * 0.5) { e.preventDefault(); onPlay(); }
  });

  if (reducedMotion) { hero.classList.add('is-in'); return; }
  gsap.set(words, { yPercent: 110 });
  gsap.set([meta, tag, cta, hint], { opacity: 0, y: 14 });

  return () => {
    hero.classList.add('is-in');
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(words, { yPercent: 0, duration: 1.2, stagger: 0.12 }, 0.05)
      .to(meta, { opacity: 1, y: 0, duration: 0.7 }, 0.35)
      .to(tag, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to(cta, { opacity: 1, y: 0, duration: 0.7 }, 0.75)
      .to(hint, { opacity: 1, y: 0, duration: 0.7 }, 1.0);
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } });
    gsap.to('.hero__text', { y: -60, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.6 } });
    ScrollTrigger.refresh();
  };
}
