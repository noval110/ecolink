import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Building2,
  Share2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';
import {
  getCampaignById,
  getWasteBankById,
  joinCampaign,
  isAuthenticated,
  getMyCampaigns,
} from '../../services/api';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [affiliatedBanks, setAffiliatedBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCampaign = async () => {
      setLoading(true);
      setError('');
      setCampaign(null);
      setAffiliatedBanks([]);
      setJoinMessage('');
      setCopied(false);
      setAlreadyJoined(false);

      try {
        const result = await getCampaignById(id);
        const data = result.data;
        if (!data) throw new Error('Kampanye tidak ditemukan.');
        if (!active) return;
        setCampaign(data);

        if (isAuthenticated()) {
          try {
            const myResult = await getMyCampaigns();
            const joined = Array.isArray(myResult.data) && myResult.data.some(
              (item) => Number(item.id) === Number(id)
            );
            if (active) setAlreadyJoined(joined);
          } catch (error) {
            if (active) console.error('Failed to check campaign membership:', error);
          }
        }

        if (!active) return;

        const partners = Array.isArray(data.partner_waste_banks)
          ? data.partner_waste_banks
          : [];
        const bankResults = await Promise.all(
          partners.map(async (bank) => {
            try {
              const result = await getWasteBankById(bank.id);
              return result.data || bank;
            } catch {
              return bank;
            }
          })
        );

        if (active) setAffiliatedBanks(bankResults);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat kampanye.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCampaign();
    return () => {
      active = false;
    };
  }, [id]);

  const handleJoinCampaign = async () => {
    if (alreadyJoined) {
      setJoinMessage('Kamu sudah mengikuti kampanye ini.');
      return;
    }

    if (!isAuthenticated()) {
      navigate('/login?redirect=' + encodeURIComponent('/campaigns/' + id));
      return;
    }

    if (joining) return;
    setJoining(true);
    setJoinMessage('');

    try {
      await joinCampaign(id);
      setAlreadyJoined(true);
      setJoinMessage('Berhasil bergabung dengan kampanye.');

      try {
        const refreshed = await getCampaignById(id);
        setCampaign(refreshed.data);
      } catch {
        setJoinMessage('Berhasil bergabung dengan kampanye. Data kampanye belum dapat diperbarui.');
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('already joined')) {
        setAlreadyJoined(true);
        setJoinMessage('Kamu sudah mengikuti kampanye ini.');
      } else {
        setJoinMessage(err.message || 'Gagal bergabung dengan kampanye.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setJoinMessage('Tautan belum dapat disalin. Silakan salin dari alamat browser.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem' }} role="status">
        <h2>Memuat kampanye...</h2>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h2>Kampanye Tidak Ditemukan</h2>
        <p role="alert" style={{ margin: '1rem 0 2rem' }}>{error || 'Kampanye tidak tersedia.'}</p>
        <Link to="/campaigns" className="btn btn-primary">Kembali ke Daftar Kampanye</Link>
      </div>
    );
  }

  const progressPct = Math.min(100, Math.max(0, Number(campaign.progress_percentage || 0)));
  const estimatedCarbonReduced = Number(campaign.current_weight || 0) * 0.6;

  return (
    <div className="campaign-detail-page">
      <div className="container">
        <div className="breadcrumb-nav">
          <Link to="/campaigns" className="breadcrumb-back-link">
            <ArrowLeft size={16} /> Kembali ke Jelajah Kampanye
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{campaign.title}</span>
        </div>

        <div className="campaign-detail-hero">
          {campaign.status && (
            <div className="hero-top-badges">
              <span className="status-pill">{campaign.status}</span>
            </div>
          )}
          <h1 className="campaign-detail-title">{campaign.title}</h1>

          <div className="campaign-organizer-bar">
            <Building2 size={18} className="text-emerald" />
            <div className="organizer-text">
              <span className="org-label">Penyelenggara:</span>
              <strong className="org-name">{campaign.organization}</strong>
            </div>
          </div>

          {(campaign.start_date || campaign.end_date) && (
            <div className="campaign-meta-row">
              <div className="meta-col">
                <Calendar size={16} className="text-emerald" />
                <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="campaign-content-layout">
          <div className="campaign-content-main">
            <div className="content-card">
              <h3 className="card-section-title">Tentang Inisiatif Ini</h3>
              <p className="card-body-paragraph" style={{ whiteSpace: 'pre-line' }}>
                {campaign.description || 'Belum ada deskripsi kampanye.'}
              </p>
            </div>

            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Bank Sampah Mitra Penampung</h3>
                  <p className="card-section-sub">
                    Mitra bank sampah yang terdaftar pada kampanye ini.
                  </p>
                </div>
              </div>

              <div className="affiliated-banks-stack">
                {affiliatedBanks.length === 0 && <p>Belum ada bank sampah mitra yang terdaftar.</p>}
                {affiliatedBanks.map((bank) => (
                  <div key={bank.id} className="affiliated-bank-item">
                    <div className="bank-info-side">
                      <h4 className="bank-item-title">{bank.name}</h4>
                      {bank.address && (
                        <p className="bank-item-address">
                          <MapPin size={14} className="text-emerald shrink-0" />
                          {bank.address}
                        </p>
                      )}
                      {bank.status && <span className="status-pill">{bank.status}</span>}
                    </div>
                    <div className="bank-action-side">
                      <Link to={'/waste-banks/' + bank.id} className="btn btn-outline btn-sm">
                        Lihat Bank Sampah
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="campaign-content-sidebar">
            <div className="campaign-sidebar-sticky">
              <div className="content-card sidebar-action-card">
                <span className="target-summary-lbl">Kemajuan Capaian Target</span>
                <div className="target-hero-stats">
                  <div className="stat-big-number">
                    {campaign.current_weight} <span className="unit">kg</span>
                  </div>
                  <div className="stat-target-label">
                    dari target <strong>{campaign.target_weight} kg</strong>
                  </div>
                </div>

                <div className="progress-track-bg" style={{ height: '10px', margin: '1.25rem 0 0.75rem' }}>
                  <div className="progress-fill-bar" style={{ width: progressPct + '%' }} />
                </div>
                <div className="progress-details-flex">
                  <span><strong>{progressPct.toFixed(2)}%</strong> tercapai</span>
                </div>

                <div className="sidebar-metrics-grid">
                  <div className="sidebar-metric-box">
                    <Users size={18} className="text-emerald" />
                    <div>
                      <div className="s-val">{campaign.participants}</div>
                      <div className="s-lbl">Peserta Terdaftar</div>
                    </div>
                  </div>
                  <div className="sidebar-metric-box">
                    <TrendingUp size={18} className="text-emerald" />
                    <div>
                      <div className="s-val">{estimatedCarbonReduced.toFixed(2)} kg</div>
                      <div className="s-lbl">Estimasi Reduksi CO₂e</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleJoinCampaign}
                  disabled={joining || alreadyJoined || campaign.status !== 'active'}
                  className="btn btn-primary w-100 justify-center"
                  style={{ marginBottom: '0.75rem', padding: '0.9rem 1rem' }}
                >
                  {alreadyJoined ? (
                    <>
                      <CheckCircle2 size={16} />
                      Sudah Mengikuti
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {joining ? 'Memproses...' : campaign.status === 'active' ? 'Ikuti Kampanye' : 'Kampanye Tidak Aktif'}
                    </>
                  )}
                </button>

                {joinMessage && (
                  <p role="status" style={{ margin: '0.75rem 0', textAlign: 'center' }}>{joinMessage}</p>
                )}

                <button type="button" onClick={handleCopyLink} className="btn btn-secondary w-100 justify-center">
                  {copied ? (
                    <><Check size={16} className="text-emerald" /> Tautan Berhasil Disalin!</>
                  ) : (
                    <><Share2 size={16} /> Bagikan Kampanye</>
                  )}
                </button>
              </div>

              <div className="content-card sidebar-bank-note">
                <div className="icon-row">
                  <MapPin size={20} className="text-emerald" />
                  <strong>{affiliatedBanks.length} Mitra Bank Sampah</strong>
                </div>
                <p>Lihat informasi bank sampah mitra sebelum melakukan penyetoran.</p>
                <Link to="/waste-banks" className="link-text-emerald">
                  Cari Bank Sampah
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
