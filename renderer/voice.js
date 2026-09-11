// Ses tanima yardimcilari: metin normalizasyonu, bulanik eslestirme, sure ayristirma ve Vosk dinleyicisi
(function () {
  const TR_MAP = { ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u', â: 'a', î: 'i', û: 'u' };

  function normalizeToken(s) {
    return String(s || '')
      .toLocaleLowerCase('tr')
      .replace(/[ışğçöüâîû]/g, (ch) => TR_MAP[ch] || ch)
      .replace(/[^a-z0-9]/g, '');
  }

  function normalize(s) {
    return String(s || '').split(/\s+/).map(normalizeToken).filter(Boolean).join(' ');
  }

  function tokenize(text) {
    const tokens = [];
    const raw = [];
    for (const word of String(text || '').trim().split(/\s+/)) {
      const n = normalizeToken(word);
      if (!n) continue;
      tokens.push(n);
      raw.push(word.toLocaleLowerCase('tr'));
    }
    return { tokens, raw };
  }

  function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  function fuzzyEq(token, word) {
    if (!token || !word) return false;
    if (token === word) return true;
    const n = Math.max(token.length, word.length);
    if (n < 4) return false;
    const d = levenshtein(token, word);
    if (d <= 1) return true;
    return d === 2 && n >= 6 && token.slice(0, 3) === word.slice(0, 3);
  }

  function hasWord(tokens, words) {
    return (words || []).some((w) => {
      const nw = normalize(w);
      return nw && tokens.some((t) => fuzzyEq(t, nw));
    });
  }

  function phraseScore(tokens, phrase, stopWords) {
    const words = normalize(phrase).split(' ').filter(Boolean);
    if (!words.length) return 0;
    let hits = 0;
    let strong = false;
    for (const w of words) {
      if (!tokens.some((t) => fuzzyEq(t, w))) continue;
      hits++;
      if (w.length >= 3 && !stopWords.has(w)) strong = true;
    }
    if (!hits) return 0;
    if (!strong && hits < words.length) return 0;
    return hits / words.length;
  }

  // Uyandirma sozcukleri icin siki eslesme: kisa adlarda birebir, uzunlarda en fazla 1 harf farki.
  function wakeEq(token, name) {
    if (token === name) return true;
    if (name.length < 5 || Math.abs(token.length - name.length) > 1) return false;
    return levenshtein(token, name) <= 1;
  }

  // Ad yalnizca cumlenin basinda (ilk iki kelime icinde) aranir; startOnly adlar sadece ilk kelime olabilir.
  function findWake(tokens, names, startOnly, maxIndex = 1) {
    const limit = Math.min(tokens.length - 1, maxIndex);
    for (let i = 0; i <= limit; i++) {
      const pair = i + 1 < tokens.length ? tokens[i] + tokens[i + 1] : null;
      for (const n of names) {
        if (startOnly && startOnly.has(n) && i !== 0) continue;
        if (wakeEq(tokens[i], n)) return { index: i, length: 1, name: n };
        if (pair && wakeEq(pair, n)) return { index: i, length: 2, name: n };
      }
    }
    return null;
  }

  function evaluateNumberWords(words, numbers) {
    let total = 0;
    let cur = 0;
    for (const w of words) {
      if (/^\d+([.,]\d+)?$/.test(w)) {
        cur += parseFloat(w.replace(',', '.'));
        continue;
      }
      const n = numbers[w];
      if (n >= 100) {
        cur = (cur || 1) * n;
        total += cur;
        cur = 0;
      } else {
        cur += n;
      }
    }
    return total + cur;
  }

  function parseDuration(tokens, cfg) {
    const units = Object.entries(cfg.units).map(([w, m]) => [normalize(w), m]);
    let unitIdx = -1;
    let mul = 0;
    outer: for (let i = 0; i < tokens.length; i++) {
      for (const [w, m] of units) {
        if (fuzzyEq(tokens[i], w)) {
          unitIdx = i;
          mul = m;
          break outer;
        }
      }
    }
    if (unitIdx < 0) return null;

    const numbers = {};
    for (const [w, n] of Object.entries(cfg.numbers)) numbers[normalize(w)] = n;
    const half = new Set(cfg.half.map(normalize));
    const filler = new Set([...cfg.articles, ...cfg.glue].map(normalize));

    const used = new Set([unitIdx]);
    const numberWords = [];
    let isHalf = false;
    for (let j = unitIdx - 1; j >= 0; j--) {
      const t = tokens[j];
      if (/^\d+([.,]\d+)?$/.test(t) || t in numbers) {
        numberWords.unshift(t);
        used.add(j);
        continue;
      }
      if (half.has(t)) {
        isHalf = true;
        used.add(j);
        continue;
      }
      if (filler.has(t)) {
        used.add(j);
        continue;
      }
      break;
    }
    let value = evaluateNumberWords(numberWords, numbers);
    if (isHalf) value += 0.5;
    if (!value) value = 1;
    return { minutes: value * mul, used };
  }

  function parseReminder(tokens, raw, cfg) {
    const dur = parseDuration(tokens, cfg);
    const skip = new Set(cfg.skip.map(normalize));
    const triggers = cfg.reminder.map(normalize);
    const note = [];
    for (let i = 0; i < tokens.length; i++) {
      if (dur && dur.used.has(i)) continue;
      const t = tokens[i];
      if (skip.has(t) || triggers.some((tr) => t.startsWith(tr))) continue;
      note.push(raw[i]);
    }
    return {
      minutes: dur ? Math.max(1, Math.round(dur.minutes)) : cfg.defaultMinutes || 10,
      note: note.join(' '),
    };
  }

  // Mikrofonu dinleyip Vosk'a besler. Sessizlikte CPU harcamamak icin basit bir ses kapisi (gate) var.
  // Kullanilabilir mikrofonlar (etiketler izin verildikten sonra gorunur)
  async function listMicrophones() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({ id: d.deviceId, label: d.label || d.deviceId.slice(0, 8) }));
  }

  async function createListener({ modelUrl, onResult, onPartial, onSpeech, deviceId }) {
    if (!window.Vosk) throw new Error('vosk-browser not loaded');
    const model = await window.Vosk.createModel(modelUrl);
    const ctx = new AudioContext();
    await ctx.resume();
    const recognizer = new model.KaldiRecognizer(ctx.sampleRate);
    recognizer.on('result', (msg) => {
      const text = (msg.result && msg.result.text) || '';
      if (text.trim()) onResult(text);
    });
    recognizer.on('partialresult', (msg) => {
      const text = (msg.result && msg.result.partial) || '';
      if (text.trim()) onPartial(text);
    });

    const audio = { echoCancellation: true, noiseSuppression: true, channelCount: 1 };
    if (deviceId) audio.deviceId = { exact: deviceId };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: false, audio });
    } catch (err) {
      if (!deviceId) throw err;
      // secili cihaz yoksa varsayilana dus
      delete audio.deviceId;
      stream = await navigator.mediaDevices.getUserMedia({ video: false, audio });
    }
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    let noiseFloor = 0.002;
    let activeUntil = 0;
    let previous = null;
    let lastSpeechCallback = 0;
    let speechLevel = 0.02;
    const stats = { frames: 0, speechFrames: 0, peak: 0 };
    node.onaudioprocess = (e) => {
      const data = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / (data.length / 4));
      if (rms < noiseFloor * 2) noiseFloor = noiseFloor * 0.95 + rms * 0.05;
      const now = performance.now();
      const wasActive = now < activeUntil;
      stats.frames++;
      if (rms > stats.peak) stats.peak = rms;
      if (rms > Math.max(0.003, noiseFloor * 4)) {
        stats.speechFrames++;
        activeUntil = now + 1800;
        speechLevel = speechLevel * 0.9 + rms * 0.1;
        if (onSpeech && now - lastSpeechCallback > 500) {
          lastSpeechCallback = now;
          onSpeech();
        }
      }
      // Sessiz mikrofonlar icin otomatik kazanc: konusma seviyesini ~0.08 RMS'e cek
      const gain = Math.min(10, Math.max(1, 0.08 / Math.max(speechLevel, 0.004)));
      const scaled = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) scaled[i] = Math.max(-1, Math.min(1, data[i] * gain));
      if (now < activeUntil) {
        try {
          // kapi yeni acildiysa bir onceki parcayi da ver ki ilk hece kirpilmasin
          if (!wasActive && previous) recognizer.acceptWaveformFloat(previous, ctx.sampleRate);
          recognizer.acceptWaveformFloat(scaled, ctx.sampleRate);
        } catch (err) {
          console.error('acceptWaveform', err);
        }
      }
      previous = scaled;
    };
    source.connect(node);
    node.connect(ctx.destination);

    const track = stream.getAudioTracks()[0];
    return {
      deviceLabel: track ? track.label : '',
      sampleRate: ctx.sampleRate,
      // Teshis icin: son okumadan beri kac ses karesi geldi, kaci konusma sayildi, en yuksek seviye
      readStats() {
        const out = { ...stats, noiseFloor, speechLevel };
        stats.frames = 0;
        stats.speechFrames = 0;
        stats.peak = 0;
        return out;
      },
      stop() {
        try {
          node.disconnect();
          source.disconnect();
          stream.getTracks().forEach((t) => t.stop());
          recognizer.remove();
          model.terminate();
          ctx.close();
        } catch (err) {
          console.error('voice stop', err);
        }
      },
      // Test amacli: bir WAV dosyasini mikrofon yerine taniyiciya besler.
      async feedUrl(url) {
        const buf = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
        const data = buf.getChannelData(0);
        const chunk = 4096;
        for (let i = 0; i < data.length; i += chunk) {
          const b = ctx.createBuffer(1, chunk, buf.sampleRate);
          b.getChannelData(0).set(data.subarray(i, i + chunk));
          recognizer.acceptWaveform(b);
        }
        recognizer.acceptWaveform(ctx.createBuffer(1, buf.sampleRate * 2, buf.sampleRate));
      },
    };
  }

  window.KitzoVoice = { normalize, tokenize, fuzzyEq, hasWord, phraseScore, findWake, parseReminder, createListener, listMicrophones };
})();
