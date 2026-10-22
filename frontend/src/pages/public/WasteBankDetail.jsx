import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  ChevronRight,
  Check,
  Copy,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getWasteBankById, getCampaigns } from '../../services/api';

const pinMarkerIcon = L.divIcon({
  className: 'custom-map-marker',
  html: '<div style="width: 24px; height: 24px; background-color: #34d399; border-radius: 50%; box-shadow: 0 0 0 8px rgba(52, 211, 153, 0.4); border: 2px solid #064e3b;"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function getBankPosition(bank) {
  if (bank.latitude == null || bank.longitude == null) return null;
  const latitude = Number(bank.latitude);
  const longitude = Number(bank.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return [latitude, longitude];
}

export default function WasteBankDetail() {
  const { id } = useParams();
  const [bank, setBank] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      setBank(null);
      setCampaigns([]);
      setCopied(false);
      setCopyError('');
      setActiveCategory('Semua');

      try {
        const [bankResult, campaignResult] = await Promise.all([
          getWasteBankById(id),
          getCampaigns(),
        ]);

        if (!active) return;
        setBank(bankResult.data);
        setCampaigns(Array.isArray(campaignResult.data) ? campaignResult.data : []);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat bank sampah.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  const materials = useMemo(
    () => Array.isArray(bank?.accepted_materials) ? bank.accepted_materials : [],
    [bank]
  );
  const categories = useMemo(
    () => ['Semua', ...new Set(materials.map((material) => material.name).filter(Boolean))],
    [materials]
  );
  const filteredMaterials = useMemo(
    () => activeCategory === 'Semua'
      ? materials
      : materials.filter((material) => material.name === activeCategory),
    [materials, activeCategory]
  );
  const affiliatedCampaigns = useMemo(
    () => campaigns.filter((campaign) =>
      campaign.partner_waste_banks?.some((partner) => Number(partner.id) === Number(bank?.id))
    ),
    [campaigns, bank?.id]
  );

  const handleCopyAddress = async () => {
    if (!bank?.address) return;
    setCopyError('');
    try {
      await navigator.clipboard.writeText(bank.address);
      setCopied(true);
    } catch {
      setCopyError('Alamat belum dapat disalin. Silakan salin alamat yang ditampilkan.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem' }} role="status">
        <h2>Memuat bank sampah...</h2>
      </div>
    );
  }

  if (error || !bank) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h2>Bank Sampah Tidak Ditemukan</h2>
        <p role="alert" style={{ margin: '1rem 0 2rem' }}>{error || 'Data bank sampah tidak tersedia.'}</p>
        <Link to="/waste-banks" className="btn btn-primary">Kembali ke Daftar Bank Sampah</Link>
      </div>
    );
  }

  const position = getBankPosition(bank);

  return (
    <div className="waste-bank-detail-page">
      <div className="container">
        <div className="breadcrumb-nav">
          <Link to="/waste-banks" className="breadcrumb-back-link">
            <ArrowLeft size={16} /> Kembali ke Peta Bank Sampah
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{bank.name}</span>
        </div>

        <div className="bank-hero-card">
          <div className="bank-hero-grid">
            <div className="bank-hero-main">
              {bank.status && (
                <div className="badge-row">
                  <span className="status-pill open-pill">
                    <span className="status-dot" /> {bank.status}
                  </span>
                </div>
              )}
              <h1 className="bank-hero-title">{bank.name}</h1>
              <div className="bank-meta-details">
                {bank.address && (
                  <div className="meta-item">
                    <MapPin size={18} className="text-emerald shrink-0" />
                    <span>{bank.address}</span>
                  </div>
                )}
                {bank.phone && (
                  <div className="meta-item">
                    <Phone size={18} className="text-emerald shrink-0" />
                    <span>{bank.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bank-actions-box">
              <h4 className="actions-box-title">Aksi & Kunjungan</h4>
              {position ? (
                <a
                  href={'https://www.google.com/maps/search/?api=1&query=' + position.join(',')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-100 justify-center"
                >
                  <Navigation size={16} /> Buka Rute Google Maps
                </a>
              ) : (
                <p>Koordinat lokasi belum tersedia.</p>
              )}
              {bank.address && (
                <button type="button" onClick={handleCopyAddress} className="btn btn-secondary w-100 justify-center">
                  {copied ? (
                    <><Check size={16} className="text-emerald" /> Alamat Berhasil Disalin!</>
                  ) : (
                    <><Copy size={16} /> Salin Alamat Lengkap</>
                  )}
                </button>
              )}
              {copyError && <p role="alert">{copyError}</p>}
            </div>
          </div>
        </div>

        <div className="bank-content-layout">
          <div className="bank-content-main">
            {bank.description && (
              <div className="content-card">
                <h3 className="card-section-title">Tentang Bank Sampah</h3>
                <p className="card-body-paragraph" style={{ whiteSpace: 'pre-line' }}>{bank.description}</p>
              </div>
            )}

            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Katalog Material & Harga Beli</h3>
                  <p className="card-section-sub">Harga material per kilogram yang tercatat untuk {bank.name}.</p>
                </div>
              </div>

              <div className="materials-cat-chips">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={'cat-pill-btn ' + (activeCategory === category ? 'active' : '')}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {filteredMaterials.length === 0 ? (
                <div className="discovery-empty-state">
                  <h4>Belum Ada Harga Material</h4>
                  <p>Harga material yang diterima akan ditampilkan di sini.</p>
                </div>
              ) : (
                <div className="material-price-table">
                  <div className="table-head-row">
                    <span>Jenis Sampah</span>
                    <span>Satuan</span>
                    <span>Keterangan</span>
                    <span className="text-right">Harga Beli / kg</span>
                  </div>
                  {filteredMaterials.map((material) => (
                    <div key={material.waste_category_id} className="table-body-row">
                      <div className="mat-name-cell"><strong>{material.name}</strong></div>
                      <div><span className="category-badge">{material.unit || 'kg'}</span></div>
                      <div className="mat-note-cell"><span className="note-text">Material diterima oleh bank sampah ini</span></div>
                      <div className="mat-price-cell text-right">
                        <strong className="price-val">Rp {Number(material.price_per_kg).toLocaleString('id-ID')}</strong>
                        <span className="per-unit">/ kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Kampanye Kolaboratif yang Didukung</h3>
                  <p className="card-section-sub">Kampanye yang mencantumkan bank sampah ini sebagai mitra.</p>
                </div>
              </div>
              {affiliatedCampaigns.length === 0 ? (
                <p>Belum ada kampanye terkait.</p>
              ) : (
                <div className="affiliated-campaigns-grid">
                  {affiliatedCampaigns.map((campaign) => {
                    const progress = Number(campaign.progress_percentage || 0);
                    return (
                      <div key={campaign.id} className="affiliated-camp-card">
                        {campaign.status && <div className="camp-card-badge">{campaign.status}</div>}
                        <h4>{campaign.title}</h4>
                        <p className="organizer-name">Diselenggarakan oleh: {campaign.organization}</p>
                        <div className="camp-progress-bar-box">
                          <div className="progress-labels">
                            <span>{campaign.current_weight} / {campaign.target_weight} kg terkumpul</span>
                            <span>{progress.toFixed(2)}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: Math.min(100, Math.max(0, progress)) + '%' }} />
                          </div>
                        </div>
                        <Link to={'/campaigns/' + campaign.id} className="btn-camp-link">
                          Lihat Detail Kampanye <ChevronRight size={15} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bank-content-sidebar">
            <div className="content-card sidebar-card">
              <h4 className="sidebar-card-title">
                <MapPin size={18} className="text-emerald" /> Lokasi di Peta
              </h4>
              {position ? (
                <div className="mini-map-wrapper">
                  <MapContainer key={bank.id} center={position} zoom={15} scrollWheelZoom={false} className="mini-leaflet-map">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      className="dark-map-tiles"
                    />
                    <Marker position={position} icon={pinMarkerIcon}><Popup>{bank.name}</Popup></Marker>
                  </MapContainer>
                </div>
              ) : (
                <p>Koordinat lokasi belum tersedia.</p>
              )}
              {bank.address && <p className="mini-map-address">{bank.address}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
