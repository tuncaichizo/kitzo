const http = require('http');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const tar = require('tar');

const MODELS = {
  tr: 'vosk-model-small-tr-0.3',
  en: 'vosk-model-small-en-us-0.15',
};
const BASE_URL = 'https://alphacephei.com/vosk/models/';

let server = null;
let serverDir = null;
let port = 0;

async function download(url, dest, onProgress) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`download failed: ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  const file = fs.createWriteStream(dest);
  let got = 0;
  let lastPct = -1;
  for await (const chunk of res.body) {
    if (!file.write(chunk)) await new Promise((r) => file.once('drain', r));
    got += chunk.length;
    const pct = total ? Math.floor((got / total) * 100) : 0;
    if (pct !== lastPct) {
      lastPct = pct;
      onProgress(pct / 100);
    }
  }
  await new Promise((resolve, reject) => file.end((err) => (err ? reject(err) : resolve())));
}

// vosk-browser modeli fetch ile ister; file:// sayfadan fetch yapilamadigi icin yerel bir sunucu kullaniyoruz.
function startServer(dir) {
  serverDir = dir;
  if (server) return Promise.resolve();
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      const name = path.basename(decodeURIComponent(req.url.split('?')[0]));
      const file = path.join(serverDir, name);
      if (!name || !fs.existsSync(file)) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fs.statSync(file).size,
        'Access-Control-Allow-Origin': '*',
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve();
    });
  });
}

async function ensure(dir, lang, onProgress) {
  const name = MODELS[lang] || MODELS.en;
  fs.mkdirSync(dir, { recursive: true });
  const tgz = path.join(dir, `${name}.tar.gz`);
  if (!fs.existsSync(tgz)) {
    const zip = path.join(dir, `${name}.zip`);
    onProgress({ stage: 'download', value: 0 });
    await download(`${BASE_URL}${name}.zip`, zip, (v) => onProgress({ stage: 'download', value: v }));
    onProgress({ stage: 'extract', value: 0 });
    new AdmZip(zip).extractAllTo(dir, true);
    await tar.c({ gzip: true, file: tgz, cwd: dir }, [name]);
    fs.rmSync(zip, { force: true });
    fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
  await startServer(dir);
  return `http://127.0.0.1:${port}/${name}.tar.gz`;
}

async function publish(src, name) {
  if (!serverDir || !fs.existsSync(src)) return null;
  fs.copyFileSync(src, path.join(serverDir, name));
  await startServer(serverDir);
  return `http://127.0.0.1:${port}/${name}`;
}

module.exports = { ensure, publish, MODELS };
