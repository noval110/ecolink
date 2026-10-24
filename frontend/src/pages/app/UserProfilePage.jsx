import React, {
  useEffect,
  useState,
} from 'react';

import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Check,
  Leaf,
  Scale,
  Award,
  Calendar,
} from 'lucide-react';

import {
  getProfile,
  getPassport,
  getDashboard,
  updateProfile,
  updateStoredUser,
} from '../../services/api';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'long',
      timeZone: 'Asia/Jakarta',
    }
  ).format(date);
}

export default function UserProfilePage() {
  const [profile, setProfile] =
    useState(null);

  const [passport, setPassport] =
    useState(null);

  const [dashboard, setDashboard] =
    useState(null);

  const [formData, setFormData] =
    useState({
      full_name: '',
      email: '',
      phone: '',
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [savedSuccess, setSavedSuccess] =
    useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          profileResult,
          passportResult,
          dashboardResult,
        ] = await Promise.all([
          getProfile(),
          getPassport(),
          getDashboard(),
        ]);

        const profileData =
          profileResult.data;

        if (!active) return;
        if (!profileData) throw new Error('Data profil tidak tersedia.');
        setProfile(profileData);
        setPassport(
          passportResult.data
        );

        setDashboard(
          dashboardResult.data
        );

        setFormData({
          full_name:
            profileData.full_name || '',
          email:
            profileData.email || '',
          phone:
            profileData.phone || '',
        });
      } catch (err) {
        if (!active) return;
        setError(
          err.message ||
            'Gagal memuat profil.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!savedSuccess) return;
    const timer = setTimeout(() => setSavedSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [savedSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      const result =
        await updateProfile({
          full_name:
            formData.full_name,
          email:
            formData.email,
          phone:
            formData.phone ||
            null,
        });

      setProfile(result.data);
      setFormData({
        full_name: result.data.full_name || '',
        email: result.data.email || '',
        phone: result.data.phone || '',
      });

      updateStoredUser(
        { ...result.data, phone: result.data.phone ?? null }
      );

      window.dispatchEvent(
        new Event(
          'ecolink_profile_changed'
        )
      );

      setSavedSuccess(true);

    } catch (err) {
      setError(
        err.message ||
          'Gagal memperbarui profil.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page" role="status">
        <h3>Memuat profil...</h3>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="user-profile-page">
        <h3>
          Profil tidak dapat dimuat
        </h3>

        <p role="alert">{error}</p>
      </div>
    );
  }

  const passportID =
    passport?.passport_id || '-';

  const totalRecycled =
    dashboard?.stats?.total_recycled ??
    passport?.stats?.total_recycled ??
    0;

  const ecoScore =
    dashboard?.stats?.eco_score ??
    passport?.stats?.eco_score ??
    0;

  const co2Avoided =
    dashboard?.impact_summary?.co2_avoided ??
    passport?.stats?.co2_avoided ??
    0;

  return (
    <div className="user-profile-page">

      {/* HEADER */}
      <div className="page-header-row">
        <div>

          <div className="inline-badge-tiny">
            <User
              size={14}
              className="text-emerald"
            />

            <span>
              Profil & Akun
            </span>
          </div>

          <h1 className="page-title">
            Profil Pengguna EcoLink
          </h1>

          <p className="page-sub">
            Kelola informasi akun yang
            tersimpan di EcoLink.
          </p>

        </div>
      </div>

      {savedSuccess && (
        <div
          className="claim-reward-toast fade-in"
          role="status"
        >
          <Check
            size={18}
            className="text-emerald"
          />

          <span>
            Profil berhasil diperbarui.
          </span>
        </div>
      )}

      {error && (
        <div
          className="claim-reward-toast"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}

      <div className="profile-layout-grid">

        {/* PROFILE OVERVIEW */}
        <div className="profile-overview-col">

          <div className="dash-card profile-card-hero">

            <div
              className="profile-hero-avatar-wrap"
            >
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2rem',
                  fontWeight: 700,
                  background:
                    'rgba(52,211,153,.2)',
                }}
              >
                {profile.full_name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="verify-seal">
                <ShieldCheck
                  size={14}
                  color="#062415"
                />
              </div>
            </div>

            <div className="profile-category-tag">
              {profile.role}
            </div>

            <h3 className="profile-hero-name">
              {profile.full_name}
            </h3>

            <span className="profile-hero-role">
              {profile.email}
            </span>

            <div className="profile-passport-id-box">

              <span className="lbl">
                ID ECO PASSPORT
              </span>

              <strong className="val">
                {passportID}
              </strong>

            </div>

            <div className="profile-quick-stats">

              <div className="p-stat">
                <strong className="p-val">
                  {totalRecycled} kg
                </strong>

                <span className="p-lbl">
                  Daur Ulang
                </span>
              </div>

              <div className="p-divider" />

              <div className="p-stat">
                <strong className="p-val text-gold">
                  {ecoScore}
                </strong>

                <span className="p-lbl">
                  Eco Score
                </span>
              </div>

              <div className="p-divider" />

              <div className="p-stat">
                <strong className="p-val text-emerald">
                  {co2Avoided} kg
                </strong>

                <span className="p-lbl">
                  CO₂ Terhindar
                </span>
              </div>

            </div>

          </div>

          <div className="dash-card security-note-card">

            <div className="security-note-top">

              <ShieldCheck
                size={18}
                className="text-emerald"
              />

              <strong>
                Informasi Akun
              </strong>

            </div>

            <p>
              Statistik akun dihitung
              berdasarkan transaksi
              penyetoran yang telah
              diverifikasi oleh Bank
              Sampah EcoLink.
            </p>

            <span className="security-date">
              Terdaftar sejak:{' '}
              {formatDate(
                profile.created_at
              )}
            </span>

          </div>

        </div>

        {/* FORM */}
        <div className="profile-form-col">

          <form
            className="dash-card profile-form-card"
            onSubmit={handleSubmit}
          >

            <div className="form-card-header">

              <div>

                <h3 className="dash-card-title">
                  Informasi Pribadi
                </h3>

                <span className="dash-card-sub">
                  Data berikut tersimpan
                  langsung di akun EcoLink.
                </span>

              </div>

            </div>

            <div className="profile-form-fields">

              <div className="form-field-group">

                <label htmlFor="profile-full-name">
                  Nama Lengkap
                </label>

                <div className="input-with-icon">

                  <User
                    size={16}
                    className="input-icon"
                  />

                  <input
                    id="profile-full-name"
                    type="text"
                    disabled={saving}
                    value={
                      formData.full_name
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        full_name:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>
              </div>

              <div className="form-field-group">

                <label htmlFor="profile-email">
                  Alamat Email
                </label>

                <div className="input-with-icon">

                  <Mail
                    size={16}
                    className="input-icon"
                  />

                  <input
                    id="profile-email"
                    type="email"
                    disabled={saving}
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>
              </div>

              <div className="form-field-group">

                <label htmlFor="profile-phone">
                  Nomor Telepon
                </label>

                <div className="input-with-icon">

                  <Phone
                    size={16}
                    className="input-icon"
                  />

                  <input
                    id="profile-phone"
                    type="tel"
                    disabled={saving}
                    value={
                      formData.phone
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                    placeholder="Contoh: 081234567890"
                  />

                </div>
              </div>

              <div className="form-field-group">

                <label htmlFor="profile-role">
                  Role Akun
                </label>

                <div className="input-with-icon">

                  <ShieldCheck
                    size={16}
                    className="input-icon"
                  />

                  <input
                    id="profile-role"
                    type="text"
                    value={profile.role}
                    disabled
                  />

                </div>
              </div>

            </div>

            <div className="profile-form-actions">

              <button
                type="submit"
                className="btn btn-light-green"
                disabled={saving}
              >
                <Save size={16} />

                {saving
                  ? 'Menyimpan...'
                  : 'Simpan Perubahan Profil'}
              </button>

            </div>

          </form>

          {/* ACCOUNT INFO */}
          <div
            className="dash-card"
            style={{
              marginTop: '1.5rem',
            }}
          >

            <h3 className="dash-card-title">
              Ringkasan Akun
            </h3>

            <div
              style={{
                display: 'grid',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >

              <div>
                <Calendar
                  size={16}
                />

                <strong>
                  {' '}Bergabung
                </strong>

                <p>
                  {formatDate(
                    profile.created_at
                  )}
                </p>
              </div>

              <div>
                <Leaf size={16} />

                <strong>
                  {' '}Total Daur Ulang
                </strong>

                <p>
                  {totalRecycled} kg
                </p>
              </div>

              <div>
                <Award size={16} />

                <strong>
                  {' '}Eco Score
                </strong>

                <p>{ecoScore}</p>
              </div>

              <div>
                <Scale size={16} />

                <strong>
                  {' '}CO₂ Terhindar
                </strong>

                <p>
                  {co2Avoided} kg
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
