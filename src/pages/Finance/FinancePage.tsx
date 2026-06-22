import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/stores/financeStore';
import { TransactionType } from '@/types';
import { formatCurrency, getMonthYear } from '@/utils/format';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Inbox, Receipt } from 'lucide-react';
import TransactionForm from '@/components/forms/TransactionForm';
import './FinancePage.css';

export default function FinancePage() {
  const navigate = useNavigate();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

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

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const recentTransactions = [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const changeMonth = (delta: number) => {
    let m = currentMonth.month + delta;
    let y = currentMonth.year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(y, m);
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <header className="finance-header">
        <div>
          <p className="page-sub">Periode Keuangan</p>
          <h1 className="page-title">{getMonthYear(currentMonth.year, currentMonth.month)}</h1>
        </div>
        <div className="month-nav">
          <button className="nav-btn glass-panel" onClick={() => changeMonth(-1)}>
            <ChevronLeft size={24} />
          </button>
          <button className="nav-btn glass-panel" onClick={() => changeMonth(1)}>
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      {/* Hero Profit */}
      <section className="hero-card glass-panel fade-in-up" style={{ animationDelay: '0.1s' }}>
        <p className="hero-label">Saldo Bersih Bulan Ini</p>
        <h2 className={`hero-amount ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
          {profit >= 0 ? '+' : ''}
          {formatCurrency(profit)}
        </h2>
      </section>

      {/* Summary Cards */}
      <section className="summary-row fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="summary-card glass-panel">
          <p className="summary-label text-success">Total Pendapatan</p>
          <p className="summary-amount text-success">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="summary-card stat-accent">
          <p className="summary-label">Total Pengeluaran</p>
          <p className="summary-amount text-white">{formatCurrency(totalExpense)}</p>
        </div>
      </section>

      {/* Actions */}
      <section className="action-row fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button className="action-btn bg-green" onClick={() => setShowIncomeForm(true)}>
          <Inbox size={20} />
          <span>Pendapatan</span>
        </button>
        <button className="action-btn bg-red" onClick={() => setShowExpenseForm(true)}>
          <Receipt size={20} />
          <span>Pengeluaran</span>
        </button>
      </section>

      {/* Recent Transactions */}
      <section className="transactions-section fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="section-header">
          <h2 className="section-title">Transaksi Terbaru</h2>
        </div>

        {isLoading && recentTransactions.length === 0 ? (
          <div className="loading-state">Memuat data...</div>
        ) : recentTransactions.length > 0 ? (
          <div className="tx-list">
            {recentTransactions.map((t, index) => {
              const isIncome = t.transaction_type === TransactionType.INCOME;
              return (
                <div key={`${t.id}-${index}`} className="tx-row glass-panel">
                  <div className={`tx-icon-box ${isIncome ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                    {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="tx-details">
                    <p className="tx-category">{t.category?.name || 'Lainnya'}</p>
                    {t.description && <p className="tx-desc">{t.description}</p>}
                  </div>
                  <div className="tx-amount-col">
                    <p className={`tx-amount ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="tx-date">{t.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-box glass-panel">
            <span className="empty-icon">💸</span>
            <p className="empty-text">Belum ada transaksi bulan ini</p>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="link-row fade-in-up" style={{ animationDelay: '0.5s' }}>
        <button className="link-btn glass-panel" onClick={() => navigate('/finance/income')}>
          Lihat Semua Pendapatan &rarr;
        </button>
        <button className="link-btn glass-panel" onClick={() => navigate('/finance/expense')}>
          Lihat Semua Pengeluaran &rarr;
        </button>
      </section>

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
