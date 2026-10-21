import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  Award,
  Download,
  Share2,
  Copy,
  Check,
  Leaf,
  Droplets,
  Trees,
  Scale,
  Sparkles,
  Calendar,
  Building2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  X,
  Printer,
  Users
} from 'lucide-react';
import { getActiveUser, USER_BADGES } from '../../data/mockUserData';

export default function EcoPassportPage() {
  const [user, setUser] = useState(getActiveUser());
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    const handleProfileChange = () => {
      setUser(getActiveUser());
    };
    window.addEventListener('ecolink_profile_changed', handleProfileChange);
    return () => window.removeEventListener('ecolink_profile_changed', handleProfileChange);
  }, []);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`https://ecolink.id/passport/${user.passportId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrintCertificate = () => {
    setPrinted(true);
    window.print();
    setTimeout(() => setPrinted(false), 2000);
  };

  const unlockedBadges = USER_BADGES.filter(b => b.isUnlocked);
  const lockedBadges = USER_BADGES.filter(b => !b.isUnlocked);

  return (
    <div className="eco-passport-page">
      {/* Page Header */}
      <div className="passport-page-header">
        <div className="passport-header-content">
          <div className="inline-badge-tiny">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Identitas Lingkungan Digital</span>
          </div>
          <h1 className="page-title">Eco Passport Digital</h1>
          <p className="page-sub">
            Profil rekam jejak aksi lingkungan seumur hidup yang 100% berbasis transaksi timbangan resmi di Bank Sampah mitra.
          </p>
        </div>

        <div className="header-actions-flex">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="btn btn-outline btn-sm passport-action-btn"
          >
            <Share2 size={15} />
            <span>Bagikan Portofolio</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="btn btn-light-green btn-sm passport-action-btn"
          >
            <Download size={15} />
            <span>Lihat Sertifikat Resmi</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Digital Passport Card (Left) & Metrics Breakdown (Right) */}
      <div className="passport-main-grid">
        
        {/* Left: The Holographic / Dark Emerald Passport Card */}
        <div className="passport-card-column">
          <div className="digital-passport-card">
            {/* Holographic glowing orb background */}
            <div className="card-holo-glow" />

            {/* Card Header */}
            <div className="dp-card-top">
              <div className="dp-brand-row">
                <div className="logo-emblem-small">
                  <Leaf size={14} className="text-emerald" />
                </div>
                <span className="dp-brand-name">EcoLink Passport</span>
              </div>
              <div className="dp-status-pill">
                <ShieldCheck size={13} />
                <span>AKUN RESMI</span>
              </div>
            </div>

            {/* Card Middle: Profile Details */}
            <div className="dp-profile-row">
              <div className="dp-avatar-box">
                <img src={user.avatar} alt={user.name} className="dp-avatar-img" />
                <span className="dp-avatar-badge">Lv {user.level}</span>
              </div>
              <div className="dp-info-col">
                <h3 className="dp-name">{user.name}</h3>
                <span className="dp-role">{user.categoryLabel}</span>
                <span className="dp-faculty">{user.affiliationDetail}</span>
              </div>
            </div>

            {/* QR Code Presentation Box */}
            <div className="dp-qr-container">
              <div className="dp-qr-plate">
                <QrCode size={130} color="#062415" />
              </div>
              <div className="dp-qr-meta">
                <span className="dp-id-label">ID PASSPORT UNIK:</span>
                <strong className="dp-id-number">{user.passportId}</strong>
                <span className="dp-scan-hint">Scan di loket Bank Sampah mitra</span>
              </div>
            </div>

            {/* Key Stats Bar Inside Card */}
            <div className="dp-stats-ribbon">
              <div className="ribbon-item">
                <span className="r-label">Total Daur Ulang</span>
                <strong className="r-value">{user.totalRecycledKg} kg</strong>
              </div>
              <div className="ribbon-divider" />
              <div className="ribbon-item">
                <span className="r-label">Poin EcoLink</span>
                <strong className="r-value text-gold">{user.points.toLocaleString()} poin</strong>
              </div>
              <div className="ribbon-divider" />
              <div className="ribbon-item">
                <span className="r-label">Lencana</span>
                <strong className="r-value text-emerald">{unlockedBadges.length} Terbuka</strong>
              </div>
            </div>

            {/* Card Footer Micro Details */}
            <div className="dp-card-footer">
              <span>Bergabung sejak: {user.joinDate}</span>
              <span className="anti-gw-badge">100% Anti-Greenwashing</span>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="passport-trust-card">
            <Lock size={16} className="text-emerald shrink-0" />
            <p>
              Setiap gram sampah pada paspor ini diverifikasi secara fisik oleh timbangan tersertifikasi bank sampah rekanan. Data tidak dapat dimanipulasi atau diinput mandiri.
            </p>
          </div>
        </div>

        {/* Right: Detailed Impact Breakdown */}
        <div className="passport-metrics-column">
          
          {/* Material Breakdown */}
          <div className="dash-card">
            <h3 className="dash-card-title">Rincian Komposisi Sampah yang Disetor</h3>
            <span className="dash-card-sub">Distribusi material fisik berdasarkan transaksi yang tercatat</span>

            <div className="material-breakdown-list">
              <div className="mat-breakdown-row">
                <div className="mat-meta">
                  <span className="mat-color-dot" style={{ backgroundColor: '#10b981' }} />
                  <span>Plastik (Botol PET, PP, HDPE)</span>
                </div>
                <div className="mat-val-col">
                  <strong>22.1 kg</strong>
                  <span className="mat-pct">45.6%</span>
                </div>
              </div>
              <div className="mat-progress-bar">
                <div className="mat-progress-fill" style={{ width: '45.6%', backgroundColor: '#10b981' }} />
              </div>

              <div className="mat-breakdown-row">
                <div className="mat-meta">
                  <span className="mat-color-dot" style={{ backgroundColor: '#fbbf24' }} />
                  <span>Kertas, Kardus, & Karton</span>
                </div>
                <div className="mat-val-col">
                  <strong>14.6 kg</strong>
                  <span className="mat-pct">30.1%</span>
                </div>
              </div>
              <div className="mat-progress-bar">
                <div className="mat-progress-fill" style={{ width: '30.1%', backgroundColor: '#fbbf24' }} />
              </div>

              <div className="mat-breakdown-row">
                <div className="mat-meta">
                  <span className="mat-color-dot" style={{ backgroundColor: '#fb923c' }} />
                  <span>Minyak Jelantah Dapur</span>
                </div>
                <div className="mat-val-col">
                  <strong>9.5 kg</strong>
                  <span className="mat-pct">19.6%</span>
                </div>
              </div>
              <div className="mat-progress-bar">
                <div className="mat-progress-fill" style={{ width: '19.6%', backgroundColor: '#fb923c' }} />
              </div>

              <div className="mat-breakdown-row">
                <div className="mat-meta">
                  <span className="mat-color-dot" style={{ backgroundColor: '#38bdf8' }} />
                  <span>Logam & Kaleng Minuman</span>
                </div>
                <div className="mat-val-col">
                  <strong>2.3 kg</strong>
                  <span className="mat-pct">4.7%</span>
                </div>
              </div>
              <div className="mat-progress-bar">
                <div className="mat-progress-fill" style={{ width: '4.7%', backgroundColor: '#38bdf8' }} />
              </div>
            </div>
          </div>

          {/* Ecological Equivalency Cards */}
          <div className="dash-card">
            <h3 className="dash-card-title">Ekuivalensi Dampak Ekologis</h3>
            <span className="dash-card-sub">Dihitung dari konversi emisi terhindar berstandar KLHK</span>

            <div className="eco-equivalencies-grid">
              <div className="eco-eq-card">
                <div className="eq-icon-box" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                  <Leaf size={22} />
                </div>
                <div>
                  <strong className="eq-value">{user.co2SavedKg} kg</strong>
                  <span className="eq-title">CO₂e Terhindar</span>
                  <p className="eq-desc">Setara menyerap emisi 48 liter bahan bakar kendaraan bermotor.</p>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <strong className="eq-value">{user.waterSavedLiter.toLocaleString()} L</strong>
                  <span className="eq-title">Air Tanah Bersih</span>
                  <p className="eq-desc">Minyak jelantah yang tidak dibuang ke saluran air mencegah pencemaran air bersih.</p>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#10b981' }}>
                  <Trees size={22} />
                </div>
                <div>
                  <strong className="eq-value">1.8 Pohon</strong>
                  <span className="eq-title">Pohon Terselamatkan</span>
                  <p className="eq-desc">Dihitung dari 14.6 kg daur ulang kertas dan kardus perumahan/perkantoran.</p>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}>
                  <Scale size={22} />
                </div>
                <div>
                  <strong className="eq-value">{user.completedTransactionsCount} Kali</strong>
                  <span className="eq-title">Transaksi Valid</span>
                  <p className="eq-desc">Semua tercatat permanen di jaringan audit bank sampah.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Unlocked Badges Showcase */}
          <div className="dash-card">
            <div className="card-header-between">
              <div>
                <h3 className="dash-card-title">Koleksi Lencana Terbuka ({unlockedBadges.length})</h3>
                <span className="dash-card-sub">Pencapaian yang telah diverifikasi di paspormu</span>
              </div>
              <a href="/app/badges" className="btn btn-outline btn-sm">
                <span>Lihat Semua Lencana</span>
                <ArrowRight size={13} />
              </a>
            </div>

            <div className="passport-badges-inline-grid">
              {unlockedBadges.map((badge) => (
                <div key={badge.id} className="inline-badge-card" style={{ borderColor: `${badge.color}35` }}>
                  <div className="badge-icon-bubble" style={{ background: `${badge.color}20`, color: badge.color }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <strong className="badge-name">{badge.title}</strong>
                    <span className="badge-rarity" style={{ color: badge.color }}>{badge.rarity.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="modal-backdrop" onClick={() => setShowCertificateModal(false)}>
          <div className="certificate-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-top-bar">
              <div className="cert-bar-title">
                <ShieldCheck size={20} className="text-emerald" />
                <h3>Sertifikat Dampak Lingkungan Terverifikasi</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCertificateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Official Certificate Canvas */}
            <div className="official-certificate-canvas">
              <div className="cert-border-outer">
                <div className="cert-border-inner">
                  
                  {/* Certificate Header */}
                  <div className="cert-header-section">
                    <div className="cert-emblem-row">
                      <div className="cert-emblem-badge">
                        <Leaf size={28} className="text-emerald" />
                      </div>
                    </div>
                    <span className="cert-nation-label">JARINGAN BANK SAMPAH DIGITAL INDONESIA</span>
                    <h2 className="cert-main-heading">SERTIFIKAT DAUR ULANG TERVERIFIKASI</h2>
                    <span className="cert-reg-no">NO. REGISTRASI AUDIT: KLHK-ECOLINK/2026/{user.passportId}</span>
                  </div>

                  {/* Certificate Body */}
                  <div className="cert-body-section">
                    <p className="cert-intro-text">Dengan bangga diberikan kepada:</p>
                    <h1 className="cert-recipient-name">{user.name}</h1>
                    <span className="cert-recipient-sub">{user.categoryLabel} • {user.affiliationDetail}</span>

                    <p className="cert-award-paragraph">
                      Telah membuktikan komitmen nyata dalam aksi pengelolaan sampah sirkular dan perlindungan ekosistem melalui penimbangan fisik resmi berstandar nasional dengan capaian:
                    </p>

                    <div className="cert-stats-grid">
                      <div className="c-stat-box">
                        <span className="c-lbl">TOTAL SAMPAH TERDAUR</span>
                        <strong className="c-val">{user.totalRecycledKg} kg</strong>
                      </div>
                      <div className="c-stat-box">
                        <span className="c-lbl">REDUKSI EMISI KARBON</span>
                        <strong className="c-val text-emerald">{user.co2SavedKg} kg CO₂e</strong>
                      </div>
                      <div className="c-stat-box">
                        <span className="c-lbl">AIR TANAH TERSELAMATKAN</span>
                        <strong className="c-val text-blue">{user.waterSavedLiter.toLocaleString()} L</strong>
                      </div>
                    </div>

                    <div className="cert-verification-seal-row">
                      <div className="cert-qr-plate">
                        <QrCode size={70} color="#062415" />
                        <span className="cert-qr-lbl">Validasi Keaslian</span>
                      </div>

                      <div className="cert-signatures">
                        <div className="cert-sig-block">
                          <div className="sig-line">
                            <span className="sig-handwritten">EcoLink Indonesia</span>
                          </div>
                          <strong>Dewan Audit Sirkular</strong>
                          <span>EcoLink National Ecosystem</span>
                        </div>
                        <div className="cert-sig-block">
                          <div className="sig-seal-stamp">
                            <ShieldCheck size={36} className="text-emerald" />
                            <span>VERIFIED</span>
                          </div>
                          <strong>Mitra Bank Sampah</strong>
                          <span>Timbangan Terkalibrasi Sah</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="cert-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrintCertificate}
              >
                <Printer size={16} />
                <span>Cetak / Unduh PDF</span>
              </button>
              <button
                type="button"
                className="btn btn-light-green"
                onClick={() => setShowCertificateModal(false)}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Portfolio Modal */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-top">
              <h3>Bagikan Eco Passport Digital</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowShareModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="share-modal-body">
              <p>Tunjukkan rekam jejak aksi lingkungan terverifikasimu ke CV, media sosial, atau komunitas!</p>

              <div className="share-link-input-box">
                <input
                  type="text"
                  readOnly
                  value={`https://ecolink.id/passport/${user.passportId}`}
                  className="share-url-input"
                />
                <button
                  type="button"
                  className="btn btn-light-green"
                  onClick={handleCopyShareLink}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>

              <div className="share-social-grid">
                <a
                  href={`https://api.whatsapp.com/send?text=Halo!%20Lihat%20rekam%20jejak%20daur%20ulang%20dan%20Eco%20Passport%20resmi%20saya%20di%20EcoLink:%20https://ecolink.id/passport/${user.passportId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-share-btn wa"
                >
                  Bagikan ke WhatsApp
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://ecolink.id/passport/${user.passportId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-share-btn in"
                >
                  Bagikan ke LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
