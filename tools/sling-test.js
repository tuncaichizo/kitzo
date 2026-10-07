// renderer/sling.js cekirdek testi: node tools/sling-test.js
const assert = require('assert');
const path = require('path');
const S = require(path.join(__dirname, '..', 'renderer', 'sling.js'));
const D = S.DEFAULTS;

// firlatma yonu: sola-asagi cekilince saga-yukari gider
const a = { x: 500, y: 500 };
const l = S.launchFromPull(a, { x: 400, y: 560 });
assert(l.vx > 0 && l.vy < 0, 'yon cekilenin tersi');
assert(Math.abs(l.vx / l.vy + 100 / 60) < 1e-9, 'yon orani');
assert(l.power01 > 0 && l.power01 < 1);
// siddet cekmeyle orantili
const l1 = S.launchFromPull(a, { x: 450, y: 500 });
const l2 = S.launchFromPull(a, { x: 400, y: 500 });
assert(Math.abs(Math.hypot(l2.vx, l2.vy) / Math.hypot(l1.vx, l1.vy) - 2) < 1e-9, 'orantili');
// maxPull ile kirpilir, maxLaunch ile sinirlanir
const far = S.launchFromPull(a, { x: 500 - 5000, y: 500 });
assert.strictEqual(far.power01, 1);
assert(Math.abs(Math.hypot(far.vx, far.vy) - Math.min(D.maxPull * D.power, D.maxLaunch)) < 1e-9);
assert(Math.abs(Math.hypot(far.vx, far.vy) - 70) < 1e-9, 'tam cekme = 70');
const hard = S.launchFromPull(a, { x: 0, y: 500 }, { maxPull: 400, power: 1, maxLaunch: 70 });
assert(Math.abs(Math.hypot(hard.vx, hard.vy) - 70) < 1e-9, 'maxLaunch siniri');
assert.deepStrictEqual(S.launchFromPull(a, a), { vx: 0, vy: 0, power01: 0 });

// clampPull: daire icinde tutar, iceridekini degistirmez
const c = S.clampPull(a, { x: 500 + 300, y: 500 + 400 }, 100);
assert(Math.abs(Math.hypot(c.x - 500, c.y - 500) - 100) < 1e-9);
assert(Math.abs((c.x - 500) / (c.y - 500) - 0.75) < 1e-9, 'yon korunur');
assert.deepStrictEqual(S.clampPull(a, { x: 510, y: 490 }, 100), { x: 510, y: 490 });

// step: renderer.js'teki eski stepPhysics formuluyle ayni sonuc
function oldStep(p, w) {
  const G = 2.4, BOUNCE = 0.52, WALL = 0.62, FR = 0.8, DRAG = 0.995, REST = 2.4;
  p.vy += G;
  p.vx *= DRAG;
  let nx = p.x + p.vx;
  let ny = p.y + p.vy;
  if (nx < w.left) {
    if (!(w.canExitLeft && Math.abs(p.vx) > w.crossSpeed)) { nx = w.left; p.vx = -p.vx * WALL; }
  } else if (nx > w.right) {
    if (!(w.canExitRight && Math.abs(p.vx) > w.crossSpeed)) { nx = w.right; p.vx = -p.vx * WALL; }
  }
  if (ny < w.top) { ny = w.top; p.vy = Math.abs(p.vy) * WALL; }
  let landed = false;
  if (ny >= w.ground) {
    ny = w.ground;
    if (Math.abs(p.vy) > REST) { p.vy = -Math.abs(p.vy) * BOUNCE; p.vx *= FR; p.bounces++; }
    else { p.vy = 0; p.vx *= FR; if (Math.abs(p.vx) < 1.2) landed = true; }
  }
  p.x = nx; p.y = ny;
  return landed;
}
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let run = 0; run < 200; run++) {
  const world = {
    left: 0, right: 1800, top: -20, ground: 900,
    canExitLeft: rnd() < 0.5, canExitRight: rnd() < 0.5, crossSpeed: 30,
  };
  const o = { x: rnd() * 1800, y: rnd() * 900, vx: (rnd() - 0.5) * 140, vy: (rnd() - 0.5) * 140, bounces: 0 };
  const n = { ...o };
  for (let i = 0; i < 300; i++) {
    const landedOld = oldStep(o, world);
    const r = S.step(n, world);
    assert.strictEqual(r.landed, landedOld);
    assert.ok(Math.abs(n.x - o.x) < 1e-9 && Math.abs(n.y - o.y) < 1e-9, `konum run${run} i${i}`);
    assert.ok(Math.abs(n.vx - o.vx) < 1e-9 && Math.abs(n.vy - o.vy) < 1e-9, `hiz run${run} i${i}`);
    assert.strictEqual(n.bounces, o.bounces);
    if (r.hit) assert(r.impact > 0);
    if (landedOld) break;
  }
}
// carpma bildirimi
const b = { x: 100, y: 890, vx: 0, vy: 40, bounces: 0 };
const r = S.step(b, { left: 0, right: 1800, top: -20, ground: 900, crossSpeed: 30 });
assert.strictEqual(r.hit, 'ground');
assert(r.impact > 40 && b.bounces === 1);

// predictPath
const free = S.predictPath({ x: 0, y: 0 }, { vx: 20, vy: -30 }, null, 60, 3);
assert.strictEqual(free.length, 20);
assert(free[1].x > free[0].x);
const w = { left: 0, right: 1800, top: -2000, ground: 900, crossSpeed: 30 };
const stopped = S.predictPath({ x: 0, y: 800 }, { vx: 10, vy: 0 }, { world: w }, 200, 3);
assert(stopped.length < 200 / 3, 'ilk carpmada durur');
assert(stopped[stopped.length - 1].y === 900);

console.log('sling-test: OK');
