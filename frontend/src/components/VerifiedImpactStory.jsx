import React from 'react';
import { User, Building, ShieldCheck, Award } from 'lucide-react';

export default function VerifiedImpactStory() {
  return (
    <section className="verified-impact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Dampak dari <span className="highlight-text">Setoran Terverifikasi</span></h2>
          <p className="section-desc verification-desc">
            Petugas Bank Sampah memverifikasi setoran sebelum kontribusinya menambah metrik dan progres kampanye.
          </p>
        </div>

        <div className="impact-flow-container">
          {/* Desktop single row line */}
          <div className="connecting-line connecting-line-desktop"></div>

          {/* SVG turn connector connecting Step 2 to Step 3 on mobile */}
          <svg className="flow-mobile-turn-svg" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
            <path
              d="M 70 13.5 C 90 13.5 95 22 95 35 L 95 38 C 95 44 85 45 65 45 L 35 45 C 15 45 6 47 6 54 L 6 57 C 6 60.5 14 60.5 30 60.5"
              vectorEffect="non-scaling-stroke"
              className="flow-turn-path"
            />
          </svg>
          
          <div className="flow-step">
            {/* Mobile horizontal line between Step 1 and Step 2 */}
            <div className="flow-connector-mobile-h"></div>
            <div className="flow-icon-wrapper">
              <User size={32} color="var(--color-primary)" />
            </div>
            <h4 className="flow-title">1. Pengguna (Kamu)</h4>
            <p className="flow-desc">Menyerahkan sampah fisik</p>
          </div>

          <div className="flow-step">
            <div className="flow-icon-wrapper">
              <Building size={32} color="var(--color-primary)" />
            </div>
            <h4 className="flow-title">2. Bank Sampah</h4>
            <p className="flow-desc">Validasi & input transaksi</p>
          </div>

          <div className="flow-step">
            {/* Mobile horizontal line between Step 3 and Step 4 */}
            <div className="flow-connector-mobile-h"></div>
            <div className="flow-icon-wrapper">
              <ShieldCheck size={32} color="var(--color-primary)" />
            </div>
            <h4 className="flow-title" style={{ color: 'var(--color-primary)' }}>3. Transaksi Sah</h4>
            <p className="flow-desc">Sistem memverifikasi bobot & nilai</p>
          </div>

          <div className="flow-step">
            <div className="flow-icon-wrapper">
              <Award size={32} color="var(--color-primary)" />
            </div>
            <h4 className="flow-title">4. Eco Passport</h4>
            <p className="flow-desc">Dampak pribadi & target kampanye bertambah</p>
          </div>

        </div>
      </div>
    </section>
  );
}
