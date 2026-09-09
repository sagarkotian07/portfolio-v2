// Three panels slide sideways while the section is pinned. Stacks vertically under 900px.
import { gsap, ScrollTrigger } from './scroll';
import { q, qa } from './prefs';
export function initStartups() {
  const pin = q('#startups-pin'), track = q('#startups-track'), bar = q('#startups-bar');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: pin, pin: true, scrub: 0.8, start: 'top top', end: () => '+=' + dist() * 1.15, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (st) => gsap.set(bar, { scaleX: st.progress }) },
    });
    qa('.stop', track).forEach((stop) => {
      const parts = [stop.querySelector('.stop__index'), stop.querySelector('.stop__org'), stop.querySelector('.stop__role'), stop.querySelector('.stop__body')];
      gsap.from(parts, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: stop, containerAnimation: tween, start: 'left 70%', once: true } });
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  });
  mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => {
    qa('.stop', track).forEach((stop) => ScrollTrigger.create({ trigger: stop, start: 'top 85%', once: true, onEnter: () => stop.classList.add('is-in') }));
  });
}
