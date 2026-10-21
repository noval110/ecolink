import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Leaf, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Kampanye', path: '/campaigns' },
    { name: 'Bank Sampah', path: '/waste-banks' },
  ];

  return (
    <nav className={`navbar-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-capsule">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <div className="logo-emblem">
            <Leaf size={18} className="logo-leaf" />
          </div>
          <span className="logo-brand">
            Eco<span className="logo-accent">Link</span>
          </span>
        </Link>
        
        {/* Desktop Nav Links */}
        <div className="nav-menu-wrapper">
          <ul className="nav-pill-links">
            {navLinks.map((link) => {
              const isActive = link.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.path);
              return (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`nav-pill-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {isActive && <span className="active-glow-dot" />}
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <Link to="/waste-banks" className="nav-search-btn" title="Cari Bank Sampah">
            <Search size={16} />
            <span className="search-hint">Cari...</span>
          </Link>

          <Link to="/login" className="nav-login-link" onClick={() => setIsOpen(false)}>
            Masuk
          </Link>

          <Link to="/register" className="nav-register-btn" onClick={() => setIsOpen(false)}>
            <span>Daftar</span>
            <ArrowRight size={14} />
          </Link>

          {/* Mobile Toggle Button */}
          <button 
            className="mobile-toggle-btn" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="mobile-drawer-overlay fade-in">
          <div className="mobile-drawer-card">
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`mobile-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mobile-drawer-actions">
              <Link to="/login" className="btn btn-outline w-100 justify-center" onClick={() => setIsOpen(false)}>
                Masuk ke Akun
              </Link>
              <Link to="/register" className="btn btn-light-green w-100 justify-center" onClick={() => setIsOpen(false)}>
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
