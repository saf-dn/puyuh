# Project Puyuh

Aplikasi manajemen peternakan puyuh (burung puyuh) berbasis **Expo SDK 56** + **React Native** dengan penyimpanan data lokal **SQLite**.

## Fitur Utama

| Menu | Fungsi |
|------|--------|
| **Keuangan** | Pencatatan pemasukan & pengeluaran dengan kategori |
| **Puyuh** | Data populasi, pakan harian, produksi telur |
| **Ringkasan** | Dashboard gabungan populasi, produksi, pakan & keuangan |

## Persyaratan

- Node.js 18+
- npm

## Instalasi & Menjalankan

```bash
npm install
npx expo start --web
```

Perintah lain:

```bash
npm run web          # Buka di browser
npm run android      # Android emulator/device
npm run ios          # iOS simulator (macOS)
npm run lint         # Cek kode ESLint
npm run smoke-test   # Tes semua route web (server harus jalan)
npm run export:web   # Build statis untuk deploy web
```

## Struktur Proyek

```
src/
├── app/                    # Expo Router (layar & navigasi)
│   ├── (tabs)/
│   │   ├── finance/        # Menu keuangan
│   │   ├── puyuh/          # Menu detail puyuh
│   │   └── summary/        # Menu ringkasan
│   └── _layout.tsx         # Root layout + init database
├── components/forms/       # Form input data
├── database/               # SQLite schema & queries
├── stores/                 # State management (Zustand)
├── types/                  # TypeScript types
└── utils/                  # Helper format tanggal & mata uang
```

## Konfigurasi Web (SQLite)

Aplikasi menggunakan `expo-sqlite` di web via WebAssembly. Konfigurasi sudah diset:

- `metro.config.js` — dukungan file `.wasm`
- `app.json` — plugin `expo-sqlite` + header COOP/COEP untuk SharedArrayBuffer

Jika web error terkait database, restart dengan cache bersih:

```bash
npx expo start --web --clear
```

## Kategori Keuangan (Default)

**Pengeluaran:** Pakan, Bibit, Vitamin & Obat, Kandang & Equipment, Kardus Telur, Ongkos Kirim, Lainnya

**Pendapatan:** Penjualan Telur, Penjualan Puyuh, Penjualan Kotoran, Lainnya

## Alur Penggunaan

1. **Puyuh** → Tambah grup puyuh (usia, jumlah ekor)
2. **Puyuh** → Catat pakan harian (frekuensi, gram/ekor)
3. **Puyuh** → Catat produksi telur harian
4. **Keuangan** → Catat pemasukan/pengeluaran
5. **Ringkasan** → Lihat laporan bulanan

Panduan lengkap pengguna: [docs/PANDUAN.md](docs/PANDUAN.md)

## Pengujian

Smoke test (pastikan dev server berjalan di port 8081):

```bash
npm run smoke-test
```

## Teknologi

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [expo-sqlite](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/)
- [Zustand](https://github.com/pmndrs/zustand)

## Lisensi

Lihat file [LICENSE](LICENSE).
