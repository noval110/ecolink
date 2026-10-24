import React, { useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Leaf,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  Truck,
} from 'lucide-react';

import {
  registerUser,
  saveAuth,
} from '../../services/api';
import { getHomeForRole } from '../../components/ProtectedRoute';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState('user');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] =
    useState(false);

  const roleMap = {
    user: 'user',
    org: 'organization',
    bank: 'waste_bank',
  };

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result =
        await registerUser({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          role: roleMap[role],
        });

      saveAuth(result.data);

      navigate(getHomeForRole(result.data.user.role), { replace: true });
    } catch (err) {
      setError(
        err.message ||
          'Registrasi gagal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <Link
          to="/"
          className="auth-logo"
        >
          <Leaf
            className="logo-icon"
            size={28}
          />
          <span>EcoLink</span>
        </Link>

        <div className="auth-card glass-card">

          <div className="auth-header">
            <h2>
              Mulai Langkah Berdampakmu
            </h2>
            <p>
              Bergabung dan ciptakan
              perubahan nyata hari ini.
            </p>
          </div>

          <div className="role-selector">

            <button
              type="button"
              className={`role-btn ${
                role === 'user'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setRole('user')
              }
            >
              <User size={18} />
              Individu
            </button>

            <button
              type="button"
              className={`role-btn ${
                role === 'org'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setRole('org')
              }
            >
              <Building2 size={18} />
              Organisasi
            </button>

            <button
              type="button"
              className={`role-btn ${
                role === 'bank'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setRole('bank')
              }
            >
              <Truck size={18} />
              Bank Sampah
            </button>

          </div>

          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background:
                  'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            <div className="form-group">
              <label>Nama Lengkap</label>

              <div className="input-with-icon">
                <User
                  size={18}
                  className="input-icon"
                />

                <input
                  type="text"
                  name="fullName"
                  placeholder="Budi Santoso"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Email</label>

              <div className="input-with-icon">
                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kata Sandi</label>

              <div className="input-with-icon">
                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Membuat Akun...'
                : 'Buat Akun'}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          <div className="auth-footer">
            <p>
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="auth-link"
              >
                Masuk di sini
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
