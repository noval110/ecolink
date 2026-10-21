import React, { useState } from 'react';
import {
  Search,
  Filter,
  ReceiptText,
  ShieldCheck,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  X,
  Clock,
  Target,
  FileCheck2,
  DollarSign,
  Download,
  Share2
} from 'lucide-react';
import { USER_TRANSACTIONS } from '../../data/mockUserData';

export default function UserTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeReceipt, setActiveReceipt] = useState(null);

  const categories = ['Semua', 'Plastik', 'Kertas', 'Minyak', 'Logam'];

  const filteredTransactions = USER_TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Semua' ||
      tx.items.some(i => i.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const totalKgAccumulated = USER_TRANSACTIONS.reduce((acc, curr) => acc + curr.totalKg, 0);
  const totalRupiahAccumulated = USER_TRANSACTIONS.reduce((acc, curr) => acc + curr.rupiahAmount, 0);
  const totalPointsAccumulated = USER_TRANSACTIONS.reduce((acc, curr) => acc + curr.pointsEarned, 0);

  return (
    <div className="user-transactions-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Jejak Audit Terverifikasi</span>
          </div>
          <h1 className="page-title">Riwayat Transaksi Penyetoran</h1>
          <p className="page-sub">
            Seluruh catatan transaksi penyetoran sampah fisik yang telah divalidasi dan ditimbang oleh petugas resmi Bank Sampah.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="transactions-summary-strip">
        <div className="tx-summary-card">
          <span className="lbl">Total Transaksi Sah</span>
          <strong className="val">{USER_TRANSACTIONS.length} Transaksi</strong>
          <span className="sub text-emerald">100% Terverifikasi Timbangan</span>
        </div>
        <div className="tx-summary-card">
          <span className="lbl">Akumulasi Bobot Sampah</span>
          <strong className="val text-emerald">{totalKgAccumulated.toFixed(1)} kg</strong>
          <span className="sub">Tercatat di Eco Passport</span>
        </div>
        <div className="tx-summary-card">
          <span className="lbl">Total Pendapatan Rupiah</span>
          <strong className="val text-gold">Rp {totalRupiahAccumulated.toLocaleString('id-ID')}</strong>
          <span className="sub">Telah diterima tunai / transfer</span>
        </div>
        <div className="tx-summary-card">
          <span className="lbl">Bonus Poin Diperoleh</span>
          <strong className="val">+{totalPointsAccumulated.toLocaleString()} poin</strong>
          <span className="sub">Meningkatkan level paspor</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="discovery-filter-box" style={{ marginBottom: '2rem' }}>
        <div className="discovery-search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID transaksi, nama bank sampah, atau jenis material..."
              className="discovery-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="material-filter-scroll">
          <span className="material-filter-label">Filter Material:</span>
          <div className="material-filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List Cards */}
      {filteredTransactions.length === 0 ? (
        <div className="discovery-empty-state">
          <div className="empty-icon-box">
            <ReceiptText size={32} color="rgba(255,255,255,0.4)" />
          </div>
          <h4>Tidak Ada Transaksi yang Ditemukan</h4>
          <p>Coba gunakan kata kunci pencarian lain atau ubah filter kategori material.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="btn btn-outline btn-sm"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="transactions-stack">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="tx-full-card" onClick={() => setActiveReceipt(tx)}>
              <div className="tx-full-header">
                <div className="tx-id-badge-col">
                  <div className="tx-id-row">
                    <ReceiptText size={18} className="text-emerald" />
                    <strong className="tx-code">{tx.id}</strong>
                    <span className="tx-pill-sah">
                      <ShieldCheck size={13} /> {tx.status}
                    </span>
                  </div>
                  <span className="tx-time-text">
                    <Clock size={13} /> {tx.date}
                  </span>
                </div>

                <div className="tx-total-amounts">
                  <span className="tx-kg-pill">+{tx.totalKg} kg</span>
                  <span className="tx-rp-pill">Rp {tx.rupiahAmount.toLocaleString('id-ID')}</span>
                  <span className="tx-pts-pill">+{tx.pointsEarned} poin</span>
                </div>
              </div>

              <div className="tx-full-body">
                <div className="tx-bank-row">
                  <MapPin size={15} className="text-emerald shrink-0" />
                  <strong>{tx.bankName}</strong>
                  <span className="tx-bank-addr">({tx.bankAddress})</span>
                </div>

                {tx.campaignName && (
                  <div className="tx-campaign-link-row">
                    <Target size={14} className="text-blue shrink-0" />
                    <span>Terhubung ke Kampanye: <strong>{tx.campaignName}</strong></span>
                  </div>
                )}

                <div className="tx-items-preview-tags">
                  {tx.items.map((item, idx) => (
                    <span key={idx} className="tx-item-tag">
                      {item.name} • <strong>{item.weightKg} kg</strong> (Rp {item.subtotal.toLocaleString('id-ID')})
                    </span>
                  ))}
                </div>
              </div>

              <div className="tx-full-footer">
                <span className="tx-teller-info">Petugas: <strong>{tx.tellerName}</strong></span>
                <button type="button" className="btn btn-outline btn-xs btn-open-receipt">
                  <span>Buka Struk Digital Resmi</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Digital Receipt Modal */}
      {activeReceipt && (
        <div className="modal-backdrop" onClick={() => setActiveReceipt(null)}>
          <div className="tx-receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <div>
                <span className="receipt-tag">E-RECEIPT RESMI BANK SAMPAH</span>
                <h3 className="receipt-id">{activeReceipt.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveReceipt(null)}
                aria-label="Tutup Struk"
              >
                <X size={18} />
              </button>
            </div>

            <div className="receipt-modal-body">
              <div className="receipt-verified-banner">
                <ShieldCheck size={20} className="text-emerald shrink-0" />
                <div>
                  <strong>Transaksi Terverifikasi Timbangan Fisik</strong>
                  <p>Kode Keabsahan Audit: {activeReceipt.verificationCode}</p>
                </div>
              </div>

              <div className="receipt-info-grid">
                <div>
                  <span className="lbl">Nama Bank Sampah:</span>
                  <strong>{activeReceipt.bankName}</strong>
                  <p className="sub">{activeReceipt.bankAddress}</p>
                </div>
                <div>
                  <span className="lbl">Petugas Penimbang:</span>
                  <strong>{activeReceipt.tellerName}</strong>
                  <p className="sub">{activeReceipt.date}</p>
                </div>
              </div>

              {activeReceipt.campaignName && (
                <div className="receipt-campaign-ref">
                  <Target size={15} className="text-emerald shrink-0" />
                  <span>Kontribusi untuk: <strong>{activeReceipt.campaignName}</strong></span>
                </div>
              )}

              <div className="receipt-items-table">
                <div className="receipt-table-header">
                  <span>Nama Material</span>
                  <span>Bobot</span>
                  <span className="text-right">Harga/kg</span>
                  <span className="text-right">Subtotal</span>
                </div>
                {activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="receipt-table-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="item-cat-pill">{item.category}</span>
                    </div>
                    <span>{item.weightKg} kg</span>
                    <span className="text-right">Rp {item.pricePerKg.toLocaleString('id-ID')}</span>
                    <span className="text-right font-semibold">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-total-box">
                <div className="total-row">
                  <span>Total Sampah Disetor:</span>
                  <strong>{activeReceipt.totalKg} kg</strong>
                </div>
                <div className="total-row">
                  <span>Poin Paspor Ditambahkan:</span>
                  <strong className="text-gold">+{activeReceipt.pointsEarned} poin</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Total Rupiah Diterima:</span>
                  <strong className="text-emerald">Rp {activeReceipt.rupiahAmount.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {activeReceipt.notes && (
                <p className="receipt-notes">Catatan Pemeriksaan: "{activeReceipt.notes}"</p>
              )}
            </div>

            <div className="receipt-modal-footer">
              <button
                type="button"
                className="btn btn-outline w-100 justify-center"
                onClick={() => setActiveReceipt(null)}
              >
                Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
