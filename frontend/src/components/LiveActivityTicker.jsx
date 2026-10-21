import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const liveActivities = [
  {
    id: 1,
    time: '1m yang lalu',
    user: 'Fadhil M.',
    action: 'menyetor 4.8 kg Plastik PET',
    bank: 'Bank Sampah Bersih Melati',
    campaign: 'Aksi Kampus Bersih',
    points: '+48 poin'
  },
  {
    id: 2,
    time: '3m yang lalu',
    user: 'BEM Fasilkom',
    action: 'mencapai 85% target',
    bank: 'Bank Sampah Harmoni',
    campaign: 'Zero Waste Week 2026',
    points: '+250 poin'
  },
  {
    id: 3,
    time: '5m yang lalu',
    user: 'Anisa R.',
    action: 'menyetor 12.3 kg Kardus & Kertas',
    bank: 'Bank Sampah Sukamaju',
    campaign: 'Gerakan Pilah Berkah',
    points: '+123 poin'
  },
  {
    id: 4,
    time: '8m yang lalu',
    user: 'Komunitas Peduli Kali',
    action: 'mendaftarkan 42 anggota baru',
    bank: 'Bank Sampah Induk Mandiri',
    campaign: 'Sungai Bebas Sampah',
    points: 'Terverifikasi'
  }
];

export default function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveActivities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = liveActivities[currentIndex];

  return (
    <div className="live-ticker-container">
      <div className="container">
        <div className="live-ticker-bar">
          <div className="ticker-label">
            <span className="live-pulse-dot" />
            <span className="ticker-badge-text">AKTIVITAS DAMPAK LANGSUNG</span>
          </div>

          <div className="ticker-content" key={current.id}>
            <div className="ticker-main-text">
              <span className="ticker-time">{current.time}</span>
              <strong className="ticker-user">{current.user}</strong>
              <span className="ticker-action">{current.action}</span>
              <span className="ticker-separator">•</span>
              <span className="ticker-bank">
                <ShieldCheck size={14} className="ticker-shield" />
                {current.bank}
              </span>
            </div>
            <div className="ticker-reward-pill">
              <Award size={13} />
              <span>{current.points}</span>
            </div>
          </div>

          <Link to="/campaigns" className="ticker-explore-link">
            <span>Lihat Semua Kampanye</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
