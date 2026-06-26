import { supabase } from "./supabase";

// ─── Initialization ──────────────────────────────────────────────

let initialized = false;

/**
 * Ensures default seed data exists in Supabase.
 * Tables are created via the Supabase Dashboard; this only seeds rows.
 */
export async function initDatabase(): Promise<void> {
  if (initialized) return;

  try {
    await Promise.all([seedDefaultCategories()]);
    initialized = true;
    console.log("✅ Supabase database initialized");
  } catch (error) {
    console.error("❌ Supabase initialization error:", error);
    throw error;
  }
}

export function isDbReady(): boolean {
  return initialized;
}

// Re-export supabase client for convenience
export { supabase };

// ─── Seed Helpers ────────────────────────────────────────────────

async function seedDefaultCategories(): Promise<void> {
  const { count } = await supabase
    .from("expense_category")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) return;

  const defaultExpenseCategories = [
    { id: "exp_feed", name: "Pakan", category_type: "feed" },
    { id: "exp_breeding", name: "Bibit", category_type: "equipment" },
    { id: "exp_medication", name: "Vitamin & Obat", category_type: "medication" },
    { id: "exp_equipment", name: "Kandang & Equipment", category_type: "equipment" },
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

  const { error: expError } = await supabase
    .from("expense_category")
    .upsert(defaultExpenseCategories, { onConflict: "id" });
  if (expError) console.error("Failed to seed expense categories:", expError);

  const { error: incError } = await supabase
    .from("income_category")
    .upsert(defaultIncomeCategories, { onConflict: "id" });
  if (incError) console.error("Failed to seed income categories:", incError);

  console.log("✅ Default categories seeded");
}


