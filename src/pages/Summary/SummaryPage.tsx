import { useEffect, useCallback, useState, useRef } from 'react';
import { useSummaryStore } from '@/stores/summaryStore';
import { formatCurrency, formatNumber, getMonthYear } from '@/utils/format';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import './SummaryPage.css';

const formatCurrencyShort = (num: number) => {
  if (num === 0) return 'Rp0';
  const absNum = Math.abs(num);
  if (absNum >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${(num / 1000).toFixed(0)}rb`;
};

const HIGH_CONTRAST_COLORS = [
  '#ccff80', // Primary Green
  '#ffb95f', // Amber/Orange
  '#ff80bf', // Pink
  '#80dfff', // Cyan
  '#b380ff', // Purple
  '#ff8080', // Red
  '#ffff80', // Yellow
  '#80ffb3', // Mint
];

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HIGH_CONTRAST_COLORS[Math.abs(hash) % HIGH_CONTRAST_COLORS.length];
};

export default function SummaryPage() {
  const { monthlySummary, isLoading, loadMonthlySummary } = useSummaryStore();

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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

  // Calculate egg sales status
  const eggsSold = s.eggs_sold;
  const eggsProduced = s.eggs_produced;
  const eggsStock = Math.max(0, eggsProduced - eggsSold);
  const soldPct = eggsProduced > 0 ? (eggsSold / eggsProduced) * 100 : 0;
  const stockPct = eggsProduced > 0 ? (eggsStock / eggsProduced) * 100 : 0;

  // Mortality rate
  const mortalityRate = s.total_puyuh > 0 ? (s.puyuh_died_count / (s.total_puyuh + s.puyuh_died_count)) * 100 : 0;

  // Process expenses for the breakdown donut chart
  const totalExpense = s.total_expense || 1; // avoid division by zero
  const allExpenses = Object.entries(s.expense_by_category)
    .sort((a, b) => b[1] - a[1]); // Sort largest to smallest

  const expenseCircumference = 2 * Math.PI * 40; // 251.2
  let currentOffset = 0;
  const expenseSegments = allExpenses.map(([cat, amt]) => {
    const pct = amt / totalExpense;
    const strokeDasharray = `${pct * expenseCircumference} ${expenseCircumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += pct * expenseCircumference;
    return { cat, amt, pct: (pct * 100).toFixed(1), strokeDasharray, strokeDashoffset, color: stringToColor(cat) };
  });

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

        {/* Monthly Progress Horizontal Bar */}
        <div className="np-glass-card rounded-xl p-6 md-col-span-4 flex flex-col justify-center">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2 w-full text-left">Penjualan Telur</h3>
          <p className="font-label-md text-label-md text-on-surface-variant mb-6 w-full text-left">Status stok vs penjualan bulan ini</p>

          <div style={{ width: '100%', height: '1rem', backgroundColor: 'var(--p-surface-high)', borderRadius: '9999px', display: 'flex', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div className="bg-primary transition-all duration-500" style={{ width: `${soldPct}%`, height: '100%' }} title="Terjual"></div>
            <div className="bg-error transition-all duration-500" style={{ width: `${stockPct}%`, height: '100%', backgroundColor: 'var(--p-error)' }} title="Sisa Stok"></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--p-primary)' }}></div>
                <span className="font-label-sm text-on-surface-variant">Terjual</span>
              </div>
              <div className="font-stat-value text-xl text-primary">{formatNumber(eggsSold)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="font-label-sm text-on-surface-variant">Sisa Stok</span>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--p-error)' }}></div>
              </div>
              <div className="font-stat-value text-xl text-error" style={{ color: 'var(--p-error)' }}>{formatNumber(eggsStock)}</div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
             <span className="font-label-md text-on-surface-variant">Total Produksi: <span className="text-on-surface">{formatNumber(eggsProduced)} butir</span></span>
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
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          {expenseSegments.length > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="relative w-48 h-48 flex-shrink-0" onMouseLeave={() => setHoveredCategory(null)}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"></circle>
                  {expenseSegments.map((seg) => (
                    <circle
                      key={seg.cat}
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={hoveredCategory === seg.cat ? "14" : "10"}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      pointerEvents="stroke"
                      style={{ 
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        opacity: hoveredCategory && hoveredCategory !== seg.cat ? 0.3 : 1 
                      }}
                      onMouseEnter={() => setHoveredCategory(seg.cat)}
                      onClick={() => setHoveredCategory(hoveredCategory === seg.cat ? null : seg.cat)}
                    ></circle>
                  ))}
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease', pointerEvents: 'none' }}>
                  {hoveredCategory ? (
                    <>
                      <span className="font-label-md text-xs mb-1" style={{ color: stringToColor(hoveredCategory) }}>{hoveredCategory}</span>
                      <span className="font-body-md font-bold text-on-surface" style={{ fontSize: '1rem' }}>
                        {formatCurrencyShort(expenseSegments.find(s => s.cat === hoveredCategory)?.amt || 0)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-label-md text-xs text-on-surface-variant mb-1">Total</span>
                      <span className="font-body-md font-bold text-on-surface" style={{ fontSize: '1.25rem' }}>{formatCurrencyShort(totalExpense)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend List */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onMouseLeave={() => setHoveredCategory(null)}>
                {expenseSegments.map((seg) => (
                  <div 
                    key={seg.cat} 
                    onMouseEnter={() => setHoveredCategory(seg.cat)}
                    onClick={() => setHoveredCategory(hoveredCategory === seg.cat ? null : seg.cat)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', 
                      backgroundColor: 'var(--p-surface-high)', 
                      border: `1px solid ${hoveredCategory === seg.cat ? seg.color : 'rgba(255, 255, 255, 0.05)'}`,
                      boxShadow: hoveredCategory === seg.cat ? `0 0 10px ${seg.color}30` : 'none',
                      transform: hoveredCategory === seg.cat ? 'translateX(5px)' : 'none',
                      opacity: hoveredCategory && hoveredCategory !== seg.cat ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: seg.color }}></div>
                      <span className="font-label-md text-on-surface" style={{ wordBreak: 'break-word', maxWidth: '120px' }}>{seg.cat}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-label-md" style={{ color: seg.color, marginBottom: '0.25rem' }}>{seg.pct}%</div>
                      <div className="font-body-sm text-on-surface-variant">{formatCurrency(seg.amt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '1rem 0', color: 'var(--p-on-surface-var)' }}>
              Belum ada data pengeluaran bulan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
