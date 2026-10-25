import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Search,
  Filter,
  Users,
  ArrowRight,
  ShieldCheck,
  Clock,
  X,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import CustomDropdown from '../../components/CustomDropdown';

import {
  getCampaigns,
} from '../../services/api';

function daysRemaining(endDate) {
  if (!endDate) return null;

  const today = new Date();
  const end = new Date(`${endDate}T23:59:59`);

  if (Number.isNaN(end.getTime())) return null;

  const diff =
    end.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    )
  );
}

export default function ExploreCampaigns() {
  const [campaigns, setCampaigns] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('active');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let active = true;

    const loadCampaigns = async () => {
      setLoading(true);
      setError('');

      try {
        const result =
          await getCampaigns();

        if (!active) return;

        setCampaigns(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Gagal memuat kampanye.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCampaigns();
    return () => {
      active = false;
    };
  }, []);

  const filteredCampaigns =
    useMemo(() => {
      const keyword =
        searchQuery
          .trim()
          .toLowerCase();

      return campaigns
        .filter((camp) => {
          const matchesSearch =
            camp.title
              ?.toLowerCase()
              .includes(keyword) ||
            camp.organization
              ?.toLowerCase()
              .includes(keyword) ||
            camp.description
              ?.toLowerCase()
              .includes(keyword);

          const matchesStatus =
            statusFilter === 'all' ||
            camp.status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort((a, b) => {
          if (sortBy === 'target') {
            return (
              Number(b.target_weight || 0) -
              Number(a.target_weight || 0)
            );
          }

          if (sortBy === 'deadline') {
            return (
              new Date(
                a.end_date || '9999-12-31'
              ) -
              new Date(
                b.end_date || '9999-12-31'
              )
            );
          }

          return (
            Number(
              b.current_weight || 0
            ) -
            Number(
              a.current_weight || 0
            )
          );
        });
    }, [
      campaigns,
      searchQuery,
      statusFilter,
      sortBy,
    ]);

  return (
    <div className="explore-campaigns-page">
      <div className="container">

        <div
          className="section-header text-center"
          style={{
            maxWidth: '820px',
            margin:
              '0 auto 3rem auto',
          }}
        >
          <h1 className="section-title">
            Jelajahi{' '}
            <span className="highlight-text">
              Kampanye Daur Ulang
            </span>
          </h1>

          <p className="section-desc">
            Dukung kampanye lingkungan
            yang terhubung dengan Bank
            Sampah mitra EcoLink.
          </p>
        </div>

        <div className="campaign-filter-box">

          <div className="campaign-search-row">

            <div className="search-input-wrapper">
              <Search
                size={18}
                className="search-icon"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Cari kampanye atau organisasi..."
                className="campaign-search-input"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery('')
                  }
                  className="clear-search-btn"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <CustomDropdown
              options={[
                {
                  value: 'active',
                  label:
                    'Urutkan: Kontribusi Terbesar',
                },
                {
                  value: 'target',
                  label:
                    'Urutkan: Target Terbesar',
                },
                {
                  value: 'deadline',
                  label:
                    'Urutkan: Deadline Terdekat',
                },
              ]}
              value={sortBy}
              onChange={setSortBy}
              icon={Filter}
              placeholder="Urutkan..."
              className="sort-custom-dropdown"
            />

          </div>

          <div className="category-chips-row">

            {[
              ['all', 'Semua'],
              ['active', 'Aktif'],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      value
                    )
                  }
                  className={`filter-chip ${
                    statusFilter === value
                      ? 'active'
                      : ''
                  }`}
                >
                  {label}
                </button>
              )
            )}

          </div>
        </div>

        <div className="campaign-status-bar">

          <span className="results-count">
            Menemukan{' '}
            <strong>
              {filteredCampaigns.length}
            </strong>{' '}
            Kampanye
          </span>

          <span className="verified-note">
            <ShieldCheck
              size={14}
              className="text-emerald"
            />
            Terhubung dengan Bank Sampah
            Resmi
          </span>

        </div>

        {error && (
          <div className="discovery-empty-state" role="alert">
            <h4>
              Gagal Memuat Kampanye
            </h4>
            <p>{error}</p>
          </div>
        )}

        {error ? null : loading ? (
          <div className="discovery-empty-state" role="status">
            <h4>
              Memuat kampanye...
            </h4>
          </div>
        ) : filteredCampaigns.length ===
          0 ? (
          <div className="discovery-empty-state">

            <div className="empty-icon-box">
              <Search
                size={32}
                color="rgba(255,255,255,0.4)"
              />
            </div>

            <h4>
              Tidak Ada Kampanye
            </h4>

            <p>
              Coba gunakan kata kunci
              pencarian yang lain.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="btn btn-outline btn-sm"
            >
              Reset Filter
            </button>

          </div>
        ) : (
          <div className="campaigns-responsive-grid">

            {filteredCampaigns.map(
              (camp) => {
                const progress =
                  Math.min(
                    100,
                    Number(
                      camp.progress_percentage ||
                        0
                    )
                  );

                const remaining =
                  daysRemaining(
                    camp.end_date
                  );

                return (
                  <div
                    key={camp.id}
                    className="campaign-card-interactive"
                  >

                    <div
                      className="card-image-cover"
                      style={{
                        minHeight: '170px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '1.25rem',
                        background:
                          'linear-gradient(135deg, rgba(6,78,59,0.9), rgba(3,28,18,0.98))',
                      }}
                    >

                      <div className="card-top-badges">

                        <span className="cat-badge">
                          {camp.status}
                        </span>

                      </div>

                      <div className="header-meta-row">

                        <span className="location-pill">
                          <Users size={13} />
                          {camp.participants}{' '}
                          peserta
                        </span>

                        {remaining !== null && (
                          <span className="days-pill">
                            <Clock
                              size={13}
                            />
                            {remaining} hari lagi
                          </span>
                        )}

                      </div>
                    </div>

                    <div className="card-body-content">

                      <h3 className="campaign-title">
                        <Link
                          to={`/campaigns/${camp.id}`}
                        >
                          {camp.title}
                        </Link>
                      </h3>

                      <div className="organizer-row">

                        <div className="organizer-avatar">
                          <ShieldCheck
                            size={16}
                            color="var(--color-primary)"
                          />
                        </div>

                        <div className="organizer-info">

                          <span className="organizer-name">
                            {
                              camp.organization
                            }
                          </span>

                          <span className="organizer-role">
                            Organisasi
                            Penyelenggara
                          </span>

                        </div>
                      </div>

                      <p className="campaign-excerpt">
                        {camp.description}
                      </p>

                      <div className="campaign-progress-box">

                        <div className="progress-labels-row">

                          <span className="progress-current">
                            <strong>
                              {
                                camp.current_weight
                              }
                            </strong>
                            {' / '}
                            {
                              camp.target_weight
                            }{' '}
                            kg
                          </span>

                          <span className="progress-percentage">
                            {progress.toFixed(
                              2
                            )}
                            %
                          </span>

                        </div>

                        <div className="progress-track-bg">

                          <div
                            className="progress-fill-bar"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div className="card-footer-stats">

                        <div className="footer-stat-item">
                          <Users
                            size={15}
                            className="text-emerald"
                          />
                          <span>
                            {camp.participants}{' '}
                            Peserta
                          </span>
                        </div>

                        <Link
                          to={`/campaigns/${camp.id}`}
                          className="btn-explore-campaign"
                        >
                          <span>
                            Lihat Detail
                          </span>

                          <ArrowRight
                            size={15}
                          />
                        </Link>

                      </div>

                    </div>
                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
}
