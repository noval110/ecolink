import React from 'react';
import { QrCode, ShieldCheck, TrendingUp, Award, Leaf, CheckCircle2 } from 'lucide-react';

export default function HeroProductMockup() {
  return (
    <div className="hero-mockup-wrapper fade-in" style={{ animationDelay: '0.2s' }}>
      <p className="preview-caption">Pratinjau Eco Passport · Data ilustrasi</p>
      {/* Main Showcase Card: Eco Passport Digital (Unified, no floating elements) */}
      <div className="mockup-main-card">
        {/* Card Header */}
        <div className="card-top-bar">
          <div className="user-profile-mini">
            <div className="user-avatar-hex">
              <span>RP</span>
            </div>
            <div>
              <div className="user-name-row">
                <span className="user-name">Raihan Pratama</span>
                <ShieldCheck size={16} className="text-emerald" />
              </div>
              <span className="user-role">Mahasiswa • BEM Kampus Hijau</span>
            </div>
          </div>
          <div className="status-chip">
            <Leaf size={13} />
            <span>Eco Passport</span>
          </div>
        </div>

        {/* In-Card Recent Verified Activity Banner */}
        <div className="in-card-alert-banner">
          <div className="alert-banner-icon">
            <CheckCircle2 size={16} className="text-emerald" />
          </div>
          <div className="alert-banner-text">
            <div className="alert-banner-top">
              <span className="alert-title">Transaksi Terverifikasi</span>
              <span className="live-pill">CONTOH</span>
            </div>
            <p className="alert-sub">+4.8 kg Plastik PET • Bank Sampah Bersih Melati</p>
          </div>
        </div>

        {/* QR & Verification Zone */}
        <div className="passport-qr-banner">
          <div className="qr-container">
            <div className="qr-box-inner">
              <QrCode size={64} className="qr-svg" />
            </div>
          </div>
          <div className="passport-qr-meta">
            <div className="passport-id-label">ID PASSPORT:</div>
            <div className="passport-id-code">ECO-2026-9812-JKT</div>
            <div className="passport-tier-badge">
              <Award size={13} />
              <span>Level 4: Pelopor Hijau</span>
            </div>
            <div className="passport-scan-instruction">
              Tunjukkan QR ini ke petugas Bank Sampah untuk verifikasi otomatis
            </div>
          </div>
        </div>

        {/* Impact Live Metrics Grid */}
        <div className="mockup-metrics-grid">
          <div className="mockup-metric-box">
            <div className="metric-header">
              <Leaf size={14} className="text-emerald" />
              <span>Total Daur Ulang</span>
            </div>
            <div className="metric-val">48.5 <span className="metric-unit">kg</span></div>
            <div className="metric-note">100% Terverifikasi</div>
          </div>

          <div className="mockup-metric-box">
            <div className="metric-header">
              <TrendingUp size={14} className="text-emerald" />
              <span>Poin Kampanye</span>
            </div>
            <div className="metric-val">1.450 <span className="metric-unit">poin</span></div>
            <div className="metric-note">+120 minggu ini</div>
          </div>
        </div>

        {/* Integrated Campaign Contribution Widget */}
        <div className="mockup-campaign-widget">
          <div className="campaign-widget-header">
            <span>Kampanye Aktif: <strong>Aksi Kampus Bersih 2026</strong></span>
            <span className="campaign-percent">84%</span>
          </div>
          <div className="campaign-progress-track">
            <div className="campaign-progress-fill" style={{ width: '84%' }} />
          </div>
          <div className="campaign-widget-footer">
            <span>Kontribusimu: <strong>32.4 kg</strong></span>
            <span>Target: <strong>5.000 kg</strong></span>
          </div>
        </div>

        {/* In-Card Milestone / Achievement Row */}
        <div className="in-card-milestone">
          <div className="milestone-icon-box">
            <Award size={16} className="text-gold" />
          </div>
          <div className="milestone-text">
            <div className="milestone-row">
              <span className="milestone-title">Lencana Terbuka:</span>
              <span className="badge-pill">Pemilah Ahli</span>
            </div>
            <p className="milestone-sub">10x Penyetoran terverifikasi tanpa anomali</p>
          </div>
        </div>
      </div>
    </div>
  );
}
