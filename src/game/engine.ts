// Coffee Run. Dodge Bengaluru, collect filter coffee. One canvas, ink lines, one button.
import { drawRunner, type RunnerState } from './runner';

type ObKind = 'pothole' | 'auto' | 'cow' | 'cone';
type PickKind = 'coffee' | 'dosa' | 'double';
interface Ob { kind: ObKind; x: number; w: number; h: number }
interface Pick { kind: PickKind; x: number; y: number; r: number; taken: boolean; t: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string; r: number }
export interface GameHooks {
  onScore(coffee: number, metres: number): void;
  onOver(coffee: number, metres: number, best: number): void;
  onStart(): void;
}

const INK = '#0E0E0C', ACCENT = '#F04E15', MUTED = '#9A9A94', FAINT = '#C9C8C0', PAPER = '#F6F5F0';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const BEST_KEY = 'coffee-run-best';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private w = 0; private h = 0; private dpr = 1;
  state: 'idle' | 'running' | 'over' = 'idle';
  private t = 0; private phase = 0; private speed = 0; private base = 0; private px = 0;
  private gy = 0; private rx = 0; private s = 60;
  private ry = 0; private vy = 0; private onGround = true; private squash = 0; private jumpHeld = false; private coyote = 0; private buffer = 0;
  private obs: Ob[] = []; private picks: Pick[] = []; private parts: Particle[] = [];
  private nextOb = 0; private nextPick = 0;
  private clouds: { x: number; y: number; w: number }[] = [];
  private towers: { x: number; w: number; h: number; dome?: boolean }[] = [];
  private coffee = 0; private double = 0; best = 0;
  private raf = 0; private last = 0; private shake = 0; private slow = 0;
  private visible = false;

  constructor(private canvas: HTMLCanvasElement, private hooks: GameHooks) {
    this.ctx = canvas.getContext('2d')!;
    try { this.best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0; } catch {}
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  get metres() { return Math.round(this.px / (this.s * 1.1)); }
  /** Distance in px to the next obstacle ahead of the runner, and the current speed. Used by tests. */
  nearest() { const o = this.obs.filter((o) => o.x + o.w > this.rx).sort((a, b) => a.x - b.x)[0]; return { dist: o ? o.x - this.rx : Infinity, speed: this.speed, onGround: this.onGround }; }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr); this.canvas.height = Math.round(r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.gy = Math.round(this.h * 0.74); this.rx = Math.round(this.w * 0.2);
    this.s = Math.max(48, Math.min(84, this.h * 0.12));
    this.base = this.w * 0.55;
    if (!this.towers.length) this.buildBackdrop();
  }
  private buildBackdrop() {
    this.towers = []; this.clouds = [];
    let x = 0;
    while (x < this.w * 3) { const w = rand(30, 90); this.towers.push({ x, w, h: rand(this.h * 0.05, this.h * 0.22), dome: Math.random() < 0.12 }); x += w + rand(10, 60); }
    for (let i = 0; i < 7; i++) this.clouds.push({ x: rand(0, this.w * 2), y: rand(this.h * 0.12, this.h * 0.42), w: rand(50, 130) });
  }

  start() {
    this.obs = []; this.picks = []; this.parts = [];
    this.coffee = 0; this.double = 0; this.t = 0; this.px = 0;
    this.ry = 0; this.vy = 0; this.onGround = true; this.speed = this.base;
    this.nextOb = this.w * 1.7; this.nextPick = this.w * 0.45;
    this.state = 'running'; this.hooks.onStart(); this.hooks.onScore(0, 0);
  }
  jumpDown() { if (this.state !== 'running') return; this.jumpHeld = true; this.buffer = 0.12; }
  jumpUp() { this.jumpHeld = false; }

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
    this.speed = this.base * Math.min(2.2, 0.92 + this.metres / 1500 + this.t * 0.003);
    const dx = this.speed * dt;
    this.px += dx;
    if (Math.floor(this.metres / 10) !== Math.floor((this.metres - dx / (this.s * 1.1)) / 10)) this.hooks.onScore(this.coffee, this.metres);

    const g = this.s * 26, jv = this.s * 9.6;
    if (this.buffer > 0) this.buffer -= dt;
    if (this.onGround) this.coyote = 0.08; else this.coyote -= dt;
    if (this.buffer > 0 && (this.onGround || this.coyote > 0)) { this.vy = -jv; this.onGround = false; this.buffer = 0; this.coyote = 0; this.burst(this.rx, this.gy, MUTED, 5, 0.4); }
    if (!this.onGround) {
      if (!this.jumpHeld && this.vy < -jv * 0.75) this.vy = -jv * 0.75; // a tap still clears a cow
      this.vy += g * dt; this.ry += this.vy * dt;
      if (this.ry >= 0) { this.ry = 0; this.vy = 0; this.onGround = true; this.squash = 1; this.burst(this.rx, this.gy, MUTED, 4, 0.3); }
    }
    this.squash = Math.max(0, this.squash - dt * 5);

    this.nextOb -= dx;
    if (this.nextOb <= 0) {
      const roll = Math.random();
      const kind: ObKind = roll < 0.3 ? 'pothole' : roll < 0.55 ? 'cone' : roll < 0.8 ? 'auto' : 'cow';
      const s = this.s;
      const size = kind === 'pothole' ? { w: s * 0.95, h: s * 0.22 } : kind === 'cone' ? { w: s * 0.42, h: s * 0.48 } : kind === 'auto' ? { w: s * 1.15, h: s * 0.78 } : { w: s * 1.25, h: s * 0.86 };
      this.obs.push({ kind, x: this.w + 40, ...size });
      const minGap = this.speed * 0.95 + s * 2.4;
      this.nextOb = rand(minGap, minGap * 1.7);
    }
    this.nextPick -= dx;
    if (this.nextPick <= 0) {
      const r = Math.random();
      const kind: PickKind = r < 0.06 ? 'dosa' : r < 0.1 ? 'double' : 'coffee';
      const n = kind === 'coffee' ? Math.floor(rand(2, 5)) : 1;
      const y = this.gy - rand(this.s * 0.9, this.s * 2.1);
      for (let i = 0; i < n; i++) this.picks.push({ kind, x: this.w + 60 + i * this.s * 0.75, y: y - Math.sin((i / Math.max(1, n - 1)) * Math.PI) * this.s * 0.35, r: kind === 'coffee' ? this.s * 0.16 : this.s * 0.2, taken: false, t: 0 });
      this.nextPick = rand(this.speed * 0.6, this.speed * 1.4);
    }

    const rBox = { x: this.rx - this.s * 0.16, y: this.gy + this.ry - this.s * 0.95, w: this.s * 0.34, h: this.s * 0.93 };
    for (const o of this.obs) {
      o.x -= dx;
      const oBox = { x: o.x + o.w * 0.15, y: this.gy - o.h + o.h * 0.15, w: o.w * 0.7, h: o.h * 0.85 };
      if (rBox.x < oBox.x + oBox.w && rBox.x + rBox.w > oBox.x && rBox.y < oBox.y + oBox.h && rBox.y + rBox.h > oBox.y) { this.gameOver(); return; }
    }
    this.obs = this.obs.filter((o) => o.x + o.w > -20);
    if (this.double > 0) this.double -= dt;
    for (const p of this.picks) {
      p.x -= dx; p.t += dt;
      if (p.taken) continue;
      const cx = rBox.x + rBox.w / 2, cy = rBox.y + rBox.h / 2;
      if (Math.hypot(p.x - cx, p.y - cy) < p.r + this.s * 0.36) {
        p.taken = true;
        if (p.kind === 'coffee') { this.coffee += this.double > 0 ? 2 : 1; this.burst(p.x, p.y, ACCENT, 6, 0.6); }
        else if (p.kind === 'dosa') { this.coffee += 5; this.burst(p.x, p.y, ACCENT, 22, 1); }
        else { this.double = 7; this.burst(p.x, p.y, INK, 10, 0.8); }
        this.hooks.onScore(this.coffee, this.metres);
      }
    }
    this.picks = this.picks.filter((p) => p.x > -40 && !(p.taken && p.t > 30));
    for (const c of this.clouds) { c.x -= dx * 0.25; if (c.x + c.w < 0) { c.x = this.w + rand(0, 200); c.y = rand(this.h * 0.12, this.h * 0.42); } }
    for (const tw of this.towers) tw.x -= dx * 0.12;
    if (this.towers.length && this.towers[0].x + this.towers[0].w < 0) { const t0 = this.towers.shift()!; const lastT = this.towers[this.towers.length - 1]; t0.x = lastT.x + lastT.w + rand(10, 60); this.towers.push(t0); }
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += this.s * 6 * dt; p.life -= dt; }
    this.parts = this.parts.filter((p) => p.life > 0);
  }

  private gameOver() {
    this.state = 'over'; this.shake = 0.3; this.slow = 0.5;
    this.burst(this.rx, this.gy - this.s * 0.5, INK, 26, 1.2);
    if (this.coffee > this.best) { this.best = this.coffee; try { localStorage.setItem(BEST_KEY, String(this.best)); } catch {} }
    setTimeout(() => this.hooks.onOver(this.coffee, this.metres, this.best), 650);
  }
  private burst(x: number, y: number, c: string, n: number, k = 1) {
    for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: rand(-1, 1) * this.s * 4 * k, vy: rand(-1.6, 0.2) * this.s * 4 * k, life: rand(0.35, 0.8), c, r: rand(1.2, 3) });
  }

  private label(text: string, x: number, y: number, color = INK) {
    const { ctx } = this;
    ctx.save(); ctx.font = `600 10px 'JetBrains Mono', monospace`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, x, y); ctx.restore();
  }

  private draw() {
    const { ctx, w, h, gy } = this;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-5, 5) * this.shake * 3, rand(-3, 3) * this.shake * 3);
    ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // skyline
    ctx.save(); ctx.strokeStyle = FAINT; ctx.lineWidth = 1.2;
    for (const tw of this.towers) {
      if (tw.x > w || tw.x + tw.w < 0) continue;
      ctx.beginPath(); ctx.moveTo(tw.x, gy); ctx.lineTo(tw.x, gy - tw.h);
      if (tw.dome) ctx.arc(tw.x + tw.w / 2, gy - tw.h, tw.w / 2, Math.PI, 0); else ctx.lineTo(tw.x + tw.w, gy - tw.h);
      ctx.lineTo(tw.x + tw.w, gy); ctx.stroke();
      for (let y = gy - tw.h + 10; y < gy - 8; y += 12) { ctx.beginPath(); ctx.moveTo(tw.x + 6, y); ctx.lineTo(tw.x + tw.w - 6, y); ctx.stroke(); }
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = '#B9B8B0'; ctx.lineWidth = 1.4;
    for (const c of this.clouds) { ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.bezierCurveTo(c.x + c.w * 0.2, c.y - 16, c.x + c.w * 0.5, c.y - 18, c.x + c.w * 0.6, c.y - 6); ctx.bezierCurveTo(c.x + c.w * 0.8, c.y - 12, c.x + c.w, c.y - 2, c.x + c.w, c.y); ctx.stroke(); }
    ctx.restore();

    // ground, with gaps where the potholes are
    ctx.lineWidth = 1.5; ctx.beginPath();
    let gx = 0;
    for (const o of this.obs.filter((o) => o.kind === 'pothole').sort((a, b) => a.x - b.x)) { ctx.moveTo(gx, gy); ctx.lineTo(Math.max(gx, o.x), gy); gx = o.x + o.w; }
    ctx.moveTo(gx, gy); ctx.lineTo(w, gy); ctx.stroke();
    ctx.save(); ctx.strokeStyle = FAINT;
    const tickGap = 46, off = (this.px % tickGap);
    for (let x = -off; x < w; x += tickGap) { ctx.beginPath(); ctx.moveTo(x, gy + 6); ctx.lineTo(x - 8, gy + 14); ctx.stroke(); }
    ctx.restore();

    // picks
    for (const p of this.picks) {
      if (p.taken) continue;
      const bob = Math.sin(p.t * 5 + p.x * 0.01) * 3;
      ctx.save(); ctx.translate(p.x, p.y + bob); ctx.strokeStyle = ACCENT; ctx.fillStyle = ACCENT; ctx.lineWidth = 2;
      const r = p.r;
      if (p.kind === 'coffee') {
        // steel tumbler on a dabara, with steam
        ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.6); ctx.lineTo(r * 0.7, -r * 0.6); ctx.lineTo(r * 0.5, r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 0.55); ctx.quadraticCurveTo(0, r * 1.25, r * 0.95, r * 0.55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.25, -r * 0.8); ctx.quadraticCurveTo(-r * 0.45, -r * 1.15, -r * 0.2, -r * 1.4); ctx.moveTo(r * 0.25, -r * 0.8); ctx.quadraticCurveTo(r * 0.05, -r * 1.15, r * 0.3, -r * 1.4); ctx.stroke();
      } else if (p.kind === 'dosa') {
        ctx.beginPath(); ctx.moveTo(-r * 1.3, r * 0.5); ctx.lineTo(r * 1.3, r * 0.5); ctx.lineTo(r * 0.2, -r * 0.9); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = PAPER; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-r * 0.6, r * 0.2); ctx.lineTo(r * 0.5, r * 0.2); ctx.stroke();
        this.label('DOSA +5', 0, -r * 1.3, ACCENT);
      } else {
        ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        this.label('2X', 0, 4);
      }
      ctx.restore();
    }

    // obstacles
    ctx.lineWidth = 2;
    for (const o of this.obs) {
      const x = o.x, top = gy - o.h;
      ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = PAPER;
      if (o.kind === 'pothole') {
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(x, gy);
        for (let i = 1; i <= 6; i++) ctx.lineTo(x + (o.w * i) / 6, gy + (i === 6 ? 0 : rand(4, 10) + this.s * 0.12));
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 6, gy - 5); ctx.lineTo(x + 4, gy - 12); ctx.moveTo(x + o.w + 6, gy - 5); ctx.lineTo(x + o.w - 4, gy - 12); ctx.stroke();
      } else if (o.kind === 'cone') {
        ctx.beginPath(); ctx.moveTo(x + o.w * 0.5, top); ctx.lineTo(x + o.w, gy); ctx.lineTo(x, gy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + o.w * 0.28, top + o.h * 0.45); ctx.lineTo(x + o.w * 0.72, top + o.h * 0.45); ctx.stroke();
      } else if (o.kind === 'auto') {
        // three-wheeler: body, roof, wheels, driver
        const bw = o.w, bh = o.h;
        ctx.beginPath(); ctx.moveTo(x + bw * 0.1, gy - bh * 0.25); ctx.lineTo(x + bw * 0.1, gy - bh * 0.62); ctx.quadraticCurveTo(x + bw * 0.1, gy - bh, x + bw * 0.4, gy - bh); ctx.lineTo(x + bw * 0.9, gy - bh); ctx.lineTo(x + bw * 0.95, gy - bh * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + bw * 0.42, gy - bh * 0.95); ctx.lineTo(x + bw * 0.42, gy - bh * 0.55); ctx.lineTo(x + bw * 0.95, gy - bh * 0.55); ctx.stroke();
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + bw * 0.12, gy - bh * 0.35); ctx.lineTo(x + bw * 0.94, gy - bh * 0.35); ctx.stroke();
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        for (const wx of [x + bw * 0.2, x + bw * 0.78]) { ctx.beginPath(); ctx.arc(wx, gy - bh * 0.12, bh * 0.13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x + bw * 0.66, gy - bh * 0.72, bh * 0.1, 0, Math.PI * 2); ctx.stroke();
        this.label('AUTO', x + bw * 0.5, top - 10);
      } else {
        // a cow, unbothered
        const bw = o.w, bh = o.h;
        ctx.beginPath(); ctx.roundRect(x + bw * 0.1, gy - bh * 0.78, bw * 0.7, bh * 0.42, 10); ctx.fill(); ctx.stroke();
        for (const lx of [x + bw * 0.18, x + bw * 0.3, x + bw * 0.6, x + bw * 0.72]) { ctx.beginPath(); ctx.moveTo(lx, gy - bh * 0.36); ctx.lineTo(lx, gy); ctx.stroke(); }
        ctx.beginPath(); ctx.roundRect(x + bw * 0.72, gy - bh, bw * 0.26, bh * 0.36, 8); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + bw * 0.78, gy - bh); ctx.quadraticCurveTo(x + bw * 0.74, gy - bh * 1.18, x + bw * 0.84, gy - bh * 1.12); ctx.moveTo(x + bw * 0.92, gy - bh); ctx.quadraticCurveTo(x + bw * 0.96, gy - bh * 1.18, x + bw * 0.88, gy - bh * 1.12); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + bw * 0.88, gy - bh * 0.86, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + bw * 0.1, gy - bh * 0.7); ctx.quadraticCurveTo(x + bw * 0.02, gy - bh * 0.5, x + bw * 0.06, gy - bh * 0.3); ctx.stroke();
        ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(x + bw * 0.82, gy - bh * 0.62, 3, 0, Math.PI * 2); ctx.fill();
        this.label('COW', x + bw * 0.5, top - 14);
      }
      ctx.restore();
    }

    if (this.double > 0 && this.state === 'running') { this.label('2X COFFEE', this.rx, gy - this.s * 1.15 + this.ry, ACCENT); }
    const rs: RunnerState = this.state === 'over' ? 'hit' : !this.onGround ? 'jump' : this.state === 'running' ? 'run' : 'idle';
    ctx.strokeStyle = INK;
    if (this.state === 'running' && this.onGround) { ctx.save(); ctx.strokeStyle = FAINT; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const y = gy - this.s * (0.3 + i * 0.2); ctx.beginPath(); ctx.moveTo(this.rx - this.s * 0.5 - i * 6, y); ctx.lineTo(this.rx - this.s * 0.9 - i * 10, y); ctx.stroke(); } ctx.restore(); }
    drawRunner(ctx, this.rx, gy + this.ry, this.s, this.phase, rs, 2.2, { squash: this.squash });
    ctx.save(); ctx.globalAlpha = 0.18 * (1 - Math.min(1, -this.ry / (this.s * 2))); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(this.rx, gy + 3, this.s * 0.28 * (1 + this.squash * 0.3), 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    for (const p of this.parts) { ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.restore();
  }

  destroy() { cancelAnimationFrame(this.raf); }
}
