# Kitzo

A tiny desktop buddy that lives in the corner of your screen. It wanders around, talks to you,
listens for voice commands, opens your favorite sites and apps, shows crypto prices and sets reminders.
Everything runs **locally and for free** — no accounts, no API keys.

*(Türkçe açıklama aşağıda.)*

## Features

- **10 characters** – Kitzo the cyber cat, Zumi, Byto, Fyra, Nocto, Wispa, Drayko, Nubi, Özgezo and Barkınzo. Switch any time from the menu or just say a character's name.
- **Voice commands** – say the character's name, then a command: *"open YouTube"*, *"prices"*, *"remind me in 15 minutes coffee"*, *"sleep"*, *"stay"*, *"menu"*. Speech recognition runs fully offline (Vosk); the installer already contains the Turkish and English models, so nothing is downloaded. (When running from source, a missing model is fetched once into `models/`.)
- **Shortcuts** – add your own buttons (links or programs) with optional voice keywords.
- **Market mood** – BTC/ETH prices with 24h change; the buddy gets excited or sad on big moves.
- **Reminders** – from the menu or by voice, with a desktop notification.
- **Personality** – time-of-day greetings, random quips, reactions to dragging and click spam, sleeps at night or when you're away.
- **Actions** – stay / wander, go to corner, wave, throw, sleep.
- **Tricks** – every couple of minutes it performs a random trick: backflip, spin, stretch, looking around, moonwalk, dash, peeking from the screen edge, coffee break, scratching, sneezing, hops, juggling, watching your mouse, dizzy spin, push-ups, ninja vanish, kicking a ball, a power nap or a dance. Actions → Do a Trick, or ask by name: *"backflip"*, *"moonwalk"*, *"juggle"*, *"vanish"*…
- **Screen marks** – every few minutes it throws something onto the screen (paint splat, paw prints, a coin, a star, a sticker, confetti, bubbles) that fades within 5 seconds. Trigger it from Actions or say *"throw something"*; switch it off in Settings.
- **Multi-monitor** – drag it to any screen.
- **Global hotkeys** – `Ctrl+Alt+K` opens the menu anywhere; `Ctrl+Alt+L` listens for a command right away (no wake word needed — handy in noisy rooms).
- **Turkish / English** UI and voice.

## Install

**Windows** – download `Kitzo-Setup-x.y.z.exe` from the [Releases](../../releases) page and run it.

**Linux (x64)** – download `Kitzo-x.y.z-x86_64.AppImage`, make it executable and run it:

```bash
chmod +x Kitzo-*.AppImage
./Kitzo-*.AppImage
```

Debian/Ubuntu users can install `Kitzo-x.y.z-amd64.deb` instead:

```bash
sudo apt install ./Kitzo-*-amd64.deb
```

Kitzo starts on login by default (you can turn that off in Settings). On Linux a compositing
desktop is required for the transparent window (GNOME, KDE and most modern desktops have it).

## Run from source

```bash
npm install
npm start
```

## Privacy

Audio never leaves your computer (offline recognition). Market data is fetched from Binance's public API
(CoinGecko as fallback). Your shortcuts, reminders and settings are stored in `%APPDATA%\kitzo`
on Windows and in `~/.config/kitzo` on Linux.

## License

Free for personal use. Copying, modifying or redistributing the code, characters and artwork is not permitted.
See [LICENSE](LICENSE).

---

## Türkçe

Ekranınızın köşesinde yaşayan minik bir masaüstü dostu. Gezinir, konuşur, sesli komutlarınızı dinler,
sık kullandığınız siteleri/uygulamaları açar, kripto fiyatlarını gösterir ve hatırlatıcı kurar.
Her şey **yerel ve ücretsiz** çalışır — hesap ya da API anahtarı gerekmez.

- **10 karakter** – menüden seçin ya da adını söyleyin.
- **Sesli komutlar** – karakterin adını söyleyip komut verin: *"YouTube aç"*, *"fiyatlar"*,
  *"15 dakika sonra hatırlat kahve"*, *"uyu"*, *"bekle"*, *"köşeye git"*, *"menü"*.
- **Kısayollar** – Ayarlar → Kısayolları Düzenle'den kendi butonlarınızı ekleyin (sesli kelimelerle).
- **Piyasa, hatırlatıcı, eylemler, dil seçimi, Ctrl+Alt+K** kısayolu.
- **Numaralar** – birkaç dakikada bir rastgele bir numara yapar: takla, dönme, gerinme, etrafa bakınma, moonwalk, koşu, kenardan bakma, kahve molası, kaşınma, hapşırma, zıplama, hokkabazlık, fareyi izleme, baş dönmesi, şınav, ninja kaybolması, topa vurma, şekerleme, dans. Eylemler → Numara Yap ya da adıyla iste: *"takla at"*, *"moonwalk"*, *"hokkabazlık"*, *"kaybol"*…
- **Ekran izleri** – ara sıra ekrana bir şey fırlatır (boya lekesi, pati izi, coin, yıldız, çıkartma, konfeti, baloncuk); iz 5 saniye içinde silinir. Eylemler → Fırlat ya da "fırlat" de; Ayarlar'dan kapatılabilir.

**Kurulum (Windows):** [Releases](../../releases) sayfasından `Kitzo-Setup-x.y.z.exe` dosyasını indirip çalıştırın.

**Kurulum (Linux x64):** Aynı sayfadan `Kitzo-x.y.z-x86_64.AppImage` dosyasını indirip çalıştırılabilir yapın:

```bash
chmod +x Kitzo-*.AppImage
./Kitzo-*.AppImage
```

Debian/Ubuntu için `Kitzo-x.y.z-amd64.deb` paketi de var:

```bash
sudo apt install ./Kitzo-*-amd64.deb
```

Saydam pencere için masaüstünüzün birleştirici (compositor) desteği gerekir; GNOME, KDE ve güncel
masaüstlerinin hepsinde vardır.

İlk açılışta İngilizce başlar; Ayarlar → Dil'den Türkçe'ye geçebilirsiniz.

**Lisans:** Kişisel kullanım ücretsizdir; kodun, karakterlerin ve çizimlerin kopyalanması, değiştirilmesi
ve yeniden dağıtılması izinsiz yapılamaz.
