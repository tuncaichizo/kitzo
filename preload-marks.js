// Ekran izleri penceresi (renderer/marks.html) icin kucuk kopru
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('marks', {
  onPlay: (cb) => ipcRenderer.on('marks-play', (_e, data) => cb(data)),
  done: () => ipcRenderer.send('marks-done'),
});
