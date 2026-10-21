import React from 'react';
import { Building2, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from './CountUp';

const campaigns = [
  {
    id: 1,
    title: "Kampus Bebas Sampah Plastik",
    organizer: "Telkom University",
    date: "1 Okt - 31 Okt 2024",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=2070&auto=format&fit=crop",
    current: 684,
    target: 1000,
    unit: "kg",
    participants: 426
  },
  {
    id: 2,
    title: "Gerakan Kertas Lebih Baik",
    organizer: "BEM Fakultas Ilmu Terapan",
    date: "15 Sep - 15 Nov 2024",
    image: "https://images.unsplash.com/photo-1603998935745-f93d39dbf9a1?q=80&w=2070&auto=format&fit=crop",
    current: 330,
    target: 500,
    unit: "kg",
    participants: 189
  },
  {
    id: 3,
    title: "Daur Ulang untuk Hari Esok",
    organizer: "Green Campus Community",
    date: "1 Nov - 30 Nov 2024",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop",
    current: 120,
    target: 300,
    unit: "kg",
    participants: 96
  }
];

export default function FeaturedCampaigns() {
  return (
    <section className="campaign-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Kampanye untuk Dampak Lebih Besar</h2>
          <p className="section-desc">Bergabung dengan berbagai inisiatif lingkungan dan ciptakan perubahan bersama.</p>
        </div>

        <div className="campaign-grid">
          {campaigns.map((camp) => {
            const percentage = Math.min((camp.current / camp.target) * 100, 100);
            return (
              <div key={camp.id} className="campaign-card">
                <div className="card-image-wrapper">
                  <img src={camp.image} alt={camp.title} className="card-image" />
                  <div className="card-badge">Aktif</div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{camp.title}</h3>
                  <div className="card-info">
                    <div className="info-item">
                      <Building2 size={16} />
                      <span>{camp.organizer}</span>
                    </div>
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>{camp.date}</span>
                    </div>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-text">
                      <span className="current"><CountUp end={camp.current} /> / <CountUp end={camp.target} /> {camp.unit}</span>
                      <span className="percentage"><CountUp end={Math.round(percentage)} suffix="%" /></span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="participants-text">
                      <Users size={14} />
                      <span><CountUp end={camp.participants} /> peserta</span>
                    </div>
                  </div>
                  
                  <Link to={`/campaigns/${camp.id}`} className="btn btn-outline-green w-100 mt-auto">Lihat Detail Kampanye</Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="carousel-pagination d-none-desktop">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </section>
  );
}
