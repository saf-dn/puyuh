import React, { useState } from 'react';
import Modal from '../ui/Modal';
import type { PuyuhInput } from '@/types';
import { PuyuhStatus } from '@/types';
interface PuyuhFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PuyuhInput) => Promise<void>;
  isLoading: boolean;
}

export default function PuyuhForm({ isOpen, onClose, onSubmit, isLoading }: PuyuhFormProps) {
  const [count, setCount] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'sick'>('active');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedCount = parseInt(count, 10);
    const parsedAge = parseInt(ageMonths, 10);

    if (isNaN(parsedCount) || parsedCount <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }
    if (isNaN(parsedAge) || parsedAge < 0) {
      setError('Usia harus 0 atau lebih');
      return;
    }

    try {
      await onSubmit({
        count: parsedCount,
        age_months: parsedAge,
        status: status as PuyuhStatus,
        notes: notes.trim() || undefined,
      });
      
      // Reset form
      setCount('');
      setAgeMonths('');
      setStatus('active');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kelompok Puyuh">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Jumlah (ekor)</label>
          <input
            type="number"
            className="form-input"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Contoh: 1000"
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Usia Awal (bulan)</label>
          <input
            type="number"
            className="form-input"
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            placeholder="Contoh: 1"
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Catatan (opsional)</label>
          <input
            type="text"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kandang A, Rak 2"
          />
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
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
