const CHAR_W = 170;
const CHAR_H = 240; // 204 karakter + 36 emote alani
const OVERLAY_GAP = 8;
const DRAG_THRESHOLD = 8;
const WALK_SPEED = 1.6;
const LISTEN_WINDOW_MS = 7000; // isim soylendikten sonra komut icin sessizce beklenen sure
const LISTEN_EXTEND_MS = 4000; // konusma algilandiginda pencere bu kadar uzar
const LISTEN_MAX_MS = 15000; // uzatmalarla birlikte toplam ust sinir
const MAX_UTTERANCE_TOKENS = 10; // daha uzunu arka plan konusmasi sayilir
const MAX_PENDING_TOKENS = 14;
const NIGHT_END_HOUR = 7;
const NIGHT_INTERACTION_GRACE_MS = 30 * 60000;
const BIG_MOVE_COOLDOWN_MS = 30 * 60000;

// Karakterler kendi adlariyla cagrilir; Vosk'un duyabilecegi yakin yazimlar da kabul edilir.
const WAKE_ALIASES = {
  kitzo: ['kitzo', 'kitso', 'kitsu', 'kitzu', 'kizo', 'kitza', 'kiczo', 'kicso', 'hiczo', 'hiczor', 'hicso', 'kitzor', 'headzor', 'hedzor', 'hetzor', 'hetzo', 'zor', 'chicco', 'cicco', 'kicco', 'chico', 'kitco', 'kitcho', 'ciko', 'kico', 'keithso', 'kidsso', 'kidso', 'keatso', 'kitsoh', 'kizzo', 'keetso', 'kızı', 'kitzi', 'kizzi', 'gitse', 'gitso', 'gitzo', 'kitse', 'kitap', 'kitapreis', 'kidse'],
  zumi: ['zumi', 'sumi', 'zumu', 'zumii'],
  byto: ['byto', 'bayto', 'bito', 'baytu', 'bayta'],
  fyra: ['fyra', 'fira', 'fayra', 'fira'],
  nocto: ['nocto', 'nokto', 'noktu', 'nocta'],
  wispa: ['wispa', 'vispa', 'ispa', 'wisper'],
  drayko: ['drayko', 'drako', 'dreyko', 'drayk', 'draco'],
  nubi: ['nubi', 'nubii', 'nuubi', 'newbie'],
  ozgezo: ['özgezo', 'özgeso', 'özgezu', 'özge', 'ozge'],
  barkinzo: ['barkınzo', 'barkınso', 'barkinzo', 'barkın', 'barkin'],
  kutucuzo: ['kutucuzo', 'kutucuso', 'kutucu', 'kutuzo', 'korkutucu', 'korkutucuzor', 'kutucuzor'],
};
// Gunluk konusmada gecebilen kisa takma adlar: yalnizca cumle basinda uyandirir
const START_ONLY_ALIASES = new Set(['zor', 'kutucu', 'korkutucu', 'kizi', 'gitse', 'kitap']);
// Kisa bir cumlenin ilk kelimesi bu kaliba uyuyorsa karaktere seslenilmis sayilir (tanıyıcı "Kitzo"yu
// "gitse", "kitap", "kızı", "chicco" gibi yaziyor); komut basariyla calisirsa yazim ogrenilir.
const WAKE_PREFIX = { kitzo: /^(kit|git|kid|kiz|chic|cic|hic)[a-z]{1,5}$/ };
const WAKE_PREFIX_EXCLUDE = new Set([
  'gitti', 'gitme', 'gitmek', 'gitsin', 'gidip', 'gitmis', 'gitmisti', 'gitmeli', 'gitmez', 'gitmesi', 'gitmem',
  'kitle', 'kitlesi', 'hicbir', 'hicbiri', 'kizlar', 'kizlari', 'kizim', 'kizin', 'kizarmis',
]);
const TENTATIVE_WINDOW_MS = 4500; // sessiz deneme dinlemesi: yaygin kelimeye benzeyen isim eslesmeleri icin
const TENTATIVE_MAX_MS = 8000;

const I18N = window.KITZO_I18N;
const V = window.KitzoVoice;
const characters = window.KITZO_CHARACTERS;
const $ = (id) => document.getElementById(id);

const stageEl = $('stage');
const charEl = $('character');
const menuEl = $('menu');
const bubbleEl = $('bubble');
const bubbleTextEl = $('bubble-text');
const emoteEl = $('emote');
const menuTitleEl = $('menu-title');
const menuStatusEl = $('menu-status');
const actionsEl = $('menu-actions');
const closeBtn = $('btn-close-menu');
const marketBtn = $('btn-market');
const listenBtn = $('btn-listen');
const remindersBtn = $('btn-reminders');
const actionsBtn = $('btn-actions');
const stayBtn = $('btn-stay');
const cornerBtn = $('btn-corner');
const waveBtn = $('btn-wave');
const charactersBtn = $('btn-characters');
const settingsBtn = $('btn-settings');
const charListEl = $('character-list');
const languageBtn = $('btn-language');
const micBtn = $('btn-mic');
const micDeviceBtn = $('btn-mic-device');
const teachBtn = $('btn-teach');
const feedbackBtn = $('btn-feedback');
const autostartBtn = $('btn-autostart');
const shortcutsBtn = $('btn-shortcuts');
const sleepBtn = $('btn-sleep');
const quitBtn = $('btn-quit');
const scLabelEl = $('sc-label');
const scTargetEl = $('sc-target');
const scVoiceEl = $('sc-voice');
const scAddBtn = $('btn-sc-add');
const shortcutListEl = $('shortcut-list');
const scBackBtn = $('btn-sc-back');
const rmMinutesEl = $('rm-minutes');
const rmTextEl = $('rm-text');
const rmAddBtn = $('btn-rm-add');
const reminderListEl = $('reminder-list');

const sections = {
  main: $('menu-main'),
  characters: $('menu-characters'),
  actions: $('menu-actionsec'),
  settings: $('menu-settings'),
  shortcuts: $('menu-shortcuts'),
  reminders: $('menu-reminders'),
};

let lang = 'en';
let T = I18N.en;

let posX = 0;
let posY = 0;
let displays = [];

let dragging = false;
let dragMoved = false;
let dragStartMouse = null;
let dragStartPos = null;
let hovering = false;

let overlay = null; // { el, extra, below }
let bubbleTimer = null;
let bubbleQueue = [];
let emoteTimer = null;
let moveTimer = null;
let walkTick = null;

let currentCharId = null;
let actions = [];
let reminders = [];
let market = null;
let mood = 'flat';
let lastBigMove = 0;

let stay = false;
let sleeping = false;
let sleepCause = null;
let systemIdle = false;
let lastInteraction = Date.now();
let quietUntil = 0;

