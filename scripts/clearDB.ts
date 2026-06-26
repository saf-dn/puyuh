import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wuoqgxyfcqweawqlsdax.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b3FneHlmY3F3ZWF3cWxzZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODYwMDMsImV4cCI6MjA5NzQ2MjAwM30.NZjdrBqdfUHO95K6-Km10CihuGUsWWn4eBSQ0VNtInc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearDB() {
  const tables = [
    'daily_production',
    'transactions',
    'daily_feed',
    'puyuh'
  ];

  console.log("Clearing database...");
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Cleared ${table}`);
    }
  }

  // Reset feed_stock to 0
  const { error: feedStockError } = await supabase.from('feed_stock').update({ stock_kg: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (feedStockError) {
    console.error("Error resetting feed_stock:", feedStockError.message);
  } else {
    console.log("Reset feed_stock to 0");
  }

  console.log("Database cleared.");
}

clearDB();
