import React from 'react';
import { Shield, Lock, Database, CheckCircle2, FileCheck2, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Verifikasi Dua Pihak (Dual Verification)',
    description: 'Data timbangan hanya sah jika divalidasi oleh dua pihak: pemegang Eco Passport (nasabah) dan petugas terotorisasi Bank Sampah.',
    tag: 'Bebas Klaim Palsu'
  },
  {
    icon: Cpu,
    title: 'Algoritma Validasi Anomali',
    description: 'Sistem mendeteksi deviasi bobot tidak wajar secara otomatis untuk mencegah manipulasi angka setoran atau spamming.',
    tag: 'Deteksi Kecurangan'
  },
  {
    icon: Database,
    title: 'Jejak Audit Relasional',
    description: 'Setiap transaksi memiliki ID unik, penanda waktu presisi, dan relasi langsung ke kampanye organisasi yang diaudit secara transparan.',
    tag: 'Integritas Data Terjamin'
  },
  {
    icon: Lock,
    title: 'Enkripsi Data Standar Industri',
    description: 'Seluruh kredensial dan data sensitif dilindungi enkripsi AES-256 dan protokol komunikasi aman HTTPS/TLS.',
    tag: 'Keamanan Standar Tinggi'
  }
];

export default function TransparencySection() {
  return (
    <section className="transparency-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <h2 className="section-title">
            Transparansi & <span className="highlight-text">Kepercayaan Mutlak.</span>
          </h2>
          <p className="section-desc">
            Dibangun dengan arsitektur data teruji untuk kompetisi UINIC 8.0 2026. Kami menempatkan integritas metrik dan keamanan data pengguna sebagai prioritas utama.
          </p>
        </div>

        {/* 4 Trust Feature Cards */}
        <div className="trust-grid">
          {trustFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="trust-card">
                <div className="trust-card-top">
                  <div className="trust-icon-box">
                    <Icon size={24} className="text-emerald" />
                  </div>
                  <span className="trust-tag">{item.tag}</span>
                </div>
                <h4 className="trust-title">{item.title}</h4>
                <p className="trust-text">{item.description}</p>
                <div className="trust-footer-check">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <span>Sesuai Pedoman Arsitektur Lomba</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology Banner */}
        <div className="methodology-banner">
          <div className="methodology-banner-content">
            <div className="methodology-icon">
              <FileCheck2 size={32} className="text-emerald" />
            </div>
            <div>
              <h4 className="methodology-heading">Ingin Mengetahui Rumus Perhitungan Dampak Kami?</h4>
              <p className="methodology-sub">
                Kami mendokumentasikan secara terbuka standar konversi kg sampah ke kg CO₂e dan liter air bersih berdasarkan publikasi ilmiah dan pedoman kementerian.
              </p>
            </div>
          </div>
          <Link to="/about" className="btn btn-outline btn-sm whitespace-nowrap">
            Baca Metodologi Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
