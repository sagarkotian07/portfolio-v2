// Digits roll into place like a mechanical counter when the band scrolls in.
import { gsap, ScrollTrigger } from './scroll';
import { qa, reducedMotion } from './prefs';
export function initOdometers() {
  qa<HTMLElement>('.odo').forEach((el, i) => {
    const value = el.dataset.value ?? el.textContent ?? '';
    if (reducedMotion) { el.textContent = value; return; }
    el.innerHTML = `<span class="sr-only">${value}</span>` + [...value].map((c) => /\d/.test(c)
      ? `<span class="odo__col" data-d="${c}" aria-hidden="true">${'0123456789'.split('').map((n) => `<span>${n}</span>`).join('')}</span>`
      : `<span aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const cols = qa<HTMLElement>('.odo__col', el);
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => {
      cols.forEach((col, j) => gsap.to(col.children, { yPercent: -100 * Number(col.dataset.d), duration: 1.3 + j * 0.12 + i * 0.05, ease: 'power3.inOut' }));
    } });
  });
}
