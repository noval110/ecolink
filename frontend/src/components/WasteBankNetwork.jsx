import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from './CountUp';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom glowing blue marker to match the screenshot
const blueMarkerIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width: 20px; height: 20px; background-color: #3b82f6; border-radius: 50%; box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4); border: 2px solid #1e3a8a;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const wasteBanks = [
  {
    id: 1,
    name: "Bank Sampah Berseri",
    address: "Jl. Sukabirus No. 12, Bandung",
    status: "Buka",
    materials: ["Plastik", "Kertas", "Logam"],
    distance: "1.2 km",
    position: [-6.9733, 107.6303]
  },
  {
    id: 2,
    name: "Eco Hub Jakarta",
    address: "Kawasan Kuningan, Jakarta",
    status: "Tutup (Buka 08:00 besok)",
    materials: ["Plastik", "Elektronik"],
    distance: "145 km",
    position: [-6.2297, 106.8295]
  },
  {
    id: 3,
    name: "Green Recycle Center",
    address: "Surabaya Timur",
    status: "Buka",
    materials: ["Semua Jenis"],
    distance: "500+ km",
    position: [-7.2504, 112.7688]
  }
];

const extraMarkers = [
  [-0.7893, 113.9213], // Kalimantan
  [-4.1423, 122.1466], // Sulawesi
  [0.5333, 101.4500],  // Sumatra
  [-8.4095, 115.1889], // Bali
  [-5.1476, 119.4327], // Makassar
  [3.5952, 98.6722]    // Medan
];

export default function WasteBankNetwork() {
  return (
    <section className="waste-bank-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Jaringan <span className="highlight-text">Bank Sampah</span> Mitra</h2>
          <p className="section-desc">
            Temukan puluhan titik lokasi setor terdekat yang sudah terverifikasi. Setorkan sampahmu dengan mudah dan aman.
          </p>
        </div>

        <div className="waste-bank-grid">
          
          {/* Map Side */}
          <div className="waste-bank-map-wrapper">
            <div className="map-inner-container">
              <MapContainer 
                center={[-2.5, 118]} 
                zoom={4} 
                scrollWheelZoom={false}
                className="waste-bank-leaflet"
              >
                <TileLayer
                  className="dark-map-tiles"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {wasteBanks.map(bank => (
                  <Marker key={bank.id} position={bank.position} icon={blueMarkerIcon}>
                    <Popup>
                      <strong style={{ color: '#062415' }}>{bank.name}</strong><br/>
                      {bank.address}
                    </Popup>
                  </Marker>
                ))}

                {extraMarkers.map((pos, idx) => (
                  <Marker key={`extra-${idx}`} position={pos} icon={blueMarkerIcon} />
                ))}
              </MapContainer>
            </div>

            <div className="map-stat-overlay">
              <div>
                <h4 className="overlay-count"><CountUp end={42} suffix="+" /> Lokasi Aktif</h4>
                <p className="overlay-sub">Tersebar di seluruh penjuru Indonesia</p>
              </div>
              <Link to="/waste-banks" className="btn btn-outline btn-sm">Lihat Area Saya</Link>
            </div>
          </div>

          {/* List Side */}
          <div className="waste-bank-list-col">
            {wasteBanks.map(bank => (
              <div key={bank.id} className="waste-bank-card">
                <div className="bank-card-header">
                  <div>
                    <h3 className="bank-name">{bank.name}</h3>
                    <p className="bank-address">
                      <MapPin size={14} /> {bank.address}
                    </p>
                  </div>
                  <div className="bank-distance-badge">
                    <Navigation size={12} /> {bank.distance}
                  </div>
                </div>

                <div className="bank-materials-row">
                  {bank.materials.map((mat, i) => (
                    <span key={i} className="bank-mat-tag">
                      {mat}
                    </span>
                  ))}
                </div>

                <div className={`bank-status-row ${bank.status.includes('Buka') && !bank.status.includes('Tutup') ? 'status-open' : 'status-closed'}`}>
                  <Clock size={14} />
                  <span>{bank.status}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
