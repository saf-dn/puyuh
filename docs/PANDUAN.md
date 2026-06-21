# Panduan Pengguna — Project Puyuh

Dokumentasi ini menjelaskan cara menggunakan aplikasi manajemen peternakan puyuh.

---

## Daftar Isi

1. [Memulai](#memulai)
2. [Menu Keuangan](#menu-keuangan)
3. [Menu Detail Puyuh](#menu-detail-puyuh)
4. [Menu Ringkasan](#menu-ringkasan)
5. [Rumus Perhitungan](#rumus-perhitungan)
6. [Troubleshooting](#troubleshooting)

---

## Memulai

Setelah aplikasi dibuka, Anda akan diarahkan ke tab **Keuangan**. Gunakan tab di bawah layar untuk berpindah menu:

- **Keuangan** — uang masuk & keluar
- **Puyuh** — data populasi, pakan, produksi
- **Ringkasan** — laporan gabungan

**Urutan yang disarankan saat pertama kali:**

1. Tambah data puyuh di tab **Puyuh**
2. Catat pakan & produksi harian
3. Catat transaksi keuangan
4. Cek **Ringkasan** untuk melihat laporan

---

## Menu Keuangan

### Menambah Pendapatan

1. Tap tombol **+ Pendapatan**
2. Pilih **tanggal**
3. Pilih **kategori** (misal: Penjualan Telur, Penjualan Kotoran)
4. Isi **jumlah (Rp)**
5. Opsional: tambah keterangan
6. Tap **Simpan**

### Menambah Pengeluaran

1. Tap tombol **+ Pengeluaran**
2. Pilih kategori (misal: Pakan, Bibit, Vitamin & Obat, Kardus Telur, Ongkos Kirim)
3. Isi jumlah dan simpan

### Kategori Tersedia

| Pengeluaran | Pendapatan |
|-------------|------------|
| Pakan | Penjualan Telur |
| Bibit | Penjualan Puyuh |
| Vitamin & Obat | Penjualan Kotoran |
| Kandang & Equipment | Lainnya |
| Kardus Telur | |
| Ongkos Kirim | |
| Lainnya | |

### Fitur Lain

- **Navigasi bulan** — gunakan tombol ‹ › untuk melihat transaksi bulan lain
- **Lihat Semua Pendapatan/Pengeluaran** — daftar lengkap transaksi
- **Hapus transaksi** — tekan lama pada item di daftar lengkap

---

## Menu Detail Puyuh

### Ringkasan di Atas Layar

Menampilkan data bulan berjalan:

| Kartu | Keterangan |
|-------|------------|
| Total Puyuh | Jumlah seluruh ekor aktif |
| Pakan Hari Ini | Total kg pakan hari ini |
| Pakan Bulan Ini | Total kg pakan bulan ini |
| Telur Hari Ini | Produksi telur hari ini |
| Telur Bulan Ini | Total produksi bulan ini |
| Puyuh Mati Bulan Ini | Jumlah kematian tercatat |

### Tambah Grup Puyuh

1. Tap **+ Tambah Puyuh**
2. Isi **usia (bulan)** dan **jumlah (ekor)**
3. Pilih **status**: Aktif / Tidak Aktif / Sakit
4. Opsional: catatan
5. Simpan

### Catat Pakan

1. Tap **Catat Pakan** (harus ada grup puyuh dulu)
2. Pilih **kelompok puyuh**
3. Pilih **jenis pakan** (Starter, Grower, Layer)
4. Isi **frekuensi per hari** (misal: 3x)
5. Isi **gram per ekor** (misal: 25)
6. Sistem menghitung total kg/hari otomatis
7. Simpan

> Catatan: Jika sudah ada catatan pakan untuk grup yang sama di hari yang sama, data akan **diperbarui** (bukan duplikat).

### Catat Produksi

1. Tap **Catat Produksi**
2. Isi jumlah telur **dihasilkan**, **pecah**, **terjual**
3. Isi **harga per telur (Rp)**
4. Isi jumlah **puyuh mati** hari ini
5. Sistem menampilkan telur belum dijual & perkiraan pendapatan
6. Simpan

> Catatan: Satu catatan produksi per hari. Input ulang di hari yang sama akan **memperbarui** data.

### Detail per Grup

Setiap kartu grup menampilkan usia, jumlah ekor, status, dan info pakan terakhir.

---

## Menu Ringkasan

Dashboard gabungan dari keuangan + puyuh:

### Puyuh
- Total populasi & breakdown per usia
- Jumlah mati bulan ini

### Produksi Telur
- Rata-rata per hari & total per bulan
- Harga telur per pcs (rata-rata)
- Terjual, belum dijual, pecah

### Konsumsi Pakan
- Rata-rata kg/hari & total kg/bulan
- Biaya pakan

### Keuangan
- Pendapatan & pengeluaran per kategori
- Profit dan ROI (%)

---

## Rumus Perhitungan

### Pakan per Hari (kg)

```
total kg = (jumlah ekor × gram per ekor × frekuensi per hari) ÷ 1000
```

### Telur Belum Dijual

```
belum dijual = dihasilkan − pecah − terjual
```

### Profit

```
profit = total pendapatan − total pengeluaran
```

### ROI

```
ROI (%) = (profit ÷ total pengeluaran) × 100
```

---

## Troubleshooting

### Form tertutup tapi data tidak tersimpan

- Pastikan semua field wajib terisi
- Perhatikan pesan error merah di layar
- Refresh halaman: `Ctrl+Shift+R` di browser

### Error 500 / halaman blank di web

```bash
npx expo start --web --clear
```

### Database tidak berjalan di web

Pastikan `metro.config.js` ada dan berisi dukungan `wasm`. Lihat [README.md](../README.md).

### Data hilang setelah refresh browser

Di web, data SQLite disimpan di IndexedDB browser. Jangan hapus data situs/browser jika ingin mempertahankan data.

### Port 8081 sudah dipakai

```bash
# Windows PowerShell — hentikan proses di port 8081
Get-NetTCPConnection -LocalPort 8081 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## Kontak & Pengembangan

Untuk pengembang: lihat struktur kode di `src/` dan jalankan `npm run lint` sebelum commit.
