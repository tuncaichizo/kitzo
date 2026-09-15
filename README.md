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
- **Reminders** – from the menu or by voice, with a Windows notification.
- **Personality** – time-of-day greetings, random quips, reactions to dragging and click spam, sleeps at night or when you're away.
- **Actions** – stay / wander, go to corner, wave, sleep.
- **Multi-monitor** – drag it to any screen.
- **Global hotkeys** – `Ctrl+Alt+K` opens the menu anywhere; `Ctrl+Alt+L` listens for a command right away (no wake word needed — handy in noisy rooms).
- **Turkish / English** UI and voice.

## Install (Windows)

Download `Kitzo-Setup-x.y.z.exe` from the [Releases](../../releases) page and run it.
Kitzo starts with Windows by default (you can turn that off in Settings).

## Run from source

```bash
npm install
npm start
```

## Privacy

Audio never leaves your computer (offline recognition). Market data is fetched from Binance's public API
(CoinGecko as fallback). Your shortcuts, reminders and settings are stored in `%APPDATA%\kitzo`.

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

**Kurulum:** [Releases](../../releases) sayfasından `Kitzo-Setup-x.y.z.exe` dosyasını indirip çalıştırın.
İlk açılışta İngilizce başlar; Ayarlar → Dil'den Türkçe'ye geçebilirsiniz.

**Lisans:** Kişisel kullanım ücretsizdir; kodun, karakterlerin ve çizimlerin kopyalanması, değiştirilmesi
ve yeniden dağıtılması izinsiz yapılamaz.
