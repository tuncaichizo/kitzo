const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (cb) => ipcRenderer.on(channel, (_e, data) => cb(data));

contextBridge.exposeInMainWorld('ichi', {
  moveWindow: (x, y, remember = true) => ipcRenderer.send('move-window', { x, y, remember }),
  setOverlay: (opts) => ipcRenderer.send('set-overlay', opts),
  runAction: (id) => ipcRenderer.send('run-action', id),
  quitApp: () => ipcRenderer.send('quit-app'),
  voiceLog: (text) => ipcRenderer.send('voice-log', text),
  voiceReady: () => ipcRenderer.send('voice-ready'),
  throwMark: (data) => ipcRenderer.send('throw-mark', data),

  getDisplays: () => ipcRenderer.invoke('get-displays'),
  getPosition: () => ipcRenderer.invoke('get-position'),
  getCursor: () => ipcRenderer.invoke('get-cursor'),
  getActions: () => ipcRenderer.invoke('get-actions'),
  addAction: (data) => ipcRenderer.invoke('add-action', data),
  removeAction: (id) => ipcRenderer.invoke('remove-action', id),
  getAutostart: () => ipcRenderer.invoke('get-autostart'),
  setAutostart: (enabled) => ipcRenderer.invoke('set-autostart', enabled),
  getLanguage: () => ipcRenderer.invoke('get-language'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),
  getMarket: () => ipcRenderer.invoke('get-market'),
  getReminders: () => ipcRenderer.invoke('get-reminders'),
  addReminder: (data) => ipcRenderer.invoke('add-reminder', data),
  removeReminder: (id) => ipcRenderer.invoke('remove-reminder', id),
  getVoiceModelUrl: (lang) => ipcRenderer.invoke('voice-model-url', lang),

  onMarket: on('market-update'),
  onReminderDue: on('reminder-due'),
  onToggleMenu: on('toggle-menu'),
  onSystemIdle: on('system-idle'),
  onVoiceProgress: on('voice-model-progress'),
  onVoiceTest: on('voice-test'),
  onSetCharacter: on('set-character'),
  onListenNow: on('listen-now'),
  onThrowNow: on('throw-now'),
  onAnticNow: on('antic-now'),
});
