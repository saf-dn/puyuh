import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = "https://wuoqgxyfcqweawqlsdax.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1b3FneHlmY3F3ZWF3cWxzZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODYwMDMsImV4cCI6MjA5NzQ2MjAwM30.NZjdrBqdfUHO95K6-Km10CihuGUsWWn4eBSQ0VNtInc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getPastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

async function seedDB() {
  console.log("Seeding database with mock data...");
  const now = new Date().toISOString();

  // 1. Create Puyuh Group
  const puyuhId = uuidv4();
  await supabase.from('puyuh').insert({
    id: puyuhId,
    age_months: 3,
    count: 100,
    status: 'ACTIVE',
    kandang: 'A',
    row: '1',
    kolom: '1',
    created_at: now,
    updated_at: now
  });
  console.log("Seeded puyuh group");

  // 2. Create Daily Production & Transactions
  for (let i = 2; i >= 0; i--) {
    const date = getPastDate(i);
    const prodId = uuidv4();
    
    const eggsProduced = 85 + Math.floor(Math.random() * 10);
    const eggsBroken = Math.floor(Math.random() * 3);
    const eggsSold = eggsProduced - eggsBroken - 5; 
    const price = 400;

    await supabase.from('daily_production').insert({
      id: prodId,
      date: date,
      eggs_produced_count: eggsProduced,
      eggs_broken_count: eggsBroken,
      eggs_sold_count: eggsSold,
      puyuh_died_count: 0,
      price_per_egg: price,
      buyer_name: 'Pembeli Dummy ' + i,
      created_at: now,
      updated_at: now
    });

    if (eggsSold > 0) {
      await supabase.from('transactions').insert({
        id: uuidv4(),
        date: date,
        transaction_type: 'INCOME',
        category_id: 'inc_eggs',
        amount: eggsSold * price,
        description: `Penjualan ${eggsSold} telur @ ${price}/pcs (Dummy)`,
        created_at: now,
        updated_at: now
      });
    }

    // 3. Create Daily Feed
    await supabase.from('daily_feed').insert({
      id: uuidv4(),
      date: date,
      puyuh_id: puyuhId,
      created_at: now,
      updated_at: now
    });
  }

  console.log("Seeded daily_production, transactions, and daily_feed");
  console.log("Database seeded successfully!");
}

seedDB().catch(console.error);
