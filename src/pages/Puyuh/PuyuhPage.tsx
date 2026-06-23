import { useEffect, useMemo, useState } from 'react';
import { usePuyuhStore } from '@/stores/puyuhStore';
import { useFeedStore } from '@/stores/feedStore';
import { useProductionStore } from '@/stores/productionStore';
import { calculateAge, formatNumber, formatDate } from '@/utils/format';
import type { DailyFeed, Puyuh, PuyuhInput } from '@/types';
import { Plus, Wheat, Egg, Bird, Pencil, StickyNote } from 'lucide-react';
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

  const { puyuhGroups, feedTypes, totalPuyuh, isLoading: puyuhLoading, loadPuyuh, loadFeedTypes, addPuyuh, updatePuyuh } = usePuyuhStore();
  const { feeds, dailyFeedKg, isLoading: feedLoading, loadFeeds, addFeed } = useFeedStore();
  const { todayProduction, monthlyStats, isLoading: prodLoading, loadProductions, addProduction, recordDeadPuyuh } = useProductionStore();

  const [showPuyuhForm, setShowPuyuhForm] = useState(false);
  const [editingPuyuh, setEditingPuyuh] = useState<Puyuh | undefined>(undefined);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const handlePuyuhSubmit = async (data: PuyuhInput, deadCount: number) => {
    if (editingPuyuh) {
      await updatePuyuh(editingPuyuh.id, data);
      if (deadCount > 0) {
        await recordDeadPuyuh(deadCount);
      }
    } else {
      await addPuyuh(data);
    }
  };

  const openEditPuyuh = (puyuh: Puyuh) => {
    setEditingPuyuh(puyuh);
    setShowPuyuhForm(true);
  };

  const handleClosePuyuhForm = () => {
    setShowPuyuhForm(false);
    setEditingPuyuh(undefined);
  };

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

        <div className="action-grid">
          <button className="action-btn bg-red" onClick={() => {
            setEditingPuyuh(undefined);
            setShowPuyuhForm(true);
          }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Tambah Puyuh
          </button>
          <button className="action-btn bg-blue" disabled={puyuhGroups.length === 0} onClick={() => setShowFeedForm(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Wheat size={16} /> Catat Pakan
          </button>
          <button className="action-btn bg-green" onClick={() => setShowProductionForm(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Egg size={16} /> Catat Produksi
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
          <div className="no-prod-banner glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Egg size={18} />
            <p>Belum ada catatan produksi hari ini</p>
          </div>
        )}
      </section>

      {/* Puyuh Groups */}
      <section className="groups-section">
        <div className="section-header">
          <h2 className="section-title">kandang</h2>
          <span className="section-count">{puyuhGroups.length} grup</span>
        </div>

        {isLoading && puyuhGroups.length === 0 ? (
          <div className="loading-state">Memuat data...</div>
        ) : puyuhGroups.length === 0 ? (
          <div className="empty-box glass-panel">
            <Bird size={48} strokeWidth={1.5} className="text-muted" opacity={0.5} />
            <p className="empty-text">Belum ada data puyuh</p>
          </div>
        ) : (
          <div className="group-list">
            {(showAllGroups ? puyuhGroups : puyuhGroups.slice(0, 3)).map((item) => {
              const latestFeed = getLatestFeedByPuyuh(feeds, item.id);

              return (
                <div key={item.id} className="group-card fade-in-up">
                  <div className="group-top" style={{ alignItems: 'flex-start' }}>
                    <div className="group-meta">
                      <h3 className="group-age" style={{ fontSize: '1.5rem', textTransform: 'capitalize' }}>
                        {item.kandang || 'Kandang -'}
                      </h3>

                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Row: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{item.row || '-'}</span>
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Kolom: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{item.kolom || '-'}</span>
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Populasi: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{formatNumber(item.count)} ekor</span>
                        </span>
                      </div>
                    </div>
                    <div className="group-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditPuyuh(item)}
                        title="Edit Data"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold' }}>
                      Usia {calculateAge(item.age_months, item.created_at)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {latestFeed && (
                    <div className="feed-info">
                      <p className="feed-info-text" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Wheat size={14} /> {latestFeed.frequency_per_day}x/hari · {latestFeed.amount_per_bird}g/ekor · {latestFeed.total_amount.toFixed(2)} kg total
                      </p>
                    </div>
                  )}

                  {item.notes && <p className="group-notes" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><StickyNote size={14} /> {item.notes}</p>}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && puyuhGroups.length > 3 && (
          <button
            className="btn"
            style={{
              width: '100%',
              marginTop: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--accent-color)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
            onClick={() => setShowAllGroups(!showAllGroups)}
          >
            {showAllGroups ? 'Sembunyikan' : `Lihat Semua (${puyuhGroups.length})`}
          </button>
        )}
      </section>
      {/* Forms */}
      <PuyuhForm
        isOpen={showPuyuhForm}
        onClose={handleClosePuyuhForm}
        onSubmit={handlePuyuhSubmit}
        isLoading={puyuhLoading}
        initialData={editingPuyuh}
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
