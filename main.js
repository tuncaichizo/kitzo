const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  shell,
  globalShortcut,
  powerMonitor,
  Notification,
  session,
  Tray,
  Menu,
  nativeImage,
} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const market = require('./lib/market');
const reminders = require('./lib/reminders');
const voiceModel = require('./lib/voice-model');

const APP_NAME = 'Kitzo';
const CHAR_W = 170;
const CHAR_H = 240; // 204 karakter + 36 emote alani
const IDLE_SLEEP_SECONDS = 20 * 60;
const VOICE_TEST_ARG = '--voice-test=';
const EXPORT_ICON_ARG = '--export-icon=';

let win;
let tray;
let lastMarket = null;

function userFile(name) {
  return path.join(app.getPath('userData'), name);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function argValue(prefix) {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

// ---------- ayarlar ----------

function getSettings() {
  return readJson(userFile('settings.json'), {});
}

function patchSettings(patch) {
  writeJson(userFile('settings.json'), { ...getSettings(), ...patch });
}

function isAutostart() {
  return getSettings().autostart ?? true;
}

function setAutostart(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    name: APP_NAME,
    path: process.execPath,
    args: app.isPackaged ? [] : [app.getAppPath()],
  });
  patchSettings({ autostart: enabled });
}

function getLanguage() {
  const lang = getSettings().language;
  return lang === 'tr' || lang === 'en' ? lang : 'en';
}

// ---------- kisayollar ----------
// Kullanicinin kisayollari userData'da tutulur; proje icindeki actions.json sadece ilk kurulum sablonudur.

function loadActions() {
  const file = userFile('actions.json');
  if (!fs.existsSync(file)) {
    writeJson(file, readJson(path.join(__dirname, 'actions.json'), []));
  }
  const actions = readJson(file, []);
  return Array.isArray(actions) ? actions.filter((a) => a && a.type !== 'quit') : [];
}

function saveActions(actions) {
  writeJson(userFile('actions.json'), actions);
  return actions;
}

function parseVoice(voice) {
  const words = String(voice || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return words.length ? words : undefined;
}

function addAction({ label, target, voice }) {
  label = String(label || '').trim().slice(0, 40);
  target = String(target || '').trim();
  if (!label || !target) return loadActions();

  const type = /^https?:\/\//i.test(target) ? 'url' : 'app';
  const action = {
    id: `custom-${Date.now()}`,
    label,
    icon: type === 'url' ? '🔗' : '🖥️',
    type,
    target,
    voice: parseVoice(voice),
  };
  return saveActions([...loadActions(), action]);
}

function removeAction(id) {
  return saveActions(loadActions().filter((a) => a.id !== id));
}

function runAction(id) {
  const action = loadActions().find((a) => a.id === id);
  if (!action) return;

  if (action.type === 'url' && action.target) {
    shell.openExternal(action.target);
  } else if (action.type === 'app' && action.target) {
    if (fs.existsSync(action.target)) {
      shell.openPath(action.target);
    } else {
      spawn('cmd', ['/c', 'start', '', action.target], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }).unref();
    }
  }
}

function notify(title, body) {
  if (Notification.isSupported()) new Notification({ title, body }).show();
}

function appendVoiceLog(text) {
  const file = userFile('voice.log');
  try {
    if (fs.existsSync(file) && fs.statSync(file).size > 256 * 1024) {
      fs.rmSync(`${file}.old`, { force: true });
      fs.renameSync(file, `${file}.old`);
    }
  } catch {}
  fs.appendFile(file, `${new Date().toISOString()} ${text}\n`, () => {});
}

function openMenuFromOutside() {
  if (!win) return;
  win.show();
  win.focus();
  send('toggle-menu');
}

// ---------- sistem tepsisi ----------

function updateTrayMenu() {
  if (!tray) return;
  const tr = getLanguage() === 'tr';
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: tr ? 'Menüyü Aç' : 'Open Menu', click: openMenuFromOutside },
      {
        label: tr ? 'Göster / Gizle' : 'Show / Hide',
        click: () => (win.isVisible() ? win.hide() : win.show()),
      },
      { type: 'separator' },
      { label: tr ? 'Çıkış' : 'Quit', click: () => app.quit() },
    ])
  );
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'build', 'icon.png')).resize({ width: 32, height: 32 });
  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);
  tray.on('click', openMenuFromOutside);
  updateTrayMenu();
}

// ---------- pencere ----------

// Kayitli konum hala bir ekranin icindeyse orada ac; yoksa ana ekranin sag alt kosesi
function startPosition() {
  const saved = getSettings().position;
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    const cx = saved.x + CHAR_W / 2;
    const cy = saved.y + CHAR_H / 2;
    const inside = screen.getAllDisplays().some((d) => {
      const a = d.workArea;
      return cx >= a.x && cx < a.x + a.width && cy >= a.y && cy < a.y + a.height;
    });
    if (inside) return { x: Math.round(saved.x), y: Math.round(saved.y) };
  }
  const { x: ax, y: ay, width: aw, height: ah } = screen.getPrimaryDisplay().workArea;
  return { x: ax + aw - CHAR_W - 30, y: ay + ah - CHAR_H };
}

