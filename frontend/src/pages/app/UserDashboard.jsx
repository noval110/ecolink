import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Leaf,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Trophy,
  ChevronRight,
  ReceiptText,
  MapPin,
  X,
  Gift
} from 'lucide-react';
import {
  getDashboard,
  getMyCampaigns,
  getMyTransactions,
  getTransactionById,
  getStoredUser,
  getMyMissions,
  getPassport,
} from '../../services/api';

export default function UserDashboard() {
  const [user, setUser] = useState(() => getStoredUser() || {});
  const [missions, setMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [missionsError, setMissionsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [dashboardResult, campaignResult, transactionResult, passportResult] = await Promise.all([
          getDashboard(),
          getMyCampaigns(),
          getMyTransactions(),
          getPassport(),
        ]);
        const data = dashboardResult.data;

        if (!active) return;
        if (!data?.user || !data.stats || !data.impact_summary || !passportResult.data) {
          throw new Error('Data dasbor tidak tersedia.');
        }

        setUser((current) => ({
          ...current,
          full_name: data.user.full_name,
          role: data.user.role,
          passportId: passportResult.data.passport_id,
          totalRecycledKg: data.stats.total_recycled,
          co2SavedKg: Number(data.impact_summary.co2_avoided.toFixed(2)),
          ecoScore: data.stats.eco_score,
          activeCampaignsCount: data.stats.campaign_joined,
          verifiedActions: data.stats.verified_actions,
        }));

        const campaigns = Array.isArray(campaignResult.data) ? campaignResult.data : [];
        setActiveCampaign(campaigns.length > 0 ? campaigns[0] : null);

        const transactions = Array.isArray(transactionResult.data) ? transactionResult.data : [];
        setRecentTransactions(transactions.slice(0, 4));
      } catch (error) {
        if (active) {
          console.error('Failed to load dashboard:', error);
          setError(error.message || 'Gagal memuat dasbor.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadMissions = async () => {
      try {
        const result = await getMyMissions();
        if (active) setMissions(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (active) {
          console.error('Failed to load missions:', err);
          setMissions([]);
          setMissionsError(err.message || 'Gagal memuat misi.');
        }
      } finally {
        if (active) setMissionsLoading(false);
      }
    };
    loadMissions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileChange = () => {
      setUser((current) => ({
        ...current,
        ...(getStoredUser() || {}),
      }));
    };
    window.addEventListener('ecolink_profile_changed', handleProfileChange);
    return () => window.removeEventListener('ecolink_profile_changed', handleProfileChange);
  }, []);

  const handleOpenTransaction = async (id) => {
    if (detailLoading) return;

    setDetailLoading(true);
    setDetailError('');

    try {
      const result = await getTransactionById(id);
      setSelectedTx(result.data);
    } catch (error) {
      console.error('Failed to load transaction detail:', error);
      setDetailError(error.message || 'Gagal memuat detail transaksi.');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard-page" role="status">
        <h3>Memuat dasbor...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard-page">
        <h3>Dasbor tidak dapat dimuat</h3>
        <p role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-banner-content">
          <div className="welcome-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Ringkasan aktivitas • {user.role || 'Pengguna'}</span>
          </div>
          <h1 className="welcome-title">
            Halo, {user.full_name || 'Pengguna'}!
          </h1>
          <p className="welcome-desc">
            Total daur ulangmu <strong>{user.totalRecycledKg} kg</strong>, dengan estimasi pengurangan emisi <strong>{user.co2SavedKg} kg CO₂e</strong> dari setoran terverifikasi.
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
            <strong className="chip-code">{user.passportId || 'ID paspor tidak tersedia'}</strong>
            <div className="chip-level-badge">
              <span>Level & XP belum tersedia</span>
            </div>
            <Link to="/app/passport" className="btn btn-light-green btn-sm w-100 justify-center" style={{ marginTop: '0.65rem' }}>
              <QrCode size={14} />
              <span>Buka Eco Passport</span>
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
            <span className="metric-subtext">Estimasi dari sampah terverifikasi</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-gold-subtle">
            <Award size={22} className="text-gold" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Eco Score</span>
            <div className="metric-value text-gold">
              {(user.ecoScore ?? 0).toLocaleString()}
            </div>
            <span className="metric-subtext">
              Berdasarkan transaksi terverifikasi
            </span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon bg-blue-dark-subtle">
            <CheckCircle2 size={22} className="text-blue" />
          </div>
          <div className="dash-metric-info">
            <span className="metric-label">Setoran Terverifikasi</span>
            <div className="metric-value">
              {(user.verifiedActions ?? 0).toLocaleString('id-ID')} <span className="metric-unit">transaksi</span>
            </div>
            <span className="metric-subtext">Diverifikasi oleh Bank Sampah</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns) */}
      <div className="dashboard-content-grid">
        
        {/* Left Column (Campaign Progress & Recent Transactions) */}
        <div className="dashboard-left-col" style={{ minWidth: 0 }}>
          
          {/* Active Campaign Box */}
          <div className="dash-card">
            {activeCampaign ? (
              <>
                <div className="dash-card-header">
                  <div>
                    <span className="inline-badge-tiny">
                      <Target
                        size={14}
                        className="text-emerald"
                      />
                      KAMPANYE UTAMA YANG DIIKUTI
                    </span>

                    <h3 className="dash-card-title">
                      {activeCampaign.title}
                    </h3>

                    <span className="dash-card-sub">
                      Diselenggarakan oleh:{' '}
                      {activeCampaign.organization}
                    </span>
                  </div>

                  <Link
                    to={`/campaigns/${activeCampaign.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    <span>Detail</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="active-campaign-progress-box">
                  <div className="xp-text-flex">
                    <span>
                      Target Bersama:{' '}
                      <strong>
                        {activeCampaign.current_weight}
                        {' / '}
                        {activeCampaign.target_weight} kg
                      </strong>
                    </span>

                    <strong className="text-emerald">
                      {Number(
                        activeCampaign.progress_percentage
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="xp-track">
                    <div
                      className="xp-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            activeCampaign.progress_percentage
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="user-contribution-banner">

                  <div className="contribution-item">
                    <span className="c-label">
                      Kontribusimu
                    </span>

                    <strong className="c-val">
                      {activeCampaign.user_contribution}
                      {' kg'}
                    </strong>

                    <span className="c-sub">
                      Transaksi terverifikasi
                    </span>
                  </div>

                  <div className="contribution-item">
                    <span className="c-label">
                      Eco Score
                    </span>

                    <strong className="c-val text-emerald">
                      {Math.round(
                        Number(
                          activeCampaign.user_contribution || 0
                        ) * 10
                      )}
                    </strong>

                    <span className="c-sub">
                      Berdasarkan kontribusi
                    </span>
                  </div>

                  <div className="contribution-item">
                    <span className="c-label">
                      Mitra Penampung
                    </span>

                    <strong className="c-val">
                      {activeCampaign.partner_waste_banks
                        ?.map((bank) => bank.name)
                        .join(', ') || '-'}
                    </strong>

                    <span className="c-sub">
                      Bank Sampah Resmi
                    </span>
                  </div>

                </div>
              </>
            ) : (
              <div className="discovery-empty-state">
                <Target size={28} />
                <h4>Belum Mengikuti Kampanye</h4>
                <p>
                  Ikuti kampanye untuk mulai
                  mencatat kontribusimu.
                </p>

                <Link
                  to="/campaigns"
                  className="btn btn-light-green btn-sm"
                >
                  Lihat Kampanye
                </Link>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Transaksi Penyetoran Terbaru</h3>
                <span className="dash-card-sub">Riwayat penyetoran sampah yang tercatat di akunmu</span>
              </div>
              <Link to="/app/transactions" className="btn btn-outline btn-sm">
                <span>Semua Transaksi ({recentTransactions.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="recent-tx-stack">
              {recentTransactions.length === 0 && (
                <div className="discovery-empty-state">
                  <ReceiptText size={28} />
                  <h4>Belum Ada Transaksi</h4>
                  <p>Riwayat penyetoranmu akan tampil di sini.</p>
                </div>
              )}
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="tx-item-card"
                  onClick={() => handleOpenTransaction(tx.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenTransaction(tx.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-disabled={detailLoading}
                >
                  <div className="tx-icon-box">
                    <ReceiptText size={18} />
                  </div>
                  <div className="tx-info-col">
                    <div className="tx-title-row">
                      <strong className="tx-title">{tx.campaign || 'Penyetoran Sampah'}</strong>
                      <span className="tx-badge-verified">
                        {tx.status === 'verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {tx.status === 'verified' ? 'Terverifikasi' : 'Menunggu'}
                      </span>
                    </div>
                    <div className="tx-meta-row">
                      <span><MapPin size={12} /> {tx.waste_bank}</span>
                      <span>•</span>
                      <span><Clock size={12} /> {new Date(tx.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="tx-stat-col">
                    <strong className="tx-kg-val">+{tx.total_weight} kg</strong>
                    <span className="tx-pts-val">Eco Score +{Math.round(Number(tx.total_weight) * 10)}</span>
                  </div>
                </div>
              ))}
            </div>
            {detailLoading && <p role="status">Memuat detail transaksi...</p>}
            {detailError && <p role="alert" style={{ color: '#ef4444' }}>{detailError}</p>}
          </div>

        </div>

        {/* Right Column (Gamification, Missions, Quick Links) */}
        <div className="dashboard-right-col" style={{ minWidth: 0 }}>
          
          {/* Gamification Summary */}
          <div className="dash-card">
            <div className="level-card-top">
              <div className="level-icon-wrapper">
                <Trophy size={24} />
              </div>
              <div>
                <span className="level-rank-title">Gamifikasi EcoLink</span>
                <h3 className="level-number">Misi & Lencana</h3>
              </div>
            </div>

            <div className="xp-progress-block">
              <p className="xp-hint">
                Level dan XP belum tersedia. Pantau progress misi dan lencana dari aktivitas akunmu.
              </p>
            </div>

            <Link to="/app/missions" className="btn btn-outline w-100 justify-center">
              <span>Lihat Semua Lencana</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Account Missions Preview */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Misi Akun</h3>
                <span className="dash-card-sub">Progress dari aktivitas akun terverifikasi</span>
              </div>
            </div>

            <div className="missions-stack">
              {missionsLoading ? (
                <p role="status">Memuat misi...</p>
              ) : missionsError ? (
                <p role="alert">{missionsError}</p>
              ) : missions.length === 0 ? (
                <p>Belum ada misi tersedia.</p>
              ) : missions.slice(0, 3).map((mission) => {
                const isDone = mission.status === 'completed';
                const value = Number(mission.percentage || 0);
                const percentage = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

                return (
                  <div key={mission.id} className={`mission-item-box ${isDone ? 'completed' : ''}`}>
                    <div className="mission-top-row">
                      <strong className="mission-name">{mission.title}</strong>
                      {isDone ? (
                        <span className="badge-done">
                          <CheckCircle2 size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="badge-reward">Berlangsung</span>
                      )}
                    </div>
                    <p className="mission-desc">{mission.description}</p>
                    <div className="mission-track-bg" role="progressbar" aria-label={mission.title} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                      <div className="mission-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="mission-footer-text">
                      <span>{mission.progress} / {mission.target_value}</span>
                      <span>{percentage.toFixed(percentage % 1 === 0 ? 0 : 1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link to="/app/missions" className="btn btn-outline w-100 justify-center" style={{ marginTop: '0.85rem' }}>
              Buka Pusat Misi Lengkap
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="dash-card">
            <h4 className="dash-card-title" style={{ marginBottom: '0.85rem' }}>Aksi Cepat</h4>
            <div className="shortcuts-grid">
              <Link to="/app/rewards" className="shortcut-btn">
                <Gift size={18} className="text-gold" />
                <span>Rewards & Eco Score</span>
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
                <span className="receipt-tag">DETAIL TRANSAKSI ECOLINK</span>
                <h3 className="receipt-id">TRX-{selectedTx.transaction_id}</h3>
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
                {selectedTx.status === 'verified'
                  ? <ShieldCheck size={20} className="text-emerald" />
                  : <Clock size={20} className="text-emerald" />}
                <div>
                  <strong>
                    {selectedTx.status === 'verified' ? 'Transaksi Terverifikasi' : 'Menunggu Verifikasi'}
                  </strong>
                  <p>Status transaksi: {selectedTx.status}</p>
                </div>
              </div>

              <div className="receipt-info-grid">
                <div>
                  <span className="lbl">Bank Sampah:</span>
                  <strong>{selectedTx.waste_bank}</strong>
                </div>
                <div>
                  <span className="lbl">Waktu Transaksi:</span>
                  <strong>{new Date(selectedTx.created_at).toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {selectedTx.campaign && (
                <div className="receipt-campaign-ref">
                  <Target size={15} className="text-emerald" />
                  <span>Disalurkan ke: <strong>{selectedTx.campaign}</strong></span>
                </div>
              )}

              <div className="receipt-items-table">
                <div className="receipt-table-header">
                  <span>Material</span>
                  <span>Berat</span>
                  <span className="text-right">Harga/kg</span>
                  <span className="text-right">Subtotal</span>
                </div>
                {selectedTx.items.map((item) => (
                  <div key={item.waste_category_id} className="receipt-table-row">
                    <div>
                      <strong>{item.waste_category_name}</strong>
                    </div>
                    <span>{item.weight} kg</span>
                    <span className="text-right">Rp {Number(item.unit_price).toLocaleString('id-ID')}</span>
                    <span className="text-right font-semibold">Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-total-box">
                <div className="total-row">
                  <span>Total Berat Fisik:</span>
                  <strong>{selectedTx.total_weight} kg</strong>
                </div>
                <div className="total-row">
                  <span>Eco Score:</span>
                  <strong className="text-gold">+{Math.round(Number(selectedTx.total_weight) * 10)}</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Nilai Transaksi:</span>
                  <strong className="text-emerald">Rp {Number(selectedTx.total_value).toLocaleString('id-ID')}</strong>
                </div>
              </div>
            </div>

            <div className="receipt-modal-footer">
              <button
                type="button"
                className="btn btn-outline w-100 justify-center"
                onClick={() => setSelectedTx(null)}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
