// The ink figure. Shared by the game, the hero idle and the preloader.
export type RunnerState = 'idle' | 'run' | 'jump' | 'hit';

/** x = centre, gy = ground line y, s = height of the figure. phase drives the run cycle. */
export function drawRunner(ctx: CanvasRenderingContext2D, x: number, gy: number, s: number, phase: number, state: RunnerState, lw = 2, opts: { vy?: number; squash?: number } = {}) {
  const squash = opts.squash ?? 0;
  const sy = 1 - squash * 0.18, sx = 1 + squash * 0.18;
  ctx.save();
  ctx.translate(x, gy);
  ctx.scale(sx, sy);
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  const bob = state === 'idle' ? Math.sin(phase * 1.6) * s * 0.012 : state === 'run' ? Math.abs(Math.sin(phase * 2)) * -s * 0.05 : 0;
  const hipY = -s * 0.44 + bob, neckY = -s * 0.72 + bob, headY = -s * 0.86 + bob, headR = s * 0.13;
  const lean = state === 'run' ? 0.16 : state === 'jump' ? 0.08 : 0;

  // legs
  const L = s * 0.44;
  const legs = state === 'run'
    ? [Math.sin(phase * 2) * 0.85, Math.sin(phase * 2 + Math.PI) * 0.85]
    : state === 'jump' ? [-0.55, 0.35] : state === 'hit' ? [0.9, -0.6] : [0.06, -0.06];
  for (const a of legs) {
    const bend = state === 'jump' ? 0.5 : Math.max(0, -Math.cos(a)) * 0.22 + 0.12;
    const kx = Math.sin(a) * L * 0.5 + bend * L * 0.55, ky = hipY + Math.cos(a) * L * 0.5;
    let fx = Math.sin(a) * L, fy = hipY + Math.cos(a) * L;
    if (state !== 'jump' && fy > 0) fy = 0;
    if (state === 'jump') { fy = hipY + L * 0.75; }
    ctx.beginPath(); ctx.moveTo(lean * s * 0.1, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  }
  // torso
  ctx.beginPath(); ctx.moveTo(lean * s * 0.1, hipY); ctx.lineTo(lean * s * 0.3, neckY); ctx.stroke();
  // arms
  const shY = neckY + s * 0.06, shX = lean * s * 0.28;
  const arms = state === 'run' ? [Math.sin(phase * 2 + Math.PI) * 0.9, Math.sin(phase * 2) * 0.9] : state === 'jump' ? [-2.4, -2.1] : state === 'hit' ? [-1.8, 2.2] : [0.25, -0.25];
  for (const a of arms) {
    const A = s * 0.3;
    const ex = shX + Math.sin(a) * A * 0.55, ey = shY + Math.cos(a) * A * 0.55;
    const hx = ex + Math.sin(a + (state === 'run' ? -0.9 : 0)) * A * 0.5, hy = ey + Math.cos(a + (state === 'run' ? -0.9 : 0)) * A * 0.5;
    ctx.beginPath(); ctx.moveTo(shX, shY); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  }
  // head
  ctx.beginPath(); ctx.arc(lean * s * 0.34, headY, headR, 0, Math.PI * 2); ctx.stroke();
  // hair tuft
  ctx.beginPath(); ctx.moveTo(lean * s * 0.34 - headR * 0.4, headY - headR * 0.95); ctx.quadraticCurveTo(lean * s * 0.34 + headR * 0.3, headY - headR * 1.55, lean * s * 0.34 + headR * 0.9, headY - headR * 0.85); ctx.stroke();
  ctx.restore();
}
