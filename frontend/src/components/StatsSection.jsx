import React from 'react';

export default function StatsSection() {
  return (
    <div className="hero-stats-row fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="hero-stat-item">
        <span className="hero-stat-value">Setor</span>
        <span className="hero-stat-label">di Bank Sampah</span>
      </div>
      <div className="hero-stat-item">
        <span className="hero-stat-value">Verifikasi</span>
        <span className="hero-stat-label">oleh petugas</span>
      </div>
      <div className="hero-stat-item">
        <span className="hero-stat-value">Pantau</span>
        <span className="hero-stat-label">di Eco Passport</span>
      </div>
    </div>
  );
}
