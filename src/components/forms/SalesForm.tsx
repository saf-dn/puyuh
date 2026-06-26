import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Camera } from 'lucide-react';
import type { DailyProduction } from '@/types';
import { getCurrentDate } from '@/utils/format';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { eggsSold?: number; buyerName?: string; photoEggs?: string; photoTransfer?: string; paymentStatus?: string; pricePerEgg?: number; }) => Promise<void>;
  isLoading: boolean;
  initialData?: DailyProduction | null;
  todayProduction?: DailyProduction | null;
}

export default function SalesForm({ isOpen, onClose, onSubmit, isLoading, initialData, todayProduction }: SalesFormProps) {
  const [date, setDate] = useState(() => getCurrentDate());
  const [sold, setSold] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [photoEggs, setPhotoEggs] = useState<string | null>(null);
  const [photoTransfer, setPhotoTransfer] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('belum_bayar');
  const [price, setPrice] = useState('400');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setSold(initialData.eggs_sold_count?.toString() || '');
        setBuyerName(initialData.buyer_name || '');
        setPhotoEggs(initialData.photo_eggs || null);
        setPhotoTransfer(initialData.photo_transfer || null);
        setPaymentStatus(initialData.payment_status || 'belum_bayar');
        setPrice(initialData.price_per_egg?.toString() || '400');
      } else {
        setDate(getCurrentDate());
        setSold('');
        setBuyerName('');
        setPhotoEggs(null);
        setPhotoTransfer(null);
        setPaymentStatus('belum_bayar');
        setPrice('400');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1000;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'eggs' | 'transfer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressedDataUrl = await compressImage(file);
      if (type === 'eggs') {
        setPhotoEggs(compressedDataUrl);
      } else {
        setPhotoTransfer(compressedDataUrl);
      }
    } catch (err) {
      setError('Gagal membaca atau mengompres file gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const soldCount = parseInt(sold || '0', 10);
    const priceValue = parseInt(price || '0', 10);

    if (isNaN(soldCount) || soldCount <= 0) {
      setError('Jumlah terjual harus lebih dari 0');
      return;
    }

    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Harga per telur harus lebih dari 0');
      return;
    }

    // Validation: sales <= production
    const deltaSold = soldCount - (initialData?.eggs_sold_count ?? 0);
    const newTotalSold = (todayProduction?.eggs_sold_count ?? 0) + deltaSold;
    const totalProduced = todayProduction?.eggs_produced_count ?? 0;

    if (newTotalSold > totalProduced) {
      setError('Salah input: jumlah telur yang dijual melebihi total stok yang diproduksi hari ini');
      return;
    }

    if (!buyerName.trim()) {
      setError('Mohon isi nama pembeli');
      return;
    }

    if (!photoEggs) {
      window.alert('Mohon lampirkan foto telur yang dijual!');
      return;
    }

    if (!photoTransfer) {
      window.alert('Mohon lampirkan bukti transfer penjualan!');
      return;
    }

    try {
      await onSubmit({
        eggsSold: soldCount,
        buyerName: buyerName.trim() || undefined,
        photoEggs: photoEggs || undefined,
        photoTransfer: photoTransfer || undefined,
        paymentStatus: paymentStatus,
        pricePerEgg: priceValue,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Penjualan" : "Catat Penjualan"}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group col-span-2">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={date}
              disabled
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Nama Pembeli</label>
            <input
              type="text"
              className="form-input"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Masukkan nama pembeli"
              required
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Telur Terjual</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={sold}
                onChange={(e) => setSold(e.target.value)}
                placeholder="0"
                required
                min="1"
              />
              <span className="input-suffix">butir</span>
            </div>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Harga Per Telur (Rp)</label>
            <input
              type="number"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="400"
              required
              min="0"
            />
          </div>
          
          <div className="form-group col-span-2">
            <label className="form-label">Status Pembayaran</label>
            <select
              className="form-input"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              required
            >
              <option value="sudah_bayar">Sudah Bayar</option>
              <option value="belum_bayar">Belum Bayar</option>
            </select>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Foto Telur (Dijual)</label>
            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
              {photoEggs ? (
                <div>
                  <img src={photoEggs} alt="Telur" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} />
                  <button type="button" onClick={() => setPhotoEggs(null)} style={{ marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.5rem', backgroundColor: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus Foto Telur</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem' }}>
                  <Camera size={32} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-secondary)' }}>Ambil Foto Telur</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleImageChange(e, 'eggs')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Bukti TF Penjualan</label>
            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
              {photoTransfer ? (
                <div>
                  <img src={photoTransfer} alt="Bukti Transfer" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} />
                  <button type="button" onClick={() => setPhotoTransfer(null)} style={{ marginTop: '0.5rem', display: 'block', width: '100%', padding: '0.5rem', backgroundColor: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hapus Bukti TF</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem' }}>
                  <Camera size={32} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-secondary)' }}>Upload Bukti TF</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'transfer')}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: '#1976D2' }}
            disabled={isLoading || !photoEggs || !photoTransfer}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
