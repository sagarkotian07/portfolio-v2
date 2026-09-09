import { hero, stops, projects, about, links, game } from '../content';
import { images, type ImageKey } from '../generated/images';
import { q, esc } from './prefs';

export function picture(key: ImageKey, o: { alt: string; sizes: string; parallax?: boolean }) {
  const im = images[key];
  const set = (ext: 'avif' | 'webp') => im[ext].map((w) => `/img/${key}-${w}.${ext} ${w}w`).join(', ');
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${o.sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${o.sizes}"><img src="${im.jpg}" width="${im.width}" height="${im.height}" alt="${esc(o.alt)}" loading="lazy" decoding="async"${o.parallax ? ' data-parallax' : ''}></picture>`;
}
const playIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="currentColor"/></svg>`;

export function renderAll() {
  q('#hero-meta').textContent = hero.meta;
  q('#hero-first').textContent = hero.first;
  q('#hero-last').textContent = hero.last;
  q('#hero-tag').textContent = hero.line;
  q<HTMLAnchorElement>('#hero-whatsapp').href = links.whatsapp;
  q<HTMLAnchorElement>('#game-sayhi').href = links.whatsapp;
  q('#badge-text').textContent = hero.badge;

  q('#game-intro').textContent = game.intro;
  q('#game-controls').textContent = game.controls;

  q('#startups-track').innerHTML = stops.map((st) => `<article class="stop">
    <div class="stop__head">
      <p class="stop__index" aria-hidden="true">${st.index}</p>
      <h3 class="stop__org">${esc(st.org)}</h3>
      <p class="stop__role">${esc(st.role)}</p>
      <p class="stop__dates mono">${esc(st.dates)}</p>
    </div>
    <div class="stop__body"><p class="stop__line">${esc(st.line)}</p></div>
  </article>`).join('');

  q('#projects').innerHTML = projects.map((p) => {
    const media = p.kind === 'video'
      ? `<a class="project__media project__media--video" href="${p.url}" target="_blank" rel="noopener" data-cursor="play" data-clip aria-label="${esc(p.cta)}: ${esc(p.title)} (opens on Screen Studio)">
          ${picture(p.poster, { alt: '', sizes: '(max-width: 899px) 92vw, 700px', parallax: true })}
          <video class="project__preview" muted playsinline loop preload="none" data-src="${p.preview}" aria-hidden="true" tabindex="-1"></video>
          <span class="project__badge mono" aria-hidden="true">${esc(p.label)}</span>
          <span class="project__play" aria-hidden="true">${playIcon}</span></a>`
      : `<a class="project__media" href="${p.url}" target="_blank" rel="noopener" data-cursor="open" data-clip aria-label="${esc(p.cta)}: ${esc(p.title)}">
          ${picture(p.image, { alt: `Screenshot of ${p.title}`, sizes: '(max-width: 899px) 92vw, 700px', parallax: true })}
          <span class="project__badge mono" aria-hidden="true">${esc(p.label)}</span></a>`;
    return `<article class="project">
      ${media}
      <div class="project__text">
        <h3 class="project__title" data-reveal>${esc(p.title)}</h3>
        <p class="project__line serif">${esc(p.line)}</p>
        <div class="project__links mono"><a href="${p.url}" target="_blank" rel="noopener">${esc(p.cta)} ↗</a></div>
      </div>
    </article>`;
  }).join('');

  q('#about-lines').innerHTML = about.lines.map((l) => `<li data-reveal>${esc(l)}</li>`).join('');

  q('#sayhi-chars').innerHTML = [...'SAY HI'].map((c) => c === ' ' ? `<span class="ch sp"> </span>` : `<span class="ch">${c}</span>`).join('');
  q('#sayhi-links').innerHTML = `
    <li><a class="sayhi__row" href="${links.whatsapp}" target="_blank" rel="noopener" data-cursor="open"><span>WhatsApp</span><small>+91 93217 47802 ↗</small></a></li>
    <li><button class="sayhi__row" type="button" id="copy-email" data-cursor="copy"><span>${esc(links.email)}</span><small>copy</small></button></li>
    <li><a class="sayhi__row" href="${links.linkedin}" target="_blank" rel="noopener" data-cursor="open"><span>LinkedIn</span><small>↗</small></a></li>`;
}

export function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const small = btn.querySelector('small')!;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      small.textContent = 'copied'; small.classList.add('is-copied');
      setTimeout(() => { small.textContent = 'copy'; small.classList.remove('is-copied'); }, 1600);
    } catch { location.href = `mailto:${links.email}`; }
  });
}
