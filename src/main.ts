import { renderAll, initCopyEmail } from './modules/render';
import { initScroll, scrollTo, lenis } from './modules/scroll';
import { runPreloader } from './modules/preloader';
import { initHero } from './modules/hero';
import { initReveals } from './modules/reveal';
import { initStartups } from './modules/startups';
import { initProjects } from './modules/projects';
import { initSayHi } from './modules/sayhi';
import { initProgress } from './modules/progress';
import { mountGame } from './game';
import { rich } from './modules/prefs';

renderAll();
initScroll();

const gameCtl = mountGame({
  onPlay() { lenis?.stop(); document.documentElement.classList.add('is-playing'); },
  onStop() { lenis?.start(); document.documentElement.classList.remove('is-playing'); },
});
const goPlay = () => { scrollTo('#run'); setTimeout(() => gameCtl.play(), lenis ? 1150 : 50); };

const heroIntro = initHero(goPlay);
initCopyEmail();

document.fonts.ready.then(() => runPreloader().then(() => heroIntro?.()));

// everything below the fold can wait for a quiet moment
const later = () => {
  initReveals(); initProjects(); initStartups(); initProgress();
  if (rich) {
    import('./modules/cursor').then((m) => m.initCursor());
    import('./modules/magnetic').then((m) => m.initMagnetic());
    initSayHi();
  }
};
window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(later, { timeout: 1500 }) : setTimeout(later, 300)), { once: true });
