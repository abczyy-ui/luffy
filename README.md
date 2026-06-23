# 🏴‍☠️ ONE PIECE RPG WhatsApp Bot

Bot WhatsApp RPG bertema ONE PIECE untuk mencari harta karun di Grand Line!

---

## ⚙️ Instalasi

### Syarat
- Node.js v18 ke atas
- npm / yarn

### Langkah Install

```bash
# 1. Masuk ke folder bot
cd onepiece-rpg-bot

# 2. Install dependencies
npm install

# 3. Jalankan bot
npm start
```

### Pairing Code
Saat pertama kali dijalankan, bot akan meminta **nomor WhatsApp**:

```
📱 Masukkan nomor WhatsApp (format: 628xxx):
```

Masukkan nomor HP kamu (contoh: `6281234567890`), lalu bot akan menampilkan:

```
🔑 Pairing Code kamu: ABCD-EFGH
📲 Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat > Masukkan kode
```

Masukkan kode tersebut di WhatsApp kamu.

---

## 🎮 Cara Bermain

Bot **hanya aktif di grup**. Chat di private akan diabaikan (hanya dibaca).

### Perintah

| Perintah | Fungsi |
|----------|--------|
| `.regist` | Daftar jadi pemain & dapat karakter acak |
| `.start` | Mulai petualangan, munculkan musuh |
| `.attack` | Serang musuh yang sedang dihadapi |

### Alur Permainan

1. Ketik `.regist` → bot memilihkan 1 dari 10 karakter secara acak
2. Setiap karakter **hanya bisa dipakai 1 pemain (nomor WA)**
3. Ketik `.start` → berlayar ke lokasi Grand Line & bertemu musuh
4. Ketik `.attack` berulang kali sampai musuh kalah
5. Kalahkan musuh → dapat **Beli** & **Loot** harta karun
6. Kumpulkan **5+ harta** termasuk *One Piece Map Fragment* → **WIN!**

---

## 👤 Karakter (10 Slot)

| # | Karakter | Power | HP | ATK |
|---|----------|-------|----|-----|
| 1 | 🎩 Monkey D. Luffy | Gomu Gomu no Mi | 500 | 95 |
| 2 | ⚔️ Roronoa Zoro | Santoryu | 450 | 100 |
| 3 | 🌩️ Nami | Clima-Tact | 300 | 70 |
| 4 | 🎯 Usopp | Kabuto Pachinko | 320 | 75 |
| 5 | 🦵 Vinsmoke Sanji | Black Leg Style | 420 | 90 |
| 6 | 🦌 Tony Tony Chopper | Hito Hito no Mi | 350 | 65 |
| 7 | 🌸 Nico Robin | Hana Hana no Mi | 380 | 80 |
| 8 | 🤖 Franky | Cyborg Body | 480 | 85 |
| 9 | 💀 Brook | Yomi Yomi no Mi | 360 | 78 |
| 10 | 🐋 Jinbe | Fish-Man Karate | 550 | 88 |

---

## 🗂️ Struktur File

```
onepiece-rpg-bot/
├── index.js          ← Script utama bot
├── package.json      ← Konfigurasi Node.js
├── README.md         ← Panduan ini
├── auth_info/        ← Dibuat otomatis saat login
└── data/
    ├── players.json  ← Data pemain (dibuat otomatis)
    └── gamestate.json← State game (dibuat otomatis)
```

---

## ❗ Catatan Penting

- Bot hanya merespons di **grup WhatsApp**, bukan chat private
- Setiap nomor WA hanya bisa punya **1 karakter**
- Maksimal **10 pemain** (sesuai jumlah karakter)
- Data tersimpan di file JSON lokal (`data/`)
- Jika bot mati lalu dinyalakan lagi, data tetap tersimpan

---

## 🔧 Troubleshooting

**Bot tidak merespons di grup?**
- Pastikan bot sudah menjadi anggota grup
- Pastikan perintah diawali titik (`.regist`, `.start`, `.attack`)

**Pairing code tidak muncul?**
- Pastikan nomor format internasional: `628xxxxxxxxx`
- Jangan ada spasi

**Error saat install?**
```bash
npm install --legacy-peer-deps
```

---

*🏴‍☠️ "Aku akan menjadi Raja Bajak Laut!" — Monkey D. Luffy*
