import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Mail, Lock, User, Building2, Truck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // user, bank, org

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for now
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <Leaf className="logo-icon" size={28} />
          <span>EcoLink</span>
        </Link>
        
        <div className="auth-card glass-card">
          <div className="auth-header">
            <h2>Selamat Datang Kembali</h2>
            <p>Lanjutkan perjalanan dampak lingkunganmu hari ini.</p>
          </div>

          <div className="role-selector">
            <button 
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              <User size={18} /> Individu
            </button>
            <button 
              className={`role-btn ${role === 'org' ? 'active' : ''}`}
              onClick={() => setRole('org')}
            >
              <Building2 size={18} /> Organisasi
            </button>
            <button 
              className={`role-btn ${role === 'bank' ? 'active' : ''}`}
              onClick={() => setRole('bank')}
            >
              <Truck size={18} /> Bank Sampah
            </button>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Alamat Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="nama@email.com" required />
              </div>
            </div>
            
            <div className="form-group">
              <div className="label-row">
                <label>Kata Sandi</label>
                <a href="#" className="forgot-password">Lupa kata sandi?</a>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 auth-submit">
              Masuk Sekarang <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Belum punya akun? <Link to="/register" className="auth-link">Daftar di sini</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
