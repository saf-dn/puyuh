-- Run this SQL in your Supabase SQL Editor to add payment_status column to daily_production
ALTER TABLE daily_production ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'belum_bayar';
