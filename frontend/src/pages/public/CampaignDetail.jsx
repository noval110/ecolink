import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Target,
  ShieldCheck,
  Clock,
  Share2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  Navigation,
  Star,
  Trophy,
  Medal,
  Check,
  ArrowRight,
  X
} from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_WASTE_BANKS } from '../../data/mockData';

export default function CampaignDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);

  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id) || MOCK_CAMPAIGNS[0];

  if (!campaign) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h2>Kampanye Tidak Ditemukan</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '1rem 0 2rem' }}>Kampanye dengan ID ini belum terdaftar di sistem.</p>
        <Link to="/campaigns" className="btn btn-primary">Kembali ke Daftar Kampanye</Link>
      </div>
    );
  }

  // Get affiliated waste banks
  const affiliatedBanks = MOCK_WASTE_BANKS.filter((wb) =>
    campaign.affiliatedWasteBankIds?.includes(wb.id)
  );

  const progressPct = Math.min(100, Math.round((campaign.collectedKg / campaign.targetKg) * 100));
  const estimatedCarbonReduced = (campaign.collectedKg * 1.5).toFixed(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="campaign-detail-page">
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <Link to="/campaigns" className="breadcrumb-back-link">
            <ArrowLeft size={16} /> Kembali ke Jelajah Kampanye
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{campaign.title}</span>
        </div>

        {/* Campaign Hero Card */}
        <div className="campaign-detail-hero">
          {/* Campaign Feature Photo Banner */}
          <div className="campaign-hero-photo-banner">
            <img src={campaign.image} alt={campaign.title} className="campaign-hero-photo-img" />
            <div className="campaign-hero-photo-overlay" />
            <div className="photo-floating-badges">
              <span className="cat-badge">{campaign.category}</span>
              <span className="status-pill open-pill">
                <span className="status-dot"></span> {campaign.status}
              </span>
              <span className="verified-pill">
                <ShieldCheck size={14} />
                <span className="verified-full-text">Kampanye Resmi Terverifikasi</span>
                <span className="verified-short-text">Resmi Terverifikasi</span>
              </span>
            </div>
          </div>

          <h1 className="campaign-detail-title">{campaign.title}</h1>

          <div className="campaign-organizer-bar">
            <div className="organizer-main-info">
              <div className="organizer-avatar">
                <ShieldCheck size={18} color="var(--color-primary)" />
              </div>
              <div className="organizer-text">
                <span className="org-label">Penyelenggara:</span>
                <strong className="org-name">{campaign.organizer}</strong>
              </div>
            </div>
            <span className="org-role-tag">{campaign.organizerRole}</span>
          </div>

          <div className="campaign-meta-row">
            <div className="meta-col">
              <MapPin size={16} className="text-emerald" />
              <span>{campaign.location}</span>
            </div>
            <div className="meta-col">
              <Calendar size={16} className="text-emerald" />
              <span>{campaign.startDate} - {campaign.endDate}</span>
            </div>
            <div className="meta-col">
              <Clock size={16} className="text-emerald" />
              <span>{campaign.daysRemaining} Hari Tersisa</span>
            </div>
          </div>
        </div>

        {/* Content Layout (Main + Sticky Sidebar) */}
        <div className="campaign-content-layout">
          
          {/* Main Column */}
          <div className="campaign-content-main">
            
            {/* Section 1: About Campaign */}
            <div className="content-card">
              <h3 className="card-section-title">Tentang Inisiatif Ini</h3>
              <p className="card-body-paragraph">{campaign.description}</p>
              
              <div className="impact-story-highlight">
                <div className="highlight-icon">
                  <Sparkles size={24} color="var(--color-primary)" />
                </div>
                <div>
                  <h4 className="highlight-title">Dampak Langsung</h4>
                  <p className="highlight-desc">{campaign.impactStory}</p>
                </div>
              </div>

              {/* Target Materials */}
              <div className="target-materials-box">
                <span className="target-mat-label">Material Sampah yang Dicari:</span>
                <div className="target-mat-tags">
                  {campaign.targetMaterials.map((mat, idx) => (
                    <span key={idx} className="target-mat-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check size={13} className="text-emerald" /> {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Affiliated Drop Points (Waste Banks) */}
            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Titik Setor & Bank Sampah Mitra Penampung</h3>
                  <p className="card-section-sub">
                    Setorkan sampah fisikmu ke salah satu Bank Sampah mitra di bawah ini agar otomatis dihitung ke target kampanye ini:
                  </p>
                </div>
              </div>

              <div className="affiliated-banks-stack">
                {affiliatedBanks.map((bank) => (
                  <div key={bank.id} className="affiliated-bank-item">
                    <div className="bank-info-side">
                      <div className="badge-row">
                        <span className="status-pill open-pill">
                          <span className="status-dot"></span> {bank.status}
                        </span>
                        <span className="verified-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> {bank.rating}
                        </span>
                      </div>
                      <h4 className="bank-item-title">{bank.name}</h4>
                      <p className="bank-item-address">
                        <MapPin size={14} className="text-emerald shrink-0" />
                        <span>{bank.address}</span>
                      </p>
                      <div className="bank-item-hours">
                        <Clock size={14} className="text-emerald shrink-0" />
                        <span>{bank.operationalHours}</span>
                      </div>
                    </div>

                    <div className="bank-action-side">
                      <Link to={`/waste-banks/${bank.id}`} className="btn btn-outline btn-sm">
                        <span>Lihat Katalog & Rute</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Leaderboard Kontributor */}
            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Papan Peringkat Kontributor Teratas</h3>
                  <p className="card-section-sub">
                    Peringkat relawan dengan kontribusi daur ulang terverifikasi paling aktif di kampanye ini:
                  </p>
                </div>
                <div className="leaderboard-badge">
                  <Award size={16} className="text-gold" />
                  <span>Timbangan Terverifikasi</span>
                </div>
              </div>

              <div className="leaderboard-table">
                {campaign.leaderboard.map((item) => (
                  <div key={item.rank} className="leaderboard-row">
                    <div className="rank-badge-col">
                      <span className={`rank-number rank-${item.rank}`}>
                        {item.rank === 1 ? (
                          <Trophy size={20} color="#fbbf24" />
                        ) : item.rank === 2 ? (
                          <Medal size={20} color="#94a3b8" />
                        ) : item.rank === 3 ? (
                          <Medal size={20} color="#d97706" />
                        ) : (
                          `#${item.rank}`
                        )}
                      </span>
                    </div>

                    <div className="user-profile-col">
                      <div className="avatar-circle" style={{ backgroundColor: item.avatarColor }}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="user-name">{item.name}</strong>
                        <span className="user-sub">{item.faculty}</span>
                      </div>
                    </div>

                    <div className="user-stats-col text-right">
                      <span className="user-kg">{item.kg} kg</span>
                      <span className="user-pts">+{item.points} poin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Real-time Transaction Activity Log */}
            <div className="content-card">
              <h3 className="card-section-title">Aktivitas Penyetoran Terkini</h3>
              <p className="card-section-sub">
                Catatan langsung setoran sampah yang baru saja diverifikasi petugas di bank sampah mitra:
              </p>

              <div className="activity-feed-list">
                {campaign.recentTransactions.map((tx, idx) => (
                  <div key={idx} className="activity-feed-item">
                    <div className="activity-icon-bubble">
                      <CheckCircle2 size={16} className="text-emerald" />
                    </div>
                    <div className="activity-content">
                      <div className="activity-top">
                        <strong>{tx.user}</strong> menyetorkan <span className="text-emerald font-semibold">{tx.amount}</span>
                      </div>
                      <div className="activity-sub">
                        <span>{tx.bank}</span> • <span className="time-ago">{tx.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Sidebar Action Column */}
          <div className="campaign-content-sidebar">
            <div className="campaign-sidebar-sticky">
              
              <div className="content-card sidebar-action-card">
                <span className="target-summary-lbl">Kemajuan Capaian Target</span>
                
                <div className="target-hero-stats">
                  <div className="stat-big-number">
                    {campaign.collectedKg.toLocaleString()} <span className="unit">kg</span>
                  </div>
                  <div className="stat-target-label">
                    dari target <strong>{campaign.targetKg.toLocaleString()} kg</strong>
                  </div>
                </div>

                <div className="progress-track-bg" style={{ height: '10px', margin: '1.25rem 0 0.75rem' }}>
                  <div
                    className="progress-fill-bar"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                <div className="progress-details-flex">
                  <span><strong>{progressPct}%</strong> tercapai</span>
                  <span><strong>{campaign.daysRemaining}</strong> hari tersisa</span>
                </div>

                <div className="sidebar-metrics-grid">
                  <div className="sidebar-metric-box">
                    <Users size={18} className="text-emerald" />
                    <div>
                      <div className="s-val">{campaign.participantsCount}</div>
                      <div className="s-lbl">Relawan Terdaftar</div>
                    </div>
                  </div>
                  <div className="sidebar-metric-box">
                    <TrendingUp size={18} className="text-emerald" />
                    <div>
                      <div className="s-val">{estimatedCarbonReduced} kg</div>
                      <div className="s-lbl">Reduksi CO₂e</div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => setShowHowModal(true)}
                  className="btn btn-primary w-100 justify-center"
                  style={{ marginBottom: '0.75rem', padding: '0.9rem 1rem' }}
                >
                  <Sparkles size={16} /> Ikuti & Setor Sampah
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-secondary w-100 justify-center"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald" /> Tautan Berhasil Disalin!
                    </>
                  ) : (
                    <>
                      <Share2 size={16} /> Bagikan Kampanye
                    </>
                  )}
                </button>
              </div>

              {/* Affiliated Waste Bank Quick Banner */}
              <div className="content-card sidebar-bank-note">
                <div className="icon-row">
                  <MapPin size={20} className="text-emerald" />
                  <strong>Setor Langsung di Mitra</strong>
                </div>
                <p>
                  Cukup datang ke salah satu dari <strong>{affiliatedBanks.length} mitra Bank Sampah</strong> terdaftar dan tunjukkan QR Eco Passport milikmu.
                </p>
                <Link to="/waste-banks" className="link-text-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Cari Bank Sampah di Peta</span> <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* How to Participate Modal */}
      {showHowModal && (
        <div className="modal-backdrop" onClick={() => setShowHowModal(false)}>
          <div className="modal-container-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Panduan Berkontribusi di Kampanye Ini</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowHowModal(false)}
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-step-item">
                <div className="m-step-num">1</div>
                <div>
                  <strong>Pilah Sampah Sesuai Target Kampanye</strong>
                  <p>Kumpulkan {campaign.targetMaterials.join(', ')} dalam keadaan bersih dan kering.</p>
                </div>
              </div>

              <div className="modal-step-item">
                <div className="m-step-num">2</div>
                <div>
                  <strong>Bawa ke Mitra Bank Sampah Terdaftar</strong>
                  <p>Kunjungi salah satu titik setor mitra resmi kampanye ini (contoh: {affiliatedBanks[0]?.name}).</p>
                </div>
              </div>

              <div className="modal-step-item">
                <div className="m-step-num">3</div>
                <div>
                  <strong>Pindai QR Eco Passport</strong>
                  <p>Buka profil Eco Passport milikmu saat ditimbang oleh petugas. Timbangan fisik otomatis masuk ke papan peringkat kampanye!</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Link
                to={`/waste-banks/${affiliatedBanks[0]?.id || ''}`}
                className="btn btn-primary w-100 justify-center"
                onClick={() => setShowHowModal(false)}
              >
                Lihat Lokasi & Jam Buka Mitra Bank Sampah
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
