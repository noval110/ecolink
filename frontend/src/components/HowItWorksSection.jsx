import React from 'react';
import { MapPin, Box, CheckCircle, Trophy } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Bagaimana EcoLink <span className="highlight-text">Bekerja?</span></h2>
          <p className="section-desc">
            Empat langkah transparan dari pemilahan sampah hingga menjadi dampak terverifikasi di Eco Passport kamu.
          </p>
        </div>

        <div className="how-it-works-grid">
          
          <div className="how-step-card">
            <div className="step-watermark-number">1</div>
            <div className="step-card-content">
              <div className="step-icon-box">
                <MapPin size={26} />
              </div>
              <h3 className="step-card-title">Temukan Lokasi</h3>
              <p className="step-card-desc">Cari bank sampah terdekat di sekitarmu yang terdaftar resmi di jaringan kami.</p>
            </div>
          </div>
          
          <div className="how-step-card">
            <div className="step-watermark-number">2</div>
            <div className="step-card-content">
              <div className="step-icon-box">
                <Box size={26} />
              </div>
              <h3 className="step-card-title">Setorkan Sampah</h3>
              <p className="step-card-desc">Bawa sampah terpilahmu secara fisik ke mitra Bank Sampah EcoLink.</p>
            </div>
          </div>
          
          <div className="how-step-card">
            <div className="step-watermark-number">3</div>
            <div className="step-card-content">
              <div className="step-icon-box">
                <CheckCircle size={26} />
              </div>
              <h3 className="step-card-title">Transaksi Sah</h3>
              <p className="step-card-desc">Petugas menimbang & memvalidasi data setoran langsung ke dalam sistem.</p>
            </div>
          </div>
          
          <div className="how-step-card">
            <div className="step-watermark-number">4</div>
            <div className="step-card-content">
              <div className="step-icon-box">
                <Trophy size={26} />
              </div>
              <h3 className="step-card-title">Dampak Terverifikasi</h3>
              <p className="step-card-desc">Poin, lencana, dan kontribusi kampanye komunitasmu otomatis bertambah.</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
