import { useEffect, useMemo, useState } from 'react';
import { usePuyuhStore } from '@/stores/puyuhStore';
import { useFeedStore } from '@/stores/feedStore';
import { useProductionStore } from '@/stores/productionStore';
import { calculateAge, formatNumber, formatDate, getCurrentDate, getDateRange, getMonthYear } from '@/utils/format';
import type { DailyFeed, Puyuh, PuyuhInput } from '@/types';
import { Plus, Wheat, Bird, Pencil, Info, History, ChevronRight, Trash, Calendar } from 'lucide-react';
import { DailyFeedQueries } from '@/database/queries/feed.queries';
import { useRef } from 'react';
import PuyuhForm from '@/components/forms/PuyuhForm';
import FeedForm from '@/components/forms/FeedForm';
import BuyFeedForm from '@/components/forms/BuyFeedForm';
import { useFinanceStore } from '@/stores/financeStore';
import { TransactionType } from '@/types';
import Modal from '@/components/ui/Modal';
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

  const { puyuhGroups, totalPuyuh, isLoading: puyuhLoading, loadPuyuh, addPuyuh, updatePuyuh, deletePuyuh } = usePuyuhStore();
  const { feeds, stockKg, feedPerQuailGrams, setFeedPerQuailGrams, isLoading: feedLoading, loadFeeds, addFeed, addStock, setStockExact } = useFeedStore();
  const { loadProductions, recordDeadPuyuh } = useProductionStore();
  const { addTransaction, isLoading: financeLoading } = useFinanceStore();

  const [showPuyuhForm, setShowPuyuhForm] = useState(false);
  const [editingPuyuh, setEditingPuyuh] = useState<Puyuh | undefined>(undefined);
  const [showBuyFeedForm, setShowBuyFeedForm] = useState(false);
  const [selectedGroupForFeed, setSelectedGroupForFeed] = useState<{puyuh: Puyuh, totalCount: number} | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [editStockValue, setEditStockValue] = useState('');
  const [editFeedRateValue, setEditFeedRateValue] = useState('');
  const [showFeedHistory, setShowFeedHistory] = useState(false);
  const [selectedHistoryGroup, setSelectedHistoryGroup] = useState<string | null>(null);
  const [puyuhToDelete, setPuyuhToDelete] = useState<Puyuh | null>(null);
  const [insufficientFeedAlert, setInsufficientFeedAlert] = useState<{required: number, count: number} | null>(null);

  const [historyDate, setHistoryDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [historyFeeds, setHistoryFeeds] = useState<DailyFeed[]>([]);
  const historyMonthInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showFeedHistory) return;
    const { start, end } = getDateRange(historyDate.year, historyDate.month);
    DailyFeedQueries.getRange(start, end)
      .then(setHistoryFeeds)
      .catch(console.error);
  }, [showFeedHistory, historyDate.year, historyDate.month]);

  // Initialize edit forms when opening modal
  const handleOpenEditStockModal = () => {
    setEditStockValue(stockKg.toString());
    setEditFeedRateValue(feedPerQuailGrams.toString());
    setShowEditStockModal(true);
  };

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

  const handleDeletePuyuh = (puyuh: Puyuh) => {
    setPuyuhToDelete(puyuh);
  };

  const confirmDeletePuyuh = async () => {
    if (!puyuhToDelete) return;
    try {
      await deletePuyuh(puyuhToDelete.id);
      setPuyuhToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kandang');
    }
  };

  const handleClosePuyuhForm = () => {
    setShowPuyuhForm(false);
    setEditingPuyuh(undefined);
  };

  useEffect(() => {
    loadPuyuh();
    loadFeeds(year, month);
    loadProductions(year, month);
  }, [loadPuyuh, loadFeeds, loadProductions, year, month]);

  return (
    <div className="nexpuyuh-page fade-in">
      {/* Page Header */}
      <div className="np-header">
        <div>
          <h2 className="np-title">Manajemen Kandang</h2>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="np-stats-grid">
        {/* Total Puyuh */}
        <div className="np-glass-card glow-primary np-floating-icon-card" style={{ padding: '0.5rem', minHeight: '80px' }}>
          <div className="np-icon-box np-icon-primary">
            <Bird size={20} />
          </div>
          <p className="np-stat-label" style={{ margin: 0 }}>Total Puyuh</p>
          <p className="np-stat-value" style={{ fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>{formatNumber(totalPuyuh)}</p>
          <button className="np-btn-card-icon-action text-primary" onClick={() => {
            setEditingPuyuh(undefined);
            setShowPuyuhForm(true);
          }}>
            <Plus size={16} />
          </button>
        </div>


        {/* Sisa Pakan */}
        <div className="np-glass-card glow-amber np-floating-icon-card" style={{ padding: '0.5rem', minHeight: '80px' }}>
          <div className="np-icon-box np-icon-secondary">
            <Wheat size={20} />
          </div>
          <p className="np-stat-label" style={{ margin: 0 }}>Sisa Pakan</p>
          <p className="np-stat-value" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>
            <span>{stockKg.toFixed(2)}</span>
            <span style={{ fontSize: '0.6em', fontWeight: 500, color: 'var(--p-on-surface-var)' }}>kg</span>
          </p>
          
          <button className="np-btn-card-icon-action text-secondary" style={{ top: '0.35rem', right: '0.35rem', bottom: 'auto' }} onClick={handleOpenEditStockModal} title="Koreksi Sisa Pakan">
            <Pencil size={16} />
          </button>
          <button className="np-btn-card-icon-action text-secondary" onClick={() => setShowBuyFeedForm(true)} title="Tambah Sisa Pakan (Beli)">
            <Plus size={16} />
          </button>
        </div>

      </div>


      {/* Content Area: Quail Group List */}
      <div className="np-groups-section">
        <h3 className="np-section-title">Group Kandang</h3>
        <div className="np-groups-grid">
          {(() => {
            const groupedPuyuhs = new Map<string, Puyuh[]>();
            puyuhGroups.forEach(p => {
              const key = p.kandang?.trim() || 'Tanpa Kandang';
              if (!groupedPuyuhs.has(key)) groupedPuyuhs.set(key, []);
              groupedPuyuhs.get(key)!.push(p);
            });
            const groupedArray = Array.from(groupedPuyuhs.entries()).map(([kandang, items]) => ({ kandang, items }));

            return groupedArray.map(({ kandang, items }) => {
              const latestFeed = getLatestFeedByPuyuh(feeds, items[0].id);
              const isFedToday = !!latestFeed && latestFeed.date === getCurrentDate();
              const progressColor = isFedToday ? 'primary' : 'secondary';
              const progressValue = isFedToday ? '100%' : '0%';

              return (
                <div key={kandang} className="np-glass-card np-group-card">
                  <div className="np-group-header">
                    <div>
                      <h4 className="np-group-title">Kandang {kandang !== 'Tanpa Kandang' ? kandang : '-'}</h4>
                    </div>
                  </div>

                  <div className="np-group-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {items.map((subItem, idx) => (
                        <div key={subItem.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px' }}>
                          <div>
                            <p className="np-group-stat-label" style={{ fontSize: '0.75rem' }}>Populasi {items.length > 1 ? idx + 1 : ''}</p>
                            <p className="np-group-stat-val" style={{ fontSize: '0.9rem' }}>{formatNumber(subItem.count)}</p>
                          </div>
                          <div>
                            <p className="np-group-stat-label" style={{ fontSize: '0.75rem' }}>Usia</p>
                            <p className="np-group-stat-val" style={{ fontSize: '0.9rem' }}>{calculateAge(subItem.age_months, subItem.created_at)}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="np-icon-btn" style={{ width: '1.75rem', height: '1.75rem' }} onClick={() => openEditPuyuh(subItem)} title="Edit Data">
                              <Pencil size={14} />
                            </button>
                            <button className="np-icon-btn" style={{ width: '1.75rem', height: '1.75rem', color: 'var(--p-error)' }} onClick={() => handleDeletePuyuh(subItem)} title="Hapus Data">
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="np-feed-status" style={{ marginTop: 'auto' }}>
                      <p className="np-group-stat-label">Status Pakan Kandang</p>
                      <div className="np-progress-row">
                        <span className={`np-progress-text text-${progressColor}`}>
                          {isFedToday ? 'Selesai' : 'Belum'}
                        </span>
                        <div className="np-progress-bar">
                          <div className={`np-progress-fill bg-${progressColor}`} style={{ width: progressValue }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Action (e.g. Photo) */}
                  {isFedToday && latestFeed?.photo && (
                    <button
                      onClick={() => setPreviewPhoto(latestFeed.photo!)}
                      className="np-btn np-btn-secondary"
                      style={{ marginBottom: '0.75rem', width: '100%', justifyContent: 'center' }}
                    >
                      Lihat Bukti Pakan
                    </button>
                  )}

                  <button
                    className={`np-btn np-btn-full ${isFedToday ? 'np-btn-secondary' : 'np-btn-primary'}`}
                    onClick={() => {
                      const totalCount = items.reduce((sum, i) => sum + i.count, 0);
                      const kgUsed = (totalCount * 25) / 1000;
                      if (!isFedToday && stockKg < kgUsed) {
                        setInsufficientFeedAlert({ required: kgUsed, count: totalCount });
                      } else {
                        setSelectedGroupForFeed({ puyuh: items[0], totalCount });
                      }
                    }}
                  >
                    <Wheat size={18} /> {isFedToday ? 'Edit Pakan' : 'Beri Pakan Sekarang'}
                  </button>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Tombol Riwayat Pakan */}
      <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
        <button className="np-glass-btn" onClick={() => setShowFeedHistory(!showFeedHistory)} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
          <History size={18} /> {showFeedHistory ? 'Tutup Riwayat Beri Pakan Bulan Ini' : 'Lihat Riwayat Beri Pakan Bulan Ini'}
        </button>
      </div>

      {showFeedHistory && (
        <div className="np-groups-section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="np-section-title" style={{ marginBottom: 0 }}>Riwayat Beri Pakan {getMonthYear(historyDate.year, historyDate.month)}</h3>
            <button
              className="np-cycle-picker"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '2.5rem', height: '2.5rem', padding: '0',
                backgroundColor: 'rgba(25, 29, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem', cursor: 'pointer', position: 'relative'
              }}
              onClick={() => {
                const input = historyMonthInputRef.current as any;
                if (input && 'showPicker' in input) {
                  try { input.showPicker(); } catch (e) { input.focus(); }
                } else {
                  input?.focus();
                }
              }}
            >
              <Calendar size={18} className="text-primary" />
              <input
                ref={historyMonthInputRef}
                type="month"
                value={`${historyDate.year}-${historyDate.month.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m] = e.target.value.split('-');
                    setHistoryDate({ year: parseInt(y), month: parseInt(m) });
                  }
                }}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
            </button>
          </div>
          {(() => {
            const groupedPuyuhs = new Map<string, Puyuh[]>();
            puyuhGroups.forEach(p => {
              const key = p.kandang?.trim() || 'Tanpa Kandang';
              if (!groupedPuyuhs.has(key)) groupedPuyuhs.set(key, []);
              groupedPuyuhs.get(key)!.push(p);
            });
            const groupedArray = Array.from(groupedPuyuhs.entries()).map(([kandang, items]) => ({ kandang, items }));

            return (
              <>
                <div className="np-groups-grid">
                  {groupedArray.map(({ kandang }) => (
                    <div key={kandang} className="np-glass-card" onClick={() => setSelectedHistoryGroup(kandang)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                      <h4 className="np-group-title" style={{ marginBottom: 0 }}>Kandang {kandang !== 'Tanpa Kandang' ? kandang : '-'}</h4>
                      <ChevronRight size={20} style={{ color: 'var(--p-on-surface-var)' }} />
                    </div>
                  ))}
                  {groupedArray.length === 0 && (
                    <div className="np-empty-state" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(50, 54, 42, 0.4)', borderRadius: '12px' }}>
                      <p>Tidak ada data kandang.</p>
                    </div>
                  )}
                </div>

                <Modal 
                  isOpen={!!selectedHistoryGroup} 
                  onClose={() => setSelectedHistoryGroup(null)} 
                  title={`Riwayat Pakan: Kandang ${selectedHistoryGroup !== 'Tanpa Kandang' ? selectedHistoryGroup : '-'}`}
                  customStyle={{ width: '90vw', maxWidth: 'none', height: '90vh', margin: 'auto' }}
                >
                  {(() => {
                    if (!selectedHistoryGroup) return null;
                    const targetGroup = groupedArray.find(g => g.kandang === selectedHistoryGroup);
                    if (!targetGroup) return null;
                    
                    const groupIds = targetGroup.items.map(i => i.id);
                    const groupFeeds = historyFeeds.filter(f => groupIds.includes(f.puyuh_id));
                    
                    return (
                <div className="np-groups-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {groupFeeds.map((feed) => (
                    <div key={feed.id} className="np-glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', aspectRatio: '1 / 1', position: 'relative' }}>
                      <p style={{ position: 'absolute', top: '0.5rem', left: '0.6rem', margin: 0, fontSize: '0.65rem', fontWeight: 700, color: 'var(--p-on-surface-var)' }}>
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(feed.date))}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-on-surface)' }}>
                          {formatDate(feed.date)}
                        </p>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span className="np-badge np-badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>Selesai</span>
                        </div>
                      </div>

                      {feed.photo && (
                        <button
                          onClick={() => setPreviewPhoto(feed.photo!)}
                          className="np-btn np-btn-secondary"
                          style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.7rem', marginTop: 'auto' }}
                        >
                          Lihat Bukti
                        </button>
                      )}
                    </div>
                  ))}

                  {groupFeeds.length === 0 && (
                    <div className="np-empty-state" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(50, 54, 42, 0.4)', borderRadius: '12px' }}>
                      <p>Belum ada riwayat beri pakan untuk kandang ini di bulan ini.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </Modal>
        </>
      );
    })()}
  </div>
)}

      {/* Forms */}
      <PuyuhForm
        isOpen={showPuyuhForm}
        onClose={handleClosePuyuhForm}
        onSubmit={handlePuyuhSubmit}
        isLoading={puyuhLoading}
        initialData={editingPuyuh}
      />
      <BuyFeedForm
        isOpen={showBuyFeedForm}
        onClose={() => setShowBuyFeedForm(false)}
        onSubmit={async (data) => {
          await addTransaction({
            date: data.date,
            amount: data.amount,
            description: data.description,
            transaction_type: TransactionType.EXPENSE,
            category_id: 'exp_feed'
          });
          const match = data.description.match(/Beli Pakan (\d+(\.\d+)?) kg/i);
          if (match) {
            addStock(parseFloat(match[1]));
          }
        }}
        isLoading={financeLoading}
      />
      <FeedForm
        isOpen={!!selectedGroupForFeed}
        onClose={() => setSelectedGroupForFeed(null)}
        onSubmit={async (data) => {
          const count = selectedGroupForFeed?.totalCount || 25;
          const kgUsed = (count * 25) / 1000;
          await addFeed(data, kgUsed);
          setSelectedGroupForFeed(null);
        }}
        selectedGroup={selectedGroupForFeed ? { id: selectedGroupForFeed.puyuh.id, name: `Kandang ${selectedGroupForFeed.puyuh.kandang || '-'} (${formatNumber(selectedGroupForFeed.totalCount)} ekor)`, count: selectedGroupForFeed.totalCount } : null}
        isLoading={feedLoading}
      />

      <Modal isOpen={!!previewPhoto} onClose={() => setPreviewPhoto(null)} title="Bukti Pakan Harian">
        <div style={{ textAlign: 'center' }}>
          {previewPhoto && (
            <img src={previewPhoto} alt="Bukti pakan" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '70vh', objectFit: 'contain' }} />
          )}
          <button
            className="np-btn np-btn-secondary"
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            onClick={() => setPreviewPhoto(null)}
          >
            Tutup
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!puyuhToDelete} onClose={() => setPuyuhToDelete(null)} title="Hapus Kandang">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 180, 171, 0.1)', color: 'var(--p-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Trash size={24} />
          </div>
          <p style={{ marginBottom: '1.5rem', color: 'var(--p-on-surface-var)' }}>
            Apakah Anda yakin ingin menghapus <strong>Kandang {puyuhToDelete?.kandang || '-'}</strong>?<br />
            Data ini tidak dapat dikembalikan.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="np-btn np-btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setPuyuhToDelete(null)}
            >
              Batal
            </button>
            <button
              className="np-btn"
              style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--p-error)', color: '#690005', border: 'none' }}
              onClick={confirmDeletePuyuh}
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditStockModal} onClose={() => setShowEditStockModal(false)} title="Koreksi Sisa Pakan">
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--p-on-surface-var)' }}>Sisa Pakan Aktual (kg)</label>
            <input
              type="number"
              className="np-form-input"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}
              value={editStockValue}
              onChange={(e) => setEditStockValue(e.target.value)}
              min="0"
              step="0.1"
              placeholder="0.0"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--p-on-surface-var)' }}>Takaran Pakan per Puyuh (gram)</label>
            <input
              type="number"
              className="np-form-input"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}
              value={editFeedRateValue}
              onChange={(e) => setEditFeedRateValue(e.target.value)}
              min="1"
              step="1"
              placeholder="25"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              className="np-btn np-btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setShowEditStockModal(false)}
            >
              Batal
            </button>
            <button
              className="np-btn np-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                const stockVal = parseFloat(editStockValue);
                const rateVal = parseInt(editFeedRateValue);
                
                if (isNaN(stockVal) || stockVal < 0) {
                  alert("Nilai sisa pakan tidak valid");
                  return;
                }
                if (isNaN(rateVal) || rateVal <= 0) {
                  alert("Nilai takaran pakan tidak valid");
                  return;
                }

                setStockExact(stockVal);
                setFeedPerQuailGrams(rateVal);
                
                // Reload summary immediately so values update everywhere
                loadFeeds(year, month);
                setShowEditStockModal(false);
              }}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!insufficientFeedAlert} onClose={() => setInsufficientFeedAlert(null)} title="Peringatan Pakan">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 185, 95, 0.1)', color: 'var(--p-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Info size={24} />
          </div>
          <p style={{ marginBottom: '1.5rem', color: 'var(--p-on-surface-var)', lineHeight: 1.5 }}>
            Sisa pakan tidak cukup! Kandang ini membutuhkan <strong>{insufficientFeedAlert?.required.toFixed(1)} kg</strong> pakan untuk {insufficientFeedAlert?.count} ekor puyuh, sedangkan sisa pakan Anda saat ini hanya <strong>{stockKg.toFixed(1)} kg</strong>.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="np-btn np-btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setInsufficientFeedAlert(null)}
            >
              Tutup
            </button>
            <button
              className="np-btn np-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                setInsufficientFeedAlert(null);
                setShowBuyFeedForm(true);
              }}
            >
              Beli Pakan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