let micOn = true;
let listener = null;
let voiceStarting = false;
let voiceGeneration = 0;
let listeningUntil = 0;
let listeningStartedAt = 0;
let listeningTentative = false; // sessiz deneme dinlemesi (gosterge yok, kisa pencere)
let listenTimer = null;
let pendingCmd = null; // dinleme sirasinda biriken komut parcalari
let bubbleTag = null;
let voiceReadyAnnounced = false;
let feedback = true; // "Duydum: ..." geri bildirimi
let pendingWakeAlias = null; // sezgiyle eslesen isim yazimi; komut basarili olursa ogrenilir
let reminderParts = null; // { free, grammar, timer } — iki taniyicidan gelen hatirlatici parcalari

// ---------- yardimcilar ----------

function savedItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function fill(text, vars) {
  let s = String(text);
  for (const [k, v] of Object.entries(vars || {})) s = s.replaceAll(`{${k}}`, v);
  return s;
}

function t(key, vars) {
  return fill(T.ui[key] ?? key, vars);
}

function line(key, vars) {
  const v = T.lines[key];
  let text = v;
  if (typeof v === 'function') text = v(currentName(), new Date().getHours());
  else if (Array.isArray(v)) text = v[Math.floor(Math.random() * v.length)];
  return fill(text ?? '', { name: currentName(), ...vars });
}

function currentName() {
  const c = characters.find((x) => x.id === currentCharId);
  return c ? c.name : 'Kitzo';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function displayAt(x, y) {
  return displays.find((d) => x >= d.x && x < d.x + d.width && y >= d.y && y < d.y + d.height);
}

function currentDisplay() {
  return displayAt(posX + CHAR_W / 2, posY + CHAR_H / 2) || displays[0];
}

function chime() {
  try {
    const ctx = new AudioContext();
    const start = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = start + i * 0.12;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.55);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
}

// ---------- baslangic ----------

async function init() {
  displays = await window.ichi.getDisplays();
  const pos = await window.ichi.getPosition();
  posX = pos[0];
  posY = pos[1];

  lang = await window.ichi.getLanguage();
  T = I18N[lang] || I18N.en;
  micOn = savedItem('mic') !== '0';
  stay = savedItem('stay') === '1';
  feedback = savedItem('feedback') !== '0';

  applyLanguage();
  loadCharacter(savedItem('character'));
  market = await window.ichi.getMarket();
  updateMood(false);
  await renderActions();
  await refreshReminders();
  await refreshAutostart();
  updateMicButton();
  bindIpc();
  scheduleNextMove();
  scheduleBlink();

  setTimeout(() => {
    showEmote('👋', 2500);
    wave();
    say(line('greeting'));
    if (!savedItem('tipShown')) {
      say(line('tip'));
      saveItem('tipShown', '1');
    }
    if (market) say(marketText(), 7000);
  }, 1200);

  if (micOn) startVoice();
  setInterval(minuteTick, 60000);
}

function bindIpc() {
  window.ichi.onMarket((data) => {
    const first = !market && Boolean(data);
    market = data;
    updateMood(!first);
    if (first) say(marketText(), 7000);
  });
  window.ichi.onReminderDue((r) => {
    wakeUp('reminder');
    showEmote('⏰', 6000);
    jump();
    chime();
    say(`⏰ ${r.text || t('reminderDefault')}`, 10000, { replace: true });
    refreshReminders();
  });
  window.ichi.onToggleMenu(() => {
    lastInteraction = Date.now();
    if (sleeping) wakeUp('hotkey');
    toggleMenu();
  });
  window.ichi.onSystemIdle((idle) => {
    systemIdle = idle;
    checkSleep();
  });
  window.ichi.onVoiceProgress((p) => {
    if (p.stage === 'download') setVoiceStatus(t('statusDownloading', { p: Math.round((p.value || 0) * 100) }));
    else setVoiceStatus(t('statusPreparing'));
  });
  window.ichi.onVoiceTest(({ url, teach, char }) => {
    if (!listener) return;
    if (char) loadCharacter(char);
    if (teach) startTeaching();
    setTimeout(() => listener.feedUrl(url), 800);
  });
  window.ichi.onListenNow(listenNow);
}

// ---------- dil ----------

function applyLanguage() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-ph]')) el.placeholder = t(el.dataset.i18nPh);
  languageBtn.textContent = t('language');
  updateMicButton();
  updateMicDeviceButton(listener ? listener.deviceLabel : '');
  updateSleepButton();
  updateStayButton();
  updateFeedbackButton();
  refreshAutostart();
  renderShortcutList();
  renderReminderList();
}

async function setLanguage(next) {
  lang = await window.ichi.setLanguage(next);
  T = I18N[lang] || I18N.en;
  applyLanguage();
  if (menuOpen()) relayoutOverlay();
  say(line('langChanged'), 3000, { replace: true });
  if (micOn) {
    stopVoice();
    startVoice();
  }
}

// ---------- karakter ----------

function loadCharacter(id) {
  const c = characters.find((x) => x.id === id) || characters[0];
  currentCharId = c.id;
  charEl.innerHTML = c.svg;
  menuTitleEl.textContent = `${c.emoji} ${c.name.toUpperCase()}`;
  saveItem('character', c.id);
  renderCharacterList();
}

function renderCharacterList() {
  charListEl.replaceChildren();
  for (const c of characters) {
    const btn = document.createElement('button');
    btn.className = 'menu-btn' + (c.id === currentCharId ? ' active' : '');
    btn.textContent = `${c.emoji} ${c.name}`;
    btn.addEventListener('click', () => {
      if (c.id === currentCharId) return;
      loadCharacter(c.id);
      showEmote(c.id === 'kutucuzo' ? '💕' : '✨', 2500);
    });
    charListEl.appendChild(btn);
  }
}

// Kullanicinin "Adimi Ogret" ile kaydettigi, kendi sesinden duyulan yazimlar
function learnedAliases(id) {
  try {
    const list = JSON.parse(localStorage.getItem(`aliases:${id}`) || '[]');
    // cok kisa yazimlar ("git" gibi) gunluk kelimelerle karisir, kullanilmaz
    return Array.isArray(list) ? list.filter((a) => typeof a === 'string' && a.length >= 4) : [];
  } catch {
    return [];
  }
}

function saveLearnedAliases(id, list) {
  saveItem(`aliases:${id}`, JSON.stringify(list.slice(-12)));
}

function namesOf(id) {
  const c = characters.find((x) => x.id === id);
  const names = new Set([...(WAKE_ALIASES[id] || []), id, c ? c.name : '', ...learnedAliases(id)]);
  return [...names].map(V.normalize).filter(Boolean);
}

