import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Navigation, ChevronRight, List, Map, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  getWasteBanks,
  getWasteBankById,
} from '../../services/api';

function getBankPosition(bank) {
  if (bank.latitude == null || bank.longitude == null) return null;
  const latitude = Number(bank.latitude);
  const longitude = Number(bank.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return [latitude, longitude];
}

// Custom Marker for Leaflet
const createMarkerIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: ${isSelected ? '28px' : '20px'};
        height: ${isSelected ? '28px' : '20px'};
        background-color: ${isSelected ? '#34d399' : '#3b82f6'};
        border-radius: 50%;
        box-shadow: 0 0 0 ${isSelected ? '10px' : '6px'} ${isSelected ? 'rgba(52, 211, 153, 0.4)' : 'rgba(59, 130, 246, 0.35)'};
        border: 2px solid ${isSelected ? '#064e3b' : '#1e3a8a'};
        transition: all 0.3s ease;
      "></div>
    `,
    iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
    iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10]
  });
};

// Error boundary to prevent map runtime issues from crashing the page
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('Map Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.7)', flexDirection: 'column', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
          <p>Peta sedang memuat ulang tampilan...</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => this.setState({ hasError: false })}>Muat Ulang Peta</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component to handle smooth map center changes, resizing, and preventing NaN errors
function MapController({ center, zoom, mobileTab }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !center) return;

    const lat = Number(center[0]);
    const lng = Number(center[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        const size = map.getSize();
        if (!size || size.x === 0 || size.y === 0) return;
        map.flyTo([lat, lng], zoom || 13, { duration: 1.2 });
      } catch (err) {
        console.warn('Map flyTo skipped:', err);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [center, zoom, mobileTab, map]);

  return null;
}

export default function WasteBankDiscovery() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('Semua');
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'
  const [mapCenter, setMapCenter] = useState([-7.42, 109.24]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    let active = true;

    const loadBanks = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getWasteBanks();
        const list = Array.isArray(result.data) ? result.data : [];
        const detailedBanks = await Promise.all(
          list.map(async (bank) => {
            try {
              const detail = await getWasteBankById(bank.id);
              return {
                ...bank,
                accepted_materials: Array.isArray(detail.data?.accepted_materials)
                  ? detail.data.accepted_materials
                  : [],
              };
            } catch {
              return { ...bank, accepted_materials: [] };
            }
          })
        );

        if (!active) return;
        setBanks(detailedBanks);

        if (detailedBanks.length > 0) {
          const first = detailedBanks[0];
          setSelectedBankId(first.id);
          const position = getBankPosition(first);
          if (position) setMapCenter(position);
        }
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat bank sampah.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBanks();
    return () => {
      active = false;
    };
  }, []);

  const materialsList = useMemo(() => {
    const names = banks.flatMap((bank) =>
      bank.accepted_materials?.map((item) => item.name) || []
    );
    return ['Semua', ...new Set(names.filter(Boolean))];
  }, [banks]);

  const filteredBanks = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return banks.filter((bank) => {
      const matchesSearch =
        bank.name?.toLowerCase().includes(keyword) ||
        bank.address?.toLowerCase().includes(keyword);
      const matchesMaterial =
        selectedMaterial === 'Semua' ||
        bank.accepted_materials?.some((material) => material.name === selectedMaterial);
      return matchesSearch && matchesMaterial;
    });
  }, [banks, searchQuery, selectedMaterial]);

  const handleSelectBank = (bank) => {
    if (!bank) return;
    setSelectedBankId(bank.id);
    const position = getBankPosition(bank);
    if (position) {
      setMapCenter(position);
      setMapZoom(15);
    }
    // If mobile, switch to map view automatically on select
    if (position && window.innerWidth <= 768) {
      setMobileTab('map');
    }
  };

  return (
    <div className="waste-bank-discovery-page">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center" style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          {/* <div className="inline-badge" style={{ marginBottom: '1rem' }}>
            <MapPin size={14} className="text-emerald" />
            <span>Jaringan Mitra Terverifikasi</span>
          </div> */}
          <h1 className="section-title">
            Temukan <span className="highlight-text">Bank Sampah</span> Terdekat
          </h1>
          <p className="section-desc">
            Cari mitra Bank Sampah resmi EcoLink untuk menyetor sampah fisik, mendapatkan verifikasi timbangan langsung, dan mencatatkan dampak ke Eco Passport pribadimu.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="discovery-filter-box">
          <div className="discovery-search-row">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama bank sampah, jalan, atau area..."
                className="discovery-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  type="button"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Material Category Pills */}
          <div className="material-filter-scroll">
            <span className="material-filter-label">Kategori Material:</span>
            <div className="material-filter-chips">
              {materialsList.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterial(mat)}
                  className={`filter-chip ${selectedMaterial === mat ? 'active' : ''}`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="discovery-mobile-toggle d-block-mobile">
          <div className="mobile-toggle-segmented">
            <button
              type="button"
              className={`toggle-seg-btn ${mobileTab === 'list' ? 'active' : ''}`}
              onClick={() => setMobileTab('list')}
            >
              <List size={15} /> <span>Daftar ({filteredBanks.length})</span>
            </button>
            <button
              type="button"
              className={`toggle-seg-btn ${mobileTab === 'map' ? 'active' : ''}`}
              onClick={() => setMobileTab('map')}
            >
              <Map size={15} /> <span>Peta Interaktif</span>
            </button>
          </div>
        </div>

        {/* Discovery Layout Grid (Split Map & List) */}
        <div className="discovery-layout-grid">
          
          {/* Left Column: Waste Bank Cards List */}
          <div className={`discovery-list-col ${mobileTab === 'map' ? 'mobile-hidden' : ''}`}>
            <div className="list-status-header">
              <span className="results-count">
                Menampilkan <strong>{filteredBanks.length}</strong> Bank Sampah Mitra
              </span>
              <span className="verified-note">
                <MapPin size={14} className="text-emerald" /> Mitra EcoLink
              </span>
            </div>

            {loading ? (
              <div className="discovery-empty-state" role="status">
                <h4>Memuat bank sampah...</h4>
              </div>
            ) : error ? (
              <div className="discovery-empty-state" role="alert">
                <h4>Gagal Memuat Bank Sampah</h4>
                <p>{error}</p>
              </div>
            ) : filteredBanks.length === 0 ? (
              <div className="discovery-empty-state">
                <div className="empty-icon-box">
                  <MapPin size={32} color="rgba(255,255,255,0.4)" />
                </div>
                <h4>Tidak Ada Bank Sampah yang Sesuai</h4>
                <p>Coba gunakan kata kunci lain atau reset filter material.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMaterial('Semua');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="waste-banks-cards-stack">
                {filteredBanks.map((bank) => {
                  const isSelected = bank.id === selectedBankId;
                  return (
                    <div
                      key={bank.id}
                      className={`bank-discovery-card ${isSelected ? 'active-card' : ''}`}
                      onClick={() => handleSelectBank(bank)}
                    >
                      <div className="bank-card-body">
                        {bank.status && (
                          <div className="card-top-row">
                            <span className="status-pill open-pill">
                              <span className="status-dot" /> {bank.status}
                            </span>
                          </div>
                        )}
                        <h3 className="bank-name">{bank.name}</h3>
                        <p className="bank-address">
                          <MapPin size={15} className="text-emerald shrink-0" />
                          <span>{bank.address}</span>
                        </p>

                        {/* Material Tags */}
                        <div className="materials-tags-row">
                          {bank.accepted_materials?.slice(0, 4).map((material) => (
                            <span key={material.waste_category_id} className="material-tag">
                              {material.name}
                            </span>
                          ))}
                          {bank.accepted_materials.length > 4 && (
                            <span className="material-tag more-tag">
                              +{bank.accepted_materials.length - 4} lainnya
                            </span>
                          )}
                        </div>

                        <div className="card-actions-row">
                          <button
                            type="button"
                            className="btn-locate-map"
                            disabled={!getBankPosition(bank)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBank(bank);
                            }}
                          >
                            <Navigation size={14} /> {getBankPosition(bank) ? 'Pusatkan di Peta' : 'Koordinat belum tersedia'}
                          </button>
                          <Link
                            to={`/waste-banks/${bank.id}`}
                            className="btn-detail-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Katalog Harga & Detail</span>
                            <ChevronRight size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Full Leaflet Interactive Map */}
          <div className={`discovery-map-col ${mobileTab === 'list' ? 'mobile-hidden' : ''}`}>
            <div className="map-sticky-container">
              <MapErrorBoundary>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  scrollWheelZoom={true}
                  className="full-leaflet-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="dark-map-tiles"
                  />

                  <MapController center={mapCenter} zoom={mapZoom} mobileTab={mobileTab} />

                  {filteredBanks.map((bank) => {
                    const position = getBankPosition(bank);
                    if (!position) return null;
                    const isSelected = bank.id === selectedBankId;
                    return (
                      <Marker
                        key={bank.id}
                        position={position}
                        icon={createMarkerIcon(isSelected)}
                        eventHandlers={{
                          click: () => {
                            setSelectedBankId(bank.id);
                          }
                        }}
                      >
                        <Popup className="custom-leaflet-popup">
                          <div style={{ color: '#0f172a', minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>
                              {bank.name}
                            </h4>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#64748b' }}>
                              {bank.address}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>
                                ● {bank.status}
                              </span>
                            </div>
                            <Link
                              to={`/waste-banks/${bank.id}`}
                              style={{
                                display: 'block',
                                textAlign: 'center',
                                background: '#166534',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                            >
                              Lihat Katalog Harga & Detail →
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </MapErrorBoundary>

              <div className="map-overlay-info">
                <span className="dot-pulse"></span>
                <span>Klik marker untuk informasi bank sampah</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
