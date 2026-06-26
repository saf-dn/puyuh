import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, getMonthYear, formatDate } from '@/utils/format';
import { ChevronLeft, Inbox, Receipt, Edit } from 'lucide-react';
import TransactionForm from '@/components/forms/TransactionForm';
import { TransactionType } from '@/types';
import './FinancePage.css';

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isIncome = location.pathname.includes('income');
  const txType = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;
  
  const { 
    incomeTransactions, 
    expenseTransactions,
    incomeCategories,
    expenseCategories,
    currentMonth, 
    isLoading, 
    loadFinanceData,
    updateTransaction,
    deleteTransaction
  } = useFinanceStore();

  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [loadFinanceData, currentMonth.year, currentMonth.month]);

  const rawTransactions = isIncome ? incomeTransactions : expenseTransactions;
  const categories = isIncome ? incomeCategories : expenseCategories;

  const sortedTransactions = useMemo(() => {
    return [...rawTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [rawTransactions]);

  const total = useMemo(() => sortedTransactions.reduce((sum, t) => sum + t.amount, 0), [sortedTransactions]);

  // Styling based on type
  const colorClass = isIncome ? 'text-primary' : 'text-error';
  const prefix = isIncome ? '+' : '-';
  const title = isIncome ? 'Riwayat Pendapatan' : 'Riwayat Pengeluaran';
  const gradientBg = isIncome 
    ? 'linear-gradient(135deg, rgba(204, 255, 128, 0.15) 0%, rgba(204, 255, 128, 0.02) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 180, 171, 0.15) 0%, rgba(255, 180, 171, 0.02) 100%)';
  const borderColor = isIncome ? 'rgba(204, 255, 128, 0.2)' : 'rgba(255, 180, 171, 0.2)';
  const Icon = isIncome ? Inbox : Receipt;
  const emptyText = isIncome ? 'Belum ada pendapatan bulan ini' : 'Belum ada pengeluaran bulan ini';

  return (
    <div className="np-finance-page fade-in">
      <header className="np-fin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <button className="np-cycle-picker" onClick={() => navigate('/finance')}>
            <ChevronLeft size={20} className="text-primary" />
          </button>
          <div>
            <span className="np-fin-subtitle">{getMonthYear(currentMonth.year, currentMonth.month)}</span>
            <h1 className="np-section-title" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{title}</h1>
          </div>
        </div>
      </header>

      <section className="np-glass-card" style={{ padding: '1.5rem', background: gradientBg, borderColor }}>
        <p className="np-saldo-label" style={{ marginBottom: '0.5rem' }}>Total {isIncome ? 'Pendapatan' : 'Pengeluaran'}</p>
        <h2 className={`${colorClass} font-stat-value`} style={{ fontSize: '2.25rem', margin: 0 }}>
          {prefix}{formatCurrency(total)}
        </h2>
      </section>

      {/* Toggle Switch */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', background: 'rgba(25, 29, 18, 0.4)', padding: '0.35rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <button 
          onClick={() => navigate('/finance/income', { replace: true })}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
            transition: 'all 0.2s ease', cursor: 'pointer', border: 'none',
            background: isIncome ? 'rgba(204, 255, 128, 0.15)' : 'transparent',
            color: isIncome ? 'var(--p-primary)' : 'var(--p-on-surface-var)'
          }}
        >
          Pendapatan
        </button>
        <button 
          onClick={() => navigate('/finance/expense', { replace: true })}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
            transition: 'all 0.2s ease', cursor: 'pointer', border: 'none',
            background: !isIncome ? 'rgba(255, 180, 171, 0.15)' : 'transparent',
            color: !isIncome ? 'var(--p-error)' : 'var(--p-on-surface-var)'
          }}
        >
          Pengeluaran
        </button>
      </div>

      <section className="transactions-section" style={{ marginTop: '0.5rem' }}>
        {isLoading && sortedTransactions.length === 0 ? (
          <div className="text-center text-muted py-8">Memuat data...</div>
        ) : sortedTransactions.length > 0 ? (
          <div className="np-glass-card np-fin-table-container">
            <div className="np-table-wrapper">
              <table className="np-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Deskripsi</th>
                    <th className="text-right">Jumlah</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((t, idx) => (
                    <tr 
                      key={`${t.id}-${idx}`} 
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTx(t);
                        setShowEditForm(true);
                      }}
                    >
                      <td>{formatDate(t.date)}</td>
                      <td>{t.category?.name || 'Lainnya'}</td>
                      <td className="text-muted">{t.description || '-'}</td>
                      <td className={`text-right font-medium ${colorClass}`} style={{ whiteSpace: 'nowrap' }}>
                        {prefix} {formatCurrency(t.amount)}
                      </td>
                      <td className="text-center">
                        <span className="np-status-badge badge-primary">
                          Selesai
                        </span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="np-icon-btn-small" 
                          style={{ display: 'inline-flex', padding: '0.25rem', borderRadius: '4px' }}
                          onClick={() => {
                            setSelectedTx(t);
                            setShowEditForm(true);
                          }}
                        >
                          <Edit size={16} className="text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="np-glass-card text-center py-12 flex flex-col items-center justify-center">
            <Icon size={48} strokeWidth={1.5} className="text-muted mb-3" opacity={0.5} />
            <p className="text-muted" style={{ margin: 0 }}>{emptyText}</p>
          </div>
        )}
      </section>

      {selectedTx && (
        <TransactionForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedTx(null);
          }}
          onSubmit={async (_type, data) => {
            await updateTransaction(selectedTx.id, {
              category_id: data.categoryId,
              amount: data.amount,
              date: data.date,
              description: data.description
            });
          }}
          onDelete={async () => {
            await deleteTransaction(selectedTx.id);
          }}
          type={txType}
          categories={categories}
          isLoading={isLoading}
          transaction={selectedTx}
        />
      )}
    </div>
  );
}
