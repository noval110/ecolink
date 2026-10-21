import React, { useState } from 'react';
import { Package, CanSoda, TrendingUp, Award, Droplets, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function PlasticBottleIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4v2h-4z" />
      <path d="M10 4v2.5l-2.5 3a1 1 0 0 0-.5.85V19a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-8.65a1 1 0 0 0-.5-.85L14 6.5V4" />
      <path d="M8 14h8" strokeDasharray="1.5 1.5" />
      <path d="M8 17h8" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function OilDrumIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="7" ry="2.5" />
      <path d="M5 5v14c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V5" />
      <path d="M5 12c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" />
      <circle cx="12" cy="5" r="1" fill={color} />
    </svg>
  );
}

const materialTypes = [
  {
    id: 'plastic',
    name: 'Botol Plastik PET',
    co2Factor: 1.5,
    pointsFactor: 10,
    waterFactor: 2.5,
    icon: PlasticBottleIcon,
    color: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  {
    id: 'paper',
    name: 'Kertas & Kardus',
    co2Factor: 1.2,
    pointsFactor: 8,
    waterFactor: 15.0,
    icon: Package,
    color: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  {
    id: 'metal',
    name: 'Logam / Kaleng',
    co2Factor: 3.0,
    pointsFactor: 20,
    waterFactor: 10.0,
    icon: CanSoda,
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  {
    id: 'oil',
    name: 'Minyak Jelantah',
    co2Factor: 2.8,
    pointsFactor: 25,
    waterFactor: 1000.0,
    icon: OilDrumIcon,
    color: '#fb923c',
    badgeBg: 'rgba(251, 146, 60, 0.12)',
    borderColor: 'rgba(251, 146, 60, 0.25)',
  }
];

export default function ImpactCalculatorSection() {
  const [selectedMaterial, setSelectedMaterial] = useState(materialTypes[0].id);
  const [weightKg, setWeightKg] = useState(15);

  const currentMat = materialTypes.find((m) => m.id === selectedMaterial) || materialTypes[0];

  const estimatedCO2 = (weightKg * currentMat.co2Factor).toFixed(1);
  const estimatedPoints = Math.round(weightKg * currentMat.pointsFactor);
  const estimatedWater = Math.round(weightKg * currentMat.waterFactor);

  return (
    <section className="impact-calculator-section">
      <div className="container">
        {/* Header */}
        <div className="section-header text-center">
          <h2 className="section-title">
            Hitung <span className="highlight-text">Dampak Nyata</span> Sampahmu
          </h2>
          <p className="section-desc">
            Berapa banyak emisi karbon dan air yang bisa kamu selamatkan jika menyetor ke mitra Bank Sampah EcoLink hari ini? Geser dan buktikan sendiri.
          </p>
        </div>

        {/* Calculator Card Box */}
        <div className="calculator-box">
          <div className="calculator-grid">
            {/* Left: Input Controller */}
            <div className="calc-inputs-col">
              <label className="calc-label">1. Pilih Kategori Material Sampah:</label>
              <div className="material-selector-grid">
                {materialTypes.map((mat) => {
                  const isSelected = mat.id === selectedMaterial;
                  const IconComponent = mat.icon;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat.id)}
                      className={`material-btn ${isSelected ? 'active' : ''}`}
                      type="button"
                    >
                      <div
                        className="material-icon-badge"
                        style={{
                          backgroundColor: mat.badgeBg,
                          color: mat.color,
                          borderColor: isSelected ? mat.color : mat.borderColor,
                          boxShadow: isSelected ? `0 0 12px ${mat.badgeBg}` : 'none',
                        }}
                      >
                        <IconComponent size={20} color={mat.color} />
                      </div>
                      <span className="material-name">{mat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slider Controller */}
              <div className="weight-slider-box">
                <div className="slider-header">
                  <label className="calc-label" style={{ marginBottom: 0 }}>
                    2. Estimasi Berat Sampah:
                  </label>
                  <div className="weight-display">
                    <strong>{weightKg}</strong> <span>kg</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="100"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="calc-range-slider"
                />

                <div className="slider-presets">
                  {[5, 15, 30, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setWeightKg(preset)}
                      className={`preset-pill ${weightKg === preset ? 'active' : ''}`}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-micro-note">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>Kalkulasi diverifikasi berdasarkan metodologi emisi daur ulang standar KLHK.</span>
              </div>
            </div>

            {/* Right: Real-time Metric Outputs */}
            <div className="calc-outputs-col">
              <div className="output-card-header">
                <TrendingUp size={16} className="text-emerald" />
                <span>Hasil Estimasi Dampak Lingkungan</span>
              </div>

              <div className="output-metrics-list">
                <div className="output-metric-item">
                  <div className="output-icon-box bg-emerald-soft">
                    <Leaf size={24} className="text-emerald" />
                  </div>
                  <div>
                    <span className="output-label">Reduksi Emisi Karbon</span>
                    <div className="output-val">
                      {estimatedCO2} <span className="output-unit">kg CO₂e</span>
                    </div>
                    <p className="output-desc">Setara menyerap emisi perjalanan motor sejauh {(estimatedCO2 * 8).toFixed(0)} km</p>
                  </div>
                </div>

                <div className="output-metric-item">
                  <div className="output-icon-box bg-gold-soft">
                    <Award size={24} className="text-gold" />
                  </div>
                  <div>
                    <span className="output-label">Poin Eco Passport</span>
                    <div className="output-val">
                      +{estimatedPoints} <span className="output-unit">poin</span>
                    </div>
                    <p className="output-desc">Langsung tercatat di kartu digital setelah verifikasi timbangan</p>
                  </div>
                </div>

                <div className="output-metric-item">
                  <div className="output-icon-box bg-blue-soft">
                    <Droplets size={24} className="text-blue" />
                  </div>
                  <div>
                    <span className="output-label">Air Terlindungi</span>
                    <div className="output-val">
                      {estimatedWater.toLocaleString()} <span className="output-unit">Liter</span>
                    </div>
                    <p className="output-desc">Mencegah kontaminasi sumber daya air tanah bersih</p>
                  </div>
                </div>
              </div>

              <div className="calc-cta-action">
                <Link to="/waste-banks" className="btn btn-light-green w-100 justify-center">
                  <span>Temukan Bank Sampah Terdekat</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
