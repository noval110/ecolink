import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
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
  loginUser,
  saveAuth,
} from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
      });

      const user = result.data.user;

      const roleMap = {
        user: 'user',
        org: 'organization',
        bank: 'waste_bank',
      };

      if (user.role !== roleMap[role]) {
        throw new Error(
          'Jenis akun yang dipilih tidak sesuai dengan akun ini.'
        );
      }

      saveAuth(result.data);

      if (user.role === 'user') {
        const redirect = searchParams.get('redirect');
        const destination = /^\/campaigns\/[1-9]\d*$/.test(redirect || '') ? redirect : '/app';
        navigate(destination, { replace: true });
        return;
      }

      /*
       * Dashboard organization dan waste bank
       * belum kita implementasikan.
       */
      navigate('/');
    } catch (err) {
      setError(
        err.message || 'Login gagal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <Link to="/" className="auth-logo">
          <Leaf
            className="logo-icon"
            size={28}
          />
          <span>EcoLink</span>
        </Link>

        <div className="auth-card glass-card">

          <div className="auth-header">
            <h2>Selamat Datang Kembali</h2>
            <p>
              Lanjutkan perjalanan dampak
              lingkunganmu hari ini.
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
            onSubmit={handleLogin}
          >

            <div className="form-group">
              <label>
                Alamat Email
              </label>

              <div className="input-with-icon">
                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">

              <div className="label-row">
                <label>
                  Kata Sandi
                </label>
              </div>

              <div className="input-with-icon">

                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
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
                ? 'Memproses...'
                : 'Masuk Sekarang'}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          <div className="auth-footer">
            <p>
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="auth-link"
              >
                Daftar di sini
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
