import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Mail, Lock, User, Building2, Truck } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // user, bank, org

  const handleRegister = (e) => {
    e.preventDefault();
    // Simulate registration for now
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
            <h2>Mulai Langkah Berdampakmu</h2>
            <p>Bergabung dan ciptakan perubahan nyata hari ini.</p>
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

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input type="text" placeholder="Budi Santoso" required />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input type="email" placeholder="nama@email.com" required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="Minimal 8 karakter" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 auth-submit">
              Buat Akun <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
