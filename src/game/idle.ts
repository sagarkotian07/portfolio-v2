// The little runner idling on the hero ground line, and the preloader run.
import { drawRunner } from './runner';
export function mountIdle(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let w = 0, h = 0, phase = 0, raf = 0, last = 0, visible = false, dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => { const r = canvas.getBoundingClientRect(); w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now;
    if (!visible) return;
    phase += dt * 2.2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#0E0E0C';
    drawRunner(ctx, w * 0.5, h - 1, Math.min(72, h * 0.7), phase, 'idle', 2);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
export function preloaderRun(canvas: HTMLCanvasElement, progress: () => number) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect(); const w = r.width, h = r.height;
  canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let phase = 0, raf = 0, last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now;
    phase += dt * 10;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#0E0E0C'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, h - 20); ctx.lineTo(w, h - 20); ctx.stroke();
    const x = 40 + (w - 80) * progress();
    drawRunner(ctx, x, h - 21, 70, phase, 'run', 2.2);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
