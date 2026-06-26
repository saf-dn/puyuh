import { useEffect, useState } from 'react';
import { useProductionStore } from '@/stores/productionStore';
import { formatNumber, getCurrentDate, formatCurrency } from '@/utils/format';
import { Egg, Camera, Pencil, Receipt, ShoppingCart, CalendarDays, ChevronDown, RefreshCw } from 'lucide-react';
import type { DailyProduction } from '@/types';
import ProductionForm from '@/components/forms/ProductionForm';
import SalesForm from '@/components/forms/SalesForm';
import Modal from '@/components/ui/Modal';
import './ProductionPage.css';

export default function ProductionPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const {
    todayProduction,
    monthlyStats,
    productions,
    isLoading,
    loadProductions,
    addProduction,
    updateProduction,
  } = useProductionStore();

  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);

  const [editingProduction, setEditingProduction] = useState<DailyProduction | null>(null);
  const [editingSales, setEditingSales] = useState<DailyProduction | null>(null);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'production'>('sales');
  const [showAllList, setShowAllList] = useState(false);

  useEffect(() => {
    loadProductions(year, month);
  }, [loadProductions, year, month]);

  const todayDate = getCurrentDate();
  const salesListToday = productions.filter(p => (p.eggs_sold_count || 0) > 0 && p.date === todayDate);
  const prodListToday = productions.filter(p => ((p.eggs_produced_count || 0) > 0 || (p.eggs_broken_count || 0) > 0) && p.date === todayDate);
  const salesListAll = productions.filter(p => (p.eggs_sold_count || 0) > 0);
  const prodListAll = productions.filter(p => ((p.eggs_produced_count || 0) > 0 || (p.eggs_broken_count || 0) > 0));

  const producedToday = todayProduction?.eggs_produced_count ?? 0;

  const brokenToday = todayProduction?.eggs_broken_count ?? 0;

  const renderTable = (sList: DailyProduction[], pList: DailyProduction[]) => (
    <table className="np-table w-full">
      {activeTab === 'sales' ? (
        <>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Pembeli</th>
              <th>Jumlah </th>
              <th>Pendapatan</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted">Belum ada data penjualan.</td>
              </tr>
            ) : (
              sList.slice().reverse().map(prod => (
                <tr key={`sales-${prod.id}`} className="group cursor-pointer">
                  <td>
                    <p className="np-list-subtitle" style={{ margin: 0 }}>{prod.date}</p>
                  </td>
                  <td>
                    <p className="np-list-title group-hover-text-secondary" style={{ margin: 0 }}>{prod.buyer_name || 'Tanpa Nama'}</p>
                  </td>
                  <td>{formatNumber(prod.eggs_sold_count)}</td>
                  <td>{formatCurrency(prod.eggs_sold_count ? prod.eggs_sold_count * (prod.price_per_egg || 400) : 0)}</td>
                  <td>
                    {prod.payment_status === 'sudah_bayar' ? (
                      <span className="np-badge badge-primary">Lunas</span>
                    ) : (
                      <span className="np-badge badge-danger">Belum Lunas</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="np-row-actions">
                      {prod.photo_eggs && (
                        <button className="np-action-icon" onClick={() => setPreviewPhoto(prod.photo_eggs!)} title="Lihat Foto Telur">
                          <Camera size={18} />
                        </button>
                      )}
                      {prod.photo_transfer && (
                        <button className="np-action-icon" onClick={() => setPreviewPhoto(prod.photo_transfer!)} title="Lihat Bukti Transfer">
                          <Receipt size={18} />
                        </button>
                      )}
                      <button className="np-action-icon" onClick={() => { setEditingSales(prod); setShowSalesForm(true); }} title="Edit">
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </>
      ) : (
        <>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Dihasilkan</th>
              <th>Pecah</th>
              <th>Keterangan</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-muted">Belum ada data produksi.</td>
              </tr>
            ) : (
              pList.slice().reverse().map(prod => (
                <tr key={`prod-${prod.id}`} className="group cursor-pointer">
                  <td>
                    <p className="np-list-title group-hover-text-primary" style={{ margin: 0 }}>{prod.date}</p>
                  </td>
                  <td className="text-primary font-medium">+{formatNumber(prod.eggs_produced_count)}</td>
                  <td className="text-error font-medium">{formatNumber(prod.eggs_broken_count)}</td>
                  <td><span className="np-list-subtitle">-</span></td>
                  <td className="text-right">
                    <div className="np-row-actions">
                      <button className="np-action-icon" onClick={() => { setEditingProduction(prod); setShowProductionForm(true); }} title="Edit">
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </>
      )}
    </table>
  );


  return (
    <div className="np-production-page fade-in">
      {/* Header Section */}
      <div className="np-prod-header-section" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="np-prod-title">Produksi & Penjualan</h2>
          <button
            onClick={() => loadProductions(year, month)}
            disabled={isLoading}
            className="np-action-icon"
            style={{ padding: '0.5rem', background: 'var(--p-surface-elevated)', borderRadius: '0.5rem', opacity: isLoading ? 0.5 : 1 }}
            title="Muat Ulang Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Main Actions Card */}
        <div className="np-glass-card">
          <div className="np-prod-actions-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            <button
              className="np-primary-btn np-action-btn"
              style={{ padding: '1rem', width: '100%', fontSize: '1rem', justifyContent: 'center' }}
              onClick={() => setShowProductionForm(true)}
            >
              <Egg size={20} /> Catat Produksi
            </button>

            <button
              className="np-glass-btn np-action-btn"
              style={{ padding: '1rem', width: '100%', fontSize: '1rem', justifyContent: 'center' }}
              onClick={() => setShowSalesForm(true)}
            >
              <ShoppingCart size={20} className="text-secondary" /> Catat Penjualan
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="np-prod-top-stats">
        {/* Stat Card 1: Telur Hari Ini */}
        <div className="np-glass-card flex flex-col" style={{ minHeight: '180px' }}>
          <div className="flex items-start mb-2">
            <p className="flex items-center gap-2 font-label-md text-on-surface-variant font-medium m-0">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--p-primary)]"></span> Telur Hari Ini
            </p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="font-bold text-on-surface m-0" style={{ fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1 }}>{formatNumber(producedToday)}</h3>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-label-md text-on-surface-variant m-0">
              {formatNumber(brokenToday)} Pecah
            </p>
          </div>
        </div>

        {/* Stat Card 2: Telur Bulan Ini */}
        <div className="np-glass-card flex flex-col" style={{ minHeight: '180px' }}>
          <div className="flex items-start mb-2">
            <p className="flex items-center gap-2 font-label-md text-on-surface-variant font-medium m-0">
              <span className="w-2 h-2 rounded-full bg-tertiary-dim shadow-[0_0_8px_var(--p-tertiary-dim)]"></span> Telur Bulan Ini
            </p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="font-bold text-on-surface m-0" style={{ fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1 }}>{formatNumber(monthlyStats?.total_eggs_produced ?? 0)}</h3>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-label-md text-error-80 m-0">
              {formatNumber(monthlyStats?.total_eggs_broken ?? 0)} Pecah
            </p>
          </div>
        </div>

        {/* Stat Card 3: Terjual Bulan Ini */}
        <div className="np-glass-card flex flex-col" style={{ minHeight: '180px' }}>
          <div className="flex items-start mb-2">
            <p className="flex items-center gap-2 font-label-md text-on-surface-variant font-medium m-0">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--p-secondary)]"></span> Terjual Bulan Ini
            </p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="font-bold text-on-surface m-0" style={{ fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1 }}>{formatNumber(monthlyStats?.total_eggs_sold ?? 0)}</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Area (Bento Grid) */}
      <div className="np-prod-main-grid">
        {/* Left Column: Production Status & Recent History */}
        <div className="np-prod-left-col">
          {/* Tabs & Lists Area */}
          <div className="np-glass-card np-tabs-container">
            {/* Tab Headers */}
            <div className="np-tabs-header">
              <button
                className={`np-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                onClick={() => setActiveTab('sales')}
              >
                Riwayat Penjualan
              </button>
              <button
                className={`np-tab-btn ${activeTab === 'production' ? 'active' : ''}`}
                onClick={() => setActiveTab('production')}
              >
                Riwayat Produksi
              </button>
            </div>

            {/* List Content */}
            <div className="np-tabs-content">
              {renderTable(salesListToday, prodListToday)}
            </div>

            {/* Footer Actions (Sticky at bottom of card) */}
            <div className="np-load-more" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="np-load-more-btn" onClick={() => setShowAllList(true)}>
                Lihat Semua Riwayat <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      <ProductionForm
        isOpen={showProductionForm}
        onClose={() => {
          setShowProductionForm(false);
          setEditingProduction(null);
        }}
        onSubmit={async (data) => {
          if (editingProduction) {
            await updateProduction(editingProduction.id, data);
          } else {
            await addProduction(data);
          }
        }}
        isLoading={isLoading}
        initialData={editingProduction}
        todayProduction={todayProduction}
      />

      <SalesForm
        isOpen={showSalesForm}
        onClose={() => {
          setShowSalesForm(false);
          setEditingSales(null);
        }}
        onSubmit={async (data) => {
          if (editingSales) {
            await updateProduction(editingSales.id, data);
          } else {
            await addProduction(data);
          }
        }}
        isLoading={isLoading}
        initialData={editingSales}
        todayProduction={todayProduction}
      />

      <Modal isOpen={!!previewPhoto} onClose={() => setPreviewPhoto(null)} title="Lihat Foto">
        <div className="text-center">
          {previewPhoto && (
            <img src={previewPhoto} alt="Preview" className="max-w-full rounded-lg max-h-[70vh] object-contain mx-auto" />
          )}
          <button
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md font-bold hover:bg-primary-fixed transition-colors mt-4"
            onClick={() => setPreviewPhoto(null)}
          >
            Tutup
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={showAllList}
        onClose={() => setShowAllList(false)}
        title="Semua Riwayat"
        customStyle={{ width: '90vw', maxWidth: 'none', height: '90vh', margin: 'auto' }}
      >
        <div className="np-tabs-header" style={{ marginBottom: '1rem', backgroundColor: 'transparent' }}>
          <button
            className={`np-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Riwayat Penjualan
          </button>
          <button
            className={`np-tab-btn ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => setActiveTab('production')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Riwayat Produksi
          </button>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(90vh - 150px)', overflowY: 'auto' }}>
          {renderTable(salesListAll, prodListAll)}
        </div>
      </Modal>
    </div>
  );
}
