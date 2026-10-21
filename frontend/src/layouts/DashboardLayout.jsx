import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  QrCode,
  ReceiptText,
  Target,
  Trophy,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Bell,
  Copy,
  Check,
  Gift,
  Users
} from 'lucide-react';
import { getActiveUser } from '../data/mockUserData';
import {
  getStoredUser,
  logoutUser,
  getDashboard,
} from '../services/api';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const mockUser = getActiveUser();

  const [currentUser, setCurrentUser] = useState({
    ...mockUser,
    name:
      storedUser?.full_name ||
      mockUser.name,
    email:
      storedUser?.email ||
      mockUser.email,
    role:
      storedUser?.role ||
      mockUser.role,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const result = await getDashboard();
        const data = result.data;

        if (!active) return;

        setCurrentUser((current) => ({
          ...current,
          name: data.user.full_name,
          role: data.user.role,
          totalRecycledKg: data.stats.total_recycled,
          co2SavedKg: Number(data.impact_summary.co2_avoided.toFixed(2)),
          ecoScore: data.stats.eco_score,
        }));
      } catch (error) {
        if (active) console.error('Failed to load dashboard layout:', error);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { name: 'Dasbor Utama', path: '/app', icon: LayoutDashboard, exact: true },
    { name: 'Eco Passport Digital', path: '/app/passport', icon: QrCode },
    { name: 'Tukar Poin & Hadiah', path: '/app/rewards', icon: Gift },
    { name: 'Riwayat Transaksi', path: '/app/transactions', icon: ReceiptText },
    { name: 'Kampanye Saya', path: '/app/campaigns', icon: Target },
    { name: 'Misi & Lencana', path: '/app/badges', icon: Trophy },
    { name: 'Titik Setor Bank Sampah', path: '/waste-banks', icon: MapPin, isExternalNav: true },
    { name: 'Profil & Akun', path: '/app/profile', icon: User },
  ];

  const handleCopyPassportId = () => {
    navigator.clipboard.writeText(currentUser.passportId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login', {
      replace: true,
    });
  };

  const currentLevelProgress = Math.round((currentUser.currentXp / currentUser.nextLevelXp) * 100);

  return (
    <div className="dashboard-app-root">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <Link to="/" className="sidebar-logo">
            <div className="logo-emblem">
              <Leaf size={18} className="logo-leaf" />
            </div>
            <span className="logo-brand">
              Eco<span className="logo-accent">Link</span>
            </span>
          </Link>
          <div className="sidebar-role-badge">
            <span className="badge-dot-green"></span>
            <span>{currentUser.categoryLabel.split('/')[0].trim()}</span>
          </div>

          <button
            type="button"
            className="sidebar-close-btn d-block-mobile"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Mini ID Card in Sidebar */}
        <div className="sidebar-passport-card">
          <div className="sidebar-passport-header">
            <div className="user-avatar-small">
              <img src={currentUser.avatar} alt={currentUser.name} />
              <span className="avatar-verify-badge">
                <ShieldCheck size={10} color="#062415" />
              </span>
            </div>
            <div className="passport-text-col">
              <strong className="sidebar-user-name">{currentUser.name}</strong>
              <span className="sidebar-user-id">{currentUser.passportId}</span>
            </div>
          </div>

          <div className="sidebar-xp-bar-box">
            <div className="xp-labels-row">
              <span>Level {currentUser.level}</span>
              <span>{currentUser.currentXp} / {currentUser.nextLevelXp} XP</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${currentLevelProgress}%` }} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="sidebar-qr-trigger-btn"
          >
            <QrCode size={15} />
            <span>Tunjukkan QR Paspor</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav-menu">
          <span className="sidebar-section-title">MENU UTAMA</span>
          <ul className="sidebar-links-list">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              const IconComponent = item.icon;

              return (
                <li key={item.name}>
                  {item.isExternalNav ? (
                    <Link
                      to={item.path}
                      className="sidebar-nav-link"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <IconComponent size={18} className="nav-icon" />
                      <span className="nav-label">{item.name}</span>
                      <ExternalLink size={13} className="nav-ext-badge" />
                    </Link>
                  ) : (
                    <Link
                      to={item.path}
                      className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <IconComponent size={18} className="nav-icon" />
                      <span className="nav-label">{item.name}</span>
                      {isActive && <span className="nav-active-pill" />}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom-actions">
          <Link to="/" className="sidebar-public-link">
            <span>Lihat Halaman Publik</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <LogOut size={16} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="dashboard-main-wrapper">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-hamburger-btn d-block-mobile"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka Menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-greeting">
              <span className="greeting-sub">Selamat datang kembali,</span>
              <h2 className="greeting-name">{currentUser.name}</h2>
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick Eco Score Pill */}
            <div className="topbar-metric-pill" title="Eco Score dari transaksi terverifikasi">
              <Award size={15} className="text-gold" />
              <strong>{(currentUser.ecoScore ?? 0).toLocaleString()}</strong>
              <span className="pill-sub">score</span>
            </div>

            {/* Quick Kg Pill */}
            <div className="topbar-metric-pill d-none-mobile" title="Total Sampah Terverifikasi">
              <TrendingUp size={15} className="text-emerald" />
              <strong>{currentUser.totalRecycledKg}</strong>
              <span className="pill-sub">kg</span>
            </div>

            {/* Quick QR Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="btn btn-light-green topbar-qr-cta"
            >
              <QrCode size={16} />
              <span className="d-none-mobile">QR Paspor</span>
            </button>

            {/* User Avatar Badge */}
            <Link to="/app/profile" className="topbar-user-badge">
              <img src={currentUser.avatar} alt={currentUser.name} className="topbar-avatar" />
              <div className="user-badge-info d-none-mobile">
                <span className="user-badge-name">{currentUser.name}</span>
                <span className="user-badge-role">Level {currentUser.level} • {currentUser.role}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Nested App Pages Content */}
        <main className="dashboard-content-body">
          <Outlet />
        </main>
      </div>

      {/* Fullscreen QR Modal for Physical Waste Bank Deposits */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="passport-qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <div className="modal-title-with-badge">
                <ShieldCheck size={20} className="text-emerald" />
                <h3>ID Paspor Lingkungan Digital</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label="Tutup QR Modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="qr-modal-body">
              <p className="qr-instruction-text">
                Tunjukkan kode QR ini kepada petugas di Bank Sampah mitra resmi untuk mencatatkan timbangan langsung ke akunmu.
              </p>

              <div className="passport-qr-card-visual">
                <div className="qr-code-white-plate">
                  <QrCode size={190} color="#062415" />
                </div>

                <div className="qr-user-identity-plate">
                  <span className="id-plate-label">KODE PASPOR AUDIT RESMI</span>
                  <div className="id-plate-number-row">
                    <strong className="id-number-text">{currentUser.passportId}</strong>
                    <button
                      type="button"
                      className="copy-passport-btn"
                      onClick={handleCopyPassportId}
                      title="Salin ID Paspor"
                    >
                      {copiedId ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <div className="id-holder-details">
                    <strong className="id-holder-name">{currentUser.name}</strong>
                    <span className="id-holder-role-pill">{currentUser.categoryLabel}</span>
                  </div>
                </div>
              </div>

              <div className="qr-modal-tips">
                <div className="tip-item">
                  <span className="tip-bullet">✓</span>
                  <span>Berlaku di seluruh Bank Sampah mitra jaringan resmi EcoLink.</span>
                </div>
                <div className="tip-item">
                  <span className="tip-bullet">✓</span>
                  <span>Petugas akan menimbang sampah fisik, memverifikasi jenis material, dan poin langsung bertambah secara real-time.</span>
                </div>
              </div>
            </div>

            <div className="qr-modal-footer">
              <button
                type="button"
                className="btn btn-outline w-100 justify-center"
                onClick={() => setShowQrModal(false)}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
