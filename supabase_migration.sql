-- Update Puyuh Table
-- Menambahkan kolom kandang, row, dan kolom jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='puyuh' AND column_name='kandang') THEN
        ALTER TABLE puyuh ADD COLUMN kandang text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='puyuh' AND column_name='row') THEN
        ALTER TABLE puyuh ADD COLUMN row text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='puyuh' AND column_name='kolom') THEN
        ALTER TABLE puyuh ADD COLUMN kolom text;
    END IF;
END $$;

-- Update Daily Feed Table
-- Menambahkan kolom photo jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_feed' AND column_name='photo') THEN
        ALTER TABLE daily_feed ADD COLUMN photo text;
    END IF;
END $$;

-- Hapus kolom lama yang tidak dipakai lagi (opsional)
ALTER TABLE daily_feed DROP COLUMN IF EXISTS feed_type_id;
ALTER TABLE daily_feed DROP COLUMN IF EXISTS frequency_per_day;
ALTER TABLE daily_feed DROP COLUMN IF EXISTS amount_per_bird;
ALTER TABLE daily_feed DROP COLUMN IF EXISTS total_amount;
ALTER TABLE daily_feed DROP COLUMN IF EXISTS cost;

-- Update Daily Production Table
-- Menambahkan kolom foto telur dan bukti tf
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_production' AND column_name='photo_eggs') THEN
        ALTER TABLE daily_production ADD COLUMN photo_eggs text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_production' AND column_name='photo_transfer') THEN
        ALTER TABLE daily_production ADD COLUMN photo_transfer text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_production' AND column_name='buyer_name') THEN
        ALTER TABLE daily_production ADD COLUMN buyer_name text;
    END IF;
END $$;
