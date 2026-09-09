import { qa, rich } from './prefs';
export function initProjects() {
  if (!rich) return;
  qa<HTMLElement>('.project__media--video').forEach((media) => {
    const video = media.querySelector<HTMLVideoElement>('.project__preview');
    if (!video) return;
    let timer = 0;
    media.addEventListener('pointerenter', () => {
      timer = window.setTimeout(() => {
        if (!video.src) video.src = video.dataset.src ?? '';
        video.currentTime = 0;
        video.play().then(() => media.classList.add('is-previewing')).catch(() => {});
      }, 160);
    });
    media.addEventListener('pointerleave', () => { clearTimeout(timer); video.pause(); media.classList.remove('is-previewing'); });
  });
}
