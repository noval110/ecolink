import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Building2,
} from 'lucide-react';
import {
  getMyCampaigns,
  getCampaigns,
} from '../../services/api';

export default function UserCampaignsPage() {
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'explore'
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCampaigns = async () => {
      try {
        const [myResult, allResult] = await Promise.all([
          getMyCampaigns(),
          getCampaigns(),
        ]);

        if (!active) return;

        setMyCampaigns(Array.isArray(myResult.data) ? myResult.data : []);
        setAllCampaigns(Array.isArray(allResult.data) ? allResult.data : []);
      } catch (error) {
        if (active) {
          console.error('Failed to load campaigns:', error);
          setError(error.message || 'Gagal memuat kampanye.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCampaigns();

    return () => {
      active = false;
    };
  }, []);

  const joinedIds = new Set(myCampaigns.map((campaign) => campaign.id));
  const availableCampaigns = allCampaigns.filter(
    (campaign) => !joinedIds.has(campaign.id)
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
          <span>Kampanye yang Diikuti ({myCampaigns.length})</span>
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

      {loading && (
        <div className="discovery-empty-state" role="status">
          <h4>Memuat kampanye...</h4>
        </div>
      )}

      {error && (
        <div className="discovery-empty-state" role="alert">
          <h4>Gagal memuat kampanye</h4>
          <p>{error}</p>
        </div>
      )}

      {/* Enrolled Campaigns Tab */}
      {!loading && !error && activeTab === 'enrolled' && (
        <div className="enrolled-campaigns-stack">
          {myCampaigns.length === 0 && (
            <div className="discovery-empty-state">
              <h4>Belum ada kampanye yang diikuti</h4>
              <p>Jelajahi kampanye yang tersedia untuk mulai berkontribusi.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('explore')}
              >
                Jelajahi Kampanye
              </button>
            </div>
          )}
          {myCampaigns.map((camp) => {
            const overallPct = Number(camp.progress_percentage ?? 0);
            const partners = camp.partner_waste_banks ?? [];

            return (
              <div key={camp.id} className="enrolled-camp-card">
                <div className="camp-top-row">
                  <div className="camp-brand-info">
                    <h3 className="camp-title">{camp.title}</h3>
                    <span className="camp-organizer">Penyelenggara: <strong>{camp.organization}</strong></span>
                  </div>

                  <div className="camp-badges-col">
                    {camp.status && (
                      <span className="camp-status-badge">
                        {camp.status === 'active' && <span className="status-dot-active" />}
                        {camp.status === 'active' ? 'Aktif' : camp.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="camp-progress-section">
                  <div className="camp-progress-header">
                    <span>Kemajuan Bersama: <strong>{camp.current_weight} / {camp.target_weight} kg</strong></span>
                    <span className="text-emerald font-semibold">{Number(overallPct.toFixed(2))}%</span>
                  </div>
                  <div className="progress-track-bg">
                    <div className="progress-fill-bar" style={{ width: `${Math.min(100, Math.max(0, overallPct))}%` }} />
                  </div>
                </div>

                {/* User Personal Impact Card Inside Campaign */}
                <div className="personal-contribution-grid">
                  <div className="contrib-box">
                    <span className="contrib-lbl">Kontribusi Pribadimu</span>
                    <strong className="contrib-val text-emerald">{camp.user_contribution} kg</strong>
                    <span className="contrib-sub">Timbangan tervalidasi</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Peserta</span>
                    <strong className="contrib-val text-gold">
                      <Users size={16} /> {camp.participants}
                    </strong>
                    <span className="contrib-sub">Peserta kampanye</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Eco Score</span>
                    <strong className="contrib-val text-blue">{Math.round(camp.user_contribution * 10)}</strong>
                    <span className="contrib-sub">Berdasarkan kontribusi terverifikasi</span>
                  </div>

                  <div className="contrib-box">
                    <span className="contrib-lbl">Mitra Bank Sampah Penampung</span>
                    <strong className="contrib-val">{partners.map((bank) => bank.name).join(', ') || 'Belum ada mitra'}</strong>
                    <span className="contrib-sub">{partners.length} bank sampah</span>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="camp-action-row">
                  <Link to={`/campaigns/${camp.id}`} className="btn btn-outline btn-sm">
                    <span>Lihat Halaman Publik</span>
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
      {!loading && !error && activeTab === 'explore' && (
        <div className="explore-recommendations-grid">
          {availableCampaigns.length === 0 && (
            <div className="discovery-empty-state">
              <h4>Belum ada kampanye lain</h4>
              <p>Kampanye yang tersedia sudah kamu ikuti atau belum ditambahkan.</p>
            </div>
          )}
          {availableCampaigns.map((camp) => (
            <div key={camp.id} className="recommend-camp-card">
              <div className="recommend-content">
                <h4 className="recommend-title">{camp.title}</h4>
                <p className="recommend-org">Oleh: {camp.organization}</p>

                <div className="recommend-stats">
                  <span>Target: <strong>{camp.target_weight} kg</strong></span>
                  <span>Terkumpul: <strong>{camp.current_weight} kg</strong></span>
                </div>

                <Link to={`/campaigns/${camp.id}`} className="btn btn-light-green w-100 justify-center btn-sm mt-3">
                  <span>Lihat Detail Kampanye</span>
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