// Kisa ogrenilmis yazimlar da yalnizca cumle basinda gecerli
function startOnlyFor(id) {
  const set = new Set(START_ONLY_ALIASES);
  for (const a of learnedAliases(id)) if (a.length <= 4) set.add(a);
  return set;
}

// Herhangi bir karakterin adi soylenirse o karakter cagrilir (once mevcut karakter denenir).
function findWakeAny(tokens) {
  const order = [currentCharId, ...characters.map((c) => c.id).filter((id) => id !== currentCharId)];
  for (const id of order) {
    const wake = V.findWake(tokens, namesOf(id), startOnlyFor(id));
    if (wake) {
      // yaygin kelimeye benzeyen takma adlar (zor, kitap...) ogrenilene kadar deneme sayilir
      const tentative = START_ONLY_ALIASES.has(wake.name) && !learnedAliases(id).includes(wake.name);
      return { ...wake, id, heuristic: tentative };
    }
  }
  // "-zo" ile biten adlar taniyici tarafindan cok farkli yazilabiliyor ("hiç zor", "peki zor");
  // ilk kelime(ler) zo/zor ile bitiyorsa mevcut karakter cagrilmis say.
  const prefix = WAKE_PREFIX[currentCharId];
  if (prefix && tokens.length && tokens.length <= 4 && prefix.test(tokens[0]) && !WAKE_PREFIX_EXCLUDE.has(tokens[0])) {
    return { index: 0, length: 1, name: tokens[0], id: currentCharId, heuristic: true };
  }
  // Ingilizce modelde "kid so", "keith so" gibi "-so" ile biten ikililer de ayni sekilde kabul edilir.
  if (/zo$/.test(currentCharId) && tokens.length) {
    if (/zor?$/.test(tokens[0])) return { index: 0, length: 1, name: tokens[0], id: currentCharId, heuristic: true };
    if (tokens.length > 1 && tokens[1].length <= 4 && /(zor?|so)$/.test(tokens[0] + tokens[1]) && tokens[0].length >= 3) {
      return { index: 0, length: 2, name: tokens[0] + tokens[1], id: currentCharId, heuristic: true };
    }
  }
  return null;
}

// Sezgiyle yakalanan isim yazimi, ardindan komut basariyla calisirsa kalici takma ad olur
function rememberWakeAlias() {
  const alias = pendingWakeAlias;
  pendingWakeAlias = null;
  if (!alias || alias.length < 4) return;
  const learned = learnedAliases(currentCharId);
  if (learned.includes(alias)) return;
  learned.push(alias);
  saveLearnedAliases(currentCharId, learned);
  window.ichi.voiceLog(`LEARNED: ${alias}`);
}

// Kisitli taniyicinin kelime dagarcigi: komut kelimeleri, sayilar, birimler ve kisayol adlari
function grammarWords() {
  const vc = T.voice;
  const words = new Set();
  const add = (w) => {
    for (const part of String(w || '').toLocaleLowerCase('tr').split(/\s+/)) {
      const clean = part.replace(/[^\p{L}\p{N}]/gu, '');
      if (clean) words.add(clean);
    }
  };
  const lists = ['reminder', 'help', 'mic', 'off', 'app', 'quit', 'market', 'corner', 'stay', 'wander', 'sleep', 'wake', 'menu', 'quiet', 'hello', 'thanks', 'who', 'half', 'articles', 'glue', 'skip', 'stop', 'extraGrammar'];
  for (const key of lists) (vc[key] || []).forEach(add);
  Object.keys(vc.units).forEach(add);
  Object.keys(vc.numbers).forEach(add);
  for (const a of actions) {
    add(a.label);
    (a.voice || []).forEach(add);
  }
  return [...words];
}

function refreshGrammar() {
  if (listener) listener.setGrammar(grammarWords());
}

function isReminderTokens(tokens) {
  return tokens.some((tok) => T.voice.reminder.some((r) => tok.startsWith(V.normalize(r))));
}

// Hatirlatici: sure kisitli taniyicidan (sayilari iyi duyar), not serbest taniyicidan alinir
function collectReminderPart(source, tokens, raw) {
  if (!reminderParts) reminderParts = { free: null, grammar: null, timer: null };
  reminderParts[source] = { tokens, raw };
  clearTimeout(reminderParts.timer);
  if (reminderParts.free && reminderParts.grammar) finalizeReminder();
  else reminderParts.timer = setTimeout(finalizeReminder, 900);
}

function finalizeReminder() {
  const parts = reminderParts;
  reminderParts = null;
  if (!parts) return;
  clearTimeout(parts.timer);
  const vc = T.voice;
  const g = parts.grammar ? V.parseReminder(parts.grammar.tokens, parts.grammar.raw, vc) : null;
  const f = parts.free ? V.parseReminder(parts.free.tokens, parts.free.raw, vc) : null;
  const minutes = g && g.hasDuration ? g.minutes : f ? f.minutes : g.minutes;
  const note = (f && f.note) || (g && g.note) || '';
  addReminder(minutes, note, true);
  rememberWakeAlias();
  stopListening();
}

function onGrammarTranscript(text) {
  window.ichi.voiceLog(`GRAMMAR: ${text}`);
  if (teaching) return;
  const unknown = (text.match(/\[unk\]/g) || []).length;
  const { tokens, raw } = V.tokenize(text.replace(/\[unk\]/g, ' '));
  const reminderPending = Boolean(reminderParts && !reminderParts.grammar);
  if (!isListening() && !reminderPending) return;
  // cogu [unk] ise bu bir komut degil; serbest taniyici karar versin
  if (!tokens.length || unknown > tokens.length) return;
  if (isReminderTokens(tokens)) {
    collectReminderPart('grammar', tokens, raw);
    return;
  }
  if (!isListening()) return;
  if (listeningTentative && tokens.length > 5) return;
  if (runVoiceCommand(tokens, raw, 'grammar')) {
    rememberWakeAlias();
    stopListening();
  }
}

function updateFeedbackButton() {
  feedbackBtn.textContent = t(feedback ? 'feedbackOn' : 'feedbackOff');
}

function showHeard(rawTokens, ms = 2500) {
  if (!feedback || menuOpen()) return;
  say(t('heardLine', { text: rawTokens.join(' ') }), ms, { replace: true, tag: 'listening' });
}

// ---------- adimi ogret ----------

let teaching = null; // { samples: [], until }

function startTeaching() {
  if (!micOn || !listener) {
    setMic(true);
    say(t('statusPreparing'), 3000, { replace: true });
    return;
  }
  if (menuOpen()) closeMenu();
  stopListening();
  teaching = { samples: [], until: Date.now() + 25000 };
  showEmote('🎙️', 0, true);
  say(line('teachStart'), 25000, { replace: true, tag: 'teach' });
  setTimeout(() => {
    if (teaching && Date.now() >= teaching.until) finishTeaching();
  }, 25500);
}

