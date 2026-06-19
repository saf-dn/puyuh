import { SQLiteDatabase } from "expo-sqlite";

export const SCHEMA = {
  puyuh: `
    CREATE TABLE IF NOT EXISTS puyuh (
      id TEXT PRIMARY KEY,
      age_months INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      status TEXT CHECK(status IN ('active', 'inactive', 'sick')) DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  feed_type: `
    CREATE TABLE IF NOT EXISTS feed_type (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL,
      price_per_unit REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  daily_feed: `
    CREATE TABLE IF NOT EXISTS daily_feed (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      puyuh_id TEXT NOT NULL,
      feed_type_id TEXT NOT NULL,
      frequency_per_day INTEGER NOT NULL,
      amount_per_bird REAL NOT NULL,
      total_amount REAL NOT NULL,
      cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (puyuh_id) REFERENCES puyuh(id),
      FOREIGN KEY (feed_type_id) REFERENCES feed_type(id)
    )
  `,

  daily_production: `
    CREATE TABLE IF NOT EXISTS daily_production (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      eggs_produced_count INTEGER NOT NULL DEFAULT 0,
      eggs_broken_count INTEGER NOT NULL DEFAULT 0,
      eggs_sold_count INTEGER NOT NULL DEFAULT 0,
      puyuh_died_count INTEGER NOT NULL DEFAULT 0,
      price_per_egg REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  expense_category: `
    CREATE TABLE IF NOT EXISTS expense_category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category_type TEXT CHECK(category_type IN ('feed', 'medication', 'equipment', 'shipping', 'other')) DEFAULT 'other',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  income_category: `
    CREATE TABLE IF NOT EXISTS income_category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category_type TEXT CHECK(category_type IN ('egg_sales', 'bird_sales', 'manure', 'other')) DEFAULT 'other',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  transaction: `
    CREATE TABLE IF NOT EXISTS transaction (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      transaction_type TEXT CHECK(transaction_type IN ('INCOME', 'EXPENSE')) NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
};

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  try {
    // Create all tables
    for (const schema of Object.values(SCHEMA)) {
      await db.execAsync(schema);
    }

    // Seed default categories
    await seedDefaultCategories(db);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

async function seedDefaultCategories(db: SQLiteDatabase): Promise<void> {
  // Check if categories already exist
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM expense_category",
  );

  if (result && result.count > 0) {
    return; // Categories already seeded
  }

  const defaultExpenseCategories = [
    { id: "exp_feed", name: "Pakan", category_type: "feed" },
    { id: "exp_breeding", name: "Bibit", category_type: "equipment" },
    {
      id: "exp_medication",
      name: "Vitamin & Obat",
      category_type: "medication",
    },
    {
      id: "exp_equipment",
      name: "Kandang & Equipment",
      category_type: "equipment",
    },
    { id: "exp_packaging", name: "Kardus Telur", category_type: "equipment" },
    { id: "exp_shipping", name: "Ongkos Kirim", category_type: "shipping" },
    { id: "exp_other", name: "Lainnya", category_type: "other" },
  ];

  const defaultIncomeCategories = [
    { id: "inc_eggs", name: "Penjualan Telur", category_type: "egg_sales" },
    { id: "inc_birds", name: "Penjualan Puyuh", category_type: "bird_sales" },
    { id: "inc_manure", name: "Penjualan Kotoran", category_type: "manure" },
    { id: "inc_other", name: "Lainnya", category_type: "other" },
  ];

  for (const category of defaultExpenseCategories) {
    await db.runAsync(
      "INSERT OR IGNORE INTO expense_category (id, name, category_type) VALUES (?, ?, ?)",
      [category.id, category.name, category.category_type],
    );
  }

  for (const category of defaultIncomeCategories) {
    await db.runAsync(
      "INSERT OR IGNORE INTO income_category (id, name, category_type) VALUES (?, ?, ?)",
      [category.id, category.name, category.category_type],
    );
  }

  console.log("✅ Default categories seeded");
}
