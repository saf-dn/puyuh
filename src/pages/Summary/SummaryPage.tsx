import { useEffect, useCallback } from 'react';
import { useSummaryStore } from '@/stores/summaryStore';
import { calculateAge, formatCurrency, formatNumber, getMonthYear } from '@/utils/format';
import { BarChart3 } from 'lucide-react';
import './SummaryPage.css';

// ─── Sub-components ──────────────────────────────────────────────────
function InfoRow({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div className="info-row">
      <span className={`info-label ${bold ? 'font-bold text-primary' : ''}`}>{label}</span>
      <span className={`info-value ${bold ? 'font-extrabold' : ''}`} style={valueColor ? { color: valueColor } : {}}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="section-card glass-panel fade-in-up">
      <div className="section-card-header">
        {accent && <div className="section-accent-dot" style={{ backgroundColor: accent }} />}
        <h2 className="section-card-title">{title}</h2>
      </div>
      <div className="section-card-content">
        {children}
      </div>
    </div>
  );
}

function MetricBig({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="metric-big glass-panel-light">
      <span className="metric-big-label">{label}</span>
      <span className="metric-big-value" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SummaryPage() {
  const { monthlySummary, isLoading, loadMonthlySummary } = useSummaryStore();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadData = useCallback(() => {
    loadMonthlySummary(year, month);
  }, [loadMonthlySummary, year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading && !monthlySummary) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="loading-state">Memuat laporan bulanan...</div>
      </div>
    );
  }

  if (!monthlySummary) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <BarChart3 size={48} strokeWidth={1.5} className="text-muted" opacity={0.5} style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Belum ada data</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', maxWidth: '300px' }}>
          Mulai dengan menambahkan data puyuh dan transaksi
        </p>
        <button className="btn btn-primary bg-red" onClick={loadData}>
          Muat Ulang
        </button>
      </div>
    );
  }

  const s = monthlySummary;
  const profitColor = s.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <p className="page-sub">Laporan Bulanan</p>
        <h1 className="page-title">{getMonthYear(year, month)}</h1>
      </header>

      {/* Profit Hero */}
      <section className="summary-hero glass-panel fade-in-up" style={{ animationDelay: '0.1s' }}>
        <p className="hero-label">Profit / Rugi Bersih</p>
        <h2 className="hero-profit" style={{ color: profitColor }}>
          {s.profit >= 0 ? "+" : ""}
          {formatCurrency(s.profit)}
        </h2>
        <div className="hero-row">
          <div className="hero-pill">
            <span className="hero-pill-text">ROI: {s.roi_percentage.toFixed(2)}%</span>
          </div>
          <span className="hero-period">{s.period}</span>
        </div>
      </section>

      {/* Finance Row */}
      <section className="fin-row fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="fin-card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <p className="fin-label text-success">Total Pendapatan</p>
          <p className="fin-amount text-success">{formatCurrency(s.total_income)}</p>
        </div>
        <div className="fin-card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p className="fin-label text-danger">Total Pengeluaran</p>
          <p className="fin-amount text-danger">{formatCurrency(s.total_expense)}</p>
        </div>
      </section>

      {/* Puyuh Section */}
      <div style={{ animationDelay: '0.3s' }} className="fade-in-up">
        <SectionCard title="Populasi Puyuh" accent="var(--danger-color)">
          <div className="metric-row">
            <MetricBig label="Total Ekor" value={formatNumber(s.total_puyuh)} color="var(--text-primary)" />
            <MetricBig 
              label="Mati Bulan Ini" 
              value={formatNumber(s.puyuh_died_count)} 
              color={s.puyuh_died_count > 0 ? 'var(--danger-color)' : 'var(--text-primary)'} 
            />
          </div>
          <div className="info-list">
            {s.puyuh_by_age.map((g) => (
              <InfoRow
                key={`${g.age_months}-${g.status}-${g.created_at}`}
                label={`Usia ${calculateAge(g.age_months, g.created_at)}`}
                value={`${formatNumber(g.count)} ekor`}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Production Section */}
      <div style={{ animationDelay: '0.4s' }} className="fade-in-up">
        <SectionCard title="Produksi Telur" accent="var(--success-color)">
          <div className="metric-row">
            <MetricBig label="Per Bulan" value={formatNumber(s.eggs_produced)} color="var(--text-primary)" />
            <MetricBig label="Rata-rata / Hari" value={formatNumber(s.avg_eggs_per_day)} color="var(--success-color)" />
          </div>
          <div className="info-list">
            <InfoRow label="Harga Rata-rata / Pcs" value={formatCurrency(s.avg_price_per_egg)} />
            <InfoRow label="Terjual" value={`${formatNumber(s.eggs_sold)} pcs`} valueColor="var(--success-color)" />
            <InfoRow label="Belum Dijual" value={`${formatNumber(s.eggs_available)} pcs`} valueColor="var(--warning-color)" />
            <InfoRow label="Pecah / Rusak" value={`${formatNumber(s.eggs_broken)} pcs`} valueColor="var(--danger-color)" />
          </div>
        </SectionCard>
      </div>

      {/* Feed Section */}
      <div style={{ animationDelay: '0.5s' }} className="fade-in-up">
        <SectionCard title="Konsumsi Pakan" accent="var(--warning-color)">
          <div className="metric-row">
            <MetricBig label="Total / Bulan" value={`${s.total_feed_kg.toFixed(1)} kg`} color="var(--text-primary)" />
            <MetricBig label="Rata-rata / Hari" value={`${s.avg_feed_per_day.toFixed(2)} kg`} color="var(--warning-color)" />
          </div>
          <div className="info-list">
            <InfoRow label="Biaya Pakan" value={formatCurrency(s.total_feed_cost)} valueColor="var(--danger-color)" bold />
          </div>
        </SectionCard>
      </div>

      {/* Finance Detail */}
      <div style={{ animationDelay: '0.6s' }} className="fade-in-up">
        <SectionCard title="Rincian Keuangan" accent="var(--success-color)">
          
          {Object.keys(s.income_by_category).length > 0 && (
            <>
              <p className="sub-section-label">Pendapatan per Kategori</p>
              <div className="info-list">
                {Object.entries(s.income_by_category).map(([cat, amt]) => (
                  <InfoRow key={cat} label={cat} value={formatCurrency(amt)} valueColor="var(--success-color)" />
                ))}
              </div>
            </>
          )}
          <div className="info-list" style={{ marginTop: '0.5rem' }}>
            <InfoRow label="Total Pendapatan" value={formatCurrency(s.total_income)} valueColor="var(--success-color)" bold />
          </div>

          <div className="divider" />

          {Object.keys(s.expense_by_category).length > 0 && (
            <>
              <p className="sub-section-label">Pengeluaran per Kategori</p>
              <div className="info-list">
                {Object.entries(s.expense_by_category).map(([cat, amt]) => (
                  <InfoRow key={cat} label={cat} value={formatCurrency(amt)} valueColor="var(--danger-color)" />
                ))}
              </div>
            </>
          )}
          <div className="info-list" style={{ marginTop: '0.5rem' }}>
            <InfoRow label="Total Pengeluaran" value={formatCurrency(s.total_expense)} valueColor="var(--danger-color)" bold />
          </div>

          <div className="divider" />

          <div className="profit-line">
            <span className="profit-line-label">PROFIT BERSIH</span>
            <span className="profit-line-value" style={{ color: profitColor }}>
              {s.profit >= 0 ? "+" : ""}
              {formatCurrency(s.profit)}
            </span>
          </div>

        </SectionCard>
      </div>
      
    </div>
  );
}
