// 10 Kitzo karakterinin piksel (50x60 izgara) tanimlari. Ortak bir "chibi" iskelet uzerine
// her karakterin kendi kulak/sac/kuyruk/gomlek detaylari eklenir. Ciktidaki SVG, mevcut
// animasyon kancalarini (#leg-left, #leg-right, #arm-left, #arm-right, .eye-open, .eye-closed,
// .wink-eye, .hacker-gear) aynen tasir.
const { Canvas, PX } = require('./pixelart');

// Ortak olculer
const HEAD = { cx: 25, cy: 17, rx: 13, ry: 11.5 };
const EYE = { y: 18, lx: 20, rx: 30 };
const TORSO = { x: 15, y: 29, w: 20, h: 15, r: 4 };
const LEG = { y: 45, w: 6, h: 10, lx: 17, rx: 27 };
const ARM = { y: 31, w: 5, h: 13, lx: 9, rx: 36 };

function basePalette(p) {
  return {
    '#': p.line,
    B: p.body,
    b: p.bodyDark || shade(p.body, -0.22),
    L: p.bodyLight || shade(p.body, 0.18),
    S: p.shirt || p.body,
    s: p.shirtDark || shade(p.shirt || p.body, -0.2),
    P: p.pants || p.body,
    p: p.pantsDark || shade(p.pants || p.body, -0.2),
    F: p.shoe || '#f5f5f5',
    A: p.accent || p.body,
    a: p.accentDark || shade(p.accent || p.body, -0.25),
    E: p.eye || '#4ff0ff',
    W: '#ffffff',
    K: p.pupil || '#1a1a2e',
    N: p.nose || '#ff8fb1',
    G: p.glow || '#7ff7ff',
    T: p.extra || '#ffffff',
  };
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))))
  );
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const BEVEL = { B: { light: 'L', dark: 'b' }, S: { dark: 's' }, P: { dark: 'p' }, A: { dark: 'a' } };

// ---- ortak parcalar ----

function drawTorso(c, spec) {
  c.roundRect(TORSO.x, TORSO.y, TORSO.w, TORSO.h, TORSO.r, 'S');
  if (spec.legs !== false) c.rect(TORSO.x + 1, TORSO.y + TORSO.h - 3, TORSO.w - 2, 5, 'P');
}

function drawHead(c) {
  c.ellipse(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, 'B');
}

function drawLimb(w, h, ch) {
  const c = new Canvas(w + 2, h + 2);
  c.roundRect(1, 0, w, h, 2, ch);
  return c;
}

// Gozler: acik hal (ak + iris + bebek + parlama), kapali hal (koyu cizgi)
function eyeGroups(spec, pal) {
  const s = spec.eyes || {};
  const rx = s.rx || 3.2;
  const ry = s.ry || 4;
  const irisR = s.iris || 2;
  const open = new Canvas();
  const closed = new Canvas();
  const openR = new Canvas();
  const closedR = new Canvas();
  const y = s.y || EYE.y;

  const drawEye = (canvas, cx) => {
    if (s.style === 'screen') {
      canvas.rect(cx - 3, y - 2, 7, 5, 'E');
      canvas.rect(cx - 1, y - 1, 3, 3, 'W');
      return;
    }
    canvas.ellipse(cx, y, rx, ry, 'W');
    canvas.ellipse(cx, y + 0.5, irisR, irisR + 0.4, 'E');
    canvas.ellipse(cx, y + 0.8, irisR - 1.1, irisR - 0.6, 'K');
    canvas.set(cx - 1, y - 1, 'W');
  };
  const drawClosed = (canvas, cx) => {
    for (let i = -Math.round(rx); i <= Math.round(rx); i++) {
      const t = Math.abs(i) / rx;
      canvas.set(cx + i, y + Math.round(1.2 - t * 1.6), '#');
    }
  };

  drawEye(open, EYE.lx + (spec.eyeShift || 0));
  drawClosed(closed, EYE.lx + (spec.eyeShift || 0));
  drawEye(openR, EYE.rx + (spec.eyeShift || 0));
  drawClosed(closedR, EYE.rx + (spec.eyeShift || 0));

  return [
    `<g class="eye-open">${open.toRects(pal)}</g>`,
    `<g class="eye-closed">${closed.toRects(pal)}</g>`,
    `<g class="eye-open wink-eye">${openR.toRects(pal)}</g>`,
    `<g class="eye-closed wink-eye">${closedR.toRects(pal)}</g>`,
  ].join('');
}

