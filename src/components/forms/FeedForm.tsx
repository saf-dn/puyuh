import React, { useState } from 'react';
import Modal from '../ui/Modal';


interface FeedFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { puyuhGroupId: string; feedTypeId: string; frequencyPerDay: number; amountPerBird: number; }) => Promise<void>;
  puyuhGroups: { id: string; name: string; count: number }[];
  feedTypes: { id: string; name: string }[];
  isLoading: boolean;
}

export default function FeedForm({ isOpen, onClose, onSubmit, puyuhGroups, feedTypes, isLoading }: FeedFormProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [puyuhId, setPuyuhId] = useState('');
  const [feedTypeId, setFeedTypeId] = useState('');
  const [amountPerBird, setAmountPerBird] = useState('25'); // default 25g
  const [frequencyPerDay, setFrequencyPerDay] = useState('2'); // default 2x
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!puyuhId) {
      setError('Pilih kelompok puyuh');
      return;
    }
    if (!feedTypeId) {
      setError('Pilih jenis pakan');
      return;
    }

    const parsedAmount = parseFloat(amountPerBird);
    const parsedFreq = parseInt(frequencyPerDay, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Gram/ekor harus lebih dari 0');
      return;
    }
    if (isNaN(parsedFreq) || parsedFreq <= 0) {
      setError('Frekuensi harus lebih dari 0');
      return;
    }

    const group = puyuhGroups.find(g => g.id === puyuhId);
    if (!group) return;

    try {
      await onSubmit({
        puyuhGroupId: puyuhId,
        feedTypeId: feedTypeId,
        amountPerBird: parsedAmount,
        frequencyPerDay: parsedFreq,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pemberian Pakan">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">📅 Tanggal</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">🐦 Kelompok Puyuh</label>
          <select 
            className="form-select"
            value={puyuhId}
            onChange={(e) => setPuyuhId(e.target.value)}
            required
          >
            <option value="" disabled>Pilih Kelompok</option>
            {puyuhGroups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">🌾 Jenis Pakan</label>
          <select 
            className="form-select"
            value={feedTypeId}
            onChange={(e) => setFeedTypeId(e.target.value)}
            required
          >
            <option value="" disabled>Pilih Pakan</option>
            {feedTypes.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">⚖️ Gram / Ekor</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={amountPerBird}
                onChange={(e) => setAmountPerBird(e.target.value)}
                placeholder="25"
                required
                min="1"
              />
              <span className="input-suffix">gram</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">🔄 Frekuensi</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={frequencyPerDay}
                onChange={(e) => setFrequencyPerDay(e.target.value)}
                placeholder="2"
                required
                min="1"
              />
              <span className="input-suffix">kali/hari</span>
            </div>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn glass-panel" 
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