function finishTeaching() {
  const samples = teaching ? teaching.samples : [];
  teaching = null;
  hideEmote();
  if (!samples.length) {
    say(line('teachNone'), 4000, { replace: true });
    return;
  }
  const learned = learnedAliases(currentCharId);
  for (const s of samples) if (!learned.includes(s)) learned.push(s);
  saveLearnedAliases(currentCharId, learned);
  say(line('teachDone', { heard: samples.join(', ') }), 7000, { replace: true });
}

function onTeachingTranscript(tokens) {
  if (tokens.length > 3) return;
  const sample = tokens.join('');
  if (sample.length < 4) return;
  teaching.samples.push(sample);
  showEmote('✅', 1200);
  if (teaching.samples.length >= 3) {
    finishTeaching();
    return;
  }
  teaching.until = Date.now() + 20000;
  say(line('teachMore', { n: 3 - teaching.samples.length }), 20000, { replace: true, tag: 'teach' });
}

function summon(id) {
  if (id === currentCharId) return;
  loadCharacter(id);
  jump();
  if (id === 'kutucuzo') {
    showEmote('💕', 4000);
    hideBubble();
  } else {
    showEmote('✨', 2500);
    say(line('switched'), 3000, { replace: true });
  }
}

// ---------- gezinme ----------

function setIdle() {
  charEl.classList.remove('walking');
  charEl.classList.add('idle');
}

function jump() {
  charEl.classList.remove('jump');
  void charEl.offsetWidth;
  charEl.classList.add('jump');
  setTimeout(() => charEl.classList.remove('jump'), 700);
}

function wave() {
  charEl.classList.remove('wave');
  void charEl.offsetWidth;
  charEl.classList.add('wave');
  setTimeout(() => charEl.classList.remove('wave'), 2200);
}

// Dogal goz kirpma; arada bir tek gozle yaramaz kirpis
let blinkTimer = null;
function scheduleBlink() {
  clearTimeout(blinkTimer);
  blinkTimer = setTimeout(() => {
    if (!sleeping) {
      if (Math.random() < 0.12) {
        charEl.classList.add('wink');
        setTimeout(() => charEl.classList.remove('wink'), 650);
      } else {
        charEl.classList.add('blink');
        setTimeout(() => charEl.classList.remove('blink'), 150);
      }
    }
    scheduleBlink();
  }, 2500 + Math.random() * 4500);
}

function scheduleNextMove() {
  clearTimeout(moveTimer);
  if (stay) return;
  const idleDelay = 2500 + Math.random() * 5000;
  moveTimer = setTimeout(() => {
    // pencere programla tasindiysa mouseleave gelmemis olabilir; hover durumunu dogrula
    if (hovering && !charEl.matches(':hover')) hovering = false;
    if (dragging || menuOpen() || sleeping || stay || hovering) {
      scheduleNextMove();
      return;
    }
    walkToRandomSpot();
  }, idleDelay);
}

function walkToRandomSpot() {
  const d = currentDisplay();
  const direction = Math.random() < 0.5 ? -1 : 1;
  const distance = 80 + Math.random() * 260;
  walkTo(clamp(posX + direction * distance, d.x, d.x + d.width - CHAR_W), posY);
}

// Hedefe yuruyerek gider; y farki varsa yol boyunca yumusakca kapatilir.
// ignoreHover: kullanicinin acik istegiyle (koseye git) fare ustundeyken de yurur.
function walkTo(targetX, targetY, { ignoreHover = false } = {}) {
  if (Math.abs(targetX - posX) < 5 && Math.abs(targetY - posY) < 5) {
    scheduleNextMove();
    return;
  }
  if (ignoreHover) hovering = false;
  const direction = targetX >= posX ? 1 : -1;
  const startX = posX;
  const startY = posY;
  const spanX = Math.max(1, Math.abs(targetX - startX));

  charEl.classList.remove('idle');
  charEl.classList.add('walking');
  charEl.style.transform = direction < 0 ? 'scaleX(-1)' : 'scaleX(1)';
  charEl.classList.toggle('flipped', direction < 0);

  clearInterval(walkTick);
  walkTick = setInterval(() => {
    if (dragging || menuOpen() || sleeping || hovering) {
      clearInterval(walkTick);
      setIdle();
      scheduleNextMove();
      return;
    }
    posX += direction * WALK_SPEED;
    const progress = clamp(Math.abs(posX - startX) / spanX, 0, 1);
    posY = Math.round(startY + (targetY - startY) * progress);
    const reached = direction > 0 ? posX >= targetX : posX <= targetX;
    if (reached) {
      posX = targetX;
      posY = targetY;
      clearInterval(walkTick);
      setIdle();
      scheduleNextMove();
    }
    window.ichi.moveWindow(posX, posY);
  }, 16);
}

function setStay(on) {
  stay = on;
  saveItem('stay', on ? '1' : '0');
  window.ichi.voiceLog(`STAY: ${on ? 'on' : 'off'}`);
  updateStayButton();
  if (on) {
    clearTimeout(moveTimer);
    clearInterval(walkTick);
    setIdle();
  } else {
    scheduleNextMove();
  }
}

function updateStayButton() {
  stayBtn.textContent = t(stay ? 'wander' : 'stay');
}

function goToCorner() {
  const d = currentDisplay();
  const extra = overlay ? overlay.extra : 0;
  const targetX = d.x + d.width - CHAR_W - 30;
  const targetY = d.y + d.height - CHAR_H - (overlay && !overlay.below ? extra : 0);
  walkTo(targetX, targetY, { ignoreHover: true });
}

// ---------- surukleme / tiklama ----------

// Fare karakterin ustundeyken yurumesin; kullanici tiklamaya calisirken kacmasin.
charEl.addEventListener('mouseenter', () => {
  hovering = true;
  clearInterval(walkTick);
  setIdle();
});
charEl.addEventListener('mouseleave', () => {
  hovering = false;
  if (!dragging) scheduleNextMove();
});

charEl.addEventListener('mousedown', (e) => {
  dragging = true;
  dragMoved = false;
  clearInterval(walkTick);
  charEl.classList.remove('walking');
  dragStartMouse = { x: e.screenX, y: e.screenY };
  dragStartPos = { x: posX, y: posY };
});

window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  // fare tusu pencere disinda birakildiysa mouseup gelmez; surukleme takili kalmasin
  if (e.buttons === 0) {
    finishDrag(false);
    return;
  }
  const dx = e.screenX - dragStartMouse.x;
  const dy = e.screenY - dragStartMouse.y;
  if (!dragMoved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
    dragMoved = true;
    if (sleeping) wakeUp('drag');
    showEmote('😵', 0, true);
  }
  const nx = dragStartPos.x + dx;
  const ny = dragStartPos.y + dy;
  // karakterin merkezi bir ekranin icinde kalmali, aksi halde kaybolabilir
  if (!displayAt(nx + CHAR_W / 2, ny + CHAR_H / 2)) return;
  posX = nx;
  posY = ny;
  window.ichi.moveWindow(posX, posY);
});

