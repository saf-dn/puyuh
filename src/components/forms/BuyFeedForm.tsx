import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { getCurrentDate } from '@/utils/format';
interface BuyFeedFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; amount: number; description: string }) => Promise<void>;
  isLoading: boolean;
}

export default function BuyFeedForm({ isOpen, onClose, onSubmit, isLoading }: BuyFeedFormProps) {
  const [date, setDate] = useState(() => getCurrentDate());
  const [kg, setKg] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedKg = parseFloat(kg);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedKg) || parsedKg <= 0) {
      setError('Berat (kg) harus lebih dari 0');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Harga harus lebih dari 0');
      return;
    }

    try {
      await onSubmit({
        date,
        amount: parsedPrice,
        description: `Beli Pakan ${parsedKg} kg`,
      });

      // Reset form
      setKg('');
      setPrice('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Beli Pakan">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tanggal</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Berat Pakan</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="50"
                required
                min="1"
              />
              <span className="input-suffix">kg</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Total Harga</label>
            <div className="input-with-prefix">
              <span className="input-prefix">Rp</span>
              <input
                type="number"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="400000"
                required
                min="1"
              />
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
            style={{ backgroundColor: '#1565C0' }}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
