// Pipeline Run. One canvas, ink lines, one button. Every 20 seconds is a month.
import { drawRunner, type RunnerState } from './runner';

type ObKind = 'bounce' | 'noshow' | 'dup';
type PickKind = 'demo' | 'customer' | 'magnet';
interface Ob { kind: ObKind; x: number; w: number; h: number }
interface Pick { kind: PickKind; x: number; y: number; r: number; taken: boolean; t: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string; r: number }
export interface GameHooks {
  onScore(demos: number, customers: number, month: number): void;
  onOver(demos: number, customers: number, month: number, best: number): void;
  onStart(): void;
}

const INK = '#0E0E0C', ACCENT = '#F04E15', MUTED = '#9A9A94';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const BEST_KEY = 'pipeline-run-best';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private w = 0; private h = 0; private dpr = 1;
  state: 'idle' | 'running' | 'over' = 'idle';
  private t = 0; private phase = 0; private speed = 0; private base = 0;
  private gy = 0; private rx = 0; private s = 60;
  private ry = 0; private vy = 0; private onGround = true; private squash = 0; private jumpHeld = false; private coyote = 0; private buffer = 0;
  private obs: Ob[] = []; private picks: Pick[] = []; private parts: Particle[] = [];
  private nextOb = 0; private nextPick = 0;
  private clouds: { x: number; y: number; w: number }[] = [];
  private towers: { x: number; w: number; h: number; dome?: boolean }[] = [];
  private demos = 0; private customers = 0; private month = 1; best = 0; private magnet = 0;
  private raf = 0; private last = 0; private shake = 0; private slow = 0;
  private visible = false;

  constructor(private canvas: HTMLCanvasElement, private hooks: GameHooks) {
    this.ctx = canvas.getContext('2d')!;
    try { this.best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0; } catch {}
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.state === 'running') this.pauseToIdleFrame(); });
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr); this.canvas.height = Math.round(r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.gy = Math.round(this.h * 0.74); this.rx = Math.round(this.w * 0.2);
    this.s = Math.max(48, Math.min(84, this.h * 0.12));
    this.base = this.w * 0.55; // px per second
    if (!this.towers.length || Math.abs(this.towers[this.towers.length - 1].x - this.w * 3) > this.w) this.buildBackdrop();
  }
  private buildBackdrop() {
    this.towers = []; this.clouds = [];
    let x = 0;
    while (x < this.w * 3) { const w = rand(30, 90); this.towers.push({ x, w, h: rand(this.h * 0.05, this.h * 0.22), dome: Math.random() < 0.12 }); x += w + rand(10, 60); }
    for (let i = 0; i < 7; i++) this.clouds.push({ x: rand(0, this.w * 2), y: rand(this.h * 0.12, this.h * 0.42), w: rand(50, 130) });
  }

  start() {
    this.obs = []; this.picks = []; this.parts = [];
    this.demos = 0; this.customers = 0; this.month = 1; this.magnet = 0; this.t = 0;
    this.ry = 0; this.vy = 0; this.onGround = true; this.speed = this.base;
    this.nextOb = this.w * 0.9; this.nextPick = this.w * 0.5;
    this.state = 'running'; this.hooks.onStart(); this.hooks.onScore(0, 0, 1);
  }
  jumpDown() {
    if (this.state !== 'running') return;
    this.jumpHeld = true; this.buffer = 0.12;
  }
  jumpUp() { this.jumpHeld = false; }
  pauseToIdleFrame() { /* keep state; loop simply skips updates while hidden */ }

  private loop(now: number) {
    this.raf = requestAnimationFrame(this.loop);
    let dt = Math.min(0.033, (now - this.last) / 1000 || 0.016); this.last = now;
    if (!this.visible || document.hidden) return;
    if (this.slow > 0) { this.slow -= dt; dt *= 0.35; }
    this.phase += dt * (this.state === 'running' ? 8 + this.speed / 220 : 2.2);
    if (this.state === 'running') this.update(dt);
    if (this.shake > 0) this.shake -= dt;
    this.draw();
  }

  private update(dt: number) {
    this.t += dt;
    const month = Math.floor(this.t / 20) + 1;
    if (month !== this.month) { this.month = month; this.burst(this.rx, this.gy - this.s, ACCENT, 18); this.hooks.onScore(this.demos, this.customers, this.month); }
    this.speed = this.base * Math.min(2.1, 1 + (this.month - 1) * 0.11 + this.t * 0.004);
    const dx = this.speed * dt;

    // runner physics
    const g = this.s * 26, jv = this.s * 9.6;
    if (this.buffer > 0) this.buffer -= dt;
    if (this.onGround) this.coyote = 0.08; else this.coyote -= dt;
    if (this.buffer > 0 && (this.onGround || this.coyote > 0)) { this.vy = -jv; this.onGround = false; this.buffer = 0; this.coyote = 0; this.burst(this.rx, this.gy, MUTED, 5, 0.4); }
    if (!this.onGround) {
      if (!this.jumpHeld && this.vy < -jv * 0.45) this.vy += g * 2.4 * dt; // short hop when released early
      this.vy += g * dt; this.ry += this.vy * dt;
      if (this.ry >= 0) { this.ry = 0; this.vy = 0; this.onGround = true; this.squash = 1; this.burst(this.rx, this.gy, MUTED, 4, 0.3); }
    }
    this.squash = Math.max(0, this.squash - dt * 5);

    // spawn obstacles with jumpable gaps
    this.nextOb -= dx;
    if (this.nextOb <= 0) {
      const kinds: ObKind[] = ['bounce', 'noshow', 'dup'];
      const kind = kinds[Math.floor(rand(0, kinds.length))];
      const s = this.s;
      const size = kind === 'bounce' ? { w: s * 0.6, h: s * 0.42 } : kind === 'noshow' ? { w: s * 0.5, h: s * 0.8 } : { w: s * 0.95, h: s * 0.36 };
      this.obs.push({ kind, x: this.w + 40, ...size });
      const minGap = this.speed * 0.95 + s * 2.2;
      this.nextOb = rand(minGap, minGap * 1.7);
    }
    this.nextPick -= dx;
    if (this.nextPick <= 0) {
      const r = Math.random();
      const kind: PickKind = r < 0.07 ? 'customer' : r < 0.11 ? 'magnet' : 'demo';
      const n = kind === 'demo' ? Math.floor(rand(2, 5)) : 1;
      const y = this.gy - rand(this.s * 0.9, this.s * 2.1);
      const startX = this.w + 60 + (this.obs.length ? 0 : 0);
      for (let i = 0; i < n; i++) this.picks.push({ kind, x: startX + i * this.s * 0.75, y: y - Math.sin((i / Math.max(1, n - 1)) * Math.PI) * this.s * 0.35, r: kind === 'customer' ? this.s * 0.2 : this.s * 0.16, taken: false, t: 0 });
      this.nextPick = rand(this.speed * 0.6, this.speed * 1.4);
    }

    // move + collide
    const rBox = { x: this.rx - this.s * 0.16, y: this.gy + this.ry - this.s * 0.95, w: this.s * 0.34, h: this.s * 0.93 };
    for (const o of this.obs) {
      o.x -= dx;
      const oBox = { x: o.x + o.w * 0.12, y: this.gy - o.h + o.h * 0.1, w: o.w * 0.76, h: o.h * 0.9 };
      if (rBox.x < oBox.x + oBox.w && rBox.x + rBox.w > oBox.x && rBox.y < oBox.y + oBox.h && rBox.y + rBox.h > oBox.y) { this.gameOver(); return; }
    }
    this.obs = this.obs.filter((o) => o.x + o.w > -20);
    if (this.magnet > 0) this.magnet -= dt;
    for (const p of this.picks) {
      p.x -= dx; p.t += dt;
      if (p.taken) continue;
      if (this.magnet > 0 && p.kind === 'demo') {
        const ddx = this.rx - p.x, ddy = (this.gy + this.ry - this.s * 0.5) - p.y, d = Math.hypot(ddx, ddy);
        if (d < this.s * 3.2) { p.x += (ddx / d) * dt * this.s * 9; p.y += (ddy / d) * dt * this.s * 9; }
      }
      const cx = rBox.x + rBox.w / 2, cy = rBox.y + rBox.h / 2;
      if (Math.hypot(p.x - cx, p.y - cy) < p.r + this.s * 0.36) {
        p.taken = true;
        if (p.kind === 'demo') { this.demos += 1; this.burst(p.x, p.y, ACCENT, 6, 0.6); }
        else if (p.kind === 'customer') { this.customers += 1; this.demos += 5; this.burst(p.x, p.y, ACCENT, 22, 1); }
        else { this.magnet = 6; this.burst(p.x, p.y, INK, 10, 0.8); }
        this.hooks.onScore(this.demos, this.customers, this.month);
      }
    }
    this.picks = this.picks.filter((p) => p.x > -40 && !(p.taken && p.t > 30));
    for (const c of this.clouds) { c.x -= dx * 0.25; if (c.x + c.w < 0) { c.x = this.w + rand(0, 200); c.y = rand(this.h * 0.12, this.h * 0.42); } }
    for (const tw of this.towers) { tw.x -= dx * 0.12; }
    if (this.towers.length && this.towers[0].x + this.towers[0].w < 0) { const t0 = this.towers.shift()!; const lastT = this.towers[this.towers.length - 1]; t0.x = lastT.x + lastT.w + rand(10, 60); this.towers.push(t0); }
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += this.s * 6 * dt; p.life -= dt; }
    this.parts = this.parts.filter((p) => p.life > 0);
  }

  private gameOver() {
    this.state = 'over'; this.shake = 0.3; this.slow = 0.5;
    this.burst(this.rx, this.gy - this.s * 0.5, INK, 26, 1.2);
    if (this.demos > this.best) { this.best = this.demos; try { localStorage.setItem(BEST_KEY, String(this.best)); } catch {} }
    setTimeout(() => this.hooks.onOver(this.demos, this.customers, this.month, this.best), 650);
  }
  private burst(x: number, y: number, c: string, n: number, k = 1) {
    for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: rand(-1, 1) * this.s * 4 * k, vy: rand(-1.6, 0.2) * this.s * 4 * k, life: rand(0.35, 0.8), c, r: rand(1.2, 3) });
  }

  private draw() {
    const { ctx, w, h, gy } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-5, 5) * this.shake * 3, rand(-3, 3) * this.shake * 3);
    ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // skyline
    ctx.save(); ctx.strokeStyle = '#C9C8C0'; ctx.lineWidth = 1.2;
    for (const tw of this.towers) {
      if (tw.x > w || tw.x + tw.w < 0) continue;
      ctx.beginPath(); ctx.moveTo(tw.x, gy); ctx.lineTo(tw.x, gy - tw.h);
      if (tw.dome) ctx.arc(tw.x + tw.w / 2, gy - tw.h, tw.w / 2, Math.PI, 0); else ctx.lineTo(tw.x + tw.w, gy - tw.h);
      ctx.lineTo(tw.x + tw.w, gy); ctx.stroke();
      for (let y = gy - tw.h + 10; y < gy - 8; y += 12) { ctx.beginPath(); ctx.moveTo(tw.x + 6, y); ctx.lineTo(tw.x + tw.w - 6, y); ctx.stroke(); }
    }
    ctx.restore();
    // clouds
    ctx.save(); ctx.strokeStyle = '#B9B8B0'; ctx.lineWidth = 1.4;
    for (const c of this.clouds) { ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.bezierCurveTo(c.x + c.w * 0.2, c.y - 16, c.x + c.w * 0.5, c.y - 18, c.x + c.w * 0.6, c.y - 6); ctx.bezierCurveTo(c.x + c.w * 0.8, c.y - 12, c.x + c.w, c.y - 2, c.x + c.w, c.y); ctx.stroke(); }
    ctx.restore();
    // ground
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    ctx.save(); ctx.strokeStyle = '#C9C8C0';
    const tickGap = 46, off = ((this.t * this.speed) % tickGap);
    for (let x = -off; x < w; x += tickGap) { ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x - 8, gy + 14); ctx.stroke(); }
    ctx.restore();

    // picks
    for (const p of this.picks) {
      if (p.taken) continue;
      const bob = Math.sin(p.t * 5 + p.x * 0.01) * 3;
      ctx.save(); ctx.translate(p.x, p.y + bob); ctx.strokeStyle = ACCENT; ctx.fillStyle = ACCENT; ctx.lineWidth = 2;
      if (p.kind === 'demo') {
        const r = p.r; ctx.strokeRect(-r, -r * 0.85, r * 2, r * 1.7); ctx.beginPath(); ctx.moveTo(-r, -r * 0.35); ctx.lineTo(r, -r * 0.35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.45, r * 0.25); ctx.lineTo(-r * 0.1, r * 0.6); ctx.lineTo(r * 0.5, -r * 0.15); ctx.stroke();
      } else if (p.kind === 'customer') {
        ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? p.r * 0.45 : p.r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
      } else {
        ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, p.r, Math.PI * 0.15, Math.PI * 0.85, true); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(Math.cos(Math.PI * 0.15) * p.r, Math.sin(Math.PI * 0.15) * p.r); ctx.lineTo(Math.cos(Math.PI * 0.15) * p.r, Math.sin(Math.PI * 0.15) * p.r + p.r * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(Math.cos(Math.PI * 0.85) * p.r, Math.sin(Math.PI * 0.85) * p.r); ctx.lineTo(Math.cos(Math.PI * 0.85) * p.r, Math.sin(Math.PI * 0.85) * p.r + p.r * 0.5); ctx.stroke();
      }
      ctx.restore();
    }
    // obstacles
    ctx.lineWidth = 2;
    for (const o of this.obs) {
      const x = o.x, top = gy - o.h;
      ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = '#F6F5F0';
      if (o.kind === 'bounce') {
        ctx.fillRect(x, top, o.w, o.h); ctx.strokeRect(x, top, o.w, o.h);
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + o.w / 2, top + o.h * 0.55); ctx.lineTo(x + o.w, top); ctx.stroke();
        ctx.strokeStyle = ACCENT; ctx.beginPath(); ctx.moveTo(x + o.w * 0.3, top - 14); ctx.lineTo(x + o.w * 0.7, top - 2); ctx.moveTo(x + o.w * 0.7, top - 14); ctx.lineTo(x + o.w * 0.3, top - 2); ctx.stroke();
      } else if (o.kind === 'noshow') {
        // empty chair
        ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, top); ctx.lineTo(x + o.w * 0.15, top); ctx.lineTo(x + o.w * 0.15, top + o.h * 0.5); ctx.lineTo(x + o.w, top + o.h * 0.5); ctx.lineTo(x + o.w, gy); ctx.moveTo(x + o.w * 0.15, top + o.h * 0.5); ctx.lineTo(x + o.w * 0.15, gy); ctx.stroke();
        ctx.font = `600 10px 'JetBrains Mono', monospace`; ctx.fillStyle = INK; ctx.fillText('NO-SHOW', x - 6, top - 8);
      } else {
        ctx.fillRect(x + 10, top - 8, o.w - 10, o.h); ctx.strokeRect(x + 10, top - 8, o.w - 10, o.h);
        ctx.fillRect(x, top, o.w - 10, o.h); ctx.strokeRect(x, top, o.w - 10, o.h);
        ctx.beginPath(); ctx.moveTo(x + 8, top + o.h * 0.4); ctx.lineTo(x + o.w * 0.5, top + o.h * 0.4); ctx.moveTo(x + 8, top + o.h * 0.65); ctx.lineTo(x + o.w * 0.4, top + o.h * 0.65); ctx.stroke();
        ctx.font = `600 10px 'JetBrains Mono', monospace`; ctx.fillStyle = ACCENT; ctx.fillText('DUPLICATE', x - 4, top - 16);
      }
      ctx.restore();
    }
    // magnet aura
    if (this.magnet > 0 && this.state === 'running') { ctx.save(); ctx.strokeStyle = ACCENT; ctx.setLineDash([4, 6]); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(this.rx, gy + this.ry - this.s * 0.5, this.s * 1.6 + Math.sin(this.t * 8) * 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    // runner
    const rs: RunnerState = this.state === 'over' ? 'hit' : !this.onGround ? 'jump' : this.state === 'running' ? 'run' : 'idle';
    ctx.strokeStyle = INK;
    if (this.state === 'running' && this.onGround) { ctx.save(); ctx.strokeStyle = '#C9C8C0'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const y = gy - this.s * (0.3 + i * 0.2); ctx.beginPath(); ctx.moveTo(this.rx - this.s * 0.5 - i * 6, y); ctx.lineTo(this.rx - this.s * 0.9 - i * 10, y); ctx.stroke(); } ctx.restore(); }
    drawRunner(ctx, this.rx, gy + this.ry, this.s, this.phase, rs, 2.2, { squash: this.squash });
    // shadow
    ctx.save(); ctx.globalAlpha = 0.18 * (1 - Math.min(1, -this.ry / (this.s * 2))); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(this.rx, gy + 3, this.s * 0.28 * (1 + this.squash * 0.3), 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // particles
    for (const p of this.parts) { ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.restore();
  }

  destroy() { cancelAnimationFrame(this.raf); }
}
