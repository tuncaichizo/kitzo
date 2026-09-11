const fs = require('fs');
const path = require('path');

let file = null;
let list = [];
let onDue = null;

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

function check() {
  const now = Date.now();
  const due = list.filter((r) => r.dueAt <= now);
  if (!due.length) return;
  list = list.filter((r) => r.dueAt > now);
  save();
  due.forEach((r) => onDue(r));
}

function init(storeFile, dueHandler) {
  file = storeFile;
  onDue = dueHandler;
  list = load();
  setInterval(check, 1000);
}

function all() {
  return list;
}

function add({ minutes, text }) {
  const mins = Math.min(100000, Math.max(1, Math.round(Number(minutes) || 0)));
  const note = String(text || '').trim().slice(0, 80);
  if (!mins) return list;
  list.push({ id: `r-${Date.now()}`, minutes: mins, text: note, dueAt: Date.now() + mins * 60000 });
  save();
  return list;
}

function remove(id) {
  list = list.filter((r) => r.id !== id);
  save();
  return list;
}

module.exports = { init, all, add, remove };
