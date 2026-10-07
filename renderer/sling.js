// Sapan (cek-birak) cekirdegi: DOM'suz, Electron'suz saf JS. Tarayicida window.KitzoSling,
// Node'da module.exports olarak calisir. Hicbir oyuna/karaktere ozel sey bilmez.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KitzoSling = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // hizlar piksel/kare, mesafeler piksel
  const DEFAULTS = {
    gravity: 2.4, // kare basina hiz artisi
    bounce: 0.52, // yere carpinca korunan hiz
    wallBounce: 0.62, // yan duvar ve tavan
    groundFriction: 0.8, // yerde yatay hizin kare basina carpani
    airDrag: 0.995,
    restSpeed: 2.4, // bu dikey hizin altinda yer sekmez, durur
    maxPull: 140, // lastigin en fazla gerilecegi mesafe
    power: 0.5, // cekme pikseli basina firlatma hizi (tam cekme = maxLaunch)
    maxLaunch: 70, // firlatma hizi ust siniri
  };

  const merge = (opts) => Object.assign({}, DEFAULTS, opts || {});

  // Cekme noktasini anchor etrafindaki maxPull yaricapli daire icinde tutar
  function clampPull(anchor, pos, maxPull) {
    const max = maxPull === undefined ? DEFAULTS.maxPull : maxPull;
    const dx = pos.x - anchor.x;
    const dy = pos.y - anchor.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= max || dist === 0) return { x: pos.x, y: pos.y };
    const k = max / dist;
    return { x: anchor.x + dx * k, y: anchor.y + dy * k };
  }

  // Firlatma: yon = anchor - pos (cekilen yonun tersi), siddet = cekme mesafesi
  function launchFromPull(anchor, pos, opts) {
    const o = merge(opts);
    const dx = anchor.x - pos.x;
    const dy = anchor.y - pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return { vx: 0, vy: 0, power01: 0 };
    const pull = Math.min(dist, o.maxPull);
    const power01 = o.maxPull > 0 ? pull / o.maxPull : 0;
    let speed = pull * o.power;
    if (speed > o.maxLaunch) speed = o.maxLaunch;
    return { vx: (dx / dist) * speed, vy: (dy / dist) * speed, power01 };
  }

  // Bir kare ilerletir. body {x,y,vx,vy,bounces} yerinde degisir.
  // world {left,right,top,ground,canExitLeft,canExitRight,crossSpeed}
  // doner {landed, hit: null|'wall'|'ground'|'ceiling', impact, hits:{wall,ground,ceiling}}
  // hit/impact: en siddetli carpma; impact o andaki hiz buyuklugu (carpmadan once)
  function step(body, world, opts) {
    const o = merge(opts);
    const w = world;
    body.vy += o.gravity;
    body.vx *= o.airDrag;
    let nx = body.x + body.vx;
    let ny = body.y + body.vy;
    const hits = { wall: false, ground: false, ceiling: false };
    let hit = null;
    let impact = 0;
    const note = (kind) => {
      const speed = Math.hypot(body.vx, body.vy);
      hits[kind] = true;
      if (speed >= impact) {
        impact = speed;
        hit = kind;
      }
    };

    // yanlar: hizliysa komsu ekrana gecer, degilse sekar
    if (nx < w.left) {
      if (!(w.canExitLeft && Math.abs(body.vx) > w.crossSpeed)) {
        note('wall');
        nx = w.left;
        body.vx = -body.vx * o.wallBounce;
      }
    } else if (nx > w.right) {
      if (!(w.canExitRight && Math.abs(body.vx) > w.crossSpeed)) {
        note('wall');
        nx = w.right;
        body.vx = -body.vx * o.wallBounce;
      }
    }

    // tavan
    if (ny < w.top) {
      note('ceiling');
      ny = w.top;
      body.vy = Math.abs(body.vy) * o.wallBounce;
    }

    // yer: sekme, surtunme ve durma
    let landed = false;
    if (ny >= w.ground) {
      ny = w.ground;
      if (Math.abs(body.vy) > o.restSpeed) {
        note('ground');
        body.vy = -Math.abs(body.vy) * o.bounce;
        body.vx *= o.groundFriction;
        body.bounces++;
      } else {
        body.vy = 0;
        body.vx *= o.groundFriction;
        if (Math.abs(body.vx) < 1.2) landed = true;
      }
    }

    body.x = nx;
    body.y = ny;
    return { landed, hit, impact, hits };
  }

  // Onizleme noktalari: her `every` karede bir nokta, en fazla `steps` kare.
  // opts.world verilirse ilk carpmada (ya da durunca) biter, yoksa carpismalari yok sayar.
  function predictPath(start, v, opts, steps, every) {
    const o = merge(opts);
    const world = opts && opts.world;
    const n = steps === undefined ? 60 : steps;
    const k = Math.max(1, every || 3);
    const body = { x: start.x, y: start.y, vx: v.vx, vy: v.vy, bounces: 0 };
    const pts = [];
    for (let i = 1; i <= n; i++) {
      if (world) {
        const r = step(body, world, o);
        if (i % k === 0 || r.hit || r.landed) pts.push({ x: body.x, y: body.y });
        if (r.hit || r.landed) break;
      } else {
        body.vy += o.gravity;
        body.vx *= o.airDrag;
        body.x += body.vx;
        body.y += body.vy;
        if (i % k === 0) pts.push({ x: body.x, y: body.y });
      }
    }
    return pts;
  }

  return { DEFAULTS, launchFromPull, clampPull, step, predictPath };
});