function finishDrag(allowClick) {
  if (!dragging) return;
  dragging = false;
  charEl.classList.add('idle');
  lastInteraction = Date.now();

  if (dragMoved || !allowClick) {
    hideEmote();
    scheduleNextMove();
    return;
  }
  // Tiklama her zaman menuyu acar/kapatir; uyuyorsa sessizce uyanir.
  if (sleeping) wakeUp('click');
  toggleMenu();
}

window.addEventListener('mouseup', () => finishDrag(true));

// ---------- overlay (menu / balon) ----------

function menuOpen() {
  return Boolean(overlay && overlay.el === menuEl);
}

function bubbleOpen() {
  return Boolean(overlay && overlay.el === bubbleEl);
}

// Pencere yukari dogru buyudugunde posY kayar; surukleme suruyorsa baslangic noktasi da ayni kadar kaymali
function shiftPos(dy) {
  posY += dy;
  if (dragging && dragStartPos) dragStartPos.y += dy;
}

function openOverlay(el) {
  if (overlay) closeOverlay();
  const extra = el.offsetHeight + OVERLAY_GAP;
  const d = currentDisplay();
  const below = posY - extra < d.y;
  stageEl.classList.toggle('below', below);
  el.classList.add('open');
  window.ichi.setOverlay({ open: true, extra, below });
  if (!below) shiftPos(-extra);
  overlay = { el, extra, below };
}

function closeOverlay() {
  if (!overlay) return;
  const { el, extra, below } = overlay;
  el.classList.remove('open');
  window.ichi.setOverlay({ open: false, extra, below });
  if (!below) shiftPos(extra);
  overlay = null;
}

function relayoutOverlay() {
  if (!overlay) return;
  const el = overlay.el;
  closeOverlay();
  openOverlay(el);
}

// ---------- menu ----------

function openMenu() {
  hideBubble();
  showSection('main', false);
  openOverlay(menuEl);
}

function closeMenu() {
  if (!menuOpen()) return;
  closeOverlay();
  showSection('main', false);
  scheduleNextMove();
  flushBubbleQueue();
}

function toggleMenu() {
  if (menuOpen()) closeMenu();
  else openMenu();
}

function showSection(name, relayout = true) {
  for (const [key, el] of Object.entries(sections)) el.hidden = key !== name;
  if (relayout && menuOpen()) relayoutOverlay();
}

// ---------- balon / emote ----------

function say(text, ms, opts = {}) {
  if (!text) return;
  const duration = ms || Math.min(9000, 2500 + text.length * 70);
  if (bubbleOpen() && opts.replace) {
    bubbleTextEl.textContent = text;
    bubbleTag = opts.tag || null;
    relayoutOverlay();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, duration);
    return;
  }
  if (menuOpen() || bubbleOpen()) {
    if (bubbleQueue.length < 3) bubbleQueue.push({ text, ms: duration });
    return;
  }
  bubbleTextEl.textContent = text;
  bubbleTag = opts.tag || null;
  openOverlay(bubbleEl);
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, duration);
}

function hideBubble() {
  clearTimeout(bubbleTimer);
  bubbleTag = null;
  if (bubbleOpen()) closeOverlay();
  flushBubbleQueue();
}

function flushBubbleQueue() {
  if (!bubbleQueue.length || overlay) return;
  const next = bubbleQueue.shift();
  setTimeout(() => say(next.text, next.ms), 400);
}

function showEmote(symbol, ms = 2200, persistent = false) {
  emoteEl.textContent = symbol;
  emoteEl.hidden = false;
  emoteEl.classList.toggle('pulse', persistent);
  emoteEl.classList.remove('pop');
  void emoteEl.offsetWidth;
  emoteEl.classList.add('pop');
  clearTimeout(emoteTimer);
  if (!persistent && ms > 0) emoteTimer = setTimeout(hideEmote, ms);
}

function hideEmote() {
  clearTimeout(emoteTimer);
  emoteEl.classList.remove('pulse');
  const persistent = sleeping ? '💤' : teaching ? '🎙️' : isListening() ? '🎧' : null;
  if (persistent) {
    emoteEl.textContent = persistent;
    emoteEl.hidden = false;
    emoteEl.classList.add('pulse');
    return;
  }
  emoteEl.hidden = true;
}

// ---------- uyku ----------

function sleep(cause) {
  if (sleeping) return;
  sleeping = true;
  sleepCause = cause;
  charEl.classList.add('sleeping');
  clearInterval(walkTick);
  setIdle();
  hideListening();
  showEmote('💤', 0, true);
  updateSleepButton();
}

function wakeUp(cause) {
  lastInteraction = Date.now();
  if (!sleeping) return;
  sleeping = false;
  sleepCause = null;
  charEl.classList.remove('sleeping');
  hideEmote();
  updateSleepButton();
  if (cause === 'voice' || cause === 'morning' || cause === 'idle-end') say(line('wake'), 3000);
  scheduleNextMove();
}

function checkSleep() {
  const hour = new Date().getHours();
  const night = hour < NIGHT_END_HOUR;
  const untouched = Date.now() - lastInteraction > NIGHT_INTERACTION_GRACE_MS;
  if (!sleeping && (systemIdle || (night && untouched))) {
    sleep(systemIdle ? 'idle' : 'night');
    return;
  }
  if (sleeping && sleepCause === 'idle' && !systemIdle) wakeUp('idle-end');
  if (sleeping && sleepCause === 'night' && !night) wakeUp('morning');
}

function updateSleepButton() {
  sleepBtn.textContent = t(sleeping ? 'wake' : 'sleep');
}

// ---------- kisilik ----------

function minuteTick() {
  checkSleep();
  if (listener) {
    const s = listener.readStats();
    window.ichi.voiceLog(
      `VOICE: alive frames=${s.frames} speech=${s.speechFrames} peak=${s.peak.toFixed(4)} floor=${s.noiseFloor.toFixed(4)} level=${s.speechLevel.toFixed(4)} ambient=${(s.ambient || 0).toFixed(4)} stay=${stay ? 1 : 0} sleeping=${sleeping ? 1 : 0}`
    );
  } else if (!micOn) {
    window.ichi.voiceLog('VOICE: mic is off');
  }
  if (sleeping || overlay || Date.now() < quietUntil) return;
  const roll = Math.random();
  if (roll < 0.14) say(line('quips'));
  else if (mood === 'rocket' || mood === 'up') {
    if (roll < 0.3) showEmote('✨', 2000);
  } else if (mood === 'crash' || mood === 'down') {
    if (roll < 0.3) showEmote('💧', 2000);
  }
}

