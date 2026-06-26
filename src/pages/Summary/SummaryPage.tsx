import { useEffect, useCallback, useState, useRef } from 'react';
import { useSummaryStore } from '@/stores/summaryStore';
import { formatCurrency, formatNumber, getMonthYear } from '@/utils/format';
import { TrendingUp, TrendingDown, ListFilter, BarChart3, Calendar } from 'lucide-react';
import './SummaryPage.css';

const formatCurrencyShort = (num: number) => {
  if (num === 0) return 'Rp0';
  const absNum = Math.abs(num);
  if (absNum >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${(num / 1000).toFixed(0)}rb`;
};

export default function SummaryPage() {
  const { monthlySummary, isLoading, loadMonthlySummary } = useSummaryStore();

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const monthInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    loadMonthlySummary(currentDate.year, currentDate.month);
  }, [loadMonthlySummary, currentDate.year, currentDate.month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading && !monthlySummary) {
    return (
      <div className="np-summary-page fade-in flex items-center justify-center min-h-[50vh]">
        <div className="text-on-surface-variant">Memuat laporan bulanan...</div>
      </div>
    );
  }

  if (!monthlySummary) {
    return (
      <div className="np-summary-page fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <BarChart3 size={48} strokeWidth={1.5} className="text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Belum ada data</h2>
        <p className="text-on-surface-variant text-center mb-6 max-w-[300px]">
          Mulai dengan menambahkan data puyuh dan transaksi
        </p>
        <button className="np-primary-btn px-6" onClick={loadData}>
          Muat Ulang
        </button>
      </div>
    );
  }

  const s = monthlySummary;
  const isProfit = s.profit >= 0;

  // Calculate percentage of eggs sold vs produced
  const eggsSoldPercentage = s.eggs_produced > 0 ? (s.eggs_sold / s.eggs_produced) * 100 : 0;
  // Calculate stroke dashoffset for the circle (Circumference is 251.2 for r=40)
  const circleOffset = 251.2 - (251.2 * eggsSoldPercentage) / 100;

  // Mortality rate
  const mortalityRate = s.total_puyuh > 0 ? (s.puyuh_died_count / (s.total_puyuh + s.puyuh_died_count)) * 100 : 0;

  // Process expenses for the breakdown bars
  const totalExpense = s.total_expense || 1; // avoid division by zero
  const expensesList = Object.entries(s.expense_by_category)
    .sort((a, b) => b[1] - a[1]) // Sort largest to smallest
    .slice(0, 3); // Take top 3

  const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary-container'];
  const textColors = ['text-primary', 'text-secondary', 'text-tertiary-dim'];

  return (
    <div className="np-summary-page fade-in">
      {/* Header */}
      <header className="np-summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Laporan Bulanan</h2>
          <p className="font-label-md text-label-md text-on-surface-variant">{getMonthYear(currentDate.year, currentDate.month)}</p>
        </div>
        <button
          className="np-cycle-picker"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2.5rem', height: '2.5rem', padding: '0',
            backgroundColor: 'rgba(25, 29, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem', cursor: 'pointer', position: 'relative'
          }}
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
            value={`${currentDate.year}-${currentDate.month.toString().padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                setCurrentDate({ year: parseInt(y), month: parseInt(m) });
              }
            }}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            title="Pilih Bulan"
          />
        </button>
      </header>

      <div className="np-summary-grid">
        {/* Performance Report (Net Profit) */}
        <div className="np-glass-card rounded-xl p-6 md-col-span-8 flex flex-col justify-between">
          <div className="flex-between-start mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Performa Keuangan</h3>
              <p className="font-label-md text-label-md text-on-surface-variant">Ringkasan Laba Bersih & ROI (Bulan Ini)</p>
            </div>
          </div>

          <div className="flex-end-gap mb-8">
            <div>
              <div className={`font-stat-value text-stat-value mb-1 ${isProfit ? 'text-primary' : 'text-error'}`}>
                {isProfit ? '+' : ''}{formatCurrency(s.profit)}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                {isProfit ? <TrendingUp size={16} className="text-primary" /> : <TrendingDown size={16} className="text-error" />}
                Laba Bersih
              </div>
            </div>

            <div className="np-divider-vertical mx-4"></div>

            <div>
              <div className="font-stat-value text-28px text-on-surface mb-1">
                {s.roi_percentage > 0 ? '+' : ''}{s.roi_percentage.toFixed(1)}%
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">ROI</div>
            </div>
          </div>

          {/* Simplified Bar/Area Chart Representation */}
          <div className="w-full h-32 flex items-end gap-2 relative mt-auto">
            <div className="absolute bottom-0 left-0 w-full border-b border-white-10"></div>
            {/* Bars */}
            {s.weekly_profit.length > 0 ? (
              s.weekly_profit.map((profit, idx) => {
                const maxProfit = Math.max(...s.weekly_profit.map(Math.abs), 1);
                const heightPct = Math.max(10, Math.min(100, (Math.abs(profit) / maxProfit) * 100));
                const isPositive = profit >= 0;
                const isLast = idx === s.weekly_profit.length - 1;

                const bgClass = isPositive
                  ? (isLast ? 'bg-primary-40 border-t-2' : 'bg-primary-20')
                  : (isLast ? 'bg-error-40 border-t-2' : 'bg-error-20');
                const hoverClass = isPositive
                  ? (isLast ? 'hover-bg-primary-50' : 'hover-bg-primary-30')
                  : (isLast ? 'hover-bg-error-50' : 'hover-bg-error-30');

                return (
                  <div
                    key={idx}
                    className={`w-full ${bgClass} ${hoverClass} transition-colors rounded-t-md relative group`}
                    style={{ height: `${profit === 0 ? 5 : heightPct}%`, borderColor: isLast ? (isPositive ? 'var(--p-primary)' : 'var(--p-error)') : 'transparent' }}
                  >
                    <div className="np-tooltip opacity-0 group-hover-opacity-100 transition-opacity whitespace-nowrap">
                      W{idx + 1}: {formatCurrencyShort(profit)}
                    </div>
                  </div>
                );
              })
            ) : (
              [40, 60, 45, 80, 95].map((h, i) => {
                const isLast = i === 4;
                const bgClass = isLast ? 'bg-primary-40 border-t-2' : 'bg-primary-20';
                const hoverClass = isLast ? 'hover-bg-primary-50' : 'hover-bg-primary-30';
                return (
                  <div key={i} className={`w-full ${bgClass} ${hoverClass} transition-colors rounded-t-md relative group`} style={{ height: `${h}%`, borderColor: isLast ? 'var(--p-primary)' : 'transparent' }}>
                    <div className="np-tooltip opacity-0 group-hover-opacity-100 transition-opacity">
                      W{i + 1}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Progress / ROI Circle */}
        <div className="np-glass-card rounded-xl p-6 md-col-span-4 flex flex-col items-center justify-center text-center">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2 w-full text-left">Penjualan Telur</h3>
          <p className="font-label-md text-label-md text-on-surface-variant mb-6 w-full text-left">Persentase telur terjual</p>

          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={circleOffset}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="font-stat-value text-32px text-on-surface block">{eggsSoldPercentage.toFixed(0)}%</span>
              <span className="font-label-md text-xs text-on-surface-variant">Terjual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics Infographic */}
      <div className="mb-gutter">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Populasi Card */}
          <div className="np-glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h4 className="font-body-md text-on-surface-variant mb-1">Populasi Puyuh</h4>
            <div className="font-stat-value text-28px text-on-surface" style={{ marginBottom: '1rem' }}>{formatNumber(s.total_puyuh)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-label-sm text-on-surface-variant">Tingkat Kematian</span>
              <span className={`font-label-sm ${mortalityRate > 5 ? 'text-error' : 'text-secondary'}`}>
                {mortalityRate.toFixed(1)}% ({s.puyuh_died_count} ekor)
              </span>
            </div>
          </div>

          {/* Produksi Card */}
          <div className="np-glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h4 className="font-body-md text-on-surface-variant mb-1">Rata-rata Produksi</h4>
            <div className="font-stat-value text-28px text-on-surface" style={{ marginBottom: '1rem' }}>
              {formatNumber(s.avg_eggs_per_day)} <span className="font-body-md text-on-surface-variant font-normal">butir</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-label-sm text-on-surface-variant">Total Bulan Ini</span>
              <span className="font-label-sm text-on-surface">{formatNumber(s.eggs_produced)} butir</span>
            </div>
          </div>

          {/* Pakan Card */}
          <div className="np-glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h4 className="font-body-md text-on-surface-variant mb-1">Konsumsi Pakan</h4>
            <div className="font-stat-value text-28px text-on-surface" style={{ marginBottom: '1rem' }}>
              {s.avg_feed_per_day.toFixed(1)} <span className="font-body-md text-on-surface-variant font-normal">kg/hari</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-label-sm text-on-surface-variant">Estimasi Biaya</span>
              <span className="font-label-sm text-on-surface">{formatCurrency(s.total_feed_cost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="np-glass-card rounded-xl p-6 mb-gutter">
        <div className="flex-between-center mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">Rincian Pengeluaran</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover-bg-white-5 text-on-surface-variant transition-colors">
              <ListFilter size={20} />
            </button>
          </div>
        </div>

        <div className="np-expenses-grid">
          {expensesList.length > 0 ? (
            expensesList.map(([cat, amt], index) => {
              const pct = ((amt / totalExpense) * 100).toFixed(1);
              const colorClass = colors[index % colors.length];
              const textClass = textColors[index % textColors.length];

              return (
                <div key={cat} className="bg-surface-container-50 rounded-lg p-4 border border-white-5">
                  <div className="flex-between-center mb-2">
                    <span className="font-label-md text-label-md text-on-surface truncate pr-2">{cat}</span>
                    <span className={`font-label-md text-label-md ${textClass}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 mb-4">
                    <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="font-body-md text-body-md text-on-surface-variant">{formatCurrency(amt)}</div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-4 text-on-surface-variant">
              Belum ada data pengeluaran bulan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
