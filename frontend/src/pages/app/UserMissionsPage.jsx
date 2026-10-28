import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Lock,
  Target,
} from 'lucide-react';

import {
  getMyMissions,
  getMyBadges,
} from '../../services/api';

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
    }
  ).format(new Date(value));
}

export default function UserMissionsPage() {
  const [missions, setMissions] =
    useState([]);

  const [badges, setBadges] =
    useState([]);

  const [badgeFilter, setBadgeFilter] =
    useState('all');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          missionResult,
          badgeResult,
        ] = await Promise.all([
          getMyMissions(),
          getMyBadges(),
        ]);

        setMissions(
          Array.isArray(
            missionResult.data
          )
            ? missionResult.data
            : []
        );

        setBadges(
          Array.isArray(
            badgeResult.data
          )
            ? badgeResult.data
            : []
        );
      } catch (err) {
        setError(
          err.message ||
            'Gagal memuat misi dan lencana.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const unlockedBadges =
    badges.filter(
      (badge) => badge.is_unlocked
    );

  const filteredBadges =
    useMemo(() => {
      if (badgeFilter === 'unlocked') {
        return badges.filter(
          (badge) =>
            badge.is_unlocked
        );
      }

      if (badgeFilter === 'locked') {
        return badges.filter(
          (badge) =>
            !badge.is_unlocked
        );
      }

      return badges;
    }, [
      badges,
      badgeFilter,
    ]);

  if (loading) {
    return (
      <div className="user-missions-page">
        <h3>
          Memuat misi dan lencana...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-missions-page">
        <h3>
          Misi tidak dapat dimuat
        </h3>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="user-missions-page">

      {/* HEADER */}
      <div className="page-header-row">

        <div>

          <div className="inline-badge-tiny">

            <Trophy
              size={14}
              className="text-gold"
            />

            <span>
              Gamifikasi EcoLink
            </span>

          </div>

          <h1 className="page-title">
            Misi & Lencana
          </h1>

          <p className="page-sub">
            Progress misi dihitung
            otomatis dari transaksi dan
            aktivitas kampanye yang telah
            tercatat di EcoLink.
          </p>

        </div>

      </div>

      {/* MISSION SUMMARY */}
      <div
        className="level-hero-card"
        style={{
          marginBottom: '1.5rem',
        }}
      >

        <div className="level-hero-left">

          <div className="level-trophy-circle">
            <Trophy
              size={36}
              className="text-gold"
            />
          </div>

          <div>

            <span className="level-pre-label">
              Progress Misi
            </span>

            <h3 className="level-hero-title">
              {
                missions.filter(
                  (mission) =>
                    mission.status ===
                    'completed'
                ).length
              }{' '}
              / {missions.length} Selesai
            </h3>

            <p className="level-hero-sub">
              Progress diperbarui dari
              aktivitas akun terverifikasi.
            </p>

          </div>

        </div>

        <div className="level-hero-progress">

          <span className="level-hint-sub">
            Lencana terbuka:{' '}
            <strong>
              {unlockedBadges.length}
            </strong>{' '}
            dari{' '}
            <strong>
              {badges.length}
            </strong>
          </span>

        </div>

      </div>

      {/* MISSIONS */}
      <div
        className="dash-card"
        style={{
          marginBottom: '1.5rem',
        }}
      >

        <div className="dash-card-header">

          <div>
            <h3 className="dash-card-title">
              Misi Aktif
            </h3>

            <span className="dash-card-sub">
              Progress diperbarui otomatis
              dari aktivitas akun
            </span>
          </div>

          <span className="mission-counter-pill">
            {
              missions.filter(
                (m) =>
                  m.status ===
                  'completed'
              ).length
            }{' '}
            / {missions.length} Selesai
          </span>

        </div>

        <div className="missions-grid-display">

          {missions.map((mission) => {
            const isFinished =
              mission.status ===
              'completed';

            const percentage =
              Math.min(
                100,
                Number(
                  mission.percentage ||
                    0
                )
              );

            return (
              <div
                key={mission.id}
                className={`mission-card-full ${
                  isFinished
                    ? 'is-complete'
                    : ''
                }`}
              >

                <div className="mission-card-top">

                  <div className="mission-icon-box">

                    {isFinished ? (
                      <CheckCircle2
                        size={24}
                        className="text-emerald"
                      />
                    ) : (
                      <Target
                        size={24}
                        className="text-muted"
                      />
                    )}

                  </div>

                  <div className="mission-text-box">

                    <h4 className="mission-title">
                      {mission.title}
                    </h4>

                    <p className="mission-desc">
                      {mission.description}
                    </p>

                  </div>

                </div>

                <div className="mission-progress-block">

                  <div className="mission-progress-labels">

                    <span>
                      Progres:{' '}
                      <strong>
                        {mission.progress}
                        {' / '}
                        {
                          mission.target_value
                        }
                      </strong>
                    </span>

                    <span className="text-emerald font-semibold">
                      {percentage.toFixed(
                        percentage % 1 === 0
                          ? 0
                          : 2
                      )}
                      %
                    </span>

                  </div>

                  <div className="progress-track-bg">

                    <div
                      className="progress-fill-bar"
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="mission-card-bottom">

                  <div className="mission-reward-pills">

                    <span className="pill-xp">
                      +
                      {
                        mission.xp_reward
                      }{' '}
                      XP
                    </span>

                  </div>

                  {isFinished ? (
                    <span className="badge-claimed">
                      <CheckCircle2
                        size={14}
                      />
                      Selesai
                    </span>
                  ) : (
                    <span className="badge-in-progress">
                      <Clock size={13} />
                      Sedang Berjalan
                    </span>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* BADGES */}
      <div className="dash-card">

        <div className="dash-card-header">

          <div>

            <h3 className="dash-card-title">
              Koleksi Lencana (
              {unlockedBadges.length} /{' '}
              {badges.length} Terbuka)
            </h3>

            <span className="dash-card-sub">
              Lencana terbuka otomatis
              setelah target tercapai
            </span>

          </div>

          <div className="badge-filter-buttons">

            <button
              type="button"
              onClick={() =>
                setBadgeFilter('all')
              }
              className={`filter-btn-pill ${
                badgeFilter === 'all'
                  ? 'active'
                  : ''
              }`}
            >
              Semua ({badges.length})
            </button>

            <button
              type="button"
              onClick={() =>
                setBadgeFilter(
                  'unlocked'
                )
              }
              className={`filter-btn-pill ${
                badgeFilter ===
                'unlocked'
                  ? 'active'
                  : ''
              }`}
            >
              Terbuka (
              {unlockedBadges.length})
            </button>

            <button
              type="button"
              onClick={() =>
                setBadgeFilter(
                  'locked'
                )
              }
              className={`filter-btn-pill ${
                badgeFilter ===
                'locked'
                  ? 'active'
                  : ''
              }`}
            >
              Terkunci (
              {badges.length -
                unlockedBadges.length}
              )
            </button>

          </div>

        </div>

        <div className="badges-showcase-grid">

          {filteredBadges.map(
            (badge) => {

              const unlocked =
                badge.is_unlocked;

              const percentage =
                Math.min(
                  100,
                  Number(
                    badge.percentage ||
                      0
                  )
                );

              return (
                <div
                  key={badge.id}
                  className={`badge-showcase-card ${
                    unlocked
                      ? 'unlocked'
                      : 'locked'
                  }`}
                >

                  <div className="badge-icon-frame">

                    {unlocked ? (
                      <Award
                        size={36}
                        className="text-emerald"
                      />
                    ) : (
                      <Lock size={32} />
                    )}

                  </div>

                  <div className="badge-card-info">

                    <div className="badge-tag-row">

                      <span className="badge-category">
                        {
                          badge.criteria_type
                        }
                      </span>

                      <span className="badge-rarity-pill">
                        {unlocked
                          ? 'TERBUKA'
                          : `${percentage.toFixed(
                              0
                            )}%`}
                      </span>

                    </div>

                    <h4 className="badge-title">
                      {badge.name}
                    </h4>

                    <p className="badge-desc">
                      {badge.description}
                    </p>

                    <div
                      className="mission-progress-block"
                      style={{
                        marginTop:
                          '0.75rem',
                      }}
                    >

                      <div className="mission-progress-labels">

                        <span>
                          {badge.progress}{' '}
                          / {badge.target}
                        </span>

                        <span>
                          {percentage.toFixed(
                            percentage %
                              1 ===
                              0
                              ? 0
                              : 1
                          )}
                          %
                        </span>

                      </div>

                      <div className="progress-track-bg">

                        <div
                          className="progress-fill-bar"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="badge-unlock-status">

                      {unlocked ? (
                        <span className="status-unlocked-text">

                          <CheckCircle2
                            size={13}
                            className="text-emerald"
                          />

                          Terbuka pada{' '}
                          {formatDate(
                            badge.earned_at
                          )}

                        </span>
                      ) : (
                        <span className="status-locked-text">

                          <Lock size={13} />

                          Selesaikan target
                          untuk membuka

                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}
