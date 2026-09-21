// tools/pixel/characters.js icindeki tanimlardan renderer/characters.js dosyasini uretir.
// Kullanim: npm run characters
const fs = require('fs');
const path = require('path');
const { characters } = require('./characters');

const header = `// OTOMATIK URETILDI - elle duzenlemeyin.
// Kaynak: tools/pixel/characters.js + tools/pixel/pixelart.js  (yeniden uretmek icin: npm run characters)
// Karakterler 50x60 piksel izgarasinda cizilir, ayni viewBox (0 0 150 180) ve ayni iskelet
// kancalarini kullanir: #leg-left, #leg-right, #arm-left, #arm-right (yurume/numara animasyonlari),
// .eye-open / .eye-closed / .wink-eye (goz kirpma), .hacker-gear (Barkinzo hacker yetenegi).
window.KITZO_CHARACTERS = [
`;

const body = characters
  .map(
    (c) => `  {
    id: '${c.id}',
    name: '${c.name}',
    emoji: '${c.emoji}',
    svg: \`${c.svg}\`,
  },`
  )
  .join('\n');

const out = `${header}${body}\n];\n`;
const target = path.join(__dirname, '..', '..', 'renderer', 'characters.js');
fs.writeFileSync(target, out);
console.log(`${characters.length} karakter yazildi -> ${target} (${Math.round(out.length / 1024)} KB)`);
