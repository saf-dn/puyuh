import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/stores/financeStore';
import { TransactionType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Wallet, ArrowDown, ArrowUp, Plus, Minus, Calendar } from 'lucide-react';
import TransactionForm from '@/components/forms/TransactionForm';
import './FinancePage.css';

export default function FinancePage() {
  const navigate = useNavigate();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const {
    incomeTransactions,
    expenseTransactions,
    incomeCategories,
    expenseCategories,
    currentMonth,
    isLoading,
    loadFinanceData,
    loadCategories,
    addTransaction,
    setMonth,
  } = useFinanceStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [loadFinanceData, currentMonth.year, currentMonth.month]);

  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]);
  const totalExpense = useMemo(() => expenseTransactions.reduce((sum, t) => sum + t.amount, 0), [expenseTransactions]);
  const profit = totalIncome - totalExpense;

  const recentTransactions = useMemo(() => {
    return [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [incomeTransactions, expenseTransactions]);

  const currentMonthName = new Date(currentMonth.year, currentMonth.month - 1).toLocaleString('id-ID', { month: 'long' });

  return (
    <div className="np-finance-page fade-in">
      {/* Period Filter Header */}
      <div className="np-fin-header">
        <span className="np-fin-subtitle">Keuangan</span>
        <div className="np-fin-title-row">
          <h2 className="np-fin-title-large">{currentMonthName}</h2>
          <button
            className="np-cycle-picker"
            onClick={() => {
              const input = monthInputRef.current as any;
              if (input && 'showPicker' in input) {
                try {
                  input.showPicker();
                } catch (e) {
                  input.focus();
                }
              } else {
                input?.focus();
              }
            }}
          >
            <Calendar size={18} className="text-primary" />
            <input
              ref={monthInputRef}
              type="month"
              value={`${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split('-');
                  setMonth(parseInt(y), parseInt(m));
                }
              }}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              title="Pilih Bulan"
            />
          </button>
        </div>
      </div>

      {/* Top Row: Info Panels & Actions */}
      <div className="np-fin-top-grid">
        {/* Info Panel: Summary (Saldo, Pendapatan, Pengeluaran) */}
        <div className="np-glass-card np-fin-summary group">
          <div className="np-fin-saldo-section">
            <div className="np-saldo-glow"></div>
            <div className="np-saldo-header">
              <span className="np-saldo-label">Saldo Bersih</span>
              <div className="np-saldo-icon">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <div className="np-saldo-value">{formatCurrency(profit)}</div>
            </div>
          </div>

          <div className="np-fin-totals-section">
            <div className="np-total-col np-total-left">
              <div className="np-total-header">
                <ArrowDown size={16} className="text-primary" />
                <span className="np-total-label">Pemasukan</span>
              </div>
              <div className="np-total-value text-primary">{formatCurrency(totalIncome)}</div>
            </div>
            <div className="np-total-col np-total-right">
              <div className="np-total-header">
                <ArrowUp size={16} className="text-error" />
                <span className="np-total-label">Pengeluaran</span>
              </div>
              <div className="np-total-value text-error">-{formatCurrency(totalExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart & Actions */}
      <div className="np-fin-mid-grid">

        {/* Action Buttons */}
        <div className="np-glass-card np-fin-actions" >
          <button className="np-action-btn np-action-income group" onClick={() => setShowIncomeForm(true)} >
            <div className="np-action-icon-box bg-primary-20 group-hover-scale">
              <Plus size={20} className="text-primary" />
            </div>
            <span className="np-action-text text-primary">Catat Pendapatan</span>
          </button>
          <button className="np-action-btn np-action-expense group" onClick={() => setShowExpenseForm(true)}>
            <div className="np-action-icon-box bg-error-20 group-hover-scale">
              <Minus size={20} className="text-error" />
            </div>
            <span className="np-action-text text-error">Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="np-glass-card np-fin-table-container">
        <div className="np-table-header">
          <h4 className="np-section-title">Riwayat Transaksi</h4>
          <button className="np-link-btn" onClick={() => navigate('/finance/income')}>Lihat Semua</button>
        </div>
        <div className="np-table-wrapper">
          <table className="np-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th className="text-right">Jumlah</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    {isLoading ? 'Memuat data...' : 'Belum ada transaksi bulan ini'}
                  </td>
                </tr>
              ) : (
                recentTransactions.map((t, i) => {
                  const isIncome = t.transaction_type === TransactionType.INCOME;
                  return (
                    <tr key={`${t.id}-${i}`}>
                      <td>{formatDate(t.date)}</td>
                      <td>{t.category?.name || 'Lainnya'}</td>
                      <td className="text-muted">{t.description || '-'}</td>
                      <td className={`text-right font-medium ${isIncome ? 'text-primary' : 'text-error'}`} style={{ whiteSpace: 'nowrap' }}>
                        {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                      </td>
                      <td className="text-center">
                        <span className={`np-status-badge ${isIncome ? 'badge-primary' : 'badge-primary'}`}>
                          Selesai
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms */}
      <TransactionForm
        isOpen={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        onSubmit={(type, data) => addTransaction({
          transaction_type: type,
          category_id: data.categoryId,
          amount: data.amount,
          date: data.date,
          description: data.description
        })}
        type={TransactionType.INCOME}
        categories={incomeCategories}
        isLoading={isLoading}
      />
      <TransactionForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={(type, data) => addTransaction({
          transaction_type: type,
          category_id: data.categoryId,
          amount: data.amount,
          date: data.date,
          description: data.description
        })}
        type={TransactionType.EXPENSE}
        categories={expenseCategories}
        isLoading={isLoading}
      />
    </div>
  );
}