function buildCharacter(spec) {
  const pal = basePalette(spec.pal);

  // govde katmani: torso + kafa + aksesuarlar
  const body = new Canvas();
  if (spec.behindBody) spec.behindBody(body);
  if (spec.torso) spec.torso(body);
  else drawTorso(body, spec);
  if (spec.bottom) spec.bottom(body);
  drawHead(body);
  if (spec.top) spec.top(body);
  if (spec.face) spec.face(body);
  if (spec.emblem) spec.emblem(body);
  body.smooth().bevel(BEVEL).outline('#');

  // kollar / bacaklar ayri katmanlarda (animasyon icin)
  const armCh = spec.armColor || 'B';
  const armL = drawLimb(ARM.w, ARM.h, armCh);
  const armR = drawLimb(ARM.w, ARM.h, armCh);
  if (spec.arm) {
    spec.arm(armL, 'left');
    spec.arm(armR, 'right');
  }
  armL.smooth().bevel(BEVEL).outline('#');
  armR.smooth().bevel(BEVEL).outline('#');

  const parts = [];
  if (spec.behind) {
    const back = new Canvas();
    spec.behind(back);
    back.smooth().bevel(BEVEL).outline('#');
    parts.push(`<g class="tail">${back.toRects(pal)}</g>`);
  }
  parts.push(`<g id="arm-left">${armL.toRects(pal, ARM.lx - 1, ARM.y)}</g>`);

  if (spec.legs !== false) {
    const mkLeg = () => {
      const c = drawLimb(LEG.w, LEG.h, 'P');
      c.rect(1, LEG.h - 4, LEG.w, 4, 'F');
      c.bevel(BEVEL).outline('#');
      return c;
    };
    parts.push(`<g id="leg-left" class="leg">${mkLeg().toRects(pal, LEG.lx - 1, LEG.y)}</g>`);
    parts.push(`<g id="leg-right" class="leg">${mkLeg().toRects(pal, LEG.rx - 1, LEG.y)}</g>`);
  }

  parts.push(`<g class="body">${body.toRects(pal)}</g>`);
  parts.push(eyeGroups(spec, pal));
  if (spec.front) {
    const front = new Canvas();
    spec.front(front);
    front.bevel(BEVEL).outline('#');
    parts.push(`<g class="front">${front.toRects(pal)}</g>`);
  }
  parts.push(`<g id="arm-right">${armR.toRects(pal, ARM.rx - 1, ARM.y)}</g>`);
  if (spec.gear) {
    const gear = new Canvas();
    spec.gear(gear);
    gear.outline('#');
    parts.push(`<g class="hacker-gear">${gear.toRects(pal)}</g>`);
  }

  return [
    '<svg viewBox="0 0 150 180" width="170" height="204" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">',
    '<ellipse cx="75" cy="173" rx="30" ry="5" fill="#000" opacity="0.25"/>',
    parts.join(''),
    '</svg>',
  ].join('');
}

// ---- karakterler ----

