import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { DailyProduction } from '@/types';
import { getCurrentDate } from '@/utils/format';

interface ProductionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { eggsProduced?: number; eggsBroken?: number; }) => Promise<void>;
  isLoading: boolean;
  initialData?: DailyProduction | null;
  todayProduction?: DailyProduction | null;
}

export default function ProductionForm({ isOpen, onClose, onSubmit, isLoading, initialData, todayProduction }: ProductionFormProps) {
  const [date, setDate] = useState(() => getCurrentDate());
  const [produced, setProduced] = useState('');
  const [broken, setBroken] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setProduced(initialData.eggs_produced_count?.toString() || '');
        setBroken(initialData.eggs_broken_count?.toString() || '');
      } else {
        setDate(getCurrentDate());
        setProduced('');
        setBroken('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const producedCount = parseInt(produced, 10);
    const brokenCount = parseInt(broken || '0', 10);

    if (isNaN(producedCount) || producedCount <= 0) {
      setError('Jumlah produksi harus lebih dari 0');
      return;
    }
    if (isNaN(brokenCount) || brokenCount < 0) {
      setError('Jumlah pecah tidak valid');
      return;
    }

    // Validation: production >= sales
    const deltaProduced = producedCount - (initialData?.eggs_produced_count ?? 0);
    const newTotalProduced = (todayProduction?.eggs_produced_count ?? 0) + deltaProduced;
    const totalSold = todayProduction?.eggs_sold_count ?? 0;
    
    if (newTotalProduced < totalSold) {
      setError('Salah input: jumlah total produksi tidak boleh lebih kecil dari total penjualan');
      return;
    }

    try {
      await onSubmit({
        eggsProduced: producedCount,
        eggsBroken: brokenCount,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Produksi Telur" : "Catat Produksi Telur"}>
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
            <label className="form-label">Total Dihasilkan</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={produced}
                onChange={(e) => setProduced(e.target.value)}
                placeholder="0"
                required
                min="1"
              />
              <span className="input-suffix">butir</span>
            </div>
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">Telur Pecah</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={broken}
                onChange={(e) => setBroken(e.target.value)}
                placeholder="0"
                min="0"
              />
              <span className="input-suffix">butir</span>
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
            style={{ backgroundColor: '#2E7D32' }}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
