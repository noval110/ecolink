import React from 'react';
import { QrCode, Medal, Leaf, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from './CountUp';

export default function EcoPassportPreview() {
  return (
    <section className="eco-passport-section">
      <div className="container">
        <div className="eco-passport-grid">
          
          <div className="eco-passport-content">
            <h2 className="section-title">
              Profil Digital untuk <span className="highlight-text">Setiap Aksimu.</span>
            </h2>
            <p className="section-desc">
              Eco Passport adalah bukti nyata kontribusimu terhadap lingkungan. Simpan riwayat transaksimu, tingkatkan levelmu, dan tunjukkan kepada dunia bahwa kamu adalah agen perubahan.
            </p>
            
            <ul className="passport-features-list">
              <li className="passport-feature-item">
                <div className="passport-feature-icon">
                  <QrCode size={22} />
                </div>
                <div>
                  <h4 className="passport-feature-title">Pindai Cepat di Bank Sampah</h4>
                  <p className="passport-feature-desc">Tunjukkan kode QR milikmu untuk setor sampah kilat tanpa pencatatan manual.</p>
                </div>
              </li>
              <li className="passport-feature-item">
                <div className="passport-feature-icon">
                  <Medal size={22} />
                </div>
                <div>
                  <h4 className="passport-feature-title">Gamifikasi & Leveling</h4>
                  <p className="passport-feature-desc">Raih lencana eksklusif dan sertifikat digital setiap kali kamu mencapai target baru.</p>
                </div>
              </li>
            </ul>
            
            <div className="passport-action-wrap">
              <Link to="/register" className="btn btn-light-green">
                Buat Eco Passport Sekarang
              </Link>
            </div>
          </div>

          <div className="eco-passport-visual" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="passport-card landing-passport-preview">
              <p className="preview-caption">Contoh Eco Passport · Data ilustrasi</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>Budi Santoso</h3>
                    <p style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>Level <CountUp end={12} /> • Pejuang Lingkungan</p>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><Share2 size={20} /></button>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                  <QrCode size={120} color="#062415" />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>ID: ECO-9823-XYZ</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Total Dampak</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Leaf size={16} color="var(--color-primary)" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}><CountUp end={124} /> kg</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Lencana</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '24px', height: '24px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={14} color="#78350f" /></div>
                    <div style={{ width: '24px', height: '24px', background: '#94a3b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={14} color="#0f172a" /></div>
                    <span style={{ fontSize: '0.85rem', marginLeft: '0.25rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>+<CountUp end={4} /></span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
