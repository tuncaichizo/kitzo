// Ekran izleri: karakterin firlattigi seyler ve biraktigi izler. Bu sayfa tum ekrani kaplayan,
// tiklamayi gecirgen saydam bir pencerede calisir (main.js). Her sey 5 saniye icinde silinir.
(() => {
  const layer = document.getElementById('layer');
  const PALETTE = ['#ff5c8a', '#ffb547', '#7cf29a', '#5ac8ff', '#c084fc', '#ff7a45', '#ffe66d', '#47e0d8'];
  const STICKERS = ['⚡', '🚀', '🌙', '🍕', '🎯', '🍀', '🎸', '🧊', '🔥', '🍩', '🎈', '🪙', '🌟', '🍪', '🎮', '🐟', '🍉', '🛸'];
  const PRINT_STYLE = { kitzo: 'paw', fyra: 'paw', drayko: 'paw', zumi: 'drip', byto: 'gear', nocto: 'bird', nubi: 'bird', wispa: 'wisp', ozgezo: 'shoe', barkinzo: 'shoe' };
  const FADE_AT = 3300; // izler solmaya baslar
  const DONE_AT = 4300; // her sey temizlenir (5 sn altinda)

  let session = 0;
  let W = 0;
  let H = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - (1 - t) ** 3;

  function place(d, x, y, rot = 0, extra = '') {
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.style.transform = `translate(-50%, -50%) rotate(${rot}deg) ${extra}`;
  }

  function node(cls, html, x, y, rot = 0) {
    const d = document.createElement('div');
    d.className = `m ${cls}`;
    d.innerHTML = `<div class="in">${html}</div>`;
    place(d, x, y, rot);
    layer.appendChild(d);
    return d;
  }

  function animate(ms, fn) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = clamp((now - t0) / ms, 0, 1);
        fn(t);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  // Karakterin baktigi yone dogru, ekranin icinde kalan bir hedef
  function pickTarget(o, dir, min = 200, max = 520) {
    const dist = rnd(min, max);
    const ang = rnd(-0.6, 0.3);
    let dx = Math.cos(ang) * dist * dir;
    const dy = Math.sin(ang) * dist;
    if (o.x + dx < 70 || o.x + dx > W - 70) dx = -dx; // kenardaysa ters yone at
    return { x: clamp(o.x + dx, 70, W - 70), y: clamp(o.y + dy, 70, H - 70) };
  }

  // Yay cizerek ucus: x dogrusal, y parabol
  function fly(d, o, p, ms, { spin = 0, h = rnd(90, 200), flip = false } = {}) {
    return animate(ms, (t) => {
      const x = o.x + (p.x - o.x) * t;
      const y = o.y + (p.y - o.y) * t - h * 4 * t * (1 - t);
      place(d, x, y, spin * t, flip ? `scaleX(${Math.cos(t * Math.PI * 4).toFixed(3)})` : '');
    });
  }

  function blobSvg(r, color) {
    const n = 12;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * rnd(0.6, 1.15);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[0], pts[1]);
    let d = `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const q = pts[(i + 1) % n];
      const m = mid(q, pts[(i + 2) % n]);
      d += ` Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    const s = Math.ceil(r * 1.3);
    return `<svg width="${s * 2}" height="${s * 2}" viewBox="${-s} ${-s} ${s * 2} ${s * 2}"><path d="${d} Z" fill="${color}" opacity="0.92"/><ellipse cx="${(-r * 0.3).toFixed(1)}" cy="${(-r * 0.35).toFixed(1)}" rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.17).toFixed(1)}" fill="#fff" opacity="0.35"/></svg>`;
  }

  function printSvg(style, color) {
    switch (style) {
      case 'bird':
        return `<svg width="34" height="34" viewBox="-17 -17 34 34"><g stroke="${color}" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0.9"><path d="M0 9 V-3"/><path d="M0 -3 L-10 -12"/><path d="M0 -3 L0 -14"/><path d="M0 -3 L10 -12"/></g></svg>`;
      case 'shoe':
        return `<svg width="26" height="40" viewBox="-13 -20 26 40"><g fill="${color}" opacity="0.9"><path d="M-9 -6 Q-10 -20 0 -20 Q10 -20 9 -6 Q10 2 4 6 L-4 6 Q-10 2 -9 -6 Z"/><rect x="-7" y="10" width="14" height="9" rx="4"/></g></svg>`;
      case 'gear': {
        const teeth = [0, 60, 120, 180, 240, 300].map((a) => `<rect x="-3" y="-14" width="6" height="7" rx="1.5" transform="rotate(${a})"/>`).join('');
        return `<svg width="30" height="30" viewBox="-15 -15 30 30"><g fill="${color}" opacity="0.9"><circle r="7"/>${teeth}<circle r="3" fill="#000" opacity="0.35"/></g></svg>`;
      }
      case 'drip':
        return `<svg width="30" height="34" viewBox="-15 -17 30 34"><path d="M0 -14 C6 -4 11 2 11 7 A11 11 0 0 1 -11 7 C-11 2 -6 -4 0 -14 Z" fill="${color}" opacity="0.9"/><ellipse cx="-4" cy="5" rx="2.5" ry="4" fill="#fff" opacity="0.35"/></svg>`;
      case 'wisp':
        return `<svg width="36" height="24" viewBox="-18 -12 36 24"><ellipse rx="14" ry="7" fill="${color}" opacity="0.55"/><ellipse cx="-4" cy="-2" rx="6" ry="3.5" fill="#fff" opacity="0.35"/></svg>`;
      case 'flame':
        return `<svg width="28" height="34" viewBox="-14 -20 28 34"><path d="M0 -18 C7 -8 12 -1 10 7 A10 10 0 0 1 -10 7 C-12 -1 -7 -8 0 -18 Z" fill="${color}" opacity="0.9"/><path d="M0 -6 C3 -1 5 3 4 7 A4 4 0 0 1 -4 7 C-5 3 -3 -1 0 -6 Z" fill="#ffe066" opacity="0.85"/></svg>`;
      case 'ice':
        return `<svg width="26" height="26" viewBox="-13 -13 26 26"><polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="${color}" opacity="0.9"/><circle r="2.4" fill="#ffffff" opacity="0.8"/></svg>`;
      case 'leaf':
        return `<svg width="26" height="20" viewBox="-13 -10 26 20"><path d="M-12 0 C-6 -10 6 -10 12 0 C6 10 -6 10 -12 0 Z" fill="${color}" opacity="0.9"/><path d="M-11 0 H11" stroke="#3d6b2f" stroke-width="1.2" opacity="0.6"/></svg>`;
      default: // paw
        return `<svg width="34" height="34" viewBox="-17 -17 34 34"><g fill="${color}" opacity="0.9"><ellipse cx="0" cy="5" rx="8" ry="6.5"/><circle cx="-8.5" cy="-3" r="3.4"/><circle cx="-3" cy="-8" r="3.4"/><circle cx="3" cy="-8" r="3.4"/><circle cx="8.5" cy="-3" r="3.4"/></g></svg>`;
    }
  }

  // Boya balonu: ucar, patlar, damlalar sicrar
  async function splat(o, dir, color) {
    const p = pickTarget(o, dir);
    const ball = node('proj', `<div class="ball" style="background:${color}"></div>`, o.x, o.y);
    await fly(ball, o, p, 620, { spin: rnd(-200, 200) });
    ball.remove();
    node('mark', blobSvg(rnd(26, 44), color), p.x, p.y, rnd(0, 360));
    const drops = [];
    for (let i = 0; i < 5; i++) {
      const a = rnd(0, Math.PI * 2);
      const dist = rnd(50, 130);
      const size = rnd(5, 11).toFixed(0);
      const d = node('drop', `<div class="ball" style="width:${size}px;height:${size}px;background:${color}"></div>`, p.x, p.y);
      drops.push({ d, tx: p.x + Math.cos(a) * dist, ty: p.y + Math.sin(a) * dist });
    }
    await animate(360, (t) => {
      const e = easeOut(t);
      for (const { d, tx, ty } of drops) place(d, p.x + (tx - p.x) * e, p.y + (ty - p.y) * e);
    });
  }

  // Iz dizisi: karakterden uzaklasan kivrimli bir yol boyunca teker teker belirir
  async function trail(o, dir, color, style) {
    const p = pickTarget(o, dir, 260, 560);
    const ctrl = { x: (o.x + p.x) / 2 + rnd(-90, 90), y: (o.y + p.y) / 2 + rnd(-90, 90) };
    const at = (t) => ({
      x: (1 - t) ** 2 * o.x + 2 * (1 - t) * t * ctrl.x + t * t * p.x,
      y: (1 - t) ** 2 * o.y + 2 * (1 - t) * t * ctrl.y + t * t * p.y,
    });
    const n = 8;
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (i / (n - 1)) * 0.88;
      const a = at(t);
      const b = at(Math.min(1, t + 0.02));
      const heading = Math.atan2(b.y - a.y, b.x - a.x);
      const side = i % 2 === 0 ? 1 : -1;
      const off = style === 'wisp' || style === 'drip' ? 0 : 9;
      const x = a.x + Math.cos(heading + Math.PI / 2) * off * side;
      const y = a.y + Math.sin(heading + Math.PI / 2) * off * side;
      node('mark', printSvg(style, color), x, y, (heading * 180) / Math.PI + 90);
      await wait(150);
    }
  }

  // Bitcoin: donerek ucar, iki kez seker, parildar
  async function coin(o, dir) {
    const p = pickTarget(o, dir);
    const svg = `<svg width="36" height="36" viewBox="-18 -18 36 36"><circle r="16" fill="#f7931a"/><circle r="12.5" fill="none" stroke="#ffd27a" stroke-width="2"/><text x="0" y="6.5" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="Segoe UI, Arial, sans-serif">₿</text></svg>`;
    const c = node('proj', svg, o.x, o.y);
    await fly(c, o, p, 700, { flip: true, h: rnd(120, 220) });
    await animate(240, (t) => place(c, p.x + 14 * t * dir, p.y - 30 * 4 * t * (1 - t), 0, `scaleX(${Math.cos(t * Math.PI * 2).toFixed(3)})`));
    await animate(160, (t) => place(c, p.x + 14 * dir + 8 * t * dir, p.y - 12 * 4 * t * (1 - t)));
    const fx = p.x + 22 * dir;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + rnd(0, 0.6);
      node('quick', '<div class="spark">✦</div>', fx + Math.cos(a) * rnd(24, 40), p.y + Math.sin(a) * rnd(24, 40));
    }
  }

  // Yildiz: donerek ucar, yere yapisir, parildar
  async function star(o, dir) {
    const p = pickTarget(o, dir);
    const col = pick(['#ffe66d', '#ffd27a', '#fff3a0']);
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 8 : 18;
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
    }
    const svg = `<svg width="44" height="44" viewBox="-22 -22 44 44" style="filter:drop-shadow(0 0 6px ${col})"><polygon points="${pts.join(' ')}" fill="${col}" stroke="#ffb400" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    const s = node('proj', svg, o.x, o.y);
    await fly(s, o, p, 680, { spin: 540 * dir, h: rnd(120, 240) });
    s.remove();
    node('mark twinkle', svg, p.x, p.y, rnd(-20, 20));
  }

  // Cikartma: ucar, yapisir, sonunda kenarindan soyulur
  async function sticker(o, dir, forced) {
    const p = pickTarget(o, dir);
    const emoji = forced || pick(STICKERS);
    const s = node('proj', `<div class="sticker">${emoji}</div>`, o.x, o.y);
    await fly(s, o, p, 640, { spin: rnd(-360, 360) });
    s.remove();
    const m = node('mark', `<div class="sticker">${emoji}</div>`, p.x, p.y, rnd(-16, 16));
    setTimeout(() => {
      if (!m.isConnected) return;
      m.style.transition = 'transform 0.7s ease-in, opacity 0.7s ease-in';
      m.style.transform += ` rotate(${28 * dir}deg) translate(${12 * dir}px, -10px) skewX(14deg)`;
    }, FADE_AT - 300);
  }

  // Konfeti: kucuk bir patlama, parcalar dusup solar
  async function confetti(o, dir) {
    const p = pickTarget(o, dir, 180, 420);
    const ball = node('proj', '<div class="popper">🎉</div>', o.x, o.y);
    await fly(ball, o, p, 600, { spin: rnd(-180, 180) });
    ball.remove();
    const pieces = [];
    for (let i = 0; i < 40; i++) {
      const a = rnd(-Math.PI, 0); // yukari dogru yay
      const sp = rnd(160, 420);
      const d = node('piece', `<div class="piece" style="background:${pick(PALETTE)};width:${rnd(5, 8).toFixed(0)}px;height:${rnd(9, 14).toFixed(0)}px"></div>`, p.x, p.y);
      pieces.push({ d, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: rnd(0, 360), rs: rnd(-400, 400) });
    }
    const g = 520; // px/s^2
    await animate(2200, (t) => {
      const s = t * 2.2;
      for (const q of pieces) {
        place(q.d, p.x + q.vx * s * (1 - 0.35 * t), p.y + q.vy * s + 0.5 * g * s * s, q.rot + q.rs * s, `scaleX(${Math.cos(s * 6 + q.rot).toFixed(2)})`);
        q.d.style.opacity = t > 0.7 ? String(1 - (t - 0.7) / 0.3) : '1';
      }
    });
  }

  // Baloncuklar: karakterden yukselir, salinir, teker teker patlar
  async function bubbles(o, dir) {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const size = rnd(14, 34).toFixed(0);
      const d = node('bub', `<div class="bubble" style="width:${size}px;height:${size}px"></div>`, o.x, o.y);
      d.style.opacity = '0';
      items.push({ d, delay: i * 140 + rnd(0, 120), dur: rnd(1500, 2300), drift: rnd(40, 120) * dir + rnd(-40, 40), rise: rnd(140, 320), wob: rnd(10, 26), ph: rnd(0, 6), popped: false, t0: 0 });
    }
    await animate(3300, () => {
      const now = performance.now();
      for (const b of items) {
        if (!b.t0) b.t0 = now;
        const t = (now - b.t0 - b.delay) / b.dur;
        if (t < 0) continue;
        if (t >= 1) {
          if (!b.popped) {
            b.popped = true;
            b.d.classList.add('pop');
          }
          continue;
        }
        const e = easeOut(t);
        const scale = (0.35 + 0.65 * Math.min(1, t * 2)).toFixed(3);
        place(b.d, o.x + b.drift * e + Math.sin(t * 6 + b.ph) * b.wob, o.y - 40 - b.rise * e, 0, `scale(${scale})`);
        b.d.style.opacity = String(Math.min(1, t * 4));
      }
    });
  }

  // Hokkabazlik: iki el arasinda uc top
  async function juggle(o) {
    const L = { x: o.x - 22, y: o.y };
    const R = { x: o.x + 22, y: o.y };
    const balls = [0, 1, 2].map((i) => ({
      d: node('proj', `<div class="ball" style="width:15px;height:15px;background:${PALETTE[(i * 3) % PALETTE.length]}"></div>`, o.x, o.y),
      ph: i * 400,
    }));
    const period = 1200;
    const half = 600;
    const h = 80;
    await animate(3000, (t) => {
      const ms = t * 3000;
      for (const b of balls) {
        const k = ((ms + b.ph) % period) / half; // 0..2
        const goingRight = k < 1;
        const u = goingRight ? k : k - 1;
        const from = goingRight ? L : R;
        const to = goingRight ? R : L;
        place(b.d, from.x + (to.x - from.x) * u, from.y - h * 4 * u * (1 - u), 0);
      }
    });
  }

  // Duman bulutu: ninja kaybolmasi / belirmesi
  async function puff(o) {
    const parts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rnd(-0.3, 0.3);
      const size = rnd(18, 30).toFixed(0);
      const d = node('smoke', `<div class="smoke" style="width:${size}px;height:${size}px"></div>`, o.x, o.y);
      parts.push({ d, tx: o.x + Math.cos(a) * rnd(30, 60), ty: o.y + Math.sin(a) * rnd(30, 60) - 10 });
    }
    await animate(650, (t) => {
      const e = easeOut(t);
      for (const p of parts) {
        place(p.d, o.x + (p.tx - o.x) * e, o.y + (p.ty - o.y) * e, 0, `scale(${(0.5 + e * 1.2).toFixed(2)})`);
        p.d.style.opacity = String(0.9 * (1 - t));
      }
    });
    for (const p of parts) p.d.remove();
  }

  // Hizli renk kayması: siber sicramanin baslangic/varis noktasinda cikan RGB-split parlamasi
  async function glitch(o) {
    const layers = [
      { color: 'rgba(255,0,150,0.55)', dx: -5 },
      { color: 'rgba(0,220,255,0.55)', dx: 5 },
      { color: 'rgba(255,255,255,0.4)', dx: 0 },
    ].map(({ color, dx }) => node('mark', `<div style="width:44px;height:58px;background:${color};border-radius:6px"></div>`, o.x + dx, o.y));
    await animate(420, (t) => {
      const op = String(Math.max(0, (1 - t) * 0.9));
      for (const d of layers) d.style.opacity = op;
    });
    for (const d of layers) d.remove();
  }

  // Erime golcugu: karakterin ayaklarinin biraktigi yassi iz
  function puddle(o, color) {
    const rx = 34;
    const ry = 12;
    const svg = `<svg width="${(rx + 4) * 2}" height="${(ry + 4) * 2}" viewBox="${-(rx + 4)} ${-(ry + 4)} ${(rx + 4) * 2} ${(ry + 4) * 2}"><ellipse rx="${rx}" ry="${ry}" fill="${color}" opacity="0.85"/><ellipse rx="${rx * 0.55}" ry="${ry * 0.45}" cy="${-ry * 0.3}" fill="#ffffff" opacity="0.2"/></svg>`;
    node('mark', svg, o.x, o.y + 55, 0);
  }

  // Yesil kod yagmuru: hacker modu
  async function matrixRain(o) {
    const glyphSet = '01@#$%&アイウエオカキクケコ'.split('');
    const cols = 6;
    const items = [];
    for (let i = 0; i < cols; i++) {
      const x = o.x + (i - (cols - 1) / 2) * 16 + rnd(-4, 4);
      const startY = o.y - 90 - rnd(0, 40);
      const glyphs = Array.from({ length: 4 }, () => pick(glyphSet));
      const d = node('mark', `<div style="font:700 15px monospace;color:#39ff6a;text-shadow:0 0 4px #22ff55;line-height:15px;text-align:center;opacity:.9">${glyphs.join('<br>')}</div>`, x, startY);
      items.push({ d, x, y0: startY, dist: rnd(90, 150) });
    }
    await animate(1400, (t) => {
      for (const it of items) {
        place(it.d, it.x, it.y0 + it.dist * t);
        it.d.style.opacity = String(t < 0.7 ? 0.9 : 0.9 * (1 - (t - 0.7) / 0.3));
      }
    });
    for (const it of items) it.d.remove();
  }

  // Radar tarama halkalari: saf CSS ile buyuyup solar (bkz. marks.html .scan-ring)
  async function scanRings(o) {
    const spawn = (delay) =>
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'scan-ring';
        d.style.left = `${o.x}px`;
        d.style.top = `${o.y}px`;
        layer.appendChild(d);
        setTimeout(() => d.remove(), 950);
      }, delay);
    spawn(0);
    spawn(250);
    spawn(500);
    await wait(1300);
  }

  // Ates nefesi: agizdan yone dogru sacilan alev parcaciklari
  async function firebreath(o, dir) {
    const parts = Array.from({ length: 14 }, () => {
      const spread = rnd(-0.4, 0.4);
      const dist = rnd(120, 260);
      const size = rnd(10, 20).toFixed(0);
      const color = pick(['#ff5c1a', '#ff8a3c', '#ffce54']);
      const d = node('mark', `<div style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,${color},rgba(255,90,20,0) 70%)"></div>`, o.x, o.y);
      return { d, tx: o.x + Math.cos(spread) * dist * dir, ty: o.y + Math.sin(spread) * dist * 0.5, delay: rnd(0, 150) };
    });
    await animate(750, (t) => {
      const ms = t * 750;
      for (const p of parts) {
        const pt = clamp((ms - p.delay) / 500, 0, 1);
        const e = easeOut(pt);
        place(p.d, o.x + (p.tx - o.x) * e, o.y + (p.ty - o.y) * e);
        p.d.style.opacity = String(pt <= 0 ? 0 : 1 - pt * 0.9);
      }
    });
    for (const p of parts) p.d.remove();
  }

  // Terminal penceresi: karakterin yaninda acilir, yesil satirlar yazilir
  async function terminal(o, dir) {
    const w = 150;
    const h = 96;
    const x = clamp(o.x + dir * 110, 90, W - 90);
    const lines = ['> kitzo --scan', '> access: ok', '> npm run build', '> deploy ✓'];
    const box = node(
      'mark',
      `<div style="width:${w}px;height:${h}px;border-radius:6px;background:rgba(10,14,12,0.92);border:1px solid #39ff6a;box-shadow:0 0 12px rgba(57,255,106,0.35);padding:6px 8px;box-sizing:border-box;font:600 11px/15px Consolas,monospace;color:#39ff6a;text-align:left;overflow:hidden"><div class="tl"></div></div>`,
      x,
      o.y
    );
    const target = box.querySelector('.tl');
    for (const line of lines) {
      for (let i = 1; i <= line.length; i += 2) {
        target.textContent = `${lines.slice(0, lines.indexOf(line)).join('\n')}${lines.indexOf(line) ? '\n' : ''}${line.slice(0, i)}`;
        target.style.whiteSpace = 'pre';
        await wait(18);
      }
      await wait(120);
    }
    await wait(500);
  }

  const px = (size, color) => `<div style="width:${size}px;height:${size}px;background:${color}"></div>`;

  // Yapraklar karakterin etrafinda donerek yukselir (saman ucusu)
  async function leafSwirl(o) {
    const leaves = [];
    for (let i = 0; i < 12; i++) {
      const d = node('mark', printSvg('leaf', pick(['#7cbf5a', '#9fd97a', '#5ea347'])), o.x, o.y);
      leaves.push({
        d,
        a0: (i / 12) * Math.PI * 2,
        rx: rnd(40, 72),
        ry: rnd(12, 26),
        rise: rnd(70, 150),
        sp: rnd(1.4, 2.4),
        sc: rnd(0.55, 0.85), // karakter kucuk oldugu icin yapraklar da kucuk
      });
    }
    await animate(2600, (t) => {
      for (const l of leaves) {
        const a = l.a0 + t * l.sp * Math.PI * 2;
        place(l.d, o.x + Math.cos(a) * l.rx, o.y + Math.sin(a) * l.ry - l.rise * t, Math.sin(a) * 40, `scale(${l.sc.toFixed(2)})`);
        l.d.style.opacity = String(t < 0.72 ? 1 : Math.max(0, 1 - (t - 0.72) / 0.28));
      }
    });
    for (const l of leaves) l.d.remove();
  }

  // Bereket: yesil halka, acan cicekler ve yukselen parilti
  async function bloom(o) {
    const ring = document.createElement('div');
    ring.className = 'bloom-ring';
    ring.style.left = `${o.x}px`;
    ring.style.top = `${o.y + 28}px`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 1000);

    const flowers = [];
    for (let i = 0; i < 7; i++) {
      const x = o.x + rnd(-72, 72);
      const y = o.y + rnd(18, 46);
      const d = node('mark', `<div style="font-size:17px;line-height:1">${pick(['🌸', '🌼', '🌿', '🍀'])}</div>`, x, y);
      d.style.opacity = '0';
      flowers.push({ d, x, y, delay: i * 110 });
    }
    const sparks = [];
    for (let i = 0; i < 16; i++) {
      const x = o.x + rnd(-50, 50);
      const y = o.y + rnd(6, 44);
      const d = node('bit', px(4, pick(['#c9f7a0', '#ffffff', '#8fe36a'])), x, y);
      sparks.push({ d, x, y, rise: rnd(50, 120), delay: rnd(0, 600) });
    }

    await animate(2200, (t) => {
      const ms = t * 2200;
      for (const f of flowers) {
        const ft = clamp((ms - f.delay) / 500, 0, 1);
        place(f.d, f.x, f.y - 4 * ft, 0, `scale(${(0.3 + ft * 0.7).toFixed(2)})`);
        f.d.style.opacity = String(t > 0.8 ? Math.max(0, 1 - (t - 0.8) / 0.2) : ft);
      }
      for (const s of sparks) {
        const st = clamp((ms - s.delay) / 1200, 0, 1);
        place(s.d, s.x + Math.sin(st * 6) * 6, s.y - s.rise * st);
        s.d.style.opacity = String(st <= 0 ? 0 : 1 - st);
      }
    });
    for (const f of flowers) f.d.remove();
    for (const s of sparks) s.d.remove();
  }

  // ---- carpma/patlama efektleri (pikselli) ----

  const FIRE = ['#fff3b0', '#ffd166', '#ff8a3c', '#ff5c1a', '#c1350a'];
  const DEBRIS = ['#ffd166', '#ff8a3c', '#c1350a', '#3a2a22', '#6b5a4e'];

  // Ortak patlama: yanik izi + sok halkasi + ates topu + enkaz + duman
  async function explode(p, scale = 1) {
    node('mark', blobSvg(rnd(16, 24) * scale, '#2a1f18'), p.x, p.y + 6, rnd(0, 360));

    const ring = document.createElement('div');
    ring.className = 'boom-ring';
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 700);

    const balls = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const d = node('boom', px(Math.round(rnd(10, 18) * scale), pick(FIRE)), p.x, p.y);
      balls.push({ d, a, dist: rnd(12, 36) * scale });
    }
    const bits = [];
    for (let i = 0; i < 22; i++) {
      const a = rnd(-Math.PI, 0.2);
      const sp = rnd(150, 380) * scale;
      const d = node('bit', px(Math.round(rnd(4, 9)), pick(DEBRIS)), p.x, p.y);
      bits.push({ d, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
    await animate(950, (t) => {
      const e = easeOut(Math.min(1, t * 2));
      for (const b of balls) {
        place(
          b.d,
          p.x + Math.cos(b.a) * b.dist * e,
          p.y + Math.sin(b.a) * b.dist * e,
          0,
          `scale(${Math.max(0.2, 1.4 - t * 1.4).toFixed(2)})`
        );
        b.d.style.opacity = String(Math.max(0, 1 - t * 1.7));
      }
      const s = t * 0.95;
      for (const q of bits) {
        place(q.d, p.x + q.vx * s, p.y + q.vy * s + 0.5 * 900 * s * s);
        q.d.style.opacity = String(Math.max(0, 1 - t * 1.1));
      }
    });
    for (const b of balls) b.d.remove();
    for (const q of bits) q.d.remove();
    await puff({ x: p.x, y: p.y - 8 });
  }

  // Bomba: ucar, fitili kivilcimlanir, patlar
  async function bomb(o, dir) {
    const p = pickTarget(o, dir, 180, 420);
    const svg =
      '<svg width="30" height="32" viewBox="0 0 30 32" shape-rendering="crispEdges">' +
      '<rect x="7" y="12" width="16" height="15" fill="#26262e"/>' +
      '<rect x="5" y="15" width="20" height="10" fill="#26262e"/>' +
      '<rect x="9" y="15" width="4" height="4" fill="#5a5a68"/>' +
      '<rect x="16" y="7" width="3" height="6" fill="#8a6a3a"/>' +
      '<rect x="19" y="3" width="4" height="4" fill="#ffd166"/></svg>';
    const b = node('proj', svg, o.x, o.y);
    await fly(b, o, p, 620, { spin: rnd(-160, 160) });
    for (let i = 0; i < 3; i++) {
      node('quick', '<div class="spark">-</div>', p.x + rnd(-8, 8), p.y - 16);
      await wait(90);
    }
    b.remove();
    await explode(p);
  }

  // Havai fisek: yukari firlar, renkli kivilcimlara dagilir
  async function firework(o, dir) {
    const p = {
      x: clamp(o.x + dir * rnd(50, 220), 80, W - 80),
      y: clamp(o.y - rnd(170, 300), 60, H - 100),
    };
    const r = node('proj', px(6, '#ffd166'), o.x, o.y);
    await animate(560, (t) => {
      place(r, o.x + (p.x - o.x) * t, o.y + (p.y - o.y) * easeOut(t));
    });
    r.remove();
    const col = pick(['#ff5c8a', '#5ac8ff', '#7cf29a', '#ffd166', '#c084fc']);
    const sparks = [];
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + rnd(-0.12, 0.12);
      const sp = rnd(130, 280);
      const d = node('bit', px(4, Math.random() < 0.3 ? '#ffffff' : col), p.x, p.y);
      sparks.push({ d, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
    await animate(1400, (t) => {
      const s = t * 1.4;
      for (const q of sparks) {
        place(q.d, p.x + q.vx * s, p.y + q.vy * s + 0.5 * 240 * s * s);
        q.d.style.opacity = String(Math.max(0, 1 - t));
      }
    });
    for (const q of sparks) q.d.remove();
  }

  // Su balonu: ucar, patlar, damlalar sicrar ve islak iz kalir
  async function splash(o, dir) {
    const p = pickTarget(o, dir);
    const b = node('proj', px(16, '#5ac8ff'), o.x, o.y);
    await fly(b, o, p, 600, { spin: rnd(-140, 140) });
    b.remove();
    node('mark', blobSvg(rnd(20, 30), '#5ac8ff'), p.x, p.y + 4, rnd(0, 360));
    const drops = [];
    for (let i = 0; i < 22; i++) {
      const a = rnd(-Math.PI, 0.15);
      const sp = rnd(130, 320);
      const d = node('bit', px(Math.round(rnd(3, 8)), pick(['#5ac8ff', '#9fe8ff', '#ffffff'])), p.x, p.y);
      drops.push({ d, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
    await animate(900, (t) => {
      const s = t * 0.9;
      for (const q of drops) {
        place(q.d, p.x + q.vx * s, p.y + q.vy * s + 0.5 * 800 * s * s);
        q.d.style.opacity = String(Math.max(0, 1 - t * 1.2));
      }
    });
    for (const q of drops) q.d.remove();
  }

  // Meteor: alev izi birakarak gelir, carpip patlar
  async function meteor(o, dir) {
    const p = pickTarget(o, dir, 200, 430);
    const from = { x: clamp(p.x - dir * 280, -40, W + 40), y: Math.max(20, p.y - 280) };
    const m = node('proj', px(13, '#ff8a3c'), from.x, from.y);
    await animate(520, (t) => {
      const x = from.x + (p.x - from.x) * t;
      const y = from.y + (p.y - from.y) * t;
      place(m, x, y);
      if (t < 0.95 && Math.random() < 0.7) {
        const s = node('bit', px(Math.round(rnd(4, 9)), pick(FIRE)), x + rnd(-5, 5), y + rnd(-5, 5));
        setTimeout(() => s.remove(), 360);
      }
    });
    m.remove();
    await explode(p, 1.25);
  }

  // Kar topu: ucar, beyaz zerrelere dagilir
  async function snowball(o, dir) {
    const p = pickTarget(o, dir);
    const b = node('proj', px(14, '#eaf6ff'), o.x, o.y);
    await fly(b, o, p, 560, { spin: rnd(-200, 200) });
    b.remove();
    node('mark', blobSvg(rnd(16, 24), '#eaf6ff'), p.x, p.y + 4, rnd(0, 360));
    const bits = [];
    for (let i = 0; i < 24; i++) {
      const a = rnd(-Math.PI, 0.2);
      const sp = rnd(110, 260);
      const d = node('bit', px(Math.round(rnd(3, 7)), pick(['#ffffff', '#eaf6ff', '#bfe4ff'])), p.x, p.y);
      bits.push({ d, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
    await animate(850, (t) => {
      const s = t * 0.85;
      for (const q of bits) {
        place(q.d, p.x + q.vx * s, p.y + q.vy * s + 0.5 * 700 * s * s);
        q.d.style.opacity = String(Math.max(0, 1 - t * 1.15));
      }
    });
    for (const q of bits) q.d.remove();
  }

  // Yildirim: yukaridan zikzak iner, ekran parlar, carptigi yer patlar
  async function lightning(o, dir) {
    const p = {
      x: clamp(o.x + dir * rnd(60, 260), 70, W - 70),
      y: clamp(o.y + rnd(10, 90), 100, H - 60),
    };
    const flash = document.createElement('div');
    flash.className = 'boom-flash';
    layer.appendChild(flash);
    setTimeout(() => flash.remove(), 250);

    const segs = [];
    let x = p.x + rnd(-18, 18);
    let y = 0;
    while (y < p.y) {
      const nx = x + rnd(-18, 18);
      const ny = Math.min(p.y, y + rnd(20, 36));
      const len = Math.hypot(nx - x, ny - y);
      const ang = (Math.atan2(ny - y, nx - x) * 180) / Math.PI;
      segs.push(
        node(
          'bolt',
          `<div style="width:${Math.round(len)}px;height:5px;background:#fff9c4;box-shadow:0 0 10px #ffe066"></div>`,
          (x + nx) / 2,
          (y + ny) / 2,
          ang
        )
      );
      x = nx;
      y = ny;
    }
    await wait(130);
    for (const s of segs) s.style.opacity = '0.25';
    await wait(90);
    for (const s of segs) s.remove();
    await explode(p, 0.9);
  }

  // Top: ayaktan yuvarlanir, kucuk sekmelerle yavaslar
  async function kick(o, dir) {
    const dist = rnd(260, 440);
    const svg = '<svg width="26" height="26" viewBox="-13 -13 26 26"><circle r="12" fill="#fff" stroke="#333" stroke-width="1.5"/><polygon points="0,-6 5.7,-1.9 3.5,4.9 -3.5,4.9 -5.7,-1.9" fill="#222"/></svg>';
    const b = node('proj', svg, o.x, o.y);
    await animate(1600, (t) => {
      const e = easeOut(t);
      const bounce = Math.abs(Math.sin(t * Math.PI * 3)) * 28 * (1 - t);
      place(b, o.x + dir * dist * e, o.y - bounce, dir * 720 * e);
    });
  }

  async function play(data) {
    const id = ++session;
    layer.replaceChildren();
    W = data.width || window.innerWidth;
    H = data.height || window.innerHeight;
    const o = { x: clamp(Number(data.origin?.x) || W / 2, 0, W), y: clamp(Number(data.origin?.y) || H / 2, 0, H) };
    const dir = data.dir === -1 ? -1 : 1;
    const color = Math.random() < 0.5 && data.color ? data.color : pick(PALETTE);

    setTimeout(() => {
      if (id !== session) return;
      for (const n of layer.querySelectorAll('.m')) n.classList.add('fade');
    }, FADE_AT);
    setTimeout(() => {
      if (id !== session) return;
      layer.replaceChildren();
      window.marks.done();
    }, DONE_AT);

    try {
      switch (data.type) {
        case 'paws': await trail(o, dir, color, PRINT_STYLE[data.charId] || 'paw'); break;
        case 'coin': await coin(o, dir); break;
        case 'star': await star(o, dir); break;
        case 'sticker': await sticker(o, dir, data.emoji); break;
        case 'confetti': await confetti(o, dir); break;
        case 'bubbles': await bubbles(o, dir); break;
        case 'juggle': await juggle(o); break;
        case 'puff': await puff(o); break;
        case 'kick': await kick(o, dir); break;
        case 'trail': await trail(o, dir, data.color, data.style || 'paw'); break;
        case 'glitch': await glitch(o); break;
        case 'puddle': puddle(o, data.color); break;
        case 'matrix': await matrixRain(o); break;
        case 'scan': await scanRings(o); break;
        case 'firebreath': await firebreath(o, dir); break;
        case 'terminal': await terminal(o, dir); break;
        case 'bomb': await bomb(o, dir); break;
        case 'firework': await firework(o, dir); break;
        case 'splash': await splash(o, dir); break;
        case 'meteor': await meteor(o, dir); break;
        case 'snowball': await snowball(o, dir); break;
        case 'lightning': await lightning(o, dir); break;
        case 'leafswirl': await leafSwirl(o); break;
        case 'bloom': await bloom(o); break;
        default: await splat(o, dir, color);
      }
    } catch {
      // animasyon hatasi temizligi engellemesin
    }
  }

  window.marks.onPlay(play);
})();
