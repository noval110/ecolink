import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveActivityTicker() {
  return (
    <div className="live-ticker-container">
      <div className="container">
        <div className="live-ticker-bar">
          <div className="ticker-label">
            <ShieldCheck size={16} aria-hidden="true" />
            <span className="ticker-badge-text">ALUR VERIFIKASI</span>
          </div>
          <div className="ticker-content">
            <p className="ticker-main-text">
              Setoran ditimbang petugas, lalu dicatat sebagai kontribusi kampanye dan Eco Passport.
            </p>
          </div>
          <Link to="/campaigns" className="ticker-explore-link">
            <span>Jelajahi Kampanye</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
