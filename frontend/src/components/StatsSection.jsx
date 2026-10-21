import React from 'react';
import CountUp from './CountUp';

export default function StatsSection() {
  return (
    <div className="hero-stats-row fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="hero-stat-item">
        <span className="hero-stat-value"><CountUp end={28450} /></span>
        <span className="hero-stat-label">kg Sampah Didaur Ulang</span>
      </div>
      <div className="hero-stat-item">
        <span className="hero-stat-value"><CountUp end={1284} /></span>
        <span className="hero-stat-label">Kontributor Terverifikasi</span>
      </div>
      <div className="hero-stat-item">
        <span className="hero-stat-value"><CountUp end={32} /></span>
        <span className="hero-stat-label">Komunitas & Kampus</span>
      </div>
    </div>
  );
}