let savePositionTimer = null;
function rememberPosition(x, y) {
  clearTimeout(savePositionTimer);
  savePositionTimer = setTimeout(() => patchSettings({ position: { x, y } }), 800);
}

function createWindow() {
  const start = startPosition();

  win = new BrowserWindow({
    width: CHAR_W,
    height: CHAR_H,
    x: start.x,
    y: start.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function registerIpc() {
  ipcMain.handle('get-displays', () => screen.getAllDisplays().map((d) => d.workArea));
  ipcMain.handle('get-position', () => win.getPosition());

  ipcMain.handle('get-actions', () => loadActions());
  ipcMain.handle('add-action', (_e, data) => addAction(data || {}));
  ipcMain.handle('remove-action', (_e, id) => removeAction(id));
  ipcMain.on('run-action', (_e, id) => runAction(id));

  ipcMain.handle('get-autostart', () => isAutostart());
  ipcMain.handle('set-autostart', (_e, enabled) => {
    setAutostart(Boolean(enabled));
    return isAutostart();
  });

  ipcMain.handle('get-language', () => getLanguage());
  ipcMain.handle('set-language', (_e, lang) => {
    patchSettings({ language: lang === 'tr' ? 'tr' : 'en' });
    updateTrayMenu();
    return getLanguage();
  });

  ipcMain.handle('get-market', () => lastMarket);

  ipcMain.handle('get-reminders', () => reminders.all());
  ipcMain.handle('add-reminder', (_e, data) => reminders.add(data || {}));
  ipcMain.handle('remove-reminder', (_e, id) => reminders.remove(id));

  ipcMain.handle('voice-model-url', (_e, lang) =>
    voiceModel.ensure(userFile('models'), lang, (p) => send('voice-model-progress', p))
  );
  ipcMain.on('voice-log', (_e, text) => appendVoiceLog(String(text)));
  ipcMain.on('voice-ready', async () => {
    const wav = argValue(VOICE_TEST_ARG);
    if (!wav) return;
    const url = await voiceModel.publish(wav, 'voice-test.wav');
    if (url) send('voice-test', { url, teach: process.argv.includes('--voice-teach'), char: argValue('--char=') });
  });

  ipcMain.on('quit-app', () => app.quit());

  ipcMain.on('move-window', (_e, { x, y }) => {
    win.setPosition(Math.round(x), Math.round(y), false);
    rememberPosition(Math.round(x), Math.round(y));
  });

  ipcMain.on('set-overlay', (_e, { open, extra, below }) => {
    const b = win.getBounds();
    if (open) {
      win.setBounds({ x: b.x, y: below ? b.y : b.y - extra, width: CHAR_W, height: CHAR_H + extra });
    } else {
      win.setBounds({ x: b.x, y: below ? b.y : b.y + extra, width: CHAR_W, height: CHAR_H });
    }
  });
}

// Gelistirme yardimcisi: karakteri 256x256 PNG olarak disari aktarir (kurulum ikonu icin).
function exportIcon(outPath) {
  const iconWin = new BrowserWindow({
    width: 256,
    height: 256,
    show: false,
    transparent: true,
    frame: false,
    webPreferences: { offscreen: true },
  });
  iconWin.loadFile(path.join(__dirname, 'renderer', 'icon.html'));
  iconWin.webContents.once('did-finish-load', () => {
    setTimeout(async () => {
      const img = await iconWin.webContents.capturePage({ x: 0, y: 0, width: 256, height: 256 });
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, img.toPNG());
      app.quit();
    }, 1200);
  });
}

const exportingIcon = Boolean(argValue(EXPORT_ICON_ARG));

// Ayni anda iki Kitzo calismasin; ikinci deneme mevcut olanin menusunu acar.
if (!exportingIcon && !app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', openMenuFromOutside);

app.whenReady().then(() => {
  if (exportingIcon) {
    exportIcon(path.resolve(argValue(EXPORT_ICON_ARG)));
    return;
  }

  app.setAppUserModelId('com.kitzo.app');
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'media');
  });

  setAutostart(isAutostart());
  registerIpc();
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Alt+K', openMenuFromOutside);
  globalShortcut.register('CommandOrControl+Alt+L', () => send('listen-now'));

  market.start((data) => {
    lastMarket = data;
    send('market-update', data);
  });

  reminders.init(userFile('reminders.json'), (r) => {
    send('reminder-due', r);
    notify(`⏰ ${APP_NAME}`, r.text || 'Reminder');
  });

  setInterval(() => {
    send('system-idle', powerMonitor.getSystemIdleTime() >= IDLE_SLEEP_SECONDS);
  }, 30000);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
