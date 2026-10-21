import React, { useState } from 'react';
import { 
  User, Building2, Store, CheckCircle2, ArrowRight, 
  QrCode, Award, TrendingUp, FileText, Scale, Layers,
  Trophy, Target, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const personas = [
  {
    id: 'user',
    label: 'Mahasiswa & Individu',
    badge: 'PENYETOR & PEJUANG HIJAU',
    icon: User,
    headline: 'Ubah Setiap Botol & Kertas Menjadi Portofolio Hijau yang Diakui',
    description: 'Tidak ada lagi aksi daur ulang yang sia-sia. Setiap penyetoran ke Bank Sampah divalidasi resmi dan tercatat permanen di Eco Passport digitalmu untuk portofolio kampus dan karier masa depan.',
    benefits: [
      'Setor kilat di Bank Sampah mitra hanya dengan scan QR Passport pribadi',
      'Koleksi badge prestasi eksklusif dan naikkan level Eco Pioneer',
      'Setoranmu otomatis membantu target kampanye lingkungan kampus/komunitas',
      'Riwayat transaksi 100% tervalidasi timbangan fisik (anti-klaim palsu)'
    ],
    ctaText: 'Buat Eco Passport Gratis',
    ctaLink: '/register',
    mockup: {
      type: 'user',
      title: 'Eco Passport Digital',
      subtitle: 'Akun Terverifikasi • Mahasiswa',
      stat1: { label: 'Total Daur Ulang', val: '48.5 kg' },
      stat2: { label: 'Level Passport', val: 'Level 4' },
      badgeLabel: 'Pemilah Ahli',
      badgeIcon: Trophy
    }
  },
  {
    id: 'org',
    label: 'Organisasi, BEM & Kampus',
    badge: 'INISIATOR KAMPANYE',
    icon: Building2,
    headline: 'Jalankan Gerakan Daur Ulang Terukur dengan Laporan Dampak Nyata',
    description: 'BEM, himpunan, atau komunitas dapat membuat kampanye terstruktur, memobilisasi mahasiswa, dan melihat data kontribusi terverifikasi secara langsung tanpa pusing merekap manual.',
    benefits: [
      'Buat kampanye gotong royong dalam 2 menit dengan target material spesifik',
      'Papan Peringkat Langsung (Leaderboard) antar-fakultas untuk memicu kompetisi sehat',
      'Ekspor Laporan Dampak Lingkungan resmi (PDF/Excel) untuk LPJ dan akreditasi',
      'Mitra langsung dengan jaringan Bank Sampah berlisensi di sekitar kampus'
    ],
    ctaText: 'Daftarkan Komunitas / BEM',
    ctaLink: '/register?role=organization',
    mockup: {
      type: 'org',
      title: 'Dasbor Kampanye BEM',
      subtitle: 'Aksi Kampus Bersih 2026',
      stat1: { label: 'Terkumpul', val: '4.200 / 5.000 kg' },
      stat2: { label: 'Partisipan', val: '348 Mahasiswa' },
      badgeLabel: '84% Target Tercapai',
      badgeIcon: Target
    }
  },
  {
    id: 'bank',
    label: 'Mitra Bank Sampah',
    badge: 'VERIFIKATOR & LOGISTIK',
    icon: Store,
    headline: 'Digitalisasi Operasional Timbangan & Perluas Pasokan Sampah Terpilah',
    description: 'Bank Sampah mendapatkan sistem pencatatan digital modern, validasi nasabah kilat via QR, transparansi harga material, dan suplai sampah terpilah rutin dari kampanye komunitas.',
    benefits: [
      'Sistem POS Bank Sampah: Scan QR nasabah dan input berat dalam hitungan detik',
      'Katalog material dan harga transparan yang bisa diakses publik secara online',
      'Terhubung otomatis sebagai mitra resmi kampanye universitas dan komunitas',
      'Laporan neraca timbangan sampah masuk dan keluar terarsip rapi di cloud'
    ],
    ctaText: 'Gabung Mitra Bank Sampah',
    ctaLink: '/register?role=waste_bank',
    mockup: {
      type: 'bank',
      title: 'Terminal Verifikasi POS',
      subtitle: 'Bank Sampah Bersih Melati',
      stat1: { label: 'Transaksi Hari Ini', val: '42 Transaksi' },
      stat2: { label: 'Volume Hari Ini', val: '318 kg' },
      badgeLabel: 'Status: Verifikator Aktif',
      badgeIcon: ShieldCheck
    }
  }
];

export default function PersonaShowcaseSection() {
  const [activeTab, setActiveTab] = useState(personas[0].id);
  const current = personas.find((p) => p.id === activeTab) || personas[0];
  const IconComponent = current.icon;

  return (
    <section className="persona-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <h2 className="section-title">
            Satu Ekosistem, <span className="highlight-text">Tiga Peran Kunci.</span>
          </h2>
          <p className="section-desc">
            EcoLink dirancang khusus untuk mempertemukan seluruh rantai nilai daur ulang agar saling menguatkan.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="persona-tabs-nav">
          {personas.map((item) => {
            const TabIcon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`persona-tab-btn ${isActive ? 'active' : ''}`}
              >
                <TabIcon size={20} className={isActive ? 'text-emerald' : 'text-muted'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Persona Card Content */}
        <div className="persona-content-box" key={current.id}>
          <div className="persona-grid">
            {/* Left Content */}
            <div className="persona-details">
              <div className="persona-role-badge">
                <IconComponent size={14} />
                <span>{current.badge}</span>
              </div>
              <h3 className="persona-headline">{current.headline}</h3>
              <p className="persona-description">{current.description}</p>

              <div className="persona-benefits-list">
                {current.benefits.map((benefit, idx) => (
                  <div key={idx} className="persona-benefit-item">
                    <CheckCircle2 size={18} className="text-emerald" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="persona-action-row">
                <Link to={current.ctaLink} className="btn btn-light-green">
                  <span>{current.ctaText}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/about" className="btn btn-outline">
                  Pelajari Alur Lengkap
                </Link>
              </div>
            </div>

            {/* Right Interactive Mockup Visual */}
            <div className="persona-mockup-wrapper">
              <div className="persona-device-card">
                <div className="device-header">
                  <div className="device-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="device-title">{current.mockup.title}</span>
                  <span className="device-status">Sinkron Langsung</span>
                </div>

                <div className="device-body">
                  <div className="device-meta-row">
                    <div>
                      <div className="device-main-title">{current.label}</div>
                      <div className="device-subtitle">{current.mockup.subtitle}</div>
                    </div>
                    <div className="device-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {current.mockup.badgeIcon && <current.mockup.badgeIcon size={13} color="var(--color-primary)" />}
                      <span>{current.mockup.badgeLabel}</span>
                    </div>
                  </div>

                  <div className="device-stats-row">
                    <div className="device-stat-box">
                      <span className="stat-label">{current.mockup.stat1.label}</span>
                      <strong className="stat-value">{current.mockup.stat1.val}</strong>
                    </div>
                    <div className="device-stat-box">
                      <span className="stat-label">{current.mockup.stat2.label}</span>
                      <strong className="stat-value">{current.mockup.stat2.val}</strong>
                    </div>
                  </div>

                  {/* Interactive Visual Cue depending on persona */}
                  {current.id === 'user' && (
                    <div className="device-feature-preview">
                      <div className="qr-preview-box">
                        <QrCode size={40} className="text-emerald" />
                        <div>
                          <strong>Pemindai QR Paspor Terverifikasi</strong>
                          <p>Pindai di bank sampah untuk input data kilat</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {current.id === 'org' && (
                    <div className="device-feature-preview">
                      <div className="progress-preview-box">
                        <div className="progress-label-row">
                          <span>Target Capaian Kampus</span>
                          <strong>84%</strong>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: '84%' }} />
                        </div>
                        <span className="progress-subtext">32 ormawa berkontribusi aktif</span>
                      </div>
                    </div>
                  )}

                  {current.id === 'bank' && (
                    <div className="device-feature-preview">
                      <div className="bank-pos-preview">
                        <Scale size={24} className="text-emerald" />
                        <div>
                          <strong>Timbangan Terkalibrasi Digital</strong>
                          <p>Validasi berat sampah langsung menghasilkan bukti transaksi sah</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
