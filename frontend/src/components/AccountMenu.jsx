import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';
import { logoutUser } from '../services/api';
import './AccountMenu.css';

const roleLabels = {
  user: 'Individu',
  organization: 'Organisasi',
  waste_bank: 'Bank Sampah',
};

export default function AccountMenu({ user, onOpen }) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const navigate = useNavigate();
  const name = user?.full_name || 'Akun';

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const toggleMenu = () => {
    if (!open) {
      setShowProfile(false);
      onOpen?.();
    }
    setOpen((current) => !current);
  };

  const handleLogout = () => {
    logoutUser();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        type="button"
        className="account-menu-trigger"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggleMenu}
        title={name}
      >
        <span>{name}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} className="account-menu-panel">
          <div className="account-menu-heading">
            <strong>{name}</strong>
            <span>{roleLabels[user?.role] || 'Pengguna'}</span>
          </div>

          <button
            type="button"
            className="account-menu-item"
            aria-expanded={showProfile}
            aria-controls={`${menuId}-profile`}
            onClick={() => setShowProfile((current) => !current)}
          >
            <User size={16} aria-hidden="true" />
            Profil
          </button>

          {showProfile && (
            <div id={`${menuId}-profile`} className="account-menu-profile">
              <dl>
                <div><dt>Nama</dt><dd>{name}</dd></div>
                <div><dt>Email</dt><dd>{user?.email || 'Belum tersedia'}</dd></div>
                <div><dt>Jenis akun</dt><dd>{roleLabels[user?.role] || 'Pengguna'}</dd></div>
              </dl>
              {user?.role === 'user' && (
                <Link to="/app/profile" onClick={() => setOpen(false)}>Kelola profil</Link>
              )}
            </div>
          )}

          <Link to="/dashboard" className="account-menu-item" onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} aria-hidden="true" />
            Dashboard
          </Link>
          <div className="account-menu-divider" />
          <button type="button" className="account-menu-item" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Keluar Akun
          </button>
        </div>
      )}
    </div>
  );
}
