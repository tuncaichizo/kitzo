// Numaralar: karakterin ara sira sergiledigi kisa hareketler (takla, moonwalk, kenardan bakma, ninja,
// hokkabazlik, sinav, sekerleme...). renderer.js'in global durumunu (posX/posY, charEl, dragging...)
// paylasir ve ondan sonra yuklenir. Ekrana cizim gerektirenler marks.js katmanini kullanir.
(() => {
  const ANTIC_MIN_MS = 90 * 1000; // rastgele numaralar arasi en az 1.5 dk
  const ANTIC_MAX_MS = 4 * 60000; // en cok 4 dk
  const SAY_CHANCE = 0.45;

  let timer = null;
  let busy = false;
  let lastName = '';

  const rnd = (a, b) => a + Math.random() * (b - a);
  const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - (1 - t) ** 3;
  const easeIn = (t) => t * t * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const linear = (t) => t;

  function interrupted() {
    return dragging || Boolean(physics) || menuOpen() || sleeping || Boolean(teaching);
  }

  // Bekleme: kullanici surukler, menu acilir ya da uyku baslarsa numara yarim kalir
  async function pause(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (interrupted()) throw new Error('antic interrupted');
      await sleepMs(Math.min(60, end - Date.now()));
    }
  }

  const facing = () => (charEl.classList.contains('flipped') ? -1 : 1);
  function face(dir) {
    charEl.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
    charEl.classList.toggle('flipped', dir < 0);
  }
  const add = (...cls) => charEl.classList.add(...cls);
  const remove = (...cls) => charEl.classList.remove(...cls);
  function walkOn() {
    charEl.classList.remove('idle');
    charEl.classList.add('walking');
  }
  const walkOff = () => setIdle();

  function clampX(x) {
    const d = currentDisplay();
    return clamp(x, d.x, d.x + d.width - CHAR_W);
  }

  // Pencereyi yumusakca tasir; konum kaydi numara bitince yapilir (yarim kalirsa ekran disi kalmasin)
  function glide(tx, ty, ms, ease = easeInOut) {
    return new Promise((resolve, reject) => {
      const sx = posX;
      const sy = posY;
      const shift0 = overlayShiftTotal; // balon acilip kapanirsa posY kayar; hareket bunu takip eder
      const t0 = performance.now();
      let lastSent = 0;
      const tick = () => {
        if (interrupted()) {
          reject(new Error('antic interrupted'));
          return;
        }
        const now = performance.now();
        const t = Math.min(1, (now - t0) / ms);
        const e = ease(t);
        posX = Math.round(sx + (tx - sx) * e);
        posY = Math.round(sy + (ty - sy) * e + (overlayShiftTotal - shift0));
        // pencere tasima maliyetli: 60 yerine ~30 kare/sn gonderilir
        if (t === 1 || now - lastSent >= 30) {
          lastSent = now;
          window.ichi.moveWindow(posX, posY, false);
        }
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  function mark(type, extra = {}) {
    if (marksOn) sendMark(type, extra);
  }

  function sendMark(type, extra = {}) {
    const rect = charEl.getBoundingClientRect();
    window.ichi.throwMark({
      type,
      ox: rect.left + rect.width / 2,
      oy: rect.top + rect.height * 0.45,
      dir: facing(),
      charId: currentCharId,
      color: CHAR_COLORS[currentCharId] || '#b388ff',
      ...extra,
    });
  }

  function abilityLine(key) {
    const list = (T.lines.abilities || {})[key];
    const text = Array.isArray(list) ? list[Math.floor(Math.random() * list.length)] : list;
    return fill(text || '✨', { name: currentName() });
  }

  function abilitySay(key, always = false) {
    if (!always && Math.random() > SAY_CHANCE) return;
    if (Date.now() < quietUntil || menuOpen()) return;
    say(abilityLine(key), 2600, { replace: true });
  }

  function anticLine(name) {
    const v = (T.lines.antics || {})[name];
    const text = Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;
    return fill(text || '', { name: currentName() });
  }

  function maybeSay(name, always = false) {
    if (!always && Math.random() > SAY_CHANCE) return;
    if (Date.now() < quietUntil || menuOpen()) return;
    const text = anticLine(name);
    if (text) say(text, 2500, { replace: true });
  }

  // Ekranin o kenarinda komsu ekran yoksa karakter oradan "kaybolabilir"
  function edgeFree(d, side) {
    const edgeX = side === 'right' ? d.x + d.width : d.x;
    return !displays.some((o) => {
      if (o === d) return false;
      const touches = side === 'right' ? Math.abs(o.x - edgeX) < 4 : Math.abs(o.x + o.width - edgeX) < 4;
      const overlapY = o.y < d.y + d.height && o.y + o.height > d.y;
      return touches && overlapY;
    });
  }

  // w: rastgele secim agirligi; moves: pencereyi tasir (bekle modunda secilmez); overlay: ekran katmani kullanir
  // Her karakterin kendine has bir yetenegi: rastgele numara havuzuna kendi karakteri secili oldugunda
  // katilir, "Eylemler > Yetenek" ile veya "yetenegini goster" sohbet kalibiyla dogrudan da cagrilabilir.
  const ABILITIES = {
    kitzo: {
      w: 3,
      moves: true,
      async run() {
        mark('glitch');
        add('ability-cyber');
        showEmote('⚡', 1200);
        await pause(260);
        const d = currentDisplay();
        let dir = facing();
        let target = posX + dir * rnd(240, 420);
        if (target < d.x + 10 || target > d.x + d.width - CHAR_W - 10) {
          dir = -dir;
          target = posX + dir * rnd(240, 420);
        }
        target = clampX(target);
        face(dir);
        await glide(target, posY, 260, easeOut);
        mark('glitch');
        abilitySay('kitzo');
        await pause(300);
        remove('ability-cyber');
      },
    },
    zumi: {
      w: 3,
      moves: false,
      async run() {
        add('ability-melt');
        showEmote('🫠', 2000);
        mark('puddle');
        abilitySay('zumi', true);
        await pause(1600);
        remove('ability-melt');
      },
    },
    byto: {
      w: 3,
      moves: false,
      async run() {
        add('ability-scan');
        showEmote('📡', 1800);
        mark('scan');
        abilitySay('byto');
        await pause(1000);
        remove('ability-scan');
      },
    },
    fyra: {
      w: 2,
      moves: true,
      async run() {
        add('ability-flame');
        mark('trail', { style: 'flame' });
        showEmote('🔥', 1600);
        const d = currentDisplay();
        let dir = facing();
        let target = posX + dir * rnd(220, 380);
        if (target < d.x + 10 || target > d.x + d.width - CHAR_W - 10) {
          dir = -dir;
          target = posX + dir * rnd(220, 380);
        }
        target = clampX(target);
        face(dir);
        walkOn();
        await glide(target, posY, 500, easeOut);
        walkOff();
        abilitySay('fyra');
        await pause(300);
        remove('ability-flame');
      },
    },
    nocto: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        const startY = posY;
        add('ability-wings');
        showEmote('🌙', 2000);
        mark('trail', { style: 'feather' });
        const dir = Math.random() < 0.5 ? -1 : 1;
        face(dir);
        const targetX = clampX(posX + dir * rnd(200, 380));
        const targetY = Math.max(d.y + 10, startY - rnd(50, 90));
        walkOn();
        await glide(targetX, targetY, 900, easeInOut);
        await pause(300);
        abilitySay('nocto');
        await glide(targetX, startY, 500, easeIn);
        walkOff();
        remove('ability-wings');
      },
    },
    wispa: {
      w: 2,
      moves: true,
      async run() {
        add('ability-phase');
        showEmote('👻', 1800);
        mark('trail', { style: 'wisp' });
        const d = currentDisplay();
        let dir = facing();
        let target = posX + dir * rnd(200, 380);
        if (target < d.x + 10 || target > d.x + d.width - CHAR_W - 10) {
          dir = -dir;
          target = posX + dir * rnd(200, 380);
        }
        target = clampX(target);
        face(dir);
        await glide(target, posY, 900, easeInOut);
        abilitySay('wispa');
        await pause(300);
        remove('ability-phase');
      },
    },
    drayko: {
      w: 3,
      moves: false,
      async run() {
        add('ability-firebreath');
        showEmote('🔥', 2000);
        await pause(200);
        mark('firebreath');
        abilitySay('drayko', true);
        await pause(900);
        remove('ability-firebreath');
      },
    },
    nubi: {
      w: 2,
      moves: true,
      async run() {
        add('ability-iceslide');
        showEmote('🧊', 1800);
        mark('trail', { style: 'ice', color: '#8fd6ff' });
        const d = currentDisplay();
        let dir = facing();
        let target = posX + dir * rnd(220, 380);
        if (target < d.x + 10 || target > d.x + d.width - CHAR_W - 10) {
          dir = -dir;
          target = posX + dir * rnd(220, 380);
        }
        target = clampX(target);
        face(dir);
        await glide(target, posY, 700, easeOut);
        abilitySay('nubi');
        await pause(400);
        remove('ability-iceslide');
      },
    },
    ozgezo: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        const startY = posY;
        add('ability-shaman', 'ability-eyes-closed');
        showEmote('🍃', 2400);
        mark('trail', { style: 'leaf', color: '#7cbf5a' });
        const dir = Math.random() < 0.5 ? -1 : 1;
        face(dir);
        const targetX = clampX(posX + dir * rnd(220, 400));
        const targetY = Math.max(d.y + 10, startY - rnd(60, 100));
        await glide(targetX, targetY, 1100, easeInOut);
        abilitySay('ozgezo');
        await pause(500);
        await glide(targetX, startY, 700, easeIn);
        remove('ability-shaman', 'ability-eyes-closed');
      },
    },
    barkinzo: {
      w: 2,
      moves: false,
      async run() {
        add('ability-hacker');
        showEmote('💻', 2600);
        mark('matrix');
        abilitySay('barkinzo', true);
        await pause(2400);
        remove('ability-hacker');
      },
    },
  };

  // Her karakterin ikinci yetenegi (ikisinden biri rastgele secilir)
  const ABILITIES2 = {
    kitzo: {
      w: 3,
      moves: false,
      async run() {
        add('ability-cyber');
        showEmote('💫', 2000);
        mark('scan');
        abilitySay('kitzo2');
        await pause(1300);
        remove('ability-cyber');
      },
    },
    zumi: {
      w: 3,
      moves: false,
      async run() {
        add('ability-bounce');
        showEmote('🟢', 2200);
        mark('puddle');
        abilitySay('zumi2');
        await pause(1800);
        remove('ability-bounce');
      },
    },
    byto: {
      w: 2,
      moves: false,
      async run() {
        add('ability-scan');
        showEmote('🔄', 2400);
        mark('glitch');
        await pause(700);
        add('antic-shake');
        await pause(500);
        remove('antic-shake');
        abilitySay('byto2', true);
        await pause(800);
        remove('ability-scan');
      },
    },
    fyra: {
      w: 2,
      moves: false,
      async run() {
        add('ability-dig');
        showEmote('🕳️', 2400);
        mark('puddle', { color: '#7a4a24' });
        abilitySay('fyra2');
        await pause(2000);
        remove('ability-dig');
      },
    },
    nocto: {
      w: 3,
      moves: false,
      async run() {
        add('ability-owlspin');
        showEmote('🦉', 2400);
        abilitySay('nocto2');
        await pause(2200);
        remove('ability-owlspin');
      },
    },
    wispa: {
      w: 3,
      moves: false,
      async run() {
        add('ability-boo');
        showEmote('😱', 2000);
        abilitySay('wispa2', true);
        await pause(1500);
        remove('ability-boo');
      },
    },
    drayko: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        const startY = posY;
        add('ability-wings');
        showEmote('🐉', 2400);
        mark('trail', { style: 'flame' });
        const dir = Math.random() < 0.5 ? -1 : 1;
        face(dir);
        const tx = clampX(posX + dir * rnd(160, 300));
        const ty = Math.max(d.y + 10, startY - rnd(50, 90));
        await glide(tx, ty, 800, easeInOut);
        abilitySay('drayko2');
        await pause(400);
        await glide(tx, startY, 500, easeIn);
        remove('ability-wings');
      },
    },
    nubi: {
      w: 3,
      moves: false,
      async run() {
        showEmote('🐟', 2200);
        mark('sticker', { emoji: '🐟' });
        add('antic-hops');
        abilitySay('nubi2');
        await pause(1600);
        remove('antic-hops');
      },
    },
    ozgezo: {
      w: 3,
      moves: false,
      async run() {
        add('ability-shaman', 'ability-eyes-closed');
        showEmote('✨', 2600);
        mark('trail', { style: 'leaf', color: '#7cbf5a' });
        abilitySay('ozgezo2');
        await pause(2400);
        remove('ability-shaman', 'ability-eyes-closed');
      },
    },
    barkinzo: {
      w: 3,
      moves: false,
      async run() {
        add('ability-hacker');
        showEmote('⌨️', 2600);
        mark('terminal');
        abilitySay('barkinzo2', true);
        await pause(2400);
        remove('ability-hacker');
      },
    },
  };

  // Secili karakterin yetenekleri (ilk + ikinci)
  let lastAbilityKey = '';
  function abilityList() {
    const out = [];
    if (ABILITIES[currentCharId]) out.push({ ...ABILITIES[currentCharId], key: currentCharId });
    if (ABILITIES2[currentCharId]) out.push({ ...ABILITIES2[currentCharId], key: `${currentCharId}2` });
    return out.length ? out : null;
  }

  function pickAbility() {
    const list = abilityList();
    if (!list) return null;
    let opts = stay ? list.filter((a) => !a.moves) : list;
    if (!opts.length) opts = list;
    const fresh = opts.filter((a) => a.key !== lastAbilityKey);
    if (fresh.length) opts = fresh;
    const chosen = opts[Math.floor(Math.random() * opts.length)];
    lastAbilityKey = chosen.key;
    return chosen;
  }

  // w: rastgele secim agirligi; moves: pencereyi tasir (bekle modunda secilmez); overlay: ekran katmani kullanir
  const ANTICS = {
    spin: {
      w: 3,
      async run() {
        add('antic-spin');
        showEmote('🌀', 1800);
        await pause(1850);
      },
    },
    flip: {
      w: 3,
      async run() {
        add('antic-flip');
        showEmote('🤸', 1500);
        await pause(1150);
        maybeSay('flip');
      },
    },
    stretch: {
      w: 3,
      async run() {
        add('antic-stretch', 'antic-eyes');
        showEmote('🥱', 2400);
        await pause(2400);
        remove('antic-stretch', 'antic-eyes');
        add('antic-shake');
        await pause(450);
      },
    },
    look: {
      w: 4,
      async run() {
        const orig = facing();
        showEmote('👀', 2400);
        add('antic-tilt');
        face(-orig);
        await pause(700);
        face(orig);
        await pause(700);
        face(-orig);
        await pause(450);
        face(orig);
      },
    },
    sit: {
      w: 3,
      async run() {
        add('antic-sit');
        showEmote('☕', 2500);
        maybeSay('sit');
        await pause(4500);
      },
    },
    scratch: {
      w: 3,
      async run() {
        add('antic-scratch');
        showEmote('😸', 2200);
        await pause(2000);
      },
    },
    sneeze: {
      w: 2,
      async run() {
        add('antic-sneeze');
        await pause(520);
        showEmote('🤧', 1800);
        maybeSay('sneeze', true);
        await pause(900);
      },
    },
    hops: {
      w: 3,
      async run() {
        add('antic-hops');
        showEmote('🐇', 1600);
        await pause(1300);
      },
    },
    dizzy: {
      w: 2,
      async run() {
        add('antic-dizzy');
        await pause(1200);
        showEmote('😵‍💫', 2000);
        maybeSay('dizzy');
        await pause(1500);
      },
    },
    workout: {
      w: 2,
      async run() {
        add('antic-workout');
        showEmote('💪', 3000);
        maybeSay('workout');
        await pause(3200);
      },
    },
    doze: {
      w: 2,
      async run() {
        add('antic-doze', 'antic-eyes');
        showEmote('💤', 0, true);
        try {
          await pause(3800);
        } finally {
          remove('antic-doze', 'antic-eyes');
          hideEmote();
        }
        add('antic-shake');
        showEmote('😳', 1500);
        await pause(450);
      },
    },
    dance: {
      w: 2,
      async run() {
        add('antic-dance');
        showEmote('💃', 3000);
        await pause(3000);
      },
    },
    watch: {
      w: 3,
      async run() {
        showEmote('👀', 0, true);
        try {
          for (let i = 0; i < 8; i++) {
            const c = await window.ichi.getCursor();
            const cx = posX + CHAR_W / 2;
            if (c && Math.abs(c.x - cx) > 40) face(c.x > cx ? 1 : -1);
            await pause(550);
          }
        } finally {
          hideEmote();
        }
      },
    },
    moonwalk: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        const roomL = posX - d.x;
        const roomR = d.x + d.width - CHAR_W - posX;
        const moveDir = roomL > roomR ? -1 : 1;
        face(-moveDir); // gittigi yonun tersine bakar
        walkOn();
        showEmote('🕺', 2600);
        maybeSay('moonwalk');
        await glide(clampX(posX + moveDir * rnd(140, 220)), posY, 2300, linear);
        walkOff();
      },
    },
    dash: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        let dir = facing();
        let target = posX + dir * rnd(220, 420);
        if (target < d.x + 10 || target > d.x + d.width - CHAR_W - 10) {
          dir = -dir;
          target = posX + dir * rnd(220, 420);
        }
        target = clampX(target);
        face(dir);
        showEmote('💨', 1500);
        walkOn();
        add('antic-lean');
        await glide(target, posY, 480, easeOut);
        walkOff();
        remove('antic-lean');
        add('antic-skid');
        await pause(380);
      },
    },
    climb: {
      w: 2,
      moves: true,
      async run() {
        const d = currentDisplay();
        if (bubbleOpen()) hideBubble();
        const sides = ['left', 'right'].filter((s) => edgeFree(d, s));
        if (sides.length && Math.random() < 0.75) {
          // bos kenardan yarim gizlenip geri bakar
          const side = sides[Math.floor(Math.random() * sides.length)];
          const dir = side === 'right' ? 1 : -1;
          const startX = posX;
          const hideX = side === 'right' ? d.x + d.width - 72 : d.x - CHAR_W + 72;
          face(dir);
          walkOn();
          showEmote('👀', 1500);
          await glide(hideX, posY, 900, easeInOut);
          walkOff();
          await pause(1400);
          face(-dir);
          walkOn();
          maybeSay('climb');
          // kenardayken merkez ekran disinda kalir; currentDisplay() yaniltmasin diye baslangictaki ekran kullanilir
          await glide(clamp(startX, d.x, d.x + d.width - CHAR_W), posY, 900, easeInOut);
          walkOff();
        } else {
          // roket: ekranin ustunden cikar, geri duser
          const startY = posY;
          showEmote('🚀', 1200);
          maybeSay('climb');
          await glide(posX, d.y - CHAR_H - 10, 650, easeIn);
          await pause(900);
          await glide(posX, startY, 520, easeIn);
          add('antic-land');
          showEmote('😼', 1500);
          await pause(380);
        }
      },
    },
    vanish: {
      w: 2,
      moves: true,
      overlay: true,
      async run() {
        const d = currentDisplay();
        showEmote('🥷', 700);
        sendMark('puff');
        await pause(180);
        add('antic-hidden');
        await pause(600);
        posX = Math.round(clampX(d.x + 10 + Math.random() * Math.max(1, d.width - CHAR_W - 20)));
        window.ichi.moveWindow(posX, posY);
        await pause(450);
        sendMark('puff');
        await pause(180);
        remove('antic-hidden');
        showEmote('😼', 1500);
        maybeSay('vanish');
        await pause(600);
      },
    },
    juggle: {
      w: 2,
      overlay: true,
      async run() {
        const rect = charEl.getBoundingClientRect();
        sendMark('juggle', { oy: rect.top + rect.height * 0.42 });
        add('antic-juggle');
        showEmote('🤹', 3200);
        maybeSay('juggle');
        await pause(3200);
      },
    },
    kick: {
      w: 2,
      overlay: true,
      async run() {
        const dir = facing();
        add('antic-kick');
        await pause(330);
        const rect = charEl.getBoundingClientRect();
        sendMark('kick', { ox: rect.left + rect.width / 2 + 16 * dir, oy: rect.bottom - 8, dir });
        showEmote('⚽', 2200);
        await pause(300);
        remove('antic-kick');
        maybeSay('kick');
        await pause(1600);
      },
    },
  };

  function pickName(explicit) {
    const list = abilityList();
    if (explicit === 'power') return list ? 'power' : pickName();
    if (explicit && ANTICS[explicit]) return explicit;
    let names = Object.keys(ANTICS).filter((n) => n !== lastName);
    if (stay) names = names.filter((n) => !ANTICS[n].moves);
    if (!marksOn) names = names.filter((n) => !ANTICS[n].overlay);
    const weighted = names.map((n) => [n, ANTICS[n].w]);
    const canPower = list && (!stay || list.some((a) => !a.moves));
    if (canPower && lastName !== 'power') weighted.push(['power', 3]);
    const total = weighted.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [n, w] of weighted) {
      r -= w;
      if (r <= 0) return n;
    }
    return weighted[weighted.length - 1][0];
  }

  function getEntry(name) {
    return name === 'power' ? pickAbility() : ANTICS[name];
  }

  function cleanup() {
    for (const c of [...charEl.classList]) if (c.startsWith('antic-') || c.startsWith('ability-')) charEl.classList.remove(c);
    charEl.classList.remove('walking');
    if (!sleeping) charEl.classList.add('idle');
    if (!dragging) window.ichi.moveWindow(posX, posY); // son konum kaydedilsin
  }

  async function play(explicit) {
    if (busy || sleeping || dragging || physics) return false;
    const name = pickName(explicit);
    const entry = getEntry(name);
    if (!entry || typeof entry.run !== 'function') return false;
    busy = true;
    lastName = name;
    clearTimeout(moveTimer);
    clearInterval(walkTick);
    setIdle();
    const label = name === 'power' ? `power(${entry.key})` : name;
    window.ichi.voiceLog(`ANTIC: ${label} @${posX},${posY}`);
    try {
      await entry.run();
    } catch (err) {
      window.ichi.voiceLog(`ANTIC-ERR: ${label} ${err && err.message}`);
    } finally {
      cleanup();
      busy = false;
      window.ichi.voiceLog(`ANTIC-END: ${label} @${posX},${posY}`);
      if (!sleeping) scheduleNextMove();
    }
    return true;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const idle = !(dragging || physics || menuOpen() || sleeping || hovering || teaching || isListening() || busy);
      if (idle) await play();
      schedule();
    }, ANTIC_MIN_MS + Math.random() * (ANTIC_MAX_MS - ANTIC_MIN_MS));
  }

  window.KitzoAntics = {
    play,
    schedule,
    line: (name) => (name === 'power' ? abilityLine(currentCharId) : anticLine(name)),
    busy: () => busy,
    names: () => Object.keys(ANTICS),
    hasPower: () => Boolean(ABILITIES[currentCharId]),
  };
})();