// ---------- piyasa ----------

function fmtPrice(n) {
  return n >= 1000 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2);
}

function fmtChange(c) {
  return `${c >= 0 ? '+' : ''}${c.toFixed(1)}%`;
}

function moodEmoji() {
  return { rocket: '🚀', up: '📈', flat: '😐', down: '📉', crash: '😱' }[mood] || '😐';
}

function marketText() {
  if (!market) return t('noMarket');
  return `BTC $${fmtPrice(market.btc.price)} (${fmtChange(market.btc.change)})\nETH $${fmtPrice(market.eth.price)} (${fmtChange(market.eth.change)}) ${moodEmoji()}`;
}

function updateMood(announce) {
  if (!market) {
    mood = 'flat';
    return;
  }
  const c = market.btc.change;
  const next = c >= 3 ? 'rocket' : c >= 0.5 ? 'up' : c <= -3 ? 'crash' : c <= -0.5 ? 'down' : 'flat';
  const changed = next !== mood;
  mood = next;
  charEl.dataset.mood = mood;
  if (!announce || !changed) return;
  if ((mood === 'rocket' || mood === 'crash') && Date.now() - lastBigMove > BIG_MOVE_COOLDOWN_MS) {
    lastBigMove = Date.now();
    showEmote(mood === 'rocket' ? '🚀' : '😱', 4000);
    say(line(mood, { c: fmtChange(c) }));
  }
}

function showMarket() {
  showEmote(moodEmoji(), 3000);
  say(marketText(), 8000, { replace: true });
}

// ---------- kisayollar ----------

async function renderActions(list) {
  actions = list || (await window.ichi.getActions());
  refreshGrammar();
  actionsEl.replaceChildren();
  for (const action of actions) {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = `${action.icon || '🔗'} ${action.label}`.trim();
    btn.addEventListener('click', () => {
      window.ichi.runAction(action.id);
      closeMenu();
      showEmote('🚀', 2000);
    });
    actionsEl.appendChild(btn);
  }
  renderShortcutList();
}

function renderShortcutList() {
  shortcutListEl.replaceChildren();
  if (!actions.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = t('noShortcuts');
    shortcutListEl.appendChild(empty);
    return;
  }
  for (const action of actions) {
    const row = document.createElement('div');
    row.className = 'sc-row';
    const name = document.createElement('div');
    name.className = 'sc-name';
    name.textContent = `${action.icon || '🔗'} ${action.label}`.trim();
    name.title = action.target || '';
    const del = document.createElement('button');
    del.className = 'menu-btn sc-del';
    del.textContent = '✖';
    del.addEventListener('click', async () => {
      await renderActions(await window.ichi.removeAction(action.id));
      relayoutOverlay();
    });
    row.append(name, del);
    shortcutListEl.appendChild(row);
  }
}

async function addShortcut() {
  const label = scLabelEl.value.trim();
  const target = scTargetEl.value.trim();
  if (!label || !target) return;
  await renderActions(await window.ichi.addAction({ label, target, voice: scVoiceEl.value }));
  scLabelEl.value = '';
  scTargetEl.value = '';
  scVoiceEl.value = '';
  relayoutOverlay();
}

function matchAction(tokens) {
  const stop = new Set(T.voice.stop.map(V.normalize));
  let best = null;
  for (const action of actions) {
    const phrases = [...(action.voice || []), action.label];
    let score = 0;
    for (const p of phrases) score = Math.max(score, V.phraseScore(tokens, p, stop));
    if (score > (best ? best.score : 0)) best = { action, score };
  }
  return best && best.score >= 0.5 ? best.action : null;
}

// ---------- hatirlaticilar ----------

async function refreshReminders(list) {
  reminders = list || (await window.ichi.getReminders());
  renderReminderList();
}

function renderReminderList() {
  reminderListEl.replaceChildren();
  if (!reminders.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = t('noReminders');
    reminderListEl.appendChild(empty);
    return;
  }
  for (const r of reminders) {
    const row = document.createElement('div');
    row.className = 'sc-row';
    const name = document.createElement('div');
    name.className = 'sc-name';
    const left = Math.max(0, Math.ceil((r.dueAt - Date.now()) / 60000));
    name.textContent = `⏰ ${r.text || t('reminderDefault')} · ${left} ${t('minutesShort')}`;
    const del = document.createElement('button');
    del.className = 'menu-btn sc-del';
    del.textContent = '✖';
    del.addEventListener('click', async () => {
      await refreshReminders(await window.ichi.removeReminder(r.id));
      relayoutOverlay();
    });
    row.append(name, del);
    reminderListEl.appendChild(row);
  }
}

async function addReminder(minutes, text, fromVoice) {
  const note = text || t('reminderDefault');
  await refreshReminders(await window.ichi.addReminder({ minutes, text: note }));
  showEmote('⏰', 2500);
  say(t('reminderSet', { m: minutes, t: note }), 5000, { replace: fromVoice });
  if (menuOpen()) relayoutOverlay();
}

// ---------- ayarlar ----------

async function refreshAutostart() {
  const on = await window.ichi.getAutostart();
  autostartBtn.textContent = t(on ? 'autostartOn' : 'autostartOff');
}

function updateMicButton() {
  micBtn.textContent = t(micOn ? 'micOn' : 'micOff');
  if (!micOn) setVoiceStatus(t('statusMicOff'));
}

function setMic(on) {
  micOn = on;
  saveItem('mic', on ? '1' : '0');
  window.ichi.voiceLog(`VOICE: mic ${on ? 'on' : 'off'} (user)`);
  updateMicButton();
  if (on) startVoice();
  else stopVoice();
}

// Mikrofon cihazi secimi: butona her basista siradaki giris cihazina gecer
function shortLabel(label) {
  const s = String(label || '').replace(/\s*\(.*?\)\s*$/, '').trim();
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
}

function updateMicDeviceButton(label) {
  micDeviceBtn.textContent = t('micDevice', { name: shortLabel(label) || t('micDefault') });
}

async function cycleMicDevice() {
  let mics = [];
  try {
    mics = await V.listMicrophones();
  } catch {}
  if (!mics.length) return;
  const current = savedItem('micDevice') || '';
  const idx = mics.findIndex((m) => m.id === current);
  const next = mics[(idx + 1) % mics.length];
  saveItem('micDevice', next.id);
  window.ichi.voiceLog(`VOICE: mic device -> "${next.label}"`);
  updateMicDeviceButton(next.label);
  if (micOn) {
    stopVoice();
    startVoice();
  }
}

// ---------- ses ----------

function setVoiceStatus(text) {
  menuStatusEl.textContent = text;
}

