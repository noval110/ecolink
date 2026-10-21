import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Trophy,
  Users,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { USER_CAMPAIGNS } from '../../data/mockUserData';
import { MOCK_CAMPAIGNS } from '../../data/mockData';

export default function UserCampaignsPage() {
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'explore'

  // Campaigns that user is not yet participating in
  const availableCampaigns = MOCK_CAMPAIGNS.filter(
    (c) => !USER_CAMPAIGNS.some((uc) => uc.id === c.id)
  );

  return (
    <div className="user-campaigns-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <Target size={14} className="text-emerald" />
            <span>Gerakan Kolaboratif Terhubung</span>
          </div>
          <h1 className="page-title">Kampanye Daur Ulang Saya</h1>
          <p className="page-sub">
            Setiap gram sampah fisik yang kamu setorkan ke bank sampah mitra otomatis tercatat ke target kampanye yang kamu ikuti.
          </p>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="campaign-segmented-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('enrolled')}
          className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
        >
          <Target size={16} />
          <span>Kampanye yang Diikuti ({USER_CAMPAIGNS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('explore')}
          className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
        >
          <Sparkles size={16} />
          <span>Rekomendasi Kampanye Baru ({availableCampaigns.length})</span>
        </button>
      </div>

      {/* Enrolled Campaigns Tab */}
      {activeTab === 'enrolled' && (
        <div className="enrolled-campaigns-stack">
          {USER_CAMPAIGNS.map((camp) => {
            const overallPct = Math.round((camp.totalCollectedKg / camp.totalTargetKg) * 100);

            return (
              <div key={camp.id} className="enrolled-camp-card">
                <div className="camp-top-row">
                  <div className="camp-brand-info">
                    <span className="camp-category-tag">{camp.category}</span>
                    <h3 className="camp-title">{camp.title}</h3>
                    <span className="camp-organizer">Penyelenggara: <strong>{camp.organizer}</strong></span>
                  </div>

                  <div className="camp-badges-col">
                    <span className="camp-days-badge">
                      <Clock size={13} /> {camp.daysRemaining} hari lagi
                    </span>
                    <span className="camp-status-badge">
                      <span className="status-dot-active" /> {camp.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="camp-progress-section">
                  <div className="camp-progress-header">
                    <span>Kemajuan Bersama: <strong>{camp.totalCollectedKg.toLocaleString()} / {camp.totalTargetKg.toLocaleString()} kg</strong></span>
                    <span className="text-emerald font-semibold">{overallPct}%</span>
                  </div>
                  <div className="progress-track-bg">
                    <div className="progress-fill-bar" style={{ width: `${overallPct}%` }} />
                  </div>
                </div>

                {/* User Personal Impact Card Inside Campaign */}
                <div className="personal-contribution-grid">
                  <div className="contrib-box">
                    <span className="contrib-lbl">Kontribusi Pribadimu</span>
                    <strong className="contrib-val text-emerald">{camp.userContributionKg} kg</strong>
                    <span className="contrib-sub">Timbangan tervalidasi</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Peringkat Kontributor</span>
                    <strong className="contrib-val text-gold">
                      <Trophy size={16} /> #{camp.userRank} Teratas
                    </strong>
                    <span className="contrib-sub">Papan peringkat komunitas & fakultas</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Poin Kampanye Diperoleh</span>
                    <strong className="contrib-val text-blue">+{camp.userPoints} poin</strong>
                    <span className="contrib-sub">Masuk ke Eco Passport</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Mitra Bank Sampah Penampung</span>
                    <strong className="contrib-val">{camp.partnerWasteBank}</strong>
                    <span className="contrib-sub">Titik setor resmi</span>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="camp-action-row">
                  <Link to={`/campaigns/${camp.id}`} className="btn btn-outline btn-sm">
                    <span>Lihat Halaman Publik & Leaderboard</span>
                    <ChevronRight size={14} />
                  </Link>

                  <Link to="/waste-banks" className="btn btn-light-green btn-sm">
                    <MapPin size={14} /> Setor Sampah ke Mitra Ini
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore Other Campaigns Tab */}
      {activeTab === 'explore' && (
        <div className="explore-recommendations-grid">
          {availableCampaigns.map((camp) => (
            <div key={camp.id} className="recommend-camp-card">
              <div className="recommend-img-wrap">
                <img src={camp.image} alt={camp.title} className="recommend-img" />
                <span className="cat-pill">{camp.category}</span>
              </div>

              <div className="recommend-content">
                <h4 className="recommend-title">{camp.title}</h4>
                <p className="recommend-org">Oleh: {camp.organizer}</p>

                <div className="recommend-stats">
                  <span>Target: <strong>{camp.targetKg.toLocaleString()} kg</strong></span>
                  <span>Terkumpul: <strong>{camp.collectedKg.toLocaleString()} kg</strong></span>
                </div>

                <Link to={`/campaigns/${camp.id}`} className="btn btn-light-green w-100 justify-center btn-sm mt-3">
                  <span>Ikuti Kampanye Ini</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization Banner */}
      <div className="org-invite-banner">
        <div className="org-invite-text">
          <Building2 size={24} className="text-emerald" />
          <div>
            <h4>Ingin Mengadakan Kampanye Daur Ulang untuk Komunitas atau Kampusmu?</h4>
            <p>BEM kampus, komunitas warga RT/RW, pegiat lingkungan, maupun perusahaan dapat membuat target kampanye sendiri dan memantau kontribusi anggotanya.</p>
          </div>
        </div>
        <Link to="/register?role=organization" className="btn btn-outline btn-sm whitespace-nowrap">
          Daftarkan Organisasi
        </Link>
      </div>
    </div>
  );
}
