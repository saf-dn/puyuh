# Dokumentasi Teknis — Project Puyuh

## Arsitektur

```
┌─────────────────────────────────────────┐
│           Expo Router (UI)              │
│  finance / puyuh / summary screens      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Zustand Stores                  │
│  financeStore | puyuhStore | feedStore   │
│  productionStore | summaryStore         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      SQLite (expo-sqlite)               │
│  schema.ts + *.queries.ts               │
└─────────────────────────────────────────┘
```

## Skema Database

| Tabel | Deskripsi |
|-------|-----------|
| `puyuh` | Grup puyuh (usia, jumlah, status) |
| `feed_type` | Jenis pakan & harga/kg |
| `daily_feed` | Catatan pakan harian per grup |
| `daily_production` | Produksi telur harian (1 record/hari) |
| `expense_category` | Kategori pengeluaran |
| `income_category` | Kategori pendapatan |
| `transactions` | Transaksi keuangan |

## File Penting

| File | Peran |
|------|-------|
| `src/database/db.ts` | Singleton koneksi SQLite |
| `src/database/schema.ts` | DDL + seed data default |
| `src/app/_layout.tsx` | Init DB sebelum render UI |
| `metro.config.js` | Dukungan WASM untuk SQLite web |
| `app.json` | Plugin expo-sqlite + COOP/COEP headers |

## Pola Error Handling

Store actions (`addPuyuh`, `addTransaction`, `addFeed`, `addProduction`) melempar ulang error agar form tetap terbuka saat gagal:

```typescript
catch (error) {
  const message = storeError(error, "...");
  set({ error: message, isLoading: false });
  throw new Error(message);
}
```

## Upsert Logic

- **daily_feed**: update jika sudah ada record untuk `date + puyuh_id` yang sama
- **daily_production**: update jika sudah ada record untuk `date` yang sama

## Web vs Native

| Aspek | Web | Native |
|-------|-----|--------|
| Storage | IndexedDB (WASM) | File SQLite |
| Picker | Chip buttons (FeedForm, PuyuhForm) | Sama |
| Persistensi | Tergantung browser | Persisten di device |

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run smoke-test` | Cek HTTP 200 untuk semua route |
| `npm run export:web` | Build statis ke `.expo-web-test/` |
| `npm run lint` | ESLint via expo |

## Known Limitations

1. SQLite web masih **alpha** di Expo — gunakan native untuk produksi kritis
2. Ringkasan bulan ini menggunakan bulan kalender saat ini (belum ada month picker di summary)
3. Penjualan puyuh (burung) dicatat via kategori keuangan, bukan field produksi terpisah

## Changelog Perbaikan

- Fix import `@/utils/formatters` → `@/utils/format`
- Fix Metro WASM config untuk expo-sqlite web
- Fix silent form close pada error database
- Wire FeedForm & ProductionForm ke layar Puyuh
- Seed jenis pakan default
- Perbaiki kalkulasi pakan (gram × frekuensi × ekor → kg)
- Ganti Link asChild dengan router.push (fix expo-router Slot warning)
- Ganti Picker dengan chip select di FeedForm (kompatibilitas web)
- **Fix SQLite reserved keyword**: rename tabel `transaction` → `transactions` di schema.ts dan semua query
- **Fix infinite re-render**: pisah useEffect di FinanceScreen (categories sekali, data per bulan)
- **Fix unstable date**: pindah `new Date()` ke `useMemo` di PuyuhScreen
- **Fix VirtualizedList nesting**: ganti FlatList di dalam ScrollView dengan plain View+map di PuyuhScreen
- **Fix ProductionForm border**: currency input container sekarang menampilkan error border yang benar
- **Cleanup**: hapus `generateId()` dan import `uuid` yang tidak terpakai dari `format.ts`
