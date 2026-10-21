import React, { useState } from 'react';
import { Search, Filter, MapPin, Users, Target, ArrowRight, ShieldCheck, Clock, Sparkles, Flame, Zap, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_CAMPAIGNS } from '../../data/mockData';
import CustomDropdown from '../../components/CustomDropdown';

const renderBadge = (camp) => {
  switch (camp.badgeType) {
    case 'trending':
      return (
        <span className="campaign-highlight-pill pill-orange">
          <Flame size={12} className="pill-icon" /> {camp.badgeText}
        </span>
      );
    case 'target':
      return (
        <span className="campaign-highlight-pill pill-cyan">
          <Target size={12} className="pill-icon" /> {camp.badgeText}
        </span>
      );
    case 'impact':
      return (
        <span className="campaign-highlight-pill pill-amber">
          <Zap size={12} className="pill-icon" /> {camp.badgeText}
        </span>
      );
    case 'ending':
      return (
        <span className="campaign-highlight-pill pill-red">
          <Clock size={12} className="pill-icon" /> {camp.badgeText}
        </span>
      );
    default:
      return null;
  }
};

export default function ExploreCampaigns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('active'); // 'active' | 'target' | 'deadline'

  const categories = ['Semua', 'Kampus Bebas Plastik', 'Pembersihan Pesisir', 'Sampah Elektronik', 'Komunitas Warga'];

  // Filtered Campaigns
  const filteredCampaigns = MOCK_CAMPAIGNS.filter((camp) => {
    const matchesSearch =
      camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'Semua' || camp.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'target') {
      return b.targetKg - a.targetKg;
    }
    if (sortBy === 'deadline') {
      return a.daysRemaining - b.daysRemaining;
    }
    // Default: 'active' by collectedKg
    return b.collectedKg - a.collectedKg;
  });

  return (
    <div className="explore-campaigns-page">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center" style={{ maxWidth: '820px', margin: '0 auto 3rem auto' }}>
          <h1 className="section-title">
            Jelajahi <span className="highlight-text">Kampanye Daur Ulang</span>
          </h1>
          <p className="section-desc">
            Dukung inisiatif kampus dan komunitas. Setiap kilogram sampah fisik yang kamu setorkan ke Bank Sampah mitra resmi otomatis dihitung ke target kampanye bersama.
          </p>
        </div>

        {/* Filter and Search Controls */}
        <div className="campaign-filter-box">
          <div className="campaign-search-row">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kampanye, universitas, atau komunitas..."
                className="campaign-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Custom Sort Dropdown */}
            <CustomDropdown
              options={[
                { value: 'active', label: 'Urutkan: Paling Aktif' },
                { value: 'target', label: 'Urutkan: Target Terbesar' },
                { value: 'deadline', label: 'Urutkan: Batas Waktu Terdekat' }
              ]}
              value={sortBy}
              onChange={setSortBy}
              icon={Filter}
              placeholder="Urutkan..."
              className="sort-custom-dropdown"
            />
          </div>

          {/* Category Chips Scroll */}
          <div className="category-chips-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="campaign-status-bar">
          <span className="results-count">
            Menemukan <strong>{filteredCampaigns.length}</strong> Kampanye Aktif
          </span>
          <span className="verified-note">
            <ShieldCheck size={14} className="text-emerald" /> Terhubung dengan Bank Sampah Resmi
          </span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="discovery-empty-state">
            <div className="empty-icon-box">
              <Search size={32} color="rgba(255,255,255,0.4)" />
            </div>
            <h4>Tidak Ada Kampanye yang Ditemukan</h4>
            <p>Coba gunakan kata kunci pencarian yang lain atau reset kategori filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('Semua');
              }}
              className="btn btn-outline btn-sm"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="campaigns-responsive-grid">
            {filteredCampaigns.map((camp) => {
              const progressPct = Math.min(100, Math.round((camp.collectedKg / camp.targetKg) * 100));
              return (
                <div key={camp.id} className="campaign-card-interactive">
                  <div className="card-image-cover">
                    <img src={camp.image} alt={camp.title} className="campaign-cover-img" loading="lazy" />
                    <div className="card-image-gradient-overlay" />
                    <div className="card-top-badges">
                      <span className="cat-badge">{camp.category}</span>
                      {renderBadge(camp)}
                    </div>
                    <div className="header-meta-row">
                      <span className="location-pill">
                        <MapPin size={13} /> {camp.location}
                      </span>
                      <span className="days-pill">
                        <Clock size={13} /> {camp.daysRemaining} hari lagi
                      </span>
                    </div>
                  </div>

                  <div className="card-body-content">
                    <h3 className="campaign-title">
                      <Link to={`/campaigns/${camp.id}`}>{camp.title}</Link>
                    </h3>

                    <div className="organizer-row">
                      <div className="organizer-avatar">
                        <ShieldCheck size={16} color="var(--color-primary)" />
                      </div>
                      <div className="organizer-info">
                        <span className="organizer-name">{camp.organizer}</span>
                        <span className="organizer-role">{camp.organizerRole}</span>
                      </div>
                    </div>

                    <p className="campaign-excerpt">{camp.description}</p>

                    {/* Progress Bar Container */}
                    <div className="campaign-progress-box">
                      <div className="progress-labels-row">
                        <span className="progress-current">
                          <strong>{camp.collectedKg.toLocaleString()}</strong> / {camp.targetKg.toLocaleString()} kg
                        </span>
                        <span className="progress-percentage">{progressPct}%</span>
                      </div>
                      <div className="progress-track-bg">
                        <div
                          className="progress-fill-bar"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Card Footer Stats & Action */}
                    <div className="card-footer-stats">
                      <div className="footer-stat-item">
                        <Users size={15} className="text-emerald" />
                        <span>{camp.participantsCount} Relawan</span>
                      </div>
                      <Link to={`/campaigns/${camp.id}`} className="btn-explore-campaign">
                        <span>Dukung & Detail</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
