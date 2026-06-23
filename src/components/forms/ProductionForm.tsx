import React, { useState } from 'react';
import Modal from '../ui/Modal';
interface ProductionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { eggsProduced: number; eggsBroken: number; eggsSold: number; puyuhDied: number; pricePerEgg: number; }) => Promise<void>;
  isLoading: boolean;
}

export default function ProductionForm({ isOpen, onClose, onSubmit, isLoading }: ProductionFormProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [produced, setProduced] = useState('');
  const [broken, setBroken] = useState('');
  const [sold, setSold] = useState('');
  const [pricePerEgg] = useState(400); // fixed
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const producedCount = parseInt(produced, 10);
    const brokenCount = parseInt(broken || '0', 10);
    const soldCount = parseInt(sold || '0', 10);

    if (isNaN(producedCount) || producedCount <= 0) {
      setError('Jumlah produksi harus lebih dari 0');
      return;
    }
    if (isNaN(brokenCount) || brokenCount < 0) {
      setError('Jumlah pecah tidak valid');
      return;
    }
    if (isNaN(soldCount) || soldCount < 0) {
      setError('Jumlah terjual tidak valid');
      return;
    }

    try {
      await onSubmit({
        eggsProduced: producedCount,
        eggsBroken: brokenCount,
        eggsSold: soldCount,
        puyuhDied: 0,
        pricePerEgg,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Produksi Telur">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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

          <div className="form-group">
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

          <div className="form-group">
            <label className="form-label">Telur Terjual</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={sold}
                onChange={(e) => setSold(e.target.value)}
                placeholder="0"
                min="0"
              />
              <span className="input-suffix">butir</span>
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Harga per Butir</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={pricePerEgg}
                disabled
              />
              <span className="input-suffix">Rupiah</span>
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
