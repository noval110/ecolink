import React from 'react';
import { Target, Eye, ShieldCheck, Leaf, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="about-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Ornaments */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(134, 239, 172, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(134, 239, 172, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto' }} className="fade-in about-hero-block">
          {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(134, 239, 172, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Leaf size={16} /> Tentang EcoLink
          </div> */}
          <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>
            Membangun Ekosistem <br />
            <span className="highlight">Transparan & Terukur</span>
          </h1>
          <p className="hero-desc" style={{ fontSize: '1.1rem', margin: '0 auto' }}>
            Kami tidak hanya mencatat sampah. Kami membangun sistem verifikasi lapis ganda yang menghubungkan jutaan individu dengan bank sampah untuk memastikan setiap aksi berdampak nyata.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          <div className="glass-card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', transform: 'translateY(0)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(134, 239, 172, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Eye size={32} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Visi Kami</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Menjadi standar rujukan utama dalam pelacakan jejak karbon komunitas, mengubah aksi daur ulang tingkat akar rumput menjadi data lingkungan berskala teruji.
            </p>
          </div>
          
          <div className="glass-card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', animationDelay: '0.2s', transform: 'translateY(0)', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(134, 239, 172, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Target size={32} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Misi Kami</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Menghapus klaim palsu lingkungan (greenwashing) melalui sistem verifikasi ketat. Setiap poin yang diterbitkan oleh EcoLink adalah representasi dari sampah fisik yang benar-benar telah diolah.
            </p>
          </div>
        </div>

        {/* Methodology Section - Horizontal Layout */}
        <div className="fade-in" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '4rem', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap', animationDelay: '0.4s' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Metodologi <span className="highlight">Verifikasi</span></h2>
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
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '1', borderRadius: '50%', border: '2px dashed rgba(134, 239, 172, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 20s linear infinite' }}>
              <div style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(134, 239, 172, 0.1) 0%, transparent 70%)' }}></div>
              <ShieldCheck size={80} color="var(--color-primary)" style={{ animation: 'counterSpin 20s linear infinite' }} />
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
