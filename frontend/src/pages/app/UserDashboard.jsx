import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Leaf,
  Droplets,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Trophy,
  ExternalLink,
  ChevronRight,
  ReceiptText,
  MapPin,
  Calendar,
  X,
  Gift
} from 'lucide-react';
import { getActiveUser, USER_TRANSACTIONS, USER_CAMPAIGNS, USER_MISSIONS } from '../../data/mockUserData';

export default function UserDashboard() {
  const [user, setUser] = useState(getActiveUser());
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    const handleProfileChange = () => {
      setUser(getActiveUser());
    };
    window.addEventListener('ecolink_profile_changed', handleProfileChange);
    return () => window.removeEventListener('ecolink_profile_changed', handleProfileChange);
  }, []);

  const levelProgress = Math.round((user.currentXp / user.nextLevelXp) * 100);
  const activeCampaign = USER_CAMPAIGNS[0];
  const recentTransactions = USER_TRANSACTIONS.slice(0, 4);

  return (
    <div className="user-dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-banner-content">
          <div className="welcome-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Portofolio Hijau Terverifikasi • {user.categoryLabel}</span>
          </div>
          <h1 className="welcome-title">
            Halo, {user.name}! 👋
          </h1>
          <p className="welcome-desc">
            Kamu telah mendaur ulang <strong>{user.totalRecycledKg} kg</strong> sampah fisik dan menyelamatkan <strong>{user.co2SavedKg} kg CO₂e</strong> emisi karbon. Setiap aksimu tervalidasi timbangan resmi Bank Sampah mitra!
          </p>
        </div>

        <div className="welcome-banner-quick-pass">
          <div className="mini-passport-chip">
            <div className="chip-header">
              <span className="chip-label">ID PASSPORT</span>
              <span className="chip-status">
                <ShieldCheck size={12} /> Terverifikasi
              </span>
            </div>
            <strong className="chip-code">{user.passportId}</strong>
            <div className="chip-level-badge">
              <span>Level {user.level} • {user.levelTitle.split('(')[0].trim()}</span>
            </div>
            <Link to="/app/passport" className="btn btn-light-green btn-sm w-100 justify-center" style={{ marginTop: '0.65rem' }}>
              <QrCode size={14} />
              <span>Buka Kartu Paspor Penuh</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="dashboard-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-emerald-subtle">
            <Leaf size={22} className="text-emerald" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Total Sampah Didaur Ulang</span>
            <div className="metric-value">
              {user.totalRecycledKg} <span className="metric-unit">kg</span>
            </div>
            <span className="metric-subtext">100% Validasi Timbangan Fisik</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-blue-subtle">
            <TrendingUp size={22} className="text-blue" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Reduksi Jejak Karbon</span>
            <div className="metric-value">
              {user.co2SavedKg} <span className="metric-unit">kg CO₂e</span>
            </div>
            <span className="metric-subtext">Setara 582 km motor bebas emisi</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-gold-subtle">
            <Award size={22} className="text-gold" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Poin EcoLink Terkumpul</span>
            <div className="metric-value text-gold">
              {user.points.toLocaleString()} <span className="metric-unit">poin</span>
            </div>
            <Link to="/app/rewards" className="metric-subtext link-sub">
              Tukar ke Pulsa / Hadiah →
            </Link>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-blue-dark-subtle">
            <Droplets size={22} className="text-blue" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Air Tanah Terlindungi</span>
            <div className="metric-value">
              {user.waterSavedLiter.toLocaleString()} <span className="metric-unit">Liter</span>
            </div>
            <span className="metric-subtext">Dari daur ulang minyak jelantah</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns) */}
      <div className="dashboard-content-grid">
        
        {/* Left Column (Campaign Progress & Recent Transactions) */}
        <div className="dashboard-left-col">
          
          {/* Active Campaign Box */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <span className="inline-badge-tiny">
                  <Target size={14} className="text-emerald" /> KAMPANYE UTAMA YANG DIIKUTI
                </span>
                <h3 className="dash-card-title">{activeCampaign.title}</h3>
                <span className="dash-card-sub">Diselenggarakan oleh: {activeCampaign.organizer}</span>
              </div>
              <Link to={`/campaigns/${activeCampaign.id}`} className="btn btn-outline btn-sm">
                <span>Detail</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="active-campaign-progress-box">
              <div className="xp-text-flex">
                <span>Target Bersama: <strong>{activeCampaign.totalCollectedKg.toLocaleString()} / {activeCampaign.totalTargetKg.toLocaleString()} kg</strong></span>
                <strong className="text-emerald">{Math.round((activeCampaign.totalCollectedKg / activeCampaign.totalTargetKg) * 100)}%</strong>
              </div>
              <div className="xp-track">
                <div
                  className="xp-fill"
                  style={{ width: `${Math.round((activeCampaign.totalCollectedKg / activeCampaign.totalTargetKg) * 100)}%` }}
                />
              </div>
            </div>

            <div className="user-contribution-banner">
              <div className="contribution-item">
                <span className="c-label">Kontribusimu</span>
                <strong className="c-val">{activeCampaign.userContributionKg} kg</strong>
                <span className="c-sub">Timbangan fisik sah</span>
              </div>
              <div className="contribution-item">
                <span className="c-label">Peringkat Kontributor</span>
                <strong className="c-val text-emerald">#3 Teratas</strong>
                <span className="c-sub">Komunitas & Kampus</span>
              </div>
              <div className="contribution-item">
                <span className="c-label">Mitra Penampung</span>
                <strong className="c-val">Berseri</strong>
                <span className="c-sub">Bank Sampah Resmi</span>
              </div>
            </div>
          </div>

          {/* Recent Verified Transactions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Riwayat Transaksi Penyetoran Terverifikasi</h3>
                <span className="dash-card-sub">Semua transaksi dicatat oleh petugas resmi bank sampah</span>
              </div>
              <Link to="/app/transactions" className="btn btn-outline btn-sm">
                <span>Semua Transaksi ({USER_TRANSACTIONS.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="recent-tx-stack">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="tx-item-card"
                  onClick={() => setSelectedTx(tx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tx-icon-box">
                    <ReceiptText size={18} />
                  </div>
                  <div className="tx-info-col">
                    <div className="tx-title-row">
                      <strong className="tx-title">{tx.items.map(i => i.name).join(', ')}</strong>
                      <span className="tx-badge-verified">
                        <CheckCircle2 size={12} /> {tx.status}
                      </span>
                    </div>
                    <div className="tx-meta-row">
                      <span><MapPin size={12} /> {tx.bankName}</span>
                      <span>•</span>
                      <span><Clock size={12} /> {tx.date}</span>
                    </div>
                  </div>
                  <div className="tx-stat-col">
                    <strong className="tx-kg-val">+{tx.totalKg} kg</strong>
                    <span className="tx-pts-val">+{tx.pointsEarned} poin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Level Progress, Missions, Quick Links) */}
        <div className="dashboard-right-col">
          
          {/* Level Hero Widget */}
          <div className="dash-card">
            <div className="level-card-top">
              <div className="level-icon-wrapper">
                <Trophy size={24} />
              </div>
              <div>
                <span className="level-rank-title">{user.levelTitle}</span>
                <h3 className="level-number">Level {user.level}</h3>
              </div>
            </div>

            <div className="xp-progress-block">
              <div className="xp-text-flex">
                <span>{user.currentXp} XP</span>
                <span>{user.nextLevelXp} XP</span>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="xp-hint">
                Kurang <strong>{user.nextLevelXp - user.currentXp} XP</strong> lagi untuk membuka Level {user.level + 1} dan Lencana Pahlawan Daur Ulang.
              </p>
            </div>

            <Link to="/app/badges" className="btn btn-outline w-100 justify-center">
              <span>Lihat Semua Lencana ({user.badgesCount})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Weekly Missions Preview */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Misi Mingguan</h3>
                <span className="dash-card-sub">Selesaikan misi untuk bonus poin & XP</span>
              </div>
            </div>

            <div className="missions-stack">
              {USER_MISSIONS.slice(0, 3).map((mission) => {
                const isDone = mission.progress >= mission.target;
                const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

                return (
                  <div key={mission.id} className="mission-item-box">
                    <div className="mission-top-row">
                      <strong className="mission-name">{mission.title}</strong>
                      {isDone ? (
                        <span className="badge-done">
                          <CheckCircle2 size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="badge-reward">+{mission.rewardPoints} poin</span>
                      )}
                    </div>
                    <div className="mission-track-bg">
                      <div className="mission-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mission-footer-text">
                      <span>{mission.progress} / {mission.target} {mission.unit}</span>
                      {mission.badgeAward && <span className="text-emerald font-semibold">Lencana: {mission.badgeAward}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <Link to="/app/badges" className="btn btn-outline w-100 justify-center" style={{ marginTop: '0.85rem' }}>
              Buka Pusat Misi Lengkap
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="dash-card">
            <h4 className="dash-card-title" style={{ marginBottom: '0.85rem' }}>Aksi Cepat</h4>
            <div className="shortcuts-grid">
              <Link to="/app/rewards" className="shortcut-btn">
                <Gift size={18} className="text-gold" />
                <span>Tukar Poin</span>
              </Link>
              <Link to="/waste-banks" className="shortcut-btn">
                <MapPin size={18} className="text-emerald" />
                <span>Cari Bank Sampah</span>
              </Link>
              <Link to="/campaigns" className="shortcut-btn">
                <Target size={18} className="text-blue" />
                <span>Ikuti Kampanye</span>
              </Link>
              <Link to="/app/passport" className="shortcut-btn">
                <QrCode size={18} className="text-emerald" />
                <span>Eco Passport</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="tx-receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <div>
                <span className="receipt-tag">BUKTI SETORAN SAH</span>
                <h3 className="receipt-id">{selectedTx.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedTx(null)}
                aria-label="Tutup Nota"
              >
                <X size={18} />
              </button>
            </div>

            <div className="receipt-modal-body">
              <div className="receipt-verified-banner">
                <ShieldCheck size={20} className="text-emerald" />
                <div>
                  <strong>Terverifikasi Resmi di Timbangan</strong>
                  <p>Kode Verifikasi: {selectedTx.verificationCode}</p>
                </div>
              </div>

              <div className="receipt-info-grid">
                <div>
                  <span className="lbl">Bank Sampah:</span>
                  <strong>{selectedTx.bankName}</strong>
                  <p className="sub">{selectedTx.bankAddress}</p>
                </div>
                <div>
                  <span className="lbl">Petugas Penimbang:</span>
                  <strong>{selectedTx.tellerName}</strong>
                  <p className="sub">Waktu: {selectedTx.date}</p>
                </div>
              </div>

              {selectedTx.campaignName && (
                <div className="receipt-campaign-ref">
                  <Target size={15} className="text-emerald" />
                  <span>Disalurkan ke: <strong>{selectedTx.campaignName}</strong></span>
                </div>
              )}

              <div className="receipt-items-table">
                <div className="receipt-table-header">
                  <span>Material</span>
                  <span>Berat</span>
                  <span className="text-right">Harga/kg</span>
                  <span className="text-right">Subtotal</span>
                </div>
                {selectedTx.items.map((item, idx) => (
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
                  <span>Total Berat Fisik:</span>
                  <strong>{selectedTx.totalKg} kg</strong>
                </div>
                <div className="total-row">
                  <span>Poin Diperoleh:</span>
                  <strong className="text-gold">+{selectedTx.pointsEarned} poin</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Nilai Rupiah Diterima:</span>
                  <strong className="text-emerald">Rp {selectedTx.rupiahAmount.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {selectedTx.notes && (
                <p className="receipt-notes">Catatan Petugas: "{selectedTx.notes}"</p>
              )}
            </div>

            <div className="receipt-modal-footer">
              <button
                type="button"
                className="btn btn-outline w-100 justify-center"
                onClick={() => setSelectedTx(null)}
              >
                Tutup Bukti Setoran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
