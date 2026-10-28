import React from 'react';
import { Users, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from './CountUp';

export default function ForOrganizations() {
  return (
    <section className="for-organizations-section">
      <div className="container">
        <div className="for-org-grid">
          
          <div className="for-org-text">
            <h2 className="section-title">
              Berdayakan <span className="highlight-text">Komunitasmu.</span>
            </h2>
            <p className="section-desc">
              EcoLink menyediakan dasbor khusus untuk organisasi, BEM, dan kampus. Buat kampanye, undang partisipan, dan pantau dampak kolektif secara langsung.
            </p>
            
            <div className="for-org-features">
              <div className="for-org-feature-item">
                <div className="org-feature-icon">
                  <Target size={22} />
                </div>
                <div>
                  <h4 className="org-feature-title">Target & Sasaran Capaian</h4>
                  <p className="org-feature-desc">Tetapkan target kilogram daur ulang dan pantau progres komunitasmu menuju tujuan bersama.</p>
                </div>
              </div>
              
              <div className="for-org-feature-item">
                <div className="org-feature-icon">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h4 className="org-feature-title">Analitik & Laporan Terverifikasi</h4>
                  <p className="org-feature-desc">Unduh laporan terverifikasi resmi untuk kebutuhan akreditasi kampus atau program CSR.</p>
                </div>
              </div>
            </div>

            <div className="org-action-wrap">
              <Link to="/register?role=organization" className="btn btn-light-green">
                <span>Daftarkan Komunitas / BEM</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="for-org-visual">
            <div className="org-image-frame">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="Organization" 
                className="org-image"
              />
            </div>
            
            {/* Widget with clean responsive behavior */}
            <div className="org-stat-widget">
              <h4 className="widget-label">Contoh Progres Kampanye</h4>
              <p className="widget-value"><CountUp end={850} /> / <CountUp end={1000} /> kg</p>
              <div className="widget-progress-bar">
                <div className="widget-progress-fill" style={{ width: '85%' }}></div>
              </div>
              <div className="widget-meta">
                <Users size={14} className="text-emerald" />
                <span><CountUp end={214} /> Partisipan Aktif</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
