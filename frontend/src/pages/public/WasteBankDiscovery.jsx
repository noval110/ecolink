import React, { useState, useRef } from 'react';
import { Search, MapPin, Navigation, Clock, Phone, ShieldCheck, ChevronRight, Filter, Award, Sparkles, Layers, Star, List, Map, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MOCK_WASTE_BANKS } from '../../data/mockData';
import CustomDropdown from '../../components/CustomDropdown';

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

  // Invalidate map size when switching to map tab on mobile
  React.useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) {
        // Ignore resize error if detached
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [mobileTab, map]);

  // Safely flyTo center only when container has non-zero size and valid coordinates
  React.useEffect(() => {
    if (!map || !center) return;

    const lat = Number(center[0]);
    const lng = Number(center[1]);
    if (isNaN(lat) || isNaN(lng)) return;

    try {
      const size = map.getSize();
      // If container is hidden (e.g. mobile list view), size is 0x0. Do not flyTo to avoid NaN crash.
      if (!size || size.x === 0 || size.y === 0) {
        return;
      }
      map.flyTo([lat, lng], zoom || 14, { duration: 1.2 });
    } catch (err) {
      console.warn('Map flyTo skipped:', err);
    }
  }, [center, zoom, map]);

  return null;
}

export default function WasteBankDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('Semua');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [selectedBankId, setSelectedBankId] = useState(MOCK_WASTE_BANKS[0].id);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'
  const [mapCenter, setMapCenter] = useState(MOCK_WASTE_BANKS[0].position);
  const [mapZoom, setMapZoom] = useState(13);

  const materialsList = ['Semua', 'Plastik', 'Kertas', 'Logam', 'Minyak', 'Elektronik'];
  const citiesList = ['Semua', 'Bandung', 'Jakarta Selatan', 'Surabaya', 'Yogyakarta', 'Denpasar / Badung'];

  // Filtered Banks
  const filteredBanks = MOCK_WASTE_BANKS.filter((wb) => {
    const matchesSearch =
      wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wb.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wb.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial =
      selectedMaterial === 'Semua' ||
      wb.materials.some((m) => m.category.toLowerCase() === selectedMaterial.toLowerCase());

    const matchesCity =
      selectedCity === 'Semua' || wb.city.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesMaterial && matchesCity;
  });

  const handleSelectBank = (bank) => {
    if (!bank) return;
    setSelectedBankId(bank.id);
    if (bank.position && !isNaN(bank.position[0]) && !isNaN(bank.position[1])) {
      setMapCenter(bank.position);
      setMapZoom(15);
    }
    // If mobile, switch to map view automatically on select
    if (window.innerWidth <= 768) {
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

            {/* Custom City Dropdown */}
            <CustomDropdown
              options={citiesList.map((c) => ({ value: c, label: c === 'Semua' ? 'Semua Kota' : c }))}
              value={selectedCity}
              onChange={setSelectedCity}
              icon={MapPin}
              placeholder="Pilih Kota"
              className="city-custom-dropdown"
            />
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
                <ShieldCheck size={14} className="text-emerald" /> 100% Terverifikasi
              </span>
            </div>

            {filteredBanks.length === 0 ? (
              <div className="discovery-empty-state">
                <div className="empty-icon-box">
                  <MapPin size={32} color="rgba(255,255,255,0.4)" />
                </div>
                <h4>Tidak Ada Bank Sampah yang Sesuai</h4>
                <p>Coba gunakan kata kunci lain atau reset filter material dan kota.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMaterial('Semua');
                    setSelectedCity('Semua');
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
                      <div className="bank-card-photo-header">
                        <img src={bank.image} alt={bank.name} className="bank-card-thumb-img" loading="lazy" />
                        <div className="bank-card-photo-overlay" />
                        <div className="card-top-row">
                          <div className="badge-verified-row">
                            <span className="status-pill open-pill">
                              <span className="status-dot"></span> {bank.status}
                            </span>
                            <span className="verified-pill">
                              <ShieldCheck size={12} /> Mitra Resmi
                            </span>
                          </div>
                          <div className="rating-pill">
                            <Star size={13} fill="#fbbf24" color="#fbbf24" />
                            <span>{bank.rating}</span>
                            <span className="review-count">({bank.reviewCount})</span>
                          </div>
                        </div>
                      </div>

                      <div className="bank-card-body">
                        <h3 className="bank-name">{bank.name}</h3>
                        <p className="bank-address">
                          <MapPin size={15} className="text-emerald shrink-0" />
                          <span>{bank.address}</span>
                        </p>

                        <div className="bank-stats-compact">
                          <div className="stat-compact-item">
                            <span className="stat-label">Total Daur Ulang</span>
                            <span className="stat-val">{bank.totalRecycledKg.toLocaleString()} kg</span>
                          </div>
                          <div className="stat-compact-item">
                            <span className="stat-label">Kontributor Aktif</span>
                            <span className="stat-val">{bank.contributorsCount} orang</span>
                          </div>
                        </div>

                        {/* Material Tags */}
                        <div className="materials-tags-row">
                          {bank.materials.slice(0, 4).map((m, idx) => (
                            <span key={idx} className="material-tag">
                              {m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}
                            </span>
                          ))}
                          {bank.materials.length > 4 && (
                            <span className="material-tag more-tag">
                              +{bank.materials.length - 4} lainnya
                            </span>
                          )}
                        </div>

                        <div className="card-actions-row">
                          <button
                            type="button"
                            className="btn-locate-map"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBank(bank);
                            }}
                          >
                            <Navigation size={14} /> Pusatkan di Peta
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
                    if (!bank.position || isNaN(bank.position[0]) || isNaN(bank.position[1])) return null;
                    const isSelected = bank.id === selectedBankId;
                    return (
                      <Marker
                        key={bank.id}
                        position={bank.position}
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
                              <span style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Star size={12} fill="#fbbf24" color="#fbbf24" /> {bank.rating} ({bank.reviewCount})
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
                <span>Klik marker untuk info lokasi & navigasi rute</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
