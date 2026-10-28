import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
              Setorkan sampah ke Bank Sampah, dukung target kampanye komunitas, dan simpan kontribusi terverifikasi di Eco Passport digitalmu.
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

            <div className="hero-social-proof hero-verification-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Kontribusi dicatat setelah setoran diverifikasi petugas Bank Sampah.</span>
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
