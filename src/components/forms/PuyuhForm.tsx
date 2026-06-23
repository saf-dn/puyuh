import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { PuyuhInput, Puyuh } from '@/types';
import { PuyuhStatus } from '@/types';
interface PuyuhFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PuyuhInput, deadCount: number) => Promise<void>;
  isLoading: boolean;
  initialData?: Puyuh;
}

export default function PuyuhForm({ isOpen, onClose, onSubmit, isLoading, initialData }: PuyuhFormProps) {
  const [count, setCount] = useState('');
  const [deadCount, setDeadCount] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'sick'>('active');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCount(initialData.count.toString());
        setDeadCount('');
        setAgeMonths(initialData.age_months.toString());
        setStatus(initialData.status as any);
        setNotes(initialData.notes || '');
      } else {
        setCount('');
        setDeadCount('');
        setAgeMonths('');
        setStatus('active');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

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

    let finalCount = parsedCount;
    let finalDeadCount = 0;
    if (initialData) {
      const parsedDead = parseInt(deadCount || '0', 10);
      if (isNaN(parsedDead) || parsedDead < 0) {
        setError('Jumlah puyuh mati tidak valid');
        return;
      }
      finalDeadCount = parsedDead;
      finalCount = parsedCount - parsedDead;
    }

    if (finalCount < 0) {
      setError('Sisa jumlah puyuh tidak boleh kurang dari 0');
      return;
    }

    try {
      await onSubmit({
        count: finalCount,
        age_months: parsedAge,
        status: status as PuyuhStatus,
        notes: notes.trim() || undefined,
      }, finalDeadCount);

      // Reset form
      setCount('');
      setDeadCount('');
      setAgeMonths('');
      setStatus('active');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Puyuh" : "Tambah Puyuh"}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Jumlah</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="0"
                required
                min="1"
              />
              <span className="input-suffix">ekor</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"> Usia</label>
            <div className="input-with-suffix">
              <input
                type="number"
                className="form-input"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                placeholder="0"
                required
                min="0"
              />
              <span className="input-suffix">bulan</span>
            </div>
          </div>

          {initialData && (
            <div className="form-group col-span-2">
              <label className="form-label"> Mati </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  className="form-input"
                  value={deadCount}
                  onChange={(e) => setDeadCount(e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <span className="input-suffix">ekor</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> {deadCount || 0} ekor saat disimpan</span>
            </div>
          )}
        </div>



        <div className="form-group">
          <label className="form-label">Catatan</label>
          <input
            type="text"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}

          />
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
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