const SPECS = [
  {
    id: 'kitzo',
    name: 'Kitzo',
    emoji: '🐱',
    pal: { line: '#2a1b45', body: '#b388ff', shirt: '#f7931a', pants: '#3b3f7a', accent: '#2f3550', eye: '#4ff0ff', nose: '#ff8fb1', glow: '#7ff7ff' },
    top(c) {
      // kedi kulaklari once cizilir; sapka altlarini ortup sadece uclari disarida kalir
      c.triUp(11, 0, 9, 8, 'B');
      c.triUp(30, 0, 9, 8, 'B');
      c.triUp(13, 1, 5, 5, 'E');
      c.triUp(32, 1, 5, 5, 'E');
      // Ethereum sapkasi
      c.roundRect(12, 4, 26, 8, 3, 'A');
      c.rect(10, 11, 30, 2, 'A');
      c.stamp(['..W..', '.WWW.', 'WWWWW', '.WWW.', '..W..'], 22, 5);
    },
    face(c) {
      c.ellipse(25, 23, 2, 1.5, 'N');
      c.stamp(['#...#', '.###.'], 23, 25);
      c.rect(16, 21, 3, 1, 'b');
      c.rect(31, 21, 3, 1, 'b');
    },
    emblem(c) {
      c.ellipse(25, 36, 5, 5, 'W');
      c.stamp(['.S.', 'SSS', '.S.', 'SSS', '.S.'], 24, 33);
    },
    behind(c) {
      // kuyruk: sag kalcadan cikip yukari kivrilir, ucu parlar
      c.ellipse(37, 45, 4, 3.4, 'B');
      c.ellipse(42, 42, 3.8, 3.4, 'B');
      c.ellipse(45, 37, 3.4, 3.8, 'B');
      c.ellipse(46, 32, 3.2, 3.4, 'B');
      c.ellipse(45, 28, 3, 3, 'G');
    },
  },
  {
    id: 'zumi',
    name: 'Zumi',
    emoji: '🟢',
    legs: false,
    pal: { line: '#1d5b34', body: '#7cf29a', shirt: '#7cf29a', eye: '#1d5b34', pupil: '#0d3a20', nose: '#4bd47a' },
    bottom(c) {
      // jolelli taban: govdeyi asagi dogru genisleterek kapatir
      c.ellipse(25, 42, 15, 10, 'B');
      c.rect(12, 42, 27, 8, 'B');
      c.stamp(['BBB..BBBB..BBB', '.B....BB....B.'], 12, 49);
    },
    top(c) {
      c.ellipse(25, 8, 10, 6, 'B');
      c.stamp(['.B.', 'BBB', '.B.'], 24, 1);
      c.rect(25, 3, 1, 4, 'B');
    },
    face(c) {
      c.stamp(['#.....#', '.#####.'], 22, 24);
      c.ellipse(17, 22, 2, 1.2, 'L');
      c.ellipse(33, 22, 2, 1.2, 'L');
    },
    arm(c) {
      c.rect(1, 0, 5, 9, 'B');
    },
  },
  {
    id: 'byto',
    name: 'Byto',
    emoji: '🤖',
    pal: { line: '#123a52', body: '#5ac8ff', shirt: '#2f6f96', pants: '#1f4e6b', shoe: '#123a52', accent: '#b9e6ff', eye: '#0f2b3d', pupil: '#0f2b3d' },
    eyes: { style: 'screen', y: 18 },
    top(c) {
      // anten
      c.rect(24, 0, 2, 6, 'A');
      c.ellipse(25, 0, 2.5, 2.5, 'G');
      // kare kafa ustu
      c.rect(12, 6, 26, 6, 'B');
      c.rect(11, 12, 28, 2, 'A');
    },
    face(c) {
      c.roundRect(15, 13, 20, 11, 3, 'a');
      c.rect(19, 27, 12, 2, 'A');
      c.stamp(['A.A.A.A.A.A'], 20, 27);
    },
    emblem(c) {
      c.roundRect(19, 33, 12, 8, 2, 'A');
      c.stamp(['..GG..', '.GGGG.', 'GG..GG'], 20, 35);
    },
    arm(c) {
      c.rect(1, 0, 5, 13, 'A');
      c.rect(1, 10, 5, 3, 'B');
    },
  },
  {
    id: 'fyra',
    name: 'Fyra',
    emoji: '🦊',
    pal: { line: '#5a2c12', body: '#ff9a3c', shirt: '#ffb870', pants: '#7a3b1e', shoe: '#5a2c12', accent: '#fff1e0', eye: '#2fb36b', nose: '#3a2418' },
    top(c) {
      c.triUp(11, 0, 10, 10, 'B');
      c.triUp(29, 0, 10, 10, 'B');
      c.triUp(13, 3, 6, 6, 'A');
      c.triUp(31, 3, 6, 6, 'A');
      c.triUp(12, 0, 8, 3, 'a');
      c.triUp(30, 0, 8, 3, 'a');
    },
    face(c) {
      c.ellipse(25, 24, 7, 4.5, 'A');
      c.ellipse(25, 21.5, 2.2, 1.6, 'N');
      c.stamp(['#.#', '.#.'], 24, 24);
      c.ellipse(14, 19, 2, 1.5, 'A');
      c.ellipse(36, 19, 2, 1.5, 'A');
    },
    emblem(c) {
      c.ellipse(25, 38, 6, 4, 'A');
    },
    behind(c) {
      c.ellipse(40, 36, 6, 9, 'B');
      c.ellipse(42, 30, 4.5, 4.5, 'A');
    },
  },
  {
    id: 'nocto',
    name: 'Nocto',
    emoji: '🦉',
    pal: { line: '#3a2456', body: '#c084fc', shirt: '#a865e8', pants: '#6d3fa0', shoe: '#ffb347', accent: '#efe0ff', eye: '#ffd166', nose: '#ffb347' },
    eyes: { rx: 4.2, ry: 4.4, iris: 2.6 },
    top(c) {
      c.triUp(12, 2, 8, 7, 'B');
      c.triUp(30, 2, 8, 7, 'B');
      c.ellipse(25, 12, 12, 6, 'B');
    },
    face(c) {
      c.ellipse(20, 18, 5.4, 5.6, 'A');
      c.ellipse(30, 18, 5.4, 5.6, 'A');
      c.stamp(['.N.', 'NNN', '.N.', '.N.'], 24, 22);
    },
    emblem(c) {
      c.ellipse(25, 37, 7, 5, 'A');
    },
    front(c) {
      c.ellipse(13, 36, 4, 8, 'B');
      c.ellipse(37, 36, 4, 8, 'B');
    },
  },
  {
    id: 'wispa',
    name: 'Wispa',
    emoji: '👻',
    legs: false,
    pal: { line: '#3f6f8f', body: '#dff4ff', shirt: '#dff4ff', eye: '#3f6f8f', pupil: '#25455c', nose: '#9fd9f5' },
    bottom(c) {
      c.ellipse(25, 40, 14, 11, 'B');
      c.rect(11, 40, 28, 8, 'B');
      c.stamp(['BBBB..BBBB..BBBB', '.BB....BB....BB.', '..B....BB....B..'], 11, 48);
    },
    top(c) {
      c.ellipse(25, 12, 13, 8, 'B');
    },
    face(c) {
      c.ellipse(25, 24, 3, 2.5, 'L');
      c.stamp(['.###.'], 23, 23);
      c.ellipse(16, 22, 2, 1.2, 'N');
      c.ellipse(34, 22, 2, 1.2, 'N');
    },
    arm(c) {
      c.ellipse(3, 5, 2.5, 5, 'B');
    },
  },
  {
    id: 'drayko',
    name: 'Drayko',
    emoji: '🐉',
    pal: { line: '#5c1414', body: '#ff5c5c', shirt: '#ffd166', pants: '#8c2f2f', shoe: '#ffd166', accent: '#ffe0a3', eye: '#ffd166', nose: '#8c2f2f' },
    top(c) {
      c.triUp(13, 1, 7, 7, 'A');
      c.triUp(30, 1, 7, 7, 'A');
      c.stamp(['..A..', '.AAA.', 'AAAAA'], 23, 2);
    },
    face(c) {
      c.ellipse(25, 24, 6.5, 4, 'B');
      c.stamp(['#..#'], 23, 23);
      c.stamp(['A.A'], 24, 26);
      c.rect(14, 14, 3, 2, 'A');
      c.rect(34, 14, 3, 2, 'A');
    },
    emblem(c) {
      c.ellipse(25, 37, 6, 4.5, 'A');
    },
    behind(c) {
      // yelpaze seklinde kanatlar
      const wing = (x0, dir) => {
        for (let j = 0; j < 14; j++) {
          const w = Math.round(4 + j * 0.55);
          for (let i = 0; i < w; i++) c.set(x0 + dir * i, 28 + j, 'a');
        }
        for (let k = 0; k < 3; k++) c.set(x0 + dir * (7 + k * 2), 41, '.');
      };
      wing(14, -1);
      wing(36, 1);
      // dikenli kuyruk
      c.ellipse(38, 46, 4, 3, 'B');
      c.ellipse(43, 43, 3.4, 3, 'B');
      c.stamp(['..A', '.AA', 'AA.'], 44, 38);
    },
  },
  {
    id: 'nubi',
    name: 'Nubi',
    emoji: '🐧',
    pal: { line: '#12233d', body: '#2e4a72', shirt: '#eef4ff', pants: '#2e4a72', shoe: '#ffb347', accent: '#ffb347', eye: '#0f1d33', pupil: '#0f1d33' },
    eyes: { rx: 2.8, ry: 3.4, iris: 1.8 },
    top(c) {
      c.ellipse(25, 11, 12, 7, 'B');
      c.stamp(['.B.', 'BBB'], 24, 3);
    },
    face(c) {
      c.ellipse(25, 20, 9, 8, 'S');
      c.stamp(['.AAA.', 'AAAAA', '.AAA.'], 23, 22);
      c.ellipse(25, 38, 9, 9, 'S');
    },
    arm(c) {
      c.ellipse(3, 6, 2.5, 7, 'B');
    },
  },
  {
    id: 'ozgezo',
    name: 'Özgezo',
    emoji: '👧',
    pal: {
      line: '#7a3b55',
      body: '#f7c9a4',
      bodyLight: '#ffe0c2',
      shirt: '#f4a9c8', // elbise: yumusak pembe
      shirtDark: '#e086ac',
      pants: '#b9647f', // tayt: koyu gul
      shoe: '#fff3f7',
      accent: '#e98cb2', // basortusu: elbiseyle ayni pembe aile
      accentDark: '#cf6f97',
      extra: '#ffd9e6', // ortunun ic kenarinda acik pembe
      eye: '#6d4bd1',
      nose: '#f4809f',
      glow: '#ffd23f',
    },
    eyes: { rx: 3.9, ry: 4.7, iris: 2.5, y: 18 },
    top(c) {
      // pembe basortusu: yuvarlak hatli, sivri uc yok
      c.ellipse(25, 16, 15.5, 13.5, 'A'); // ortu kubbesi
      c.ellipse(25, 29, 13, 5.5, 'A'); // omuzlara inen yumusak etek
      c.ellipse(15.5, 25, 5.5, 6.5, 'A'); // sol yanak kivrimi
      c.ellipse(34.5, 25, 5.5, 6.5, 'A'); // sag yanak kivrimi
      c.ellipse(25, 18, 11.8, 10.4, 'T'); // yuzu cerceveleyen acik pembe
      c.ellipse(25, 19, 11, 9.4, 'B'); // yuz acikligi
      c.ellipse(35, 29, 1.4, 1.4, 'G'); // altin ignesi
    },
    face(c) {
      c.ellipse(16, 14, 2, 1, '#'); // uzun kirpikler
      c.ellipse(34, 14, 2, 1, '#');
      c.set(25, 22, 'N'); // minik burun
      c.stamp(['#..#', '.##.'], 23, 24); // kucuk tatli gulumseme
      c.ellipse(16, 22, 2.6, 1.6, 'N'); // yumusak allik
      c.ellipse(34, 22, 2.6, 1.6, 'N');
    },
    torso(c) {
      // elbise: dar korsaj, ince kemer, genisleyen etek
      c.roundRect(16, 28, 18, 10, 3, 'S');
      c.rect(16, 37, 18, 1, 'a');
      for (let j = 0; j < 9; j++) {
        const w = 18 + j;
        c.rect(25 - Math.round(w / 2), 38 + j, w, 1, 'S');
      }
      c.rect(13, 46, 24, 1, 'W'); // etek ucunda acik serit
      c.stamp(['.W.', 'WWW', '.W.'], 24, 31); // gogse minik cicek
    },
    armColor: 'S',
    arm(c) {
      c.rect(1, 8, 5, 5, 'B'); // kisa kollu elbise: bilekten sonra el
    },
  },
  {
    id: 'barkinzo',
    name: 'Barkınzo',
    emoji: '👦',
    pal: { line: '#3a2414', body: '#e8b48a', shirt: '#2ec4b6', pants: '#2b3a55', shoe: '#e63946', accent: '#2b1a10', accentDark: '#1c100a', extra: '#5a3a24', eye: '#2a4a7a', nose: '#d98f6a' },
    top(c) {
      // kisa sac + perçem
      c.ellipse(25, 11, 14, 8, 'A');
      c.rect(11, 11, 29, 4, 'A');
      c.stamp(['..AAAA..', '.AAAAAA.', 'AAAAAA..'], 20, 3);
      c.rect(11, 14, 3, 6, 'A');
      c.rect(36, 14, 3, 6, 'A');
      c.stamp(['TTTTT'], 22, 6); // sacta acik ton parlama (ten rengi degil)
    },
    face(c) {
      c.ellipse(25, 23, 1.6, 1.2, 'N');
      c.stamp(['#...#', '.###.'], 23, 25);
      c.ellipse(17, 23, 2, 1.3, 'N');
      c.ellipse(33, 23, 2, 1.3, 'N');
    },
    emblem(c) {
      c.stamp(['...WW', '..WW.', '.WWWW', '..WW.', '.WW..'], 22, 33);
    },
    gear(c) {
      // hacker modu: kapuson + gunes gozlugu (normalde gizli)
      c.ellipse(25, 12, 17, 12, 'a');
      c.ellipse(25, 18, 12, 10, '.');
      c.rect(8, 18, 34, 8, 'a');
      c.rect(14, 22, 22, 8, '.');
      c.roundRect(14, 15, 22, 6, 2, 'K');
      c.rect(24, 17, 3, 2, 'K');
      c.rect(17, 16, 4, 2, 'E');
      c.rect(29, 16, 4, 2, 'E');
    },
  },
];

const characters = SPECS.map((spec) => ({
  id: spec.id,
  name: spec.name,
  emoji: spec.emoji,
  svg: buildCharacter(spec),
}));

module.exports = { characters, SPECS, buildCharacter };
