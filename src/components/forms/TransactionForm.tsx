import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { TransactionType, type Category } from '@/types';
import { getCurrentDate } from '@/utils/format';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: TransactionType, data: { amount: number; categoryId: string; date: string; description?: string }) => Promise<void>;
  type: TransactionType;
  categories: Category[];
  isLoading: boolean;
  transaction?: any;
  onDelete?: () => Promise<void>;
}

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  type, 
  categories, 
  isLoading,
  transaction,
  onDelete
}: TransactionFormProps) {
  const [date, setDate] = useState(() => getCurrentDate());
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isIncome = type === TransactionType.INCOME;

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category_id);
      setDescription(transaction.description || '');
    } else {
      setDate(getCurrentDate());
      setAmount('');
      setCategoryId('');
      setDescription('');
    }
    setError(null);
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal tidak valid');
      return;
    }
    if (!categoryId) {
      setError('Pilih kategori');
      return;
    }

    try {
      await onSubmit(type, {
        amount: parsedAmount,
        categoryId,
        date,
        description: description.trim() || undefined,
      });

      // Reset
      setAmount('');
      setCategoryId('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? `Edit ${isIncome ? 'Pendapatan' : 'Pengeluaran'}` : `Catat ${isIncome ? 'Pendapatan' : 'Pengeluaran'}`}
    >
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

        <div className="form-group">
          <label className="form-label">Nominal (Rp)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>Pilih Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {onDelete && transaction && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ backgroundColor: '#EF4444', marginRight: 'auto' }}
              onClick={async () => {
                if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
                  await onDelete();
                  onClose();
                }
              }}
              disabled={isLoading}
            >
              Hapus
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
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
              className={`btn ${isIncome ? 'btn-primary' : 'btn-danger'}`}
              style={isIncome ? { backgroundColor: '#10B981' } : undefined}
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
