import React, { useState, useEffect } from 'react';
import {
  Gift,
  Award,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Smartphone,
  Wallet,
  CreditCard,
  Sprout,
  TreePine,
  Sparkles,
  CupSoda,
  HeartHandshake,
  Clock,
  ArrowRight
} from 'lucide-react';
import { USER_REWARDS, getActiveUser } from '../../data/mockUserData';

export default function UserRewardsPage() {
  const [user, setUser] = useState(getActiveUser());
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'riwayat'
  
  // Redeem modal state
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Local storage redeemed vouchers history
  const [redemptions, setRedemptions] = useState(() => {
    try {
      const saved = localStorage.getItem(`ecolink_redemptions_${user.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'RED-9921',
          rewardTitle: 'Voucher Pulsa Rp 25.000',
          costPoints: 250,
          date: '10 Okt 2026, 11:20 WIB',
          code: 'VCH-PLSA-882910',
          status: 'Terkirim Berhasil',
          target: user.phone
        }
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleProfileChange = () => {
      const active = getActiveUser();
      setUser(active);
    };
    window.addEventListener('ecolink_profile_changed', handleProfileChange);
    return () => window.removeEventListener('ecolink_profile_changed', handleProfileChange);
  }, []);

  const categories = [
    'Semua',
    'Pulsa & Kuota',
    'Dompet Digital',
    'Produk Sirkular Bank Sampah',
    'Donasi & Restorasi Alam'
  ];

  const getRewardIcon = (iconName, color) => {
    const props = { size: 24, style: { color } };
    switch (iconName) {
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Wallet': return <Wallet {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'Sprout': return <Sprout {...props} />;
      case 'TreePine': return <TreePine {...props} />;
      case 'CupSoda': return <CupSoda {...props} />;
      case 'HeartHandshake': return <HeartHandshake {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const filteredRewards = USER_REWARDS.filter((reward) => {
    const matchCategory = selectedCategory === 'Semua' || reward.category === selectedCategory;
    const matchSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenRedeem = (reward) => {
    setErrorMessage('');
    if (user.points < reward.costPoints) {
      setErrorMessage(`Poinmu (${user.points.toLocaleString()} poin) belum mencukupi untuk menukar ${reward.title} (${reward.costPoints.toLocaleString()} poin). Silakan setor sampah lagi ke Bank Sampah untuk menambah poin.`);
    }
    setSelectedReward(reward);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;
    if (user.points < selectedReward.costPoints) {
      setErrorMessage('Poin tidak mencukupi.');
      return;
    }

    const newPoints = user.points - selectedReward.costPoints;
    localStorage.setItem(`ecolink_points_${user.id}`, newPoints.toString());
    
    // Create voucher code
    const generatedCode = `ECOLINK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newRedemption = {
      id: `RED-${Math.floor(1000 + Math.random() * 9000)}`,
      rewardTitle: selectedReward.title,
      costPoints: selectedReward.costPoints,
      date: 'Baru Saja',
      code: generatedCode,
      status: selectedReward.category === 'Donasi & Restorasi Alam' ? 'Sertifikat Diterbitkan' : 'Berhasil Ditebus',
      target: user.phone || user.email
    };

    const updatedRedemptions = [newRedemption, ...redemptions];
    setRedemptions(updatedRedemptions);
    localStorage.setItem(`ecolink_redemptions_${user.id}`, JSON.stringify(updatedRedemptions));

    // Update local state
    setUser({ ...user, points: newPoints });
    window.dispatchEvent(new Event('ecolink_profile_changed'));
    setRedeemSuccess(newRedemption);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="user-rewards-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <Gift size={14} className="text-emerald" />
            <span>Katalog Hadiah Sirkular</span>
          </div>
          <h1 className="page-title">Tukar Poin EcoLink</h1>
          <p className="page-sub">
            Ubah tabungan poin hasil pilah sampahmu menjadi pulsa, saldo e-wallet, bibit tanaman bank sampah, atau donasi restorasi lingkungan.
          </p>
        </div>

        {/* Live Balance Card */}
        <div className="rewards-balance-pill">
          <div className="r-icon-box">
            <Award size={22} className="text-gold" />
          </div>
          <div>
            <span className="r-lbl">Saldo Poin Kamu</span>
            <div className="r-val-row">
              <strong className="r-val">{user.points.toLocaleString()}</strong>
              <span className="r-unit">poin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Katalog vs Riwayat */}
      <div className="rewards-nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'katalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('katalog')}
        >
          <Gift size={16} /> Katalog Hadiah ({USER_REWARDS.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
        >
          <Clock size={16} /> Riwayat Penukaran ({redemptions.length})
        </button>
      </div>

      {activeTab === 'katalog' && (
        <>
          {/* Search & Category Filter Bar */}
          <div className="dash-card rewards-filter-strip">
            <div className="search-field-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari voucher pulsa, e-wallet, bibit pohon, kompos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rewards-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="category-pills-row">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="rewards-cards-grid">
            {filteredRewards.map((reward) => {
              const canAfford = user.points >= reward.costPoints;
              return (
                <div key={reward.id} className="dash-card reward-item-card">
                  <div className="reward-card-top">
                    <div className="reward-icon-holder" style={{ backgroundColor: `${reward.color}15`, borderColor: `${reward.color}40` }}>
                      {getRewardIcon(reward.icon, reward.color)}
                    </div>
                    {reward.badge && (
                      <span className="reward-badge-tag" style={{ borderColor: `${reward.color}50`, color: reward.color }}>
                        {reward.badge}
                      </span>
                    )}
                  </div>

                  <div className="reward-card-body">
                    <span className="reward-category-label">{reward.category}</span>
                    <h3 className="reward-title">{reward.title}</h3>
                    <span className="reward-provider">{reward.provider}</span>
                    <p className="reward-desc">{reward.desc}</p>
                  </div>

                  <div className="reward-card-footer">
                    <div className="reward-cost-box">
                      <strong className="cost-number">{reward.costPoints.toLocaleString()}</strong>
                      <span className="cost-sub">poin</span>
                    </div>

                    <button
                      type="button"
                      className={`btn ${canAfford ? 'btn-light-green' : 'btn-outline-disabled'}`}
                      onClick={() => handleOpenRedeem(reward)}
                    >
                      {canAfford ? (
                        <>
                          <span>Tukar</span>
                          <ArrowRight size={14} />
                        </>
                      ) : (
                        <span>Poin Kurang</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'riwayat' && (
        <div className="dash-card redemptions-history-card">
          <h3 className="dash-card-title">Riwayat Penukaran Hadiah & Voucher</h3>
          <span className="dash-card-sub">Daftar kode voucher atau sertifikat donasi yang pernah kamu tebus</span>

          {redemptions.length === 0 ? (
            <div className="empty-state-box">
              <Gift size={40} className="empty-icon text-muted" />
              <p>Belum ada hadiah yang ditukarkan.</p>
            </div>
          ) : (
            <div className="redemptions-table-wrap">
              <div className="redemption-table-head">
                <span>Waktu</span>
                <span>Item Hadiah</span>
                <span>Poin Terpakai</span>
                <span>Kode Voucher / Bukti</span>
                <span>Status</span>
              </div>
              <div className="redemption-table-body">
                {redemptions.map((item) => (
                  <div key={item.id} className="redemption-table-row">
                    <span className="date-col">{item.date}</span>
                    <strong className="title-col">{item.rewardTitle}</strong>
                    <span className="pts-col text-gold">-{item.costPoints} poin</span>
                    <div className="code-col">
                      <code>{item.code}</code>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.code)}
                        className="copy-mini-btn"
                        title="Salin Kode"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className="status-pill-green">
                      <CheckCircle2 size={12} /> {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation & Redemption Modal */}
      {selectedReward && (
        <div className="modal-backdrop" onClick={() => { setSelectedReward(null); setRedeemSuccess(null); }}>
          <div className="reward-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>Konfirmasi Penukaran Poin</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setSelectedReward(null); setRedeemSuccess(null); }}
              >
                <X size={18} />
              </button>
            </div>

            {!redeemSuccess ? (
              <div className="modal-body-content">
                <div className="redeem-preview-box">
                  <div className="r-preview-icon" style={{ backgroundColor: `${selectedReward.color}20` }}>
                    {getRewardIcon(selectedReward.icon, selectedReward.color)}
                  </div>
                  <div>
                    <h4 className="r-preview-title">{selectedReward.title}</h4>
                    <span className="r-preview-prov">{selectedReward.provider}</span>
                  </div>
                </div>

                <div className="redeem-summary-table">
                  <div className="sum-row">
                    <span>Saldo Poin Saat Ini:</span>
                    <strong>{user.points.toLocaleString()} poin</strong>
                  </div>
                  <div className="sum-row">
                    <span>Biaya Penukaran:</span>
                    <strong className="text-gold">-{selectedReward.costPoints.toLocaleString()} poin</strong>
                  </div>
                  <div className="sum-divider" />
                  <div className="sum-row">
                    <span>Sisa Poin Setelah Penukaran:</span>
                    <strong className={user.points >= selectedReward.costPoints ? 'text-emerald' : 'text-danger'}>
                      {(user.points - selectedReward.costPoints).toLocaleString()} poin
                    </strong>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="error-alert-box">
                    <AlertCircle size={18} className="text-danger shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                ) : (
                  <div className="info-alert-box">
                    <CheckCircle2 size={16} className="text-emerald shrink-0" />
                    <span>Hadiah akan langsung diproses dan tercatat di riwayat penukaran akunmu.</span>
                  </div>
                )}

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedReward(null)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={user.points < selectedReward.costPoints}
                    className={`btn ${user.points >= selectedReward.costPoints ? 'btn-light-green' : 'btn-disabled'}`}
                    onClick={handleConfirmRedeem}
                  >
                    Tukar Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-success-content fade-in">
                <div className="success-icon-ring">
                  <CheckCircle2 size={44} className="text-emerald" />
                </div>
                <h3>Penukaran Poin Berhasil!</h3>
                <p>
                  Kamu telah berhasil menukarkan <strong>{selectedReward.costPoints} poin</strong> untuk{' '}
                  <strong>{selectedReward.title}</strong>.
                </p>

                <div className="voucher-result-plate">
                  <span className="v-lbl">KODE VOUCHER / KLAIM RESMI</span>
                  <div className="v-code-row">
                    <strong className="v-code">{redeemSuccess.code}</strong>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleCopyCode(redeemSuccess.code)}
                    >
                      {copiedCode ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <span className="v-sub">Tunjukkan kode ini kepada admin bank sampah atau gunakan di merchant mitra.</span>
                </div>

                <button
                  type="button"
                  className="btn btn-light-green w-100 justify-center"
                  onClick={() => { setSelectedReward(null); setRedeemSuccess(null); setActiveTab('riwayat'); }}
                >
                  Lihat di Riwayat Penukaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
