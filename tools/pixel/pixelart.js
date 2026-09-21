// Kucuk piksel cizim kutuphanesi: 50x60 izgara, otomatik kontur + golge, dikdortgen birlestirme
// ve SVG ciktisi. Her karakter parcasi (govde, kol, bacak, kuyruk) kendi katmaninda cizilir ki
// mevcut animasyonlar (#leg-left, #arm-right ...) aynen calissin.

const GRID_W = 50;
const GRID_H = 60;
const PX = 3; // 1 piksel = 3 birim (50x60 -> 150x180 viewBox)

class Canvas {
  constructor(w = GRID_W, h = GRID_H) {
    this.w = w;
    this.h = h;
    this.g = Array.from({ length: h }, () => Array(w).fill('.'));
  }

  set(x, y, ch) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.g[y][x] = ch;
  }

  get(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return '.';
    return this.g[y][x];
  }

  rect(x, y, w, h, ch) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, ch);
    return this;
  }

  // Dolu elips (piksel merkezleri kontrol edilir)
  ellipse(cx, cy, rx, ry, ch) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.02) this.set(x, y, ch);
      }
    }
    return this;
  }

  // Kose yuvarlatilmis dikdortgen
  roundRect(x, y, w, h, r, ch) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const dx = i < r ? r - i : i >= w - r ? i - (w - r - 1) : 0;
        const dy = j < r ? r - j : j >= h - r ? j - (h - r - 1) : 0;
        if (dx * dx + dy * dy > r * r + r) continue;
        this.set(x + i, y + j, ch);
      }
    }
    return this;
  }

  // Yukari bakan ucgen (kulak, boynuz)
  triUp(x, y, w, h, ch) {
    for (let j = 0; j < h; j++) {
      const t = j / (h - 1 || 1);
      const half = Math.max(0.5, (w / 2) * t);
      for (let i = Math.round(w / 2 - half); i <= Math.round(w / 2 + half - 1); i++) this.set(x + i, y + j, ch);
    }
    return this;
  }

  // Metin izgarasindan damga (nokta = seffaf)
  stamp(rows, x, y) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') this.set(x + i, y + j, ch);
      });
    });
    return this;
  }

  // Bir rengi digeriyle degistirir
  replace(from, to) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.g[y][x] === from) this.g[y][x] = to;
    return this;
  }

  // Tek basina duran / sivri cikan pikselleri temizler (kontur oncesi calistirilir)
  smooth(passes = 1) {
    for (let k = 0; k < passes; k++) {
      const drop = [];
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (this.g[y][x] === '.') continue;
          const n = [this.get(x - 1, y), this.get(x + 1, y), this.get(x, y - 1), this.get(x, y + 1)].filter(
            (c) => c !== '.'
          ).length;
          if (n <= 1) drop.push([x, y]);
        }
      }
      for (const [x, y] of drop) this.set(x, y, '.');
    }
    return this;
  }

  // Dolu piksellere komsu seffaf pikselleri kontur rengiyle doldurur
  outline(ch = '#') {
    const add = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.g[y][x] !== '.') continue;
        const n = [this.get(x - 1, y), this.get(x + 1, y), this.get(x, y - 1), this.get(x, y + 1)];
        if (n.some((c) => c !== '.' && c !== ch)) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.set(x, y, ch);
    return this;
  }

  // Isik sol ustten: sol ust kenarlar acilir, sag alt kenarlar koyulasir
  bevel(map, lineCh = '#') {
    const empty = (c) => c === '.' || c === lineCh;
    const out = this.g.map((row) => [...row]);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.g[y][x];
        const m = map[c];
        if (!m) continue;
        if (m.dark && empty(this.get(x + 1, y + 1)) && !empty(this.get(x - 1, y - 1))) out[y][x] = m.dark;
        else if (m.light && empty(this.get(x - 1, y - 1)) && !empty(this.get(x + 1, y + 1))) out[y][x] = m.light;
      }
    }
    this.g = out;
    return this;
  }

  // Ayni renkteki komsu pikselleri az sayida dikdortgene indirger (acgozlu 2B birlestirme)
  toRects(palette, ox = 0, oy = 0) {
    const used = Array.from({ length: this.h }, () => Array(this.w).fill(false));
    const out = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const ch = this.g[y][x];
        if (ch === '.' || used[y][x] || !palette[ch]) continue;
        let w = 1;
        while (x + w < this.w && this.g[y][x + w] === ch && !used[y][x + w]) w++;
        let h = 1;
        grow: while (y + h < this.h) {
          for (let i = 0; i < w; i++) {
            if (this.g[y + h][x + i] !== ch || used[y + h][x + i]) break grow;
          }
          h++;
        }
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) used[y + j][x + i] = true;
        out.push(
          `<rect x="${(ox + x) * PX}" y="${(oy + y) * PX}" width="${w * PX}" height="${h * PX}" fill="${palette[ch]}"/>`
        );
      }
    }
    return out.join('');
  }
}

module.exports = { Canvas, GRID_W, GRID_H, PX };
