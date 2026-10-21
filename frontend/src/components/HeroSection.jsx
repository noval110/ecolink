import React from 'react';
import { ArrowRight, Leaf, Recycle, Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsSection from './StatsSection';
import HeroProductMockup from './HeroProductMockup';
import LiveActivityTicker from './LiveActivityTicker';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Daur ulang tak boleh<br />
              berhenti di tempat <span className="highlight">sampah.</span>
            </h1>

            <p className="hero-desc">
              EcoLink menghubungkan aksi penyetoran sampah individu langsung ke target kampanye komunitas, divalidasi 100% melalui timbangan fisik Bank Sampah dan terekam di Eco Passport digitalmu.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-light-green hero-primary-btn">
                <span>Mulai Sekarang</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/campaigns" className="btn btn-outline hero-secondary-btn">
                <span>Jelajahi Kampanye</span>
              </Link>
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="hero-social-proof">
              <div className="proof-avatar-stack">
                <span className="proof-avatar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={14} color="#86efac" />
                </span>
                <span className="proof-avatar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Recycle size={14} color="#34d399" />
                </span>
                <span className="proof-avatar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={14} color="#38bdf8" />
                </span>
                <span className="proof-avatar proof-avatar-more">+1.2k</span>
              </div>
              <div className="proof-text">
                <div className="proof-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <strong>100% Terverifikasi</strong>
                </div>
                <span>Dipercaya 32+ komunitas kampus & 48 mitra bank sampah</span>
              </div>
            </div>

            {/* Live Impact Metrics Counter (Aligned with right card) */}
            <StatsSection />
          </div>

          {/* Right Column: Interactive Product Showcase */}
          <div className="hero-visual-col">
            <HeroProductMockup />
          </div>
        </div>
      </div>

      {/* Real-time Ticker across full width */}
      <LiveActivityTicker />
    </section>
  );
}
