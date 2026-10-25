import React, {
  useEffect,
  useState,
} from 'react';

import {
  QrCode,
  ShieldCheck,
  Award,
  Copy,
  Check,
  Leaf,
  Scale,
  Wallet,
} from 'lucide-react';

import {
  getPassport,
} from '../../services/api';

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'long',
    }
  ).format(date);
}

function formatRupiah(value) {
  return Number(
    value || 0
  ).toLocaleString('id-ID');
}

const materialColors = [
  '#10b981',
  '#fbbf24',
  '#38bdf8',
  '#fb923c',
  '#a78bfa',
];

export default function EcoPassportPage() {
  const [passport, setPassport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [copied, setCopied] =
    useState(false);
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    let active = true;

    const loadPassport = async () => {
      setLoading(true);
      setError('');

      try {
        const result =
          await getPassport();

        if (active) setPassport(result.data);
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Gagal memuat Eco Passport.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPassport();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyPassportId = async () => {
    if (!passport) return;

    setCopyError('');
    try {
      await navigator.clipboard.writeText(passport.passport_id);
      setCopied(true);
    } catch {
      setCopyError('ID belum dapat disalin. Silakan salin ID yang ditampilkan.');
    }
  };

  if (loading) {
    return (
      <div className="eco-passport-page" role="status">
        <h3>Memuat Eco Passport...</h3>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="eco-passport-page">
        <h3>
          Eco Passport tidak dapat dimuat
        </h3>
        <p role="alert">{error || 'Data Eco Passport tidak tersedia.'}</p>
      </div>
    );
  }

  const {
    user,
    stats,
  } = passport;
  const materials = Array.isArray(passport.materials) ? passport.materials : [];
  const badges = Array.isArray(passport.badges) ? passport.badges : [];

  return (
    <div className="eco-passport-page">

      <div className="passport-page-header">
        <div className="passport-header-content">

          <div className="inline-badge-tiny">
            <ShieldCheck
              size={14}
              className="text-emerald"
            />

            <span>
              Identitas Lingkungan Digital
            </span>
          </div>

          <h1 className="page-title">
            Eco Passport Digital
          </h1>

          <p className="page-sub">
            Ringkasan aktivitas daur ulang
            berdasarkan transaksi EcoLink
            yang telah terverifikasi.
          </p>

        </div>
      </div>

      <div className="passport-main-grid">

        {/* PASSPORT CARD */}
        <div className="passport-card-column">

          <div className="digital-passport-card">

            <div className="card-holo-glow" />

            <div className="dp-card-top">

              <div className="dp-brand-row">
                <div className="logo-emblem-small">
                  <Leaf
                    size={14}
                    className="text-emerald"
                  />
                </div>

                <span className="dp-brand-name">
                  EcoLink Passport
                </span>
              </div>

              <div className="dp-status-pill">
                <ShieldCheck size={13} />
                <span>AKUN AKTIF</span>
              </div>

            </div>

            <div className="dp-profile-row">

              <div className="dp-avatar-box">
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    background:
                      'rgba(52,211,153,0.15)',
                  }}
                >
                  {user.full_name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
              </div>

              <div className="dp-info-col">

                <h3 className="dp-name">
                  {user.full_name}
                </h3>

                <span className="dp-role">
                  {user.role === 'user'
                    ? 'Pengguna Individu'
                    : user.role}
                </span>

                <span className="dp-faculty">
                  {user.email}
                </span>

              </div>
            </div>

            <div className="dp-qr-container">

              <div className="dp-qr-plate">
                <QrCode
                  size={110}
                  color="#062415"
                />
              </div>

              <div className="dp-qr-meta">

                <span className="dp-id-label">
                  ID ECO PASSPORT
                </span>

                <strong className="dp-id-number">
                  {passport.passport_id}
                </strong>

                <button
                  type="button"
                  onClick={
                    handleCopyPassportId
                  }
                  className="btn btn-outline btn-sm"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Salin ID
                    </>
                  )}
                </button>

                {copyError && <p role="alert">{copyError}</p>}

              </div>
            </div>

            <div className="dp-stats-ribbon">

              <div className="ribbon-item">
                <span className="r-label">
                  Total Daur Ulang
                </span>

                <strong className="r-value">
                  {stats.total_recycled} kg
                </strong>
              </div>

              <div className="ribbon-divider" />

              <div className="ribbon-item">
                <span className="r-label">
                  Eco Score
                </span>

                <strong className="r-value text-gold">
                  {stats.eco_score}
                </strong>
              </div>

              <div className="ribbon-divider" />

              <div className="ribbon-item">
                <span className="r-label">
                  Lencana
                </span>

                <strong className="r-value text-emerald">
                  {badges.length}
                </strong>
              </div>

            </div>

            <div className="dp-card-footer">
              <span>
                Bergabung sejak:{' '}
                {formatDate(
                  user.created_at
                )}
              </span>
            </div>

          </div>

          <div className="passport-trust-card">
            <ShieldCheck
              size={16}
              className="text-emerald"
            />

            <p>
              Statistik pada halaman ini
              dihitung dari transaksi yang
              berstatus terverifikasi di
              sistem EcoLink.
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="passport-metrics-column">

          {/* SUMMARY */}
          <div className="dash-card">

            <h3 className="dash-card-title">
              Ringkasan Dampak
            </h3>

            <span className="dash-card-sub">
              Berdasarkan transaksi
              terverifikasi akun ini
            </span>

            <div className="eco-equivalencies-grid">

              <div className="eco-eq-card">
                <div className="eq-icon-box">
                  <Leaf size={22} />
                </div>

                <div>
                  <strong className="eq-value">
                    {stats.co2_avoided} kg
                  </strong>

                  <span className="eq-title">
                    CO₂ Terhindar
                  </span>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box">
                  <Scale size={22} />
                </div>

                <div>
                  <strong className="eq-value">
                    {
                      stats
                        .verified_transactions
                    }
                  </strong>

                  <span className="eq-title">
                    Transaksi Terverifikasi
                  </span>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box">
                  <Wallet size={22} />
                </div>

                <div>
                  <strong className="eq-value">
                    Rp{' '}
                    {formatRupiah(
                      stats.total_value
                    )}
                  </strong>

                  <span className="eq-title">
                    Nilai Material
                  </span>
                </div>
              </div>

              <div className="eco-eq-card">
                <div className="eq-icon-box">
                  <Award size={22} />
                </div>

                <div>
                  <strong className="eq-value">
                    {stats.eco_score}
                  </strong>

                  <span className="eq-title">
                    Eco Score
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* MATERIAL BREAKDOWN */}
          <div className="dash-card">

            <h3 className="dash-card-title">
              Komposisi Sampah
            </h3>

            <span className="dash-card-sub">
              Distribusi material dari
              transaksi terverifikasi
            </span>

            <div className="material-breakdown-list">

              {materials.length === 0 ? (
                <p>
                  Belum ada material
                  terverifikasi.
                </p>
              ) : (
                materials.map(
                  (material, index) => {
                    const pct =
                      Number(
                        material.percentage ||
                          0
                      );

                    const color =
                      materialColors[
                        index %
                          materialColors.length
                      ];

                    return (
                      <React.Fragment
                        key={
                          material.category_id
                        }
                      >

                        <div className="mat-breakdown-row">

                          <div className="mat-meta">

                            <span
                              className="mat-color-dot"
                              style={{
                                backgroundColor:
                                  color,
                              }}
                            />

                            <span>
                              {material.name}
                            </span>

                          </div>

                          <div className="mat-val-col">

                            <strong>
                              {material.weight} kg
                            </strong>

                            <span className="mat-pct">
                              {pct.toFixed(2)}%
                            </span>

                          </div>

                        </div>

                        <div className="mat-progress-bar">

                          <div
                            className="mat-progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                pct
                              )}%`,
                              backgroundColor:
                                color,
                            }}
                          />

                        </div>

                      </React.Fragment>
                    );
                  }
                )
              )}

            </div>
          </div>

          {/* BADGES */}
          <div className="dash-card">

            <div className="card-header-between">

              <div>
                <h3 className="dash-card-title">
                  Lencana ({badges.length})
                </h3>

                <span className="dash-card-sub">
                  Pencapaian yang sudah
                  diperoleh akun ini
                </span>
              </div>

            </div>

            {badges.length === 0 ? (
              <div className="discovery-empty-state">
                <Award size={28} />

                <h4>
                  Belum Ada Lencana
                </h4>

                <p>
                  Selesaikan misi EcoLink
                  untuk memperoleh lencana.
                </p>
              </div>
            ) : (
              <div className="passport-badges-inline-grid">

                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="inline-badge-card"
                  >
                    <div className="badge-icon-bubble">
                      <Award size={20} />
                    </div>

                    <div>
                      <strong className="badge-name">
                        {badge.name}
                      </strong>

                      {badge.description && (
                        <span className="badge-rarity">
                          {badge.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
