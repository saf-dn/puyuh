# 📋 Dokumentasi Lengkap — Project Puyuh

> Aplikasi manajemen peternakan burung puyuh berbasis Expo (React Native) dengan penyimpanan SQLite lokal.

---

## Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Struktur Direktori](#struktur-direktori)
3. [Database](#database)
4. [Stores (State Management)](#stores-state-management)
5. [Screens & Komponen](#screens--komponen)
6. [Bug yang Ditemukan & Diperbaiki](#bug-yang-ditemukan--diperbaiki)
7. [Panduan Pengembang](#panduan-pengembang)

---

## Arsitektur Sistem

```
┌──────────────────────────────────────────────────────┐
│                  EXPO ROUTER (UI Layer)               │
│  src/app/(tabs)/finance  puyuh  summary              │
│  income, expense (sub-routes)                        │
└─────────────────────────┬────────────────────────────┘
                          │ hooks (useSomethingStore)
┌─────────────────────────▼────────────────────────────┐
│              ZUSTAND STORES (Business Logic)          │
│  financeStore │ puyuhStore │ feedStore                │
│  productionStore │ summaryStore                      │
└─────────────────────────┬────────────────────────────┘
                          │ async calls
┌─────────────────────────▼────────────────────────────┐
│         QUERY LAYER (Data Access Object)             │
│  puyuh.queries  │ feed.queries                       │
│  production.queries  │ transaction.queries           │
└─────────────────────────┬────────────────────────────┘
                          │ expo-sqlite API
┌─────────────────────────▼────────────────────────────┐
│              SQLITE DATABASE                         │
│  expo-sqlite v56 (WASM on web, file on native)       │
└──────────────────────────────────────────────────────┘
```

**Stack:**
- **Framework**: Expo SDK 56, Expo Router 56
- **UI**: React Native + React 19
- **State**: Zustand v5
- **Database**: expo-sqlite v56 (SQLite)
- **ID generation**: uuid v14
- **Language**: TypeScript 6

---

## Struktur Direktori

```
projectPuyuh/
├── src/
│   ├── app/
│   │   ├── _layout.tsx          # Root layout + DB init gate
│   │   ├── index.tsx            # Redirect ke /finance
│   │   └── (tabs)/
│   │       ├── _layout.tsx      # Tab bar configuration
│   │       ├── finance/
│   │       │   ├── index.tsx    # Finance main screen
│   │       │   ├── income/index.tsx   # Income list screen
│   │       │   └── expense/index.tsx  # Expense list screen
│   │       ├── puyuh/
│   │       │   └── index.tsx    # Puyuh + feed + production screen
│   │       └── summary/
│   │           └── index.tsx    # Monthly summary dashboard
│   ├── components/forms/
│   │   ├── TransactionForm.tsx  # Income/expense form
│   │   ├── FeedForm.tsx         # Daily feed recording form
│   │   ├── ProductionForm.tsx   # Egg production form
│   │   └── PuyuhForm.tsx        # Add quail group form
│   ├── constants/theme.ts       # Colors, Fonts, fadedColor()
│   ├── database/
│   │   ├── db.ts                # Singleton SQLite connection
│   │   ├── schema.ts            # CREATE TABLE + seed data
│   │   └── queries/
│   │       ├── puyuh.queries.ts
│   │       ├── feed.queries.ts
│   │       ├── production.queries.ts
│   │       └── transaction.queries.ts
│   ├── stores/
│   │   ├── financeStore.ts
│   │   ├── puyuhStore.ts
│   │   ├── feedStore.ts
│   │   ├── productionStore.ts
│   │   └── summaryStore.ts
│   ├── types/index.ts           # All TypeScript interfaces & enums
│   └── utils/format.ts          # Currency, date, number formatters
├── docs/
│   ├── PANDUAN.md               # User guide
│   ├── TEKNIS.md                # Technical quick-reference
│   └── DOKUMENTASI.md           # THIS FILE
├── metro.config.js              # WASM support for SQLite web
└── app.json                     # Expo config + COOP/COEP headers
```

---

## Database

### Tabel & Relasi

#### `puyuh`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID v4 |
| `age_months` | INTEGER | Usia dalam bulan |
| `count` | INTEGER | Jumlah ekor |
| `status` | TEXT | `active` / `inactive` / `sick` |
| `notes` | TEXT | Catatan opsional |
| `created_at` | DATETIME | ISO timestamp |
| `updated_at` | DATETIME | ISO timestamp |

#### `feed_type`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID v4 |
| `name` | TEXT UNIQUE | Nama pakan |
| `unit` | TEXT | Satuan (kg) |
| `price_per_unit` | REAL | Harga per satuan |

**Default seed:** Pakan Starter (Rp 12.000/kg), Pakan Grower (Rp 11.000/kg), Pakan Layer (Rp 10.000/kg)

#### `daily_feed`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID v4 |
| `date` | DATE | YYYY-MM-DD |
| `puyuh_id` | TEXT FK | → puyuh.id |
| `feed_type_id` | TEXT FK | → feed_type.id |
| `frequency_per_day` | INTEGER | Frekuensi/hari |
| `amount_per_bird` | REAL | Gram/ekor |
| `total_amount` | REAL | Kg total (otomatis dihitung) |
| `cost` | REAL | Biaya total (otomatis dihitung) |

> **Upsert**: Jika record untuk `date + puyuh_id` sudah ada → UPDATE bukan INSERT.

**Formula:**
```
total_amount (kg) = (count_ekor × amount_per_bird × frequency_per_day) / 1000
cost = total_amount × price_per_unit
```

#### `daily_production`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID v4 |
| `date` | DATE UNIQUE | Satu record per hari |
| `eggs_produced_count` | INTEGER | Telur dihasilkan |
| `eggs_broken_count` | INTEGER | Telur pecah |
| `eggs_sold_count` | INTEGER | Telur terjual |
| `puyuh_died_count` | INTEGER | Puyuh mati hari ini |
| `price_per_egg` | REAL | Harga per telur |

> **Computed (tidak disimpan di DB):**
> - `eggs_available = eggs_produced - eggs_broken - eggs_sold`
> - `total_revenue = eggs_sold * price_per_egg`

#### `expense_category` & `income_category`
Kategori default di-seed otomatis saat DB pertama kali dibuka.

**Kategori Pengeluaran:** Pakan, Bibit, Vitamin & Obat, Kandang & Equipment, Kardus Telur, Ongkos Kirim, Lainnya

**Kategori Pendapatan:** Penjualan Telur, Penjualan Puyuh, Penjualan Kotoran, Lainnya

#### `transactions`

> ⚠️ **PENTING**: Nama tabel adalah `transactions` (plural). Kata `transaction` adalah **reserved keyword SQLite** — akan menyebabkan `Error code 1: syntax error` jika dipakai sebagai nama tabel tanpa quoting.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT PK | UUID v4 |
| `date` | DATE | YYYY-MM-DD |
| `transaction_type` | TEXT | `INCOME` / `EXPENSE` |
| `category_id` | TEXT | FK ke expense/income_category |
| `amount` | REAL | Nominal rupiah |
| `description` | TEXT | Keterangan opsional |

---

## Stores (State Management)

Semua store menggunakan **Zustand v5** dengan pola async actions.

### financeStore

```typescript
interface FinanceState {
  isLoading: boolean;
  error: string | null;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
  currentMonth: { year: number; month: number };

  loadFinanceData(year, month): Promise<void>;
  addTransaction(input): Promise<void>;
  updateTransaction(id, input): Promise<void>;
  deleteTransaction(id): Promise<void>;
  loadCategories(): Promise<void>;
  setMonth(year, month): void;
  clearError(): void;
}
```

**Pattern yang benar di screen:**
```typescript
// Dimuat sekali saat mount
useEffect(() => { loadCategories(); }, []);

// Reload setiap bulan berubah
useEffect(() => {
  loadFinanceData(currentMonth.year, currentMonth.month);
}, [currentMonth.year, currentMonth.month]);
```

### puyuhStore

```typescript
interface PuyuhState {
  puyuhGroups: Puyuh[];
  feedTypes: FeedType[];
  totalPuyuh: number;
  
  loadPuyuh(): Promise<void>;
  loadFeedTypes(): Promise<void>;
  addPuyuh(input): Promise<void>;
  updatePuyuh(id, input): Promise<void>;
  deletePuyuh(id): Promise<void>;
  addFeedType(input): Promise<void>;
}
```

### feedStore

```typescript
interface FeedStore {
  feeds: DailyFeed[];
  dailyFeedKg: number;    // total pakan hari ini
  monthlyFeedKg: number;   // total pakan bulan ini
  
  loadFeeds(year, month): Promise<void>;
  addFeed({ puyuhGroupId, feedTypeId, frequencyPerDay, amountPerBird }): Promise<void>;
}
```

### productionStore

```typescript
interface ProductionStore {
  productions: DailyProduction[];
  todayProduction: DailyProduction | null;
  monthlyStats: { total_eggs_produced, total_eggs_broken, ... } | null;
  
  loadProductions(year, month): Promise<void>;
  addProduction({ eggsProduced, eggsBroken, eggsSold, puyuhDied, pricePerEgg }): Promise<void>;
}
```

### summaryStore

```typescript
interface SummaryState {
  monthlySummary: MonthlySummary | null;
  dailyProduction: DailyProduction | null;
  currentDate: string;
  
  loadMonthlySummary(year, month): Promise<void>;
  loadDailyProduction(date): Promise<void>;
  addDailyProduction(input): Promise<void>;
  updateDailyProduction(id, input): Promise<void>;
}
```

---

## Screens & Komponen

### Root Layout — DB Gate Pattern

```typescript
// src/app/_layout.tsx
const [dbReady, setDbReady] = useState(isDbReady());
const [dbError, setDbError] = useState<string | null>(null);

useEffect(() => {
  if (dbReady) return;
  getDatabase()
    .then(() => setDbReady(true))
    .catch(err => setDbError(err.message));
}, [dbReady]);

// Tampilkan loading spinner sampai DB siap
if (!dbReady) return <ActivityIndicator />;
if (dbError) return <Text style={{ color: "red" }}>Database error: {dbError}</Text>;
return <ThemeProvider><Stack>...</Stack></ThemeProvider>;
```

### Finance Screen — fitur

- 3 kartu summary: Total Pendapatan, Total Pengeluaran, Profit/Loss (bulan ini)
- Navigasi bulan ← → untuk ganti periode
- Tombol "+ Pendapatan" dan "+ Pengeluaran" → `TransactionForm` Modal
- Daftar 8 transaksi terbaru (income + expense digabung, sort by date)
- Tombol "Lihat Semua" → navigasi ke `/finance/income` dan `/finance/expense`
- Error bar merah di bawah jika ada error

### Income & Expense List Screens

- Daftar lengkap transaksi bulan ini via `FlatList`
- Long-press item → `Alert.alert()` konfirmasi hapus
- `formatCurrency()` untuk tampilan rupiah

### Puyuh Screen — fitur

- 6 kartu stats sekaligus dari 3 store berbeda
- 3 tombol aksi, masing-masing membuka Modal form
- Daftar grup puyuh menggunakan `View + map()` (bukan FlatList) di dalam ScrollView
- Setiap kartu grup menampilkan usia, jumlah ekor, status, dan info pakan terakhir

### Summary Screen — fitur

- Data bulan berjalan (tahun & bulan dari `new Date()`)
- 4 section: Puyuh, Produksi Telur, Konsumsi Pakan, Keuangan
- ROI = `(income - expense) / expense * 100`

### Forms

| Form | Dibuka dari | Tipe Modal |
|------|------------|------------|
| `TransactionForm` | Finance screen | `transparent=false`, full screen |
| `FeedForm` | Puyuh screen | `transparent=true`, slide up |
| `ProductionForm` | Puyuh screen | `transparent=true`, slide up |
| `PuyuhForm` | Puyuh screen | `transparent=false`, full screen |

Semua form: validasi sebelum submit → tampilkan pesan error merah → reset & tutup jika sukses.

---

## Bug yang Ditemukan & Diperbaiki

### 🔴 Bug #1 — SQLite Reserved Keyword (CRASH SAAT STARTUP)

| | |
|---|---|
| **Severity** | CRITICAL |
| **File** | `src/database/schema.ts`, `src/database/queries/transaction.queries.ts` |
| **Error** | `Error code 1: near "transaction": syntax error` |
| **Root cause** | Kata `transaction` adalah reserved keyword SQLite. Tidak bisa dipakai sebagai nama tabel tanpa quoting. |

**Fix:**
```sql
-- SEBELUM (crash):
CREATE TABLE IF NOT EXISTS transaction (...);
INSERT INTO transaction ...
SELECT * FROM transaction ...

-- SESUDAH (OK):
CREATE TABLE IF NOT EXISTS transactions (...);
INSERT INTO transactions ...
SELECT * FROM transactions ...
```

---

### 🟡 Bug #2 — Infinite Re-render Loop di Finance Screen

| | |
|---|---|
| **Severity** | HIGH |
| **File** | `src/app/(tabs)/finance/index.tsx` |
| **Root cause** | `useEffect` dependency array mencakup fungsi zustand + state yang berubah setiap kali fungsi tersebut dipanggil, menyebabkan loop tak terbatas. |

**Fix:**
```typescript
// SEBELUM (loop):
useEffect(() => {
  loadCategories();
  loadFinanceData(currentMonth.year, currentMonth.month);
}, [currentMonth.month, currentMonth.year, loadCategories, loadFinanceData]);

// SESUDAH (aman):
useEffect(() => {
  loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  loadFinanceData(currentMonth.year, currentMonth.month);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentMonth.year, currentMonth.month]);
```

---

### 🟡 Bug #3 — Unstable `new Date()` di Puyuh Screen

| | |
|---|---|
| **Severity** | MEDIUM |
| **File** | `src/app/(tabs)/puyuh/index.tsx` |
| **Root cause** | `new Date()` di body komponen menghasilkan object baru setiap render → `year`/`month` selalu baru → `useCallback` rebuild → `useEffect` re-fire tanpa henti. |

**Fix:**
```typescript
// SEBELUM:
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

// SESUDAH:
const { year, month } = useMemo(() => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}, []); // Hanya dihitung sekali, stable reference
```

---

### 🟡 Bug #4 — VirtualizedList Nesting Warning

| | |
|---|---|
| **Severity** | MEDIUM |
| **File** | `src/app/(tabs)/puyuh/index.tsx` |
| **Root cause** | `FlatList` (VirtualizedList) di dalam `ScrollView` → warning "VirtualizedLists should never be nested" + perilaku scroll bermasalah. |

**Fix:**
```tsx
// SEBELUM:
<FlatList
  data={puyuhGroups}
  scrollEnabled={false}
  renderItem={({ item }) => <GroupCard item={item} />}
/>

// SESUDAH:
<View style={styles.listContent}>
  {puyuhGroups.map((item) => (
    <GroupCard key={item.id} item={item} />
  ))}
</View>
```

---

### 🟢 Bug #5 — Currency Input Error Border Tidak Muncul

| | |
|---|---|
| **Severity** | LOW |
| **File** | `src/components/forms/ProductionForm.tsx` |
| **Root cause** | `borderColor` untuk error state di-apply pada inner `TextInput` tapi yang terlihat oleh user adalah container `View`. |

**Fix:**
```tsx
// SESUDAH:
<View style={[
  styles.currencyInput,
  {
    borderColor: errors.pricePerEgg ? "#C62828" : colors.border,
    backgroundColor: colors.card,
  },
]}>
  <Text style={[styles.currencySymbol, { color: colors.text }]}>Rp</Text>
  <TextInput style={[styles.inputCurrency, { color: colors.text }]} ... />
</View>
```

---

### 🟢 Bug #6 — Date Timezone Offset di Income/Expense List

| | |
|---|---|
| **Severity** | LOW |
| **File** | `income/index.tsx`, `expense/index.tsx` |
| **Root cause** | `new Date("2026-06-01")` diparse sebagai UTC midnight. Di timezone +7, ini tampil sebagai 31 Mei. |

**Fix:**
```typescript
// SEBELUM:
new Date(item.date).toLocaleDateString("id-ID", ...)

// SESUDAH:
new Date(item.date.replace(/-/g, "/")).toLocaleDateString("id-ID", ...)
// "2026/06/01" diparse sebagai local time, bukan UTC
```

---

### 🟢 Bug #7 — Dead Code: `generateId()` + Unused Import

| | |
|---|---|
| **Severity** | LOW |
| **File** | `src/utils/format.ts` |
| **Root cause** | Fungsi `generateId()` tidak pernah dipanggil. ID generation sudah dilakukan langsung di query files menggunakan `uuid()`. |

**Fix:** Hapus fungsi dan import `uuid` dari `format.ts`.

---

## Panduan Pengembang

### Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Jalankan di web
npx expo start --web --port 8082

# Jalankan di Android
npx expo start --android

# TypeScript check (tanpa compile)
npx tsc --noEmit

# Lint
npm run lint
```

### Menambah Tabel Baru

1. Definisikan di `SCHEMA` objek di `src/database/schema.ts`
2. Buat `src/database/queries/namafitur.queries.ts`
3. Buat `src/stores/namafiturStore.ts`
4. Gunakan di screen yang relevan

> ⚠️ **Hindari reserved keywords SQL** sebagai nama tabel: `transaction`, `order`, `select`, `table`, `index`, `key`, `group`, `by`, dll.

### Konvensi Kode

| Aspek | Standar |
|-------|---------|
| ID | `uuid()` dari package `uuid`, tipe `string` |
| Date kolom DB | Format `YYYY-MM-DD` |
| Datetime kolom DB | ISO 8601: `new Date().toISOString()` |
| Error handling | Set state error + `throw new Error()` |
| Upsert daily records | Cek existing → UPDATE jika ada |
| Date parsing di UI | `str.replace(/-/g, "/")` sebelum `new Date()` |
| `new Date()` di komponen | Bungkus dalam `useMemo(() => ..., [])` |
| List di dalam ScrollView | Gunakan `View + map()`, bukan `FlatList` |

### Batasan yang Diketahui

1. **SQLite Web masih Alpha** — gunakan native untuk produksi kritis
2. **Summary Screen tidak ada navigasi bulan** — hanya tampil bulan berjalan
3. **Tidak ada autentikasi** — data hanya tersimpan lokal di device/browser
4. **Tidak ada backup/export** — data hilang jika browser data dihapus (web)
5. **Tidak ada error boundary** — crash pada satu screen bisa mematikan keseluruhan app

---

*Terakhir diperbarui: 2026-06-19*
