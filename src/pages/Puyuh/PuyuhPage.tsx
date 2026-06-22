import { useEffect, useMemo, useState } from 'react';
import { usePuyuhStore } from '@/stores/puyuhStore';
import { useFeedStore } from '@/stores/feedStore';
import { useProductionStore } from '@/stores/productionStore';
import { calculateAge, formatNumber } from '@/utils/format';
import type { DailyFeed } from '@/types';
import PuyuhForm from '@/components/forms/PuyuhForm';
import FeedForm from '@/components/forms/FeedForm';
import ProductionForm from '@/components/forms/ProductionForm';
import './PuyuhPage.css';

function getLatestFeedByPuyuh(feeds: DailyFeed[], puyuhId: string): DailyFeed | undefined {
  return feeds
    .filter((f) => f.puyuh_id === puyuhId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export default function PuyuhPage() {
  const { year, month } = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, []);

  const { puyuhGroups, feedTypes, totalPuyuh, isLoading: puyuhLoading, loadPuyuh, loadFeedTypes, addPuyuh } = usePuyuhStore();
  const { feeds, dailyFeedKg, isLoading: feedLoading, loadFeeds, addFeed } = useFeedStore();
  const { todayProduction, monthlyStats, isLoading: prodLoading, loadProductions, addProduction } = useProductionStore();

  const [showPuyuhForm, setShowPuyuhForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);

  useEffect(() => {
    loadPuyuh();
    loadFeedTypes();
    loadFeeds(year, month);
    loadProductions(year, month);
  }, [loadPuyuh, loadFeedTypes, loadFeeds, loadProductions, year, month]);

  const isLoading = puyuhLoading || feedLoading || prodLoading;

  return (
    <div className="page-container fade-in">
      <header className="page-header">
        <p className="page-sub">Manajemen Ternak</p>
        <h1 className="page-title">Populasi Puyuh</h1>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card stat-accent">
          <p className="stat-label">Total Puyuh</p>
          <p className="stat-value">{formatNumber(totalPuyuh)} ekor</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Telur Hari Ini</p>
          <p className="stat-value">{formatNumber(todayProduction?.eggs_produced_count ?? 0)} pcs</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pakan Hari Ini</p>
          <p className="stat-value">{dailyFeedKg.toFixed(2)} kg</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Telur Bulan Ini</p>
          <p className="stat-value">{formatNumber(monthlyStats?.total_eggs_produced ?? 0)} pcs</p>
        </div>
      </section>

      {/* Actions */}
      <section className="action-section">
        <div className="section-header">
          <h2 className="section-title">Aksi Cepat</h2>
        </div>
        <div className="action-grid">
          <button className="action-btn bg-red" onClick={() => setShowPuyuhForm(true)}>
            ➕ Tambah Puyuh
          </button>
          <button className="action-btn bg-blue" disabled={puyuhGroups.length === 0} onClick={() => setShowFeedForm(true)}>
            🌾 Catat Pakan
          </button>
          <button className="action-btn bg-green" onClick={() => setShowProductionForm(true)}>
            🥚 Catat Produksi
          </button>
        </div>
      </section>

      {/* Today Production Banner */}
      <section className="today-banner-container">
        {todayProduction ? (
          <div className="today-banner glass-panel">
            <div className="today-left">
              <h3 className="today-label">Produksi Hari Ini</h3>
              <p className="today-date">{todayProduction.date}</p>
            </div>
            <div className="today-stats">
              <div className="today-stat">
                <span className="today-stat-val">{formatNumber(todayProduction.eggs_produced_count)}</span>
                <span className="today-stat-label">Dihasilkan</span>
              </div>
              <div className="today-stat border-x">
                <span className="today-stat-val text-success">{formatNumber(todayProduction.eggs_sold_count)}</span>
                <span className="today-stat-label">Terjual</span>
              </div>
              <div className="today-stat">
                <span className="today-stat-val text-danger">{formatNumber(todayProduction.eggs_broken_count)}</span>
                <span className="today-stat-label">Pecah</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-prod-banner glass-panel">
            <p>🥚 Belum ada catatan produksi hari ini</p>
          </div>
        )}
      </section>

      {/* Puyuh Groups */}
      <section className="groups-section">
        <div className="section-header">
          <h2 className="section-title">Kelompok Puyuh</h2>
          <span className="section-count">{puyuhGroups.length} grup</span>
        </div>

        {isLoading && puyuhGroups.length === 0 ? (
          <div className="loading-state">Memuat data...</div>
        ) : puyuhGroups.length === 0 ? (
          <div className="empty-box glass-panel">
            <span className="empty-icon">🐦</span>
            <p className="empty-text">Belum ada data puyuh</p>
          </div>
        ) : (
          <div className="group-list">
            {puyuhGroups.map((item) => {
              const latestFeed = getLatestFeedByPuyuh(feeds, item.id);
              const statusLabel = 
                item.status === "active" ? "Sehat" :
                item.status === "inactive" ? "Mati" :
                item.status === "sick" ? "Sakit" : item.status;
              
              const statusClass = 
                item.status === "active" ? "status-active" :
                item.status === "sick" ? "status-sick" : "status-inactive";

              return (
                <div key={item.id} className="group-card glass-panel fade-in-up">
                  <div className="group-top">
                    <div className="group-meta">
                      <h3 className="group-age">Usia {calculateAge(item.age_months, item.created_at)}</h3>
                      <div className={`status-badge ${statusClass}`}>
                        <div className="status-dot"></div>
                        <span className="status-text">{statusLabel}</span>
                      </div>
                    </div>
                    <span className="group-count">{formatNumber(item.count)} ekor</span>
                  </div>

                  {latestFeed ? (
                    <div className="feed-info">
                      <p className="feed-info-text">
                        🌾 {latestFeed.frequency_per_day}x/hari · {latestFeed.amount_per_bird}g/ekor · {latestFeed.total_amount.toFixed(2)} kg total
                      </p>
                    </div>
                  ) : (
                    <p className="no-feed-text">Belum ada catatan pakan</p>
                  )}

                  {item.notes && <p className="group-notes">📝 {item.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* Forms */}
      <PuyuhForm
        isOpen={showPuyuhForm}
        onClose={() => setShowPuyuhForm(false)}
        onSubmit={addPuyuh}
        isLoading={puyuhLoading}
      />
      <FeedForm
        isOpen={showFeedForm}
        onClose={() => setShowFeedForm(false)}
        onSubmit={addFeed}
        puyuhGroups={puyuhGroups.map(g => ({ id: g.id, name: `Usia ${calculateAge(g.age_months, g.created_at)} (${g.count} ekor)`, count: g.count }))}
        feedTypes={feedTypes.map(f => ({ id: f.id, name: f.name }))}
        isLoading={feedLoading}
      />
      <ProductionForm
        isOpen={showProductionForm}
        onClose={() => setShowProductionForm(false)}
        onSubmit={addProduction}
        isLoading={prodLoading}
      />
    </div>
  );
}
