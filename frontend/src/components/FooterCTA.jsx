import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FooterCTA() {
  return (
    <>
      <section className="footer-cta-section">
        <div className="container">
          <h2 className="cta-headline">
            Jadikan setiap aksi daur ulangmu<br />berdampak <span className="highlight-text">nyata.</span>
          </h2>
          <p className="cta-sub">
            Catat setoranmu, ikuti kampanye, dan pantau kontribusi lingkungan dalam satu tempat.
          </p>
          <div className="cta-btn-wrap">
            <Link to="/register" className="btn btn-light-green cta-btn">
              Buat Akun Gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer-main">
        <div className="container">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="footer-leaf" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Leaf size={20} color="#86efac" />
                </span> EcoLink
              </div>
              <p className="footer-about-text">
                Platform kolaborasi pengelolaan sampah terverifikasi. Solusi digital kompetisi UINIC 8.0 2026.
              </p>
            </div>
            
            <div className="footer-links-group">
              <div className="footer-col">
                <h4 className="footer-col-title">Produk</h4>
                <ul className="footer-nav-list">
                  <li><Link to="/campaigns" className="footer-nav-link">Jelajah Kampanye</Link></li>
                  <li><Link to="/waste-banks" className="footer-nav-link">Jaringan Bank Sampah</Link></li>
                  <li><Link to="/login" className="footer-nav-link">Eco Passport Digital</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4 className="footer-col-title">Informasi & Bantuan</h4>
                <ul className="footer-nav-list">
                  <li><Link to="/about" className="footer-nav-link">Metodologi Verifikasi</Link></li>
                  <li><a href="#help" className="footer-nav-link">Pusat Bantuan</a></li>
                  <li><a href="#contact" className="footer-nav-link">Hubungi Kami</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom-row">
            <p className="footer-copyright">&copy; 2026 Tim EcoLink. Seluruh hak cipta dilindungi.</p>
            <div className="footer-legal-links">
              <a href="#" className="footer-legal-link">Kebijakan Privasi</a>
              <a href="#" className="footer-legal-link">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
