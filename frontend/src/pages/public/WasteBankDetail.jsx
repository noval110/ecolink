import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Award,
  Share2,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Star,
  Check,
  Copy
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MOCK_WASTE_BANKS, MOCK_CAMPAIGNS } from '../../data/mockData';

const pinMarkerIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width: 24px; height: 24px; background-color: #34d399; border-radius: 50%; box-shadow: 0 0 0 8px rgba(52, 211, 153, 0.4); border: 2px solid #064e3b;"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function WasteBankDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const bank = MOCK_WASTE_BANKS.find((wb) => wb.id === id) || MOCK_WASTE_BANKS[0];

  if (!bank) {
    return (
      <div className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center' }}>
        <h2>Bank Sampah Tidak Ditemukan</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '1rem 0 2rem' }}>Data bank sampah dengan ID ini belum terdaftar.</p>
        <Link to="/waste-banks" className="btn btn-primary">Kembali ke Daftar Bank Sampah</Link>
      </div>
    );
  }

  // Find affiliated campaigns
  const affiliatedCampaigns = MOCK_CAMPAIGNS.filter((c) =>
    bank.affiliatedCampaignIds?.includes(c.id)
  );

  const categories = ['Semua', ...new Set(bank.materials.map((m) => m.category))];
  const filteredMaterials = activeCategory === 'Semua'
    ? bank.materials
    : bank.materials.filter((m) => m.category === activeCategory);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(bank.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="waste-bank-detail-page">
      <div className="container">
        
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <Link to="/waste-banks" className="breadcrumb-back-link">
            <ArrowLeft size={16} /> Kembali ke Peta Bank Sampah
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{bank.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bank-hero-card">
          {/* Facility Photo Showcase Banner */}
          <div className="bank-facility-banner">
            <img src={bank.image} alt={bank.name} className="bank-facility-img" />
            <div className="bank-facility-overlay" />
            <div className="facility-badge-floating">
              <ShieldCheck size={14} className="text-emerald" />
              <span className="verified-full-text">Lokasi & Timbangan Resmi Terverifikasi</span>
              <span className="verified-short-text">Timbangan Resmi Terverifikasi</span>
            </div>
          </div>

          <div className="bank-hero-grid">
            <div className="bank-hero-main">
              <div className="badge-row">
                <span className="status-pill open-pill">
                  <span className="status-dot"></span> {bank.status}
                </span>
                <span className="verified-pill">
                  <ShieldCheck size={14} />
                  <span className="verified-full-text">Mitra Resmi KLHK & EcoLink</span>
                  <span className="verified-short-text">Mitra Resmi</span>
                </span>
              </div>

              <h1 className="bank-hero-title">{bank.name}</h1>
              
              <div className="bank-meta-details">
                <div className="meta-item">
                  <MapPin size={18} className="text-emerald shrink-0" />
                  <span>{bank.address}</span>
                </div>
                <div className="meta-item">
                  <Clock size={18} className="text-emerald shrink-0" />
                  <span>{bank.operationalHours}</span>
                </div>
                <div className="meta-item">
                  <Phone size={18} className="text-emerald shrink-0" />
                  <span>{bank.phone}</span>
                </div>
              </div>

              <div className="bank-rating-row">
                <span className="rating-star" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" /> {bank.rating}
                </span>
                <span className="rating-desc">Berdasarkan {bank.reviewCount} ulasan penimbang terverifikasi</span>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bank-actions-box">
              <h4 className="actions-box-title">Aksi & Kunjungan</h4>
              
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${bank.position[0]},${bank.position[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-100 justify-center"
              >
                <Navigation size={16} /> Buka Rute Google Maps
              </a>

              <a
                href={`https://wa.me/${bank.whatsapp}?text=Halo%20Admin%20${encodeURIComponent(bank.name)},%20saya%20ingin%20menanyakan%20prosedur%20penyetoran%20sampah%20EcoLink.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline w-100 justify-center"
              >
                <ExternalLink size={16} /> Hubungi Petugas via WhatsApp
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="btn btn-secondary w-100 justify-center"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald" /> Alamat Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Salin Alamat Lengkap
                  </>
                )}
              </button>

              <div className="total-recycled-banner">
                <div className="recycled-val">{bank.totalRecycledKg.toLocaleString()} kg</div>
                <div className="recycled-lbl">Total Sampah Terverifikasi Daur Ulang</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout (Main + Sidebar) */}
        <div className="bank-content-layout">
          
          {/* Main Column */}
          <div className="bank-content-main">
            
            {/* Section 1: Pricing & Materials Catalog */}
            <div className="content-card">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-section-title">Katalog Material & Harga Beli</h3>
                  <p className="card-section-sub">
                    Harga timbangan resmi per kilogram yang berlaku di {bank.name}. Nilai otomatis dikonversi ke Rupiah dan poin Eco Passport.
                  </p>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="materials-cat-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Material Items Table/List */}
              <div className="material-price-table">
                <div className="table-head-row">
                  <span>Jenis Sampah</span>
                  <span>Kategori</span>
                  <span>Kondisi / Syarat</span>
                  <span className="text-right">Harga Beli / kg</span>
                </div>
                {filteredMaterials.map((mat, idx) => (
                  <div key={idx} className="table-body-row">
                    <div className="mat-name-cell">
                      <strong>{mat.name}</strong>
                    </div>
                    <div>
                      <span className="category-badge">{mat.category}</span>
                    </div>
                    <div className="mat-note-cell">
                      <span className="note-text">{mat.note}</span>
                    </div>
                    <div className="mat-price-cell text-right">
                      <strong className="price-val">Rp {mat.pricePerKg.toLocaleString('id-ID')}</strong>
                      <span className="per-unit">/ kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: How to Deposit Physical Waste */}
            <div className="content-card">
              <h3 className="card-section-title">Alur Penyetoran di Lokasi</h3>
              <p className="card-section-sub">
                Hanya butuh 3 langkah praktis agar setoran sampahmu sah diverifikasi menjadi poin Eco Passport.
              </p>

              <div className="deposit-steps-grid">
                <div className="deposit-step-item">
                  <div className="step-num-circle">1</div>
                  <h4>Bawa Sampah Terpilah</h4>
                  <p>Pisahkan botol plastik, kardus, atau kaleng dari rumah sesuai kategori agar proses penimbangan cepat.</p>
                </div>
                <div className="deposit-step-item">
                  <div className="step-num-circle">2</div>
                  <h4>Timbang di Petugas</h4>
                  <p>Petugas bank sampah akan menimbang sampah fisik dengan timbangan digital tersertifikasi.</p>
                </div>
                <div className="deposit-step-item">
                  <div className="step-num-circle">3</div>
                  <h4>Pindai QR Eco Passport</h4>
                  <p>Tunjukkan kode QR profil Eco Passport milikmu untuk dicatat. Poin dan metrik lingkungan langsung naik!</p>
                </div>
              </div>
            </div>

            {/* Section 3: Affiliated Campaigns */}
            {affiliatedCampaigns.length > 0 && (
              <div className="content-card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-section-title">Kampanye Kolaboratif yang Didukung</h3>
                    <p className="card-section-sub">
                      Setoran sampah di bank ini dapat otomatis disalurkan untuk mencapai target kampanye berikut:
                    </p>
                  </div>
                </div>

                <div className="affiliated-campaigns-grid">
                  {affiliatedCampaigns.map((camp) => (
                    <div key={camp.id} className="affiliated-camp-card">
                      <div className="camp-card-badge">{camp.category}</div>
                      <h4>{camp.title}</h4>
                      <p className="organizer-name">Diselenggarakan oleh: {camp.organizer}</p>
                      
                      <div className="camp-progress-bar-box">
                        <div className="progress-labels">
                          <span>{camp.collectedKg.toLocaleString()} kg terkumpul</span>
                          <span>{Math.round((camp.collectedKg / camp.targetKg) * 100)}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (camp.collectedKg / camp.targetKg) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <Link to={`/campaigns/${camp.id}`} className="btn-camp-link">
                        <span>Lihat Detail Kampanye</span>
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Column */}
          <div className="bank-content-sidebar">
            
            {/* Mini Map Card */}
            <div className="content-card sidebar-card">
              <h4 className="sidebar-card-title">
                <MapPin size={18} className="text-emerald" /> Lokasi di Peta
              </h4>
              <div className="mini-map-wrapper">
                <MapContainer
                  center={bank.position}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="mini-leaflet-map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="dark-map-tiles"
                  />
                  <Marker position={bank.position} icon={pinMarkerIcon}>
                    <Popup>{bank.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="mini-map-address">{bank.address}</p>
            </div>

            {/* Facilities Card */}
            <div className="content-card sidebar-card">
              <h4 className="sidebar-card-title">
                <Layers size={18} className="text-emerald" /> Fasilitas Tersedia
              </h4>
              <ul className="facilities-list">
                {bank.facilities.map((fac, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="text-emerald shrink-0" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help / Verification Guarantee Note */}
            <div className="content-card sidebar-card guarantee-card">
              <div className="guarantee-icon">
                <ShieldCheck size={28} color="var(--color-primary)" />
              </div>
              <h4>Jaminan Transaksi Sah</h4>
              <p>
                Setiap transaksi penyetoran wajib menggunakan QR Code Eco Passport untuk mencegah manipulasi data dan menjamin keaslian metrik lingkungan.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
