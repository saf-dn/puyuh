import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, getMonthYear } from '@/utils/format';
import { ArrowDownLeft, ChevronLeft } from 'lucide-react';

export default function IncomePage() {
  const navigate = useNavigate();
  const { incomeTransactions, currentMonth, isLoading, loadFinanceData } = useFinanceStore();

  useEffect(() => {
    loadFinanceData(currentMonth.year, currentMonth.month);
  }, [loadFinanceData, currentMonth.year, currentMonth.month]);

  const sortedTransactions = [...incomeTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const total = sortedTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="page-container fade-in">
      <header className="finance-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="nav-btn glass-panel" onClick={() => navigate('/finance')} style={{ width: '40px', height: '40px' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <p className="page-sub">{getMonthYear(currentMonth.year, currentMonth.month)}</p>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Riwayat Pendapatan</h1>
          </div>
        </div>
      </header>

      <section className="hero-card glass-panel fade-in-up" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.02) 100%)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <p className="hero-label" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Pendapatan</p>
        <h2 className="hero-amount text-white" style={{ fontSize: '2rem' }}>
          +{formatCurrency(total)}
        </h2>
      </section>

      <section className="transactions-section fade-in-up" style={{ animationDelay: '0.2s', marginTop: '1rem' }}>
        {isLoading ? (
          <div className="loading-state">Memuat data...</div>
        ) : sortedTransactions.length > 0 ? (
          <div className="tx-list">
            {sortedTransactions.map((t) => (
              <div key={t.id} className="tx-row glass-panel">
                <div className="tx-icon-box bg-success-light text-success">
                  <ArrowDownLeft size={20} />
                </div>
                <div className="tx-details">
                  <p className="tx-category">{t.category?.name || 'Lainnya'}</p>
                  {t.description && <p className="tx-desc">{t.description}</p>}
                </div>
                <div className="tx-amount-col">
                  <p className="tx-amount text-success">+{formatCurrency(t.amount)}</p>
                  <p className="tx-date">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-box glass-panel">
            <span className="empty-icon">📥</span>
            <p className="empty-text">Belum ada pendapatan bulan ini</p>
          </div>
        )}
      </section>
    </div>
  );
}
