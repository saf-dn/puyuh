-- Hapus tabel feed_type karena sudah tidak digunakan
DROP TABLE IF EXISTS feed_type CASCADE;

CREATE TABLE IF NOT EXISTS feed_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_kg NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mengizinkan akses Public (Anon) agar website bisa membaca dan mengubah stok pakan
ALTER TABLE feed_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for anon" ON feed_stock;
CREATE POLICY "Enable all operations for anon" ON feed_stock 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Memasukkan 1 baris awal jika tabel masih kosong
INSERT INTO feed_stock (stock_kg)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM feed_stock);