async function startVoice() {
  if (listener || voiceStarting) return;
  voiceStarting = true;
  const generation = ++voiceGeneration;
  try {
    setVoiceStatus(t('statusPreparing'));
    const url = await window.ichi.getVoiceModelUrl(lang);
    if (generation !== voiceGeneration) return;
    setVoiceStatus(t('statusStarting'));
    const created = await V.createListener({
      modelUrl: url,
      onResult: onFinalTranscript,
      onPartial: onPartialTranscript,
      onGrammarResult: onGrammarTranscript,
      onSpeech: () => extendListening(LISTEN_EXTEND_MS),
      deviceId: savedItem('micDevice') || '',
    });
    if (generation !== voiceGeneration || !micOn) {
      created.stop();
      return;
    }
    listener = created;
    refreshGrammar();
    setVoiceStatus(t('statusListening'));
    window.ichi.voiceLog(`VOICE: listening lang=${lang} input="${created.deviceLabel}" rate=${created.sampleRate}`);
    updateMicDeviceButton(created.deviceLabel);
    if (!voiceReadyAnnounced) {
      voiceReadyAnnounced = true;
      say(line('ready'));
    }
    window.ichi.voiceReady();
  } catch (err) {
    console.error(err);
    const name = err && err.name;
    const key =
      name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError'
        ? 'statusMicDenied'
        : name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError'
          ? 'statusNoMic'
          : 'statusError';
    setVoiceStatus(t(key));
    if (key !== 'statusError') say(t(key), 10000);
    window.ichi.voiceLog(`ERROR: ${name || ''} ${err && err.message}`);
  } finally {
    voiceStarting = false;
  }
}

function stopVoice() {
  voiceGeneration++;
  if (listener) {
    listener.stop();
    listener = null;
  }
  hideListening();
}

function isListening() {
  return listeningUntil > Date.now();
}

// Isim duyuldu: komut icin sessizce bekle (soru sorma), konusma geldikce sureyi uzat.
// tentative: isim yaygin bir kelimeye benziyordu; gosterge gostermeden kisa sure komut bekle
function startListening({ tentative = false } = {}) {
  listeningStartedAt = Date.now();
  listeningTentative = tentative;
  listeningUntil = listeningStartedAt + (tentative ? TENTATIVE_WINDOW_MS : LISTEN_WINDOW_MS);
  pendingCmd = { tokens: [], raw: [] };
  if (listener) listener.setListening(true);
  if (!tentative) {
    showEmote('🎧', 0, true);
    if (!menuOpen()) say(line('listening'), LISTEN_WINDOW_MS + 2000, { replace: true, tag: 'listening' });
  }
  armListenTimer();
}

function extendListening(ms) {
  if (!isListening()) return;
  const cap = listeningStartedAt + (listeningTentative ? TENTATIVE_MAX_MS : LISTEN_MAX_MS);
  listeningUntil = Math.min(cap, Math.max(listeningUntil, Date.now() + ms));
  armListenTimer();
}

// Bas-konus: isim soylemeden dogrudan komut icin (Ctrl+Alt+L veya menudeki Dinle)
function listenNow() {
  if (!micOn || !listener) {
    setMic(true);
    say(t('statusPreparing'), 3000, { replace: true });
    return;
  }
  lastInteraction = Date.now();
  if (sleeping) wakeUp('hotkey');
  if (menuOpen()) closeMenu();
  startListening();
}

function armListenTimer() {
  clearTimeout(listenTimer);
  listenTimer = setTimeout(() => {
    if (!listeningUntil) return;
    if (Date.now() < listeningUntil) {
      armListenTimer();
      return;
    }
    stopListening();
  }, Math.max(50, listeningUntil - Date.now() + 100));
}

function stopListening() {
  listeningUntil = 0;
  listeningTentative = false;
  pendingCmd = null;
  pendingWakeAlias = null;
  clearTimeout(listenTimer);
  if (listener) listener.setListening(false);
  hideEmote();
  if (bubbleOpen() && bubbleTag === 'listening') hideBubble();
}

function onPartialTranscript(text) {
  if (isListening() || teaching) return;
  const { tokens } = V.tokenize(text);
  if (tokens.length > MAX_UTTERANCE_TOKENS) return;
  const wake = findWakeAny(tokens);
  if (wake && wake.id === currentCharId) {
    if (sleeping) wakeUp('voice');
    startListening({ tentative: Boolean(wake.heuristic) });
    pendingWakeAlias = wake.heuristic ? wake.name : null;
  }
}

function onFinalTranscript(text) {
  window.ichi.voiceLog(`HEARD: ${text}`);
  const { tokens, raw } = V.tokenize(text);
  if (!tokens.length) return;
  if (teaching) {
    onTeachingTranscript(tokens);
    return;
  }
  // Uzun cumleler TV/video gibi arka plan konusmasidir; komut olarak degerlendirilmez
  if (tokens.length > MAX_UTTERANCE_TOKENS) return;

  const wake = findWakeAny(tokens);
  if (wake) {
    lastInteraction = Date.now();
    if (sleeping) wakeUp('voice');
    let summoned = false;
    if (wake.id !== currentCharId) {
      summon(wake.id);
      summoned = true;
    }
    const cmd = tokens.slice(wake.index + wake.length);
    const rawCmd = raw.slice(wake.index + wake.length);
    const heuristicAlias = wake.heuristic ? wake.name : null;
    const tentative = Boolean(wake.heuristic);
    // ismin arta kalan kucuk parcasi ("so", "zo") komut degildir
    if (!cmd.length || (cmd.length === 1 && cmd[0].length <= 2)) {
      startListening({ tentative });
      pendingWakeAlias = heuristicAlias;
      return;
    }
    // Deneme eslesmesinde uzun cumle arka plan konusmasidir (TV: "zor koku nerede...")
    if (tentative && cmd.length > 5) return;
    // Isim ve komut ayni cumlede geldi
    pendingWakeAlias = heuristicAlias;
    const handled = runVoiceCommand(cmd, rawCmd);
    if (handled) {
      rememberWakeAlias();
      stopListening();
      return;
    }
    // Sezgisel isimden sonra tek anlamsiz kelime kaldiysa ("kitap reis") o da ismin parcasidir: beklemeye gec
    if (summoned || (wake.heuristic && cmd.length === 1)) {
      startListening({ tentative });
      pendingWakeAlias = heuristicAlias;
      return;
    }
    stopListening();
    if (tentative) return; // sessizce vazgec
    showEmote('🤔', 2500);
    if (feedback) say(t('heardLine', { text: rawCmd.join(' ') }), 4000, { replace: true });
    else say(line('unknown'), 4500, { replace: true });
    return;
  }

  if (!isListening()) return;

  // Deneme dinlemesi tek atis: kisa ve net bir komut degilse sessizce kapan
  if (listeningTentative) {
    if (tokens.length > 5) {
      stopListening();
      return;
    }
    lastInteraction = Date.now();
    if (runVoiceCommand(tokens, raw)) {
      rememberWakeAlias();
    }
    stopListening();
    return;
  }

  // Dinleme penceresindeyiz: parcalari biriktir, tamamini dene, olmadiysa beklemeye devam et
  lastInteraction = Date.now();
  pendingCmd.tokens.push(...tokens);
  pendingCmd.raw.push(...raw);
  if (runVoiceCommand(pendingCmd.tokens, pendingCmd.raw)) {
    rememberWakeAlias();
    stopListening();
    return;
  }
  if (pendingCmd.tokens.length > MAX_PENDING_TOKENS) {
    stopListening();
    return;
  }
  showEmote('🤔', 1500);
  showHeard(raw);
  extendListening(LISTEN_EXTEND_MS);
}

