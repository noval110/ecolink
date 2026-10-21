import React from 'react';
import { ShieldCheck, Users, Award, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const comparisonPoints = [
  {
    title: 'Validasi & Integritas Data',
    traditional: 'Catatan kertas manual atau klaim mandiri (rentan klaim palsu & manipulasi angka).',
    ecolink: '100% verifikasi timbangan fisik & scan QR oleh petugas Bank Sampah resmi secara langsung.'
  },
  {
    title: 'Keterhubungan Komunitas',
    traditional: 'Transaksi individual terisolasi, tidak pernah terhubung ke gerakan kampus atau target bersama.',
    ecolink: 'Setoran otomatis mendongkrak target kampanye ormawa/kampus dan masuk ke papan peringkat bersama.'
  },
  {
    title: 'Pengakuan & Portofolio',
    traditional: 'Hanya dapat uang kas sekadarnya, bukti aksi dan rekam jejak lingkungan hilang begitu saja.',
    ecolink: 'Eco Passport digital seumur hidup berisi histori terverifikasi, lencana keahlian, dan sertifikat resmi.'
  },
  {
    title: 'Akses Informasi Bank Sampah',
    traditional: 'Masyarakat bingung lokasi, jam operasional tidak pasti, dan harga sampah sering diragukan.',
    ecolink: 'Direktori & peta interaktif lengkap dengan katalog material dan transparansi harga terbuka.'
  }
];

export default function WhyEcoLinkSection() {
  return (
    <section className="why-ecolink-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <h2 className="section-title">
            Kenapa EcoLink <span className="highlight-text">Berbeda?</span>
          </h2>
          <p className="section-desc">
            Aksi lingkungan tidak boleh hanya berhenti pada janji dan klaim sepihak. EcoLink menjamin setiap gram sampah yang kamu pilah benar-benar diolah dan diakui secara kredibel.
          </p>
        </div>

        {/* 3 Identity Pillars Feature Cards */}
        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box bg-emerald-soft">
              <ShieldCheck size={28} className="text-emerald" />
            </div>
            <div className="pillar-tag">IDENTITAS #1</div>
            <h3 className="pillar-title">Dampak Terverifikasi</h3>
            <p className="pillar-text">
              Tidak ada tombol "klaim sendiri". Dampak lingkungan hanya diakui setelah timbangan fisik divalidasi oleh Bank Sampah mitra melalui sistem kami.
            </p>
            <div className="pillar-meta">
              <span>Bebas Manipulasi Data</span>
            </div>
          </div>

          <div className="pillar-card pillar-card-featured">
            <div className="featured-card-badge">FITUR UNGGULAN</div>
            <div className="pillar-icon-box bg-blue-soft">
              <Users size={28} className="text-blue" />
            </div>
            <div className="pillar-tag">IDENTITAS #2</div>
            <h3 className="pillar-title">Kampanye Kolaboratif</h3>
            <p className="pillar-text">
              Setiap kali kamu menyetor sampah, bobotnya otomatis mendongkrak target kampanye kampus atau komunitasmu. Beraksi sendiri, berdampak kolektif!
            </p>
            <div className="pillar-meta">
              <span>Integrasi Papan Peringkat Ormawa</span>
            </div>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box bg-gold-soft">
              <Award size={28} className="text-gold" />
            </div>
            <div className="pillar-tag">IDENTITAS #3</div>
            <h3 className="pillar-title">Paspor Digital Eco Passport</h3>
            <p className="pillar-text">
              Profil digital seumur hidup berisi histori setoran terverifikasi, lencana pencapaian, dan sertifikat dampak yang siap dipamerkan di CV atau portofolio.
            </p>
            <div className="pillar-meta">
              <span>Portofolio Hijau Digital</span>
            </div>
          </div>
        </div>

        {/* Modern Side-by-Side Showdown Cards */}
        <div className="showdown-wrapper">
          <div className="showdown-header text-center">
            <h3 className="showdown-heading">Perbandingan Langsung: Konvensional vs. EcoLink</h3>
            <p className="showdown-sub">Lihat bagaimana EcoLink merevolusi siklus pengelolaan sampah berbasis komunitas.</p>
          </div>

          <div className="showdown-grid">
            {/* Card 1: Cara Konvensional */}
            <div className="showdown-card card-traditional">
              <div className="showdown-card-top">
                <div className="showdown-icon-badge bg-red-soft">
                  <XCircle size={24} className="text-muted-red" />
                </div>
                <div>
                  <h4 className="showdown-card-title">Sistem Konvensional</h4>
                  <span className="showdown-card-sub">Bank Sampah Tradisional</span>
                </div>
              </div>

              <div className="showdown-list">
                {comparisonPoints.map((item, idx) => (
                  <div key={idx} className="showdown-item">
                    <div className="showdown-point-header">
                      <XCircle size={17} className="text-muted-red flex-shrink-0" />
                      <strong className="point-title">{item.title}</strong>
                    </div>
                    <p className="point-desc text-faded">{item.traditional}</p>
                  </div>
                ))}
              </div>

              <div className="showdown-card-footer footer-faded">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <XCircle size={14} className="text-muted-red" /> Rentan salah hitung, aksi sporadis, & tanpa jejak audit digital
                </span>
              </div>
            </div>

            {/* Card 2: Ekosistem EcoLink */}
            <div className="showdown-card card-ecolink">
              <div className="showdown-highlight-tag">SOLUSI TERVERIFIKASI</div>

              <div className="showdown-card-top">
                <div className="showdown-icon-badge bg-emerald-soft">
                  <CheckCircle2 size={24} className="text-emerald" />
                </div>
                <div>
                  <h4 className="showdown-card-title">Ekosistem EcoLink</h4>
                  <span className="showdown-card-sub">Platform Terhubung & Bebas Manipulasi</span>
                </div>
              </div>

              <div className="showdown-list">
                {comparisonPoints.map((item, idx) => (
                  <div key={idx} className="showdown-item">
                    <div className="showdown-point-header">
                      <CheckCircle2 size={17} className="text-emerald flex-shrink-0" />
                      <strong className="point-title text-white">{item.title}</strong>
                    </div>
                    <p className="point-desc text-bright">{item.ecolink}</p>
                  </div>
                ))}
              </div>

              <div className="showdown-card-footer">
                <Link to="/register" className="btn btn-light-green w-100 justify-center">
                  <span>Buat Akun EcoLink Sekarang</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
