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
  async function sticker(o, dir) {
    const p = pickTarget(o, dir);
    const emoji = pick(STICKERS);
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
        case 'sticker': await sticker(o, dir); break;
        case 'confetti': await confetti(o, dir); break;
        case 'bubbles': await bubbles(o, dir); break;
        default: await splat(o, dir, color);
      }
    } catch {
      // animasyon hatasi temizligi engellemesin
    }
  }

  window.marks.onPlay(play);
})();
