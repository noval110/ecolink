import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Target
} from 'lucide-react';
import { getActiveUser, USER_MISSIONS, USER_BADGES } from '../../data/mockUserData';

export default function UserMissionsPage() {
  const [user, setUser] = useState(getActiveUser());
  const [missions, setMissions] = useState(USER_MISSIONS);
  const [badgeFilter, setBadgeFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const [claimedNotice, setClaimedNotice] = useState(null);

  const handleClaimReward = (missionId) => {
    const targetMission = missions.find(m => m.id === missionId);
    if (!targetMission) return;

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          return { ...m, claimed: true };
        }
        return m;
      })
    );

    const activeUser = getActiveUser();
    const newPoints = activeUser.points + targetMission.rewardPoints;
    localStorage.setItem(`ecolink_points_${activeUser.id}`, newPoints.toString());
    setUser({ ...activeUser, points: newPoints });
    window.dispatchEvent(new Event('ecolink_profile_changed'));

    setClaimedNotice(`Selamat! Kamu berhasil mengklaim +${targetMission.rewardPoints} poin & +${targetMission.rewardXp} XP! Poin langsung ditambahkan ke saldo.`);
    setTimeout(() => setClaimedNotice(null), 4000);
  };

  const filteredBadges = USER_BADGES.filter((b) => {
    if (badgeFilter === 'unlocked') return b.isUnlocked;
    if (badgeFilter === 'locked') return !b.isUnlocked;
    return true;
  });

  const levelProgress = Math.round((user.currentXp / user.nextLevelXp) * 100);

  return (
    <div className="user-missions-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <Trophy size={14} className="text-gold" />
            <span>Gamifikasi & Prestasi Hijau</span>
          </div>
          <h1 className="page-title">Misi & Lencana Pencapaian</h1>
          <p className="page-sub">
            Selesaikan misi daur ulang mingguan, kumpulkan XP untuk menaikkan level paspor, dan buka lencana kehormatan pelopor lingkungan.
          </p>
        </div>
      </div>

      {/* Reward Claim Banner */}
      {claimedNotice && (
        <div className="claim-reward-toast fade-in">
          <Sparkles size={18} className="text-gold shrink-0" />
          <span>{claimedNotice}</span>
        </div>
      )}

      {/* Level Summary Header Card */}
      <div className="level-hero-card">
        <div className="level-hero-left">
          <div className="level-trophy-circle">
            <Trophy size={36} className="text-gold" />
          </div>
          <div>
            <span className="level-pre-label">Gelar Saat Ini</span>
            <h3 className="level-hero-title">{user.levelTitle}</h3>
            <p className="level-hero-sub">Tingkat {user.level} dari 10 Tingkat Kehormatan</p>
          </div>
        </div>

        <div className="level-hero-progress">
          <div className="xp-row">
            <span><strong>{user.currentXp}</strong> / {user.nextLevelXp} XP</span>
            <span className="text-emerald font-semibold">{levelProgress}%</span>
          </div>
          <div className="progress-track-bg">
            <div className="progress-fill-bar" style={{ width: `${levelProgress}%` }} />
          </div>
          <span className="level-hint-sub">
            Butuh <strong>{user.nextLevelXp - user.currentXp} XP</strong> lagi untuk membuka Tingkat {user.level + 1}.
          </span>
        </div>
      </div>

      {/* Section 1: Weekly Missions */}
      <div className="dash-card" style={{ marginBottom: '2.5rem' }}>
        <div className="dash-card-header">
          <div>
            <h3 className="dash-card-title">Misi Aksi Nyata Mingguan</h3>
            <span className="dash-card-sub">Diperbarui setiap hari Senin pukul 00:00 WIB</span>
          </div>
          <span className="mission-counter-pill">
            {missions.filter(m => m.isCompleted).length} / {missions.length} Selesai
          </span>
        </div>

        <div className="missions-grid-display">
          {missions.map((mission) => {
            const isFinished = mission.isCompleted;
            const isClaimed = mission.claimed;
            const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

            return (
              <div key={mission.id} className={`mission-card-full ${isFinished ? 'is-complete' : ''}`}>
                <div className="mission-card-top">
                  <div className="mission-icon-box">
                    {isFinished ? (
                      <CheckCircle2 size={24} className="text-emerald" />
                    ) : (
                      <Target size={24} className="text-muted" />
                    )}
                  </div>
                  <div className="mission-text-box">
                    <h4 className="mission-title">{mission.title}</h4>
                    <p className="mission-desc">{mission.desc}</p>
                  </div>
                </div>

                <div className="mission-progress-block">
                  <div className="mission-progress-labels">
                    <span>Progres: <strong>{mission.progress} / {mission.target} {mission.unit}</strong></span>
                    <span className="text-emerald font-semibold">{pct}%</span>
                  </div>
                  <div className="progress-track-bg">
                    <div className="progress-fill-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mission-card-bottom">
                  <div className="mission-reward-pills">
                    <span className="pill-pts">+{mission.rewardPoints} Poin</span>
                    <span className="pill-xp">+{mission.rewardXp} XP</span>
                  </div>

                  {isFinished ? (
                    isClaimed ? (
                      <span className="badge-claimed">
                        <Check size={14} /> Hadiah Diklaim
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimReward(mission.id)}
                        className="btn btn-light-green btn-xs"
                      >
                        <Sparkles size={13} /> Klaim Hadiah
                      </button>
                    )
                  ) : (
                    <span className="badge-in-progress">
                      <Clock size={13} /> Sedang Berjalan
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Badges Collection Showcase */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3 className="dash-card-title">Koleksi Lencana Penghargaan ({USER_BADGES.filter(b => b.isUnlocked).length} / {USER_BADGES.length} Terbuka)</h3>
            <span className="dash-card-sub">Lencana kehormatan yang tersemat resmi di Eco Passport pribadimu</span>
          </div>

          <div className="badge-filter-buttons">
            <button
              type="button"
              onClick={() => setBadgeFilter('all')}
              className={`filter-btn-pill ${badgeFilter === 'all' ? 'active' : ''}`}
            >
              Semua ({USER_BADGES.length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('unlocked')}
              className={`filter-btn-pill ${badgeFilter === 'unlocked' ? 'active' : ''}`}
            >
              Terbuka ({USER_BADGES.filter(b => b.isUnlocked).length})
            </button>
            <button
              type="button"
              onClick={() => setBadgeFilter('locked')}
              className={`filter-btn-pill ${badgeFilter === 'locked' ? 'active' : ''}`}
            >
              Terkunci ({USER_BADGES.filter(b => !b.isUnlocked).length})
            </button>
          </div>
        </div>

        <div className="badges-showcase-grid">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.isUnlocked;

            return (
              <div
                key={badge.id}
                className={`badge-showcase-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={isUnlocked ? { borderColor: badge.color } : {}}
              >
                <div
                  className="badge-icon-frame"
                  style={{
                    backgroundColor: isUnlocked ? badge.bg : 'rgba(255,255,255,0.03)',
                    color: isUnlocked ? badge.color : 'rgba(255,255,255,0.3)',
                    border: isUnlocked ? `1px solid ${badge.color}` : '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {isUnlocked ? <Award size={36} /> : <Lock size={32} />}
                </div>

                <div className="badge-card-info">
                  <div className="badge-tag-row">
                    <span className="badge-category">{badge.category}</span>
                    <span className="badge-rarity-pill" style={isUnlocked ? { color: badge.color } : {}}>
                      {badge.rarity}
                    </span>
                  </div>

                  <h4 className="badge-title">{badge.title}</h4>
                  <p className="badge-desc">{badge.desc}</p>

                  <div className="badge-unlock-status">
                    {isUnlocked ? (
                      <span className="status-unlocked-text">
                        <CheckCircle2 size={13} className="text-emerald" /> Terbuka pada {badge.unlockedAt}
                      </span>
                    ) : (
                      <span className="status-locked-text">
                        <Lock size={13} /> Selesaikan target untuk membuka
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
