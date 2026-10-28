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
              aria-pressed={role === 'user'}
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
              aria-pressed={role === 'org'}
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
              aria-pressed={role === 'bank'}
              onClick={() =>
                setRole('bank')
              }
            >
              <Truck size={18} />
              Bank Sampah
            </button>

          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            <div className="form-group">
              <label htmlFor="register-fullName">Nama Lengkap</label>

              <div className="input-with-icon">
                <User
                  size={18}
                  className="input-icon"
                />

                <input
                  type="text"
                  id="register-fullName"
                  autoComplete="name"
                  name="fullName"
                  placeholder="Budi Santoso"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Alamat Email</label>

              <div className="input-with-icon">
                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  id="register-email"
                  autoComplete="email"
                  name="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Kata Sandi</label>

              <div className="input-with-icon">
                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type="password"
                  id="register-password"
                  autoComplete="new-password"
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
