# 🏴‍☠️ ONE PIECE RPG WhatsApp Bot

Bot RPG bertema One Piece untuk WhatsApp menggunakan **Pairing Code** (tanpa QR Code).  
Jelajahi Grand Line dan temukan harta karun **ONE PIECE**!

---

## 📋 FITUR

| Perintah | Fungsi |
|---|---|
| `.regist` | Daftar jadi pemain → bot pilih karakter random |
| `.start` | Mulai petualangan ke lokasi berikutnya |
| `.attack` | Serang musuh dengan serangan normal |
| `.attack spesial` | Gunakan serangan spesial karaktermu |

---

## 🎭 KARAKTER (10 Slot, 1 WA = 1 Karakter)

| No | Karakter | ATK | HP | Serangan Spesial |
|---|---|---|---|---|
| 1 | Monkey D. Luffy 🌀 | 280 | 1500 | Gear Fifth - Bajrang Gun |
| 2 | Roronoa Zoro ⚔️ | 300 | 1400 | Asura: Makyusen |
| 3 | Nami ⚡ | 180 | 900 | Zeus Raitei |
| 4 | Usopp 🏹 | 200 | 950 | Firebird Star |
| 5 | Vinsmoke Sanji 🔥 | 260 | 1200 | Ifrit Jambe |
| 6 | Chopper 🦌 | 210 | 1000 | Monster Point |
| 7 | Nico Robin 🌺 | 220 | 1100 | Gigantesco Mano |
| 8 | Franky ⚙️ | 240 | 1300 | Radical Beam Burst |
| 9 | Brook 💀 | 230 | 1050 | Soul Solid |
| 10 | Jinbe 🌊 | 250 | 1350 | Fishman Karate Buraikan |

---

## 🗺️ RUTE GRAND LINE (17 Lokasi)

```
Reverse Mountain → Whiskey Peak → Little Garden → Drum Island
→ Alabasta → Skypiea → Water 7 → Enies Lobby → Thriller Bark
→ Sabaody Archipelago → Fishman Island → Punk Hazard → Dressrosa
→ Zou → Whole Cake Island → Wano Kuni → ⭐ LAUGH TALE (ONE PIECE!)
```

---

## ⚙️ CARA INSTALASI

### 1. Prasyarat
- **Node.js v18+** → https://nodejs.org
- **npm** (sudah termasuk dalam Node.js)

### 2. Install dependensi
```bash
npm install
```

### 3. Jalankan bot
```bash
node index.js
```

### 4. Pairing Code
```
📱 Masukkan nomor WhatsApp kamu (format: 628xxxxxxxxxx): 628123456789

╔══════════════════════════╗
║  🔑 PAIRING CODE KAMU:   ║
║                          ║
║     ABCD-1234            ║
║                          ║
╚══════════════════════════╝
```

### 5. Hubungkan ke WhatsApp
1. Buka WhatsApp di HP
2. Klik **⋮ (tiga titik)** → **Perangkat Tertaut**
3. Klik **Tautkan Perangkat**
4. Pilih **Tautkan dengan nomor telepon**
5. Masukkan kode 8 digit dari terminal

---

## 🎮 CARA BERMAIN

**1. Daftar dulu:**
```
.regist
```
Bot akan assign karakter secara random dari 10 karakter yang tersedia.

**2. Mulai petualangan:**
```
.start
```
Kamu akan berlayar ke lokasi baru dan menemui musuh.

**3. Serang musuh:**
```
.attack          → Serangan normal
.attack spesial  → Serangan spesial (damage lebih besar!)
```

**4. Terus serang sampai musuh kalah, lalu:**
```
.start → untuk berlayar ke lokasi berikutnya
```

**5. Tujuan akhir:** Kalahkan semua musuh di 17 lokasi dan temukan **ONE PIECE** di Laugh Tale!

---

## ⚔️ SISTEM PERTEMPURAN

- **Serangan Normal**: Damage = ATK × 0.8~1.2 - (DEF musuh × 0.3)
- **Serangan Spesial**: Damage = ATK × multiplier (3.5~4.5) - (DEF musuh × 0.5)
- **Critical Hit** (15%): Damage × 1.8
- **Musuh menyerang balik** setiap giliran

### Kalah:
- HP pulih 50%
- Berry berkurang 20%
- Mundur 1 lokasi

### Menang:
- Dapat Berry + EXP
- HP pulih 30%
- Maju ke lokasi berikutnya

---

## 📁 STRUKTUR FILE

```
onepiece-rpg-bot/
├── index.js       → Script utama bot
├── package.json   → Konfigurasi npm
├── README.md      → Panduan ini
├── db.json        → Database pemain (auto-create)
└── auth_info/     → Sesi WhatsApp (auto-create)
```

---

## ⚠️ CATATAN PENTING

- Bot hanya menerima chat **PRIVATE** (bukan grup)
- Satu nomor WA = satu karakter (tidak bisa ganti)
- Maksimal **10 pemain** sekaligus (sesuai jumlah karakter)
- Data tersimpan di `db.json` — jangan hapus file ini
- Folder `auth_info/` menyimpan sesi login — jaga kerahasiaannya

---

*"Aku akan menjadi Raja Bajak Laut!" - Monkey D. Luffy* 🏴‍☠️
