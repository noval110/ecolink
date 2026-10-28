import React from 'react';
import { Target, Eye, ShieldCheck, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="about-page" style={{ position: 'relative', overflow: 'hidden' }}>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div className="fade-in about-hero-block">
          <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>
            Membangun Ekosistem <br />
            <span className="highlight">Transparan & Terukur</span>
          </h1>
          <p className="hero-desc">
            EcoLink menghubungkan individu, komunitas, dan Bank Sampah untuk mencatat kontribusi daur ulang melalui transaksi terverifikasi.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="about-values-grid">
          <div className="glass-card fade-in about-value-card">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(134, 239, 172, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Eye size={32} color="var(--color-primary)" />
            </div>
            <h3 className="about-value-title">Visi Kami</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Menjadi standar rujukan utama dalam pelacakan jejak karbon komunitas, mengubah aksi daur ulang tingkat akar rumput menjadi data lingkungan berskala teruji.
            </p>
          </div>
          
          <div className="glass-card fade-in about-value-card">
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(134, 239, 172, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Target size={32} color="var(--color-primary)" />
            </div>
            <h3 className="about-value-title">Misi Kami</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Menghapus klaim palsu lingkungan (greenwashing) melalui sistem verifikasi ketat. Setiap poin yang diterbitkan oleh EcoLink adalah representasi dari sampah fisik yang benar-benar telah diolah.
            </p>
          </div>
        </div>

        {/* Methodology Section - Horizontal Layout */}
        <div className="fade-in about-methodology">
          <div className="about-methodology-copy">
            <h2 className="section-title">Metodologi <span className="highlight">Verifikasi</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Integritas data adalah inti dari EcoLink. Kami tidak mengandalkan klaim mandiri pengguna. Semua data metrik dan Eco Passport dihasilkan melalui sebuah siklus validasi tertutup:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={24} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Otorisasi Bank Sampah</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>Hanya Bank Sampah terdaftar yang bisa memasukkan transaksi setoran ke dalam sistem.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Globe size={24} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Konversi Dampak Langsung</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>Algoritma mengubah berat material (kg) menjadi ekuivalensi jejak karbon terhindar menggunakan rasio standar global.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Zap size={24} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Distribusi Otomatis</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>Satu transaksi secara simultan menambah skor individu, progres kampanye, dan analitik organisasi.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="about-methodology-visual">
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1', borderRadius: '50%', border: '2px dashed rgba(134, 239, 172, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'none' }}>
              <div style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(134, 239, 172, 0.1) 0%, transparent 70%)' }}></div>
              <ShieldCheck size={80} color="var(--color-primary)"  />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes counterSpin { 100% { transform: rotate(-360deg); } }
      `}</style>
    </div>
  );
}