// Komutu calistirir; taninmadiysa false doner (soru sormak cagiranin karari).
function runVoiceCommand(tokens, rawTokens, source = 'free') {
  const vc = T.voice;
  const has = (words) => V.hasWord(tokens, words);
  window.ichi.voiceLog(`COMMAND(${source}): ${tokens.join(' ')}`);

  if (isReminderTokens(tokens)) {
    collectReminderPart(source, tokens, rawTokens);
    return true;
  }
  if (has(vc.help)) {
    say(line('help'), 9000, { replace: true });
    return true;
  }
  if (has(vc.mic) && has(vc.off)) {
    say(line('micOffSay'), 4000, { replace: true });
    setTimeout(() => setMic(false), 1500);
    return true;
  }
  if (has(vc.quit) || (has(vc.app) && has(vc.off))) {
    say(line('bye'), 2000, { replace: true });
    setTimeout(() => window.ichi.quitApp(), 1800);
    return true;
  }
  if (has(vc.market)) {
    showMarket();
    return true;
  }
  if (has(vc.corner)) {
    say(line('corner'), 2500, { replace: true });
    setTimeout(goToCorner, 600);
    return true;
  }
  if (has(vc.stay)) {
    setStay(true);
    showEmote('🪑', 2500);
    say(line('stayed'), 3000, { replace: true });
    return true;
  }
  if (has(vc.wander)) {
    setStay(false);
    showEmote('🚶', 2500);
    say(line('wandering'), 3000, { replace: true });
    return true;
  }
  if (has(vc.sleep)) {
    say(line('sleep'), 2500, { replace: true });
    setTimeout(() => sleep('voice'), 900);
    return true;
  }
  if (has(vc.wake)) {
    say(line('awake'), 2500, { replace: true });
    return true;
  }
  if (has(vc.menu)) {
    openMenu();
    return true;
  }
  if (has(vc.quiet)) {
    quietUntil = Date.now() + 3600000;
    say(line('quiet'), 3000, { replace: true });
    return true;
  }
  if (has(vc.hello)) {
    showEmote('👋', 2500);
    wave();
    say(line('hello'), 3500, { replace: true });
    return true;
  }
  if (has(vc.thanks)) {
    showEmote('😊', 2500);
    say(line('thanks'), 3000, { replace: true });
    return true;
  }
  if (has(vc.who)) {
    say(line('whoAmI'), 4000, { replace: true });
    return true;
  }

  const action = matchAction(tokens);
  if (action) {
    window.ichi.voiceLog(`ACTION: ${action.label}`);
    showEmote('🚀', 2500);
    jump();
    say(line('actionDone', { label: action.label }), 3000, { replace: true });
    window.ichi.runAction(action.id);
    return true;
  }
  return false;
}

// ---------- olaylar ----------

marketBtn.addEventListener('click', () => {
  closeMenu();
  showMarket();
});
listenBtn.addEventListener('click', listenNow);
remindersBtn.addEventListener('click', () => {
  renderReminderList();
  showSection('reminders');
  rmMinutesEl.focus();
});
charactersBtn.addEventListener('click', () => showSection('characters'));
actionsBtn.addEventListener('click', () => showSection('actions'));
settingsBtn.addEventListener('click', () => showSection('settings'));
stayBtn.addEventListener('click', () => {
  const next = !stay;
  closeMenu();
  setStay(next);
  showEmote(next ? '🪑' : '🚶', 2500);
  say(line(next ? 'stayed' : 'wandering'), 3000);
});
cornerBtn.addEventListener('click', () => {
  closeMenu();
  say(line('corner'), 2500);
  setTimeout(goToCorner, 600);
});
waveBtn.addEventListener('click', () => {
  closeMenu();
  showEmote('👋', 2500);
  wave();
  say(line('hello'), 3500);
});
shortcutsBtn.addEventListener('click', () => {
  showSection('shortcuts');
  scLabelEl.focus();
});
scBackBtn.addEventListener('click', () => showSection('settings'));
for (const btn of document.querySelectorAll('.btn-back')) {
  btn.addEventListener('click', () => showSection('main'));
}

languageBtn.addEventListener('click', () => setLanguage(lang === 'tr' ? 'en' : 'tr'));
micBtn.addEventListener('click', () => setMic(!micOn));
micDeviceBtn.addEventListener('click', cycleMicDevice);
teachBtn.addEventListener('click', startTeaching);
feedbackBtn.addEventListener('click', () => {
  feedback = !feedback;
  saveItem('feedback', feedback ? '1' : '0');
  updateFeedbackButton();
});
autostartBtn.addEventListener('click', async () => {
  const on = await window.ichi.getAutostart();
  await window.ichi.setAutostart(!on);
  await refreshAutostart();
});
sleepBtn.addEventListener('click', () => {
  if (sleeping) {
    wakeUp('menu');
  } else {
    closeMenu();
    say(line('sleep'), 2500);
    setTimeout(() => sleep('menu'), 900);
  }
});
quitBtn.addEventListener('click', () => window.ichi.quitApp());

scAddBtn.addEventListener('click', addShortcut);
for (const input of [scLabelEl, scTargetEl, scVoiceEl]) {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addShortcut();
  });
}

async function addReminderFromForm() {
  const minutes = Math.round(Number(rmMinutesEl.value));
  if (!minutes || minutes < 1) {
    rmMinutesEl.focus();
    return;
  }
  await addReminder(minutes, rmTextEl.value.trim(), false);
  rmMinutesEl.value = '';
  rmTextEl.value = '';
}
rmAddBtn.addEventListener('click', addReminderFromForm);
for (const input of [rmMinutesEl, rmTextEl]) {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addReminderFromForm();
  });
}

closeBtn.addEventListener('click', () => {
  if (menuOpen()) closeMenu();
});

init();
