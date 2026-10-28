import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Building2,
  Target,
  Users,
  Scale,
  MapPin,
  Calendar,
  ShieldCheck,
  Plus,
  X,
  LogOut,
  Home,
} from 'lucide-react';

import {
  createOrganizationCampaign,
  getOrganizationDashboard,
  getStoredUser,
  getWasteBanks,
  updateOrganizationCampaignStatus,
} from '../../services/api';

import './OrganizationDashboardPage.css';

function emptyCampaignForm() {
  return {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    target_kg: '',
    partner_waste_bank_ids: [],
  };
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

function getStatusLabel(status) {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || '-';
  }
}

export default function OrganizationDashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [wasteBanks, setWasteBanks] =
    useState([]);

  const [banksLoading, setBanksLoading] =
    useState(true);

  const [banksError, setBanksError] =
    useState('');

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState('');

  const [formData, setFormData] =
    useState(emptyCampaignForm);

  const [
    statusUpdatingID,
    setStatusUpdatingID,
  ] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('ecolink_token');
    localStorage.removeItem('ecolink_user');

    navigate('/login', {
      replace: true,
    });
  };

  const loadDashboard = useCallback(
    async (isActive = () => true) => {
      try {
        const result =
          await getOrganizationDashboard();

        if (!isActive()) return;

        if (!result.data?.organization) {
          throw new Error(
            'Data organisasi tidak tersedia.'
          );
        }

        setDashboard(result.data);
      } catch (err) {
        if (!isActive()) return;

        setError(
          err.message ||
            'Gagal memuat dashboard organisasi.'
        );
      } finally {
        if (isActive()) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    loadDashboard(() => active);

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const loadWasteBanks = useCallback(
    async (isActive = () => true) => {
      try {
        const result =
          await getWasteBanks();

        if (isActive()) {
          setWasteBanks(
            Array.isArray(result.data)
              ? result.data
              : []
          );
        }
      } catch (err) {
        if (isActive()) {
          setBanksError(
            err.message ||
              'Gagal memuat daftar bank sampah.'
          );
        }
      } finally {
        if (isActive()) {
          setBanksLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    loadWasteBanks(() => active);

    return () => {
      active = false;
    };
  }, [loadWasteBanks]);

  const toggleWasteBank = (bankID) => {
    setFormData((current) => ({
      ...current,
      partner_waste_bank_ids:
        current.partner_waste_bank_ids.includes(
          bankID
        )
          ? current.partner_waste_bank_ids.filter(
              (id) => id !== bankID
            )
          : [
              ...current.partner_waste_bank_ids,
              bankID,
            ],
    }));
  };

  const handleCreateCampaign = async (
    event
  ) => {
    event.preventDefault();

    if (creating) return;

    setCreateError('');

    if (!formData.title.trim()) {
      setCreateError(
        'Nama kampanye wajib diisi.'
      );
      return;
    }

    if (
      formData.end_date <
      formData.start_date
    ) {
      setCreateError(
        'Tanggal berakhir tidak boleh sebelum tanggal mulai.'
      );
      return;
    }

    if (
      formData.partner_waste_bank_ids
        .length === 0
    ) {
      setCreateError(
        'Pilih minimal satu bank sampah mitra.'
      );
      return;
    }

    setCreating(true);

    try {
      await createOrganizationCampaign({
        title: formData.title.trim(),
        description:
          formData.description.trim() ||
          null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_kg: Number(
          formData.target_kg
        ),
        partner_waste_bank_ids:
          formData.partner_waste_bank_ids,
      });

      setFormData(emptyCampaignForm());
      setShowCreateForm(false);

      setLoading(true);
      setError('');

      await loadDashboard();
    } catch (err) {
      setCreateError(
        err.message ||
          'Gagal membuat kampanye.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (
    campaignID,
    status
  ) => {
    if (statusUpdatingID !== null) {
      return;
    }

    setStatusUpdatingID(campaignID);

    try {
      await updateOrganizationCampaignStatus(
        campaignID,
        status
      );

      await loadDashboard();
    } catch (err) {
      window.alert(
        err.message ||
          'Gagal mengubah status kampanye.'
      );
    } finally {
      setStatusUpdatingID(null);
    }
  };

  if (loading) {
    return (
      <div className="org-page org-state-page">
        <div className="org-state-card">
          <Building2 size={30} />
          <h2>Memuat dashboard...</h2>
          <p>
            Menyiapkan data organisasi.
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="org-page org-state-page">
        <div className="org-state-card">
          <Building2 size={30} />

          <h2>
            Dashboard tidak dapat dimuat
          </h2>

          <p role="alert">
            {error ||
              'Data organisasi tidak tersedia.'}
          </p>

          <div className="org-state-actions">
            <Link to="/" className="btn btn-outline">
              <Home size={16} aria-hidden="true" />
              Halaman Awal
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { organization } = dashboard;

  const campaigns = Array.isArray(
    dashboard.campaigns
  )
    ? dashboard.campaigns
    : [];

  const partnerWasteBanks =
    Array.isArray(
      dashboard.partner_waste_banks
    )
      ? dashboard.partner_waste_banks
      : [];

  return (
    <main className="org-page">
      <div className="org-container">

        {/* HEADER */}
        <section className="org-header">
          <div className="org-header-main">
            <div className="org-eyebrow">
              <Building2 size={14} />
              Dashboard Organisasi
            </div>

            <h1 className="org-title">
              {organization.name}
            </h1>

            <p className="org-welcome">
              Selamat datang,{' '}
              <strong>
                {user?.full_name ||
                  'Admin Organisasi'}
              </strong>
            </p>

            {organization.description && (
              <p className="org-description">
                {organization.description}
              </p>
            )}
          </div>

          <div className="org-header-actions">
            <Link to="/" className="btn btn-outline">
              <Home size={16} aria-hidden="true" />
              Halaman Awal
            </Link>

            <button
              type="button"
              className="btn btn-light-green"
              onClick={() =>
                setShowCreateForm(true)
              }
            >
              <Plus size={16} />
              Buat Kampanye
            </button>

            <button
              type="button"
              className="org-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </section>

        {/* METRICS */}
        <section className="org-metrics-grid">

          <article className="org-metric-card">
            <div className="org-metric-icon">
              <Target size={20} />
            </div>

            <div>
              <span className="org-metric-label">
                Total Kampanye
              </span>

              <strong className="org-metric-value">
                {dashboard.campaign_count}
              </strong>
            </div>
          </article>

          <article className="org-metric-card">
            <div className="org-metric-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span className="org-metric-label">
                Kampanye Aktif
              </span>

              <strong className="org-metric-value">
                {dashboard.active_campaigns}
              </strong>
            </div>
          </article>

          <article className="org-metric-card">
            <div className="org-metric-icon">
              <Users size={20} />
            </div>

            <div>
              <span className="org-metric-label">
                Total Peserta
              </span>

              <strong className="org-metric-value">
                {dashboard.total_participants}
              </strong>
            </div>
          </article>

          <article className="org-metric-card">
            <div className="org-metric-icon">
              <Scale size={20} />
            </div>

            <div>
              <span className="org-metric-label">
                Sampah Terkumpul
              </span>

              <strong className="org-metric-value">
                {
                  dashboard.total_waste_collected
                }
                <small> kg</small>
              </strong>
            </div>
          </article>

        </section>

        {/* CREATE CAMPAIGN */}
        {showCreateForm && (
          <section
            id="organization-create-campaign"
            className="org-panel org-create-panel"
          >
            <div className="org-section-header">
              <div>
                <span className="org-section-kicker">
                  Kampanye baru
                </span>

                <h2>
                  Buat Kampanye
                </h2>

                <p>
                  Hubungkan kampanye dengan
                  bank sampah mitra EcoLink.
                </p>
              </div>

              <button
                type="button"
                className="org-icon-btn"
                aria-label="Tutup form kampanye"
                disabled={creating}
                onClick={() =>
                  setShowCreateForm(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateCampaign
              }
              className="org-create-form"
            >
              <fieldset
                disabled={creating}
              >
                <div className="org-form-grid">

                  <div className="org-form-field">
                    <label htmlFor="campaign-title">
                      Nama Kampanye
                    </label>

                    <input
                      id="campaign-title"
                      type="text"
                      value={
                        formData.title
                      }
                      onChange={(event) =>
                        setFormData(
                          (current) => ({
                            ...current,
                            title:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Green Campus Challenge"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label htmlFor="campaign-target">
                      Target Sampah (kg)
                    </label>

                    <input
                      id="campaign-target"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={
                        formData.target_kg
                      }
                      onChange={(event) =>
                        setFormData(
                          (current) => ({
                            ...current,
                            target_kg:
                              event.target
                                .value,
                          })
                        )
                      }
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label htmlFor="campaign-start">
                      Tanggal Mulai
                    </label>

                    <input
                      id="campaign-start"
                      type="date"
                      value={
                        formData.start_date
                      }
                      onChange={(event) =>
                        setFormData(
                          (current) => ({
                            ...current,
                            start_date:
                              event.target
                                .value,
                          })
                        )
                      }
                      required
                    />
                  </div>

                  <div className="org-form-field">
                    <label htmlFor="campaign-end">
                      Tanggal Berakhir
                    </label>

                    <input
                      id="campaign-end"
                      type="date"
                      min={
                        formData.start_date ||
                        undefined
                      }
                      value={
                        formData.end_date
                      }
                      onChange={(event) =>
                        setFormData(
                          (current) => ({
                            ...current,
                            end_date:
                              event.target
                                .value,
                          })
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="org-form-field">
                  <label htmlFor="campaign-description">
                    Deskripsi
                  </label>

                  <textarea
                    id="campaign-description"
                    value={
                      formData.description
                    }
                    onChange={(event) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        })
                      )
                    }
                    rows={4}
                    placeholder="Jelaskan tujuan kampanye..."
                  />
                </div>

                <div className="org-partner-field">
                  <div className="org-partner-label">
                    <span>
                      Bank Sampah Mitra
                    </span>

                    <small>
                      Pilih minimal satu
                    </small>
                  </div>

                  {banksLoading && (
                    <p>
                      Memuat bank sampah...
                    </p>
                  )}

                  {banksError && (
                    <p className="org-error">
                      {banksError}
                    </p>
                  )}

                  {!banksLoading &&
                    !banksError &&
                    wasteBanks.length ===
                      0 && (
                      <p>
                        Belum ada bank sampah
                        tersedia.
                      </p>
                    )}

                  <div className="org-bank-selector">
                    {wasteBanks.map(
                      (bank) => {
                        const selected =
                          formData.partner_waste_bank_ids.includes(
                            bank.id
                          );

                        return (
                          <button
                            type="button"
                            key={bank.id}
                            className={`org-bank-chip ${
                              selected
                                ? 'selected'
                                : ''
                            }`}
                            aria-pressed={
                              selected
                            }
                            onClick={() =>
                              toggleWasteBank(
                                bank.id
                              )
                            }
                          >
                            <MapPin
                              size={14}
                            />
                            {bank.name}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </fieldset>

              {createError && (
                <p
                  role="alert"
                  className="org-error"
                >
                  {createError}
                </p>
              )}

              <div className="org-form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  disabled={creating}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-light-green"
                  disabled={
                    creating ||
                    banksLoading ||
                    Boolean(banksError) ||
                    wasteBanks.length === 0
                  }
                >
                  <Plus size={16} />

                  {creating
                    ? 'Membuat...'
                    : 'Buat Kampanye'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* CAMPAIGNS */}
        <section className="org-panel">
          <div className="org-section-header">
            <div>
              <span className="org-section-kicker">
                Aktivitas
              </span>

              <h2>
                Kampanye Organisasi
              </h2>

              <p>
                Pantau seluruh kampanye yang
                dikelola oleh{' '}
                {organization.name}.
              </p>
            </div>

            <span className="org-count-chip">
              {campaigns.length} kampanye
            </span>
          </div>

          {campaigns.length === 0 ? (
            <div className="org-empty-state">
              <div className="org-empty-icon">
                <Target size={24} />
              </div>

              <h3>
                Belum ada kampanye
              </h3>

              <p>
                Buat kampanye pertama untuk
                mulai menghubungkan peserta
                dengan bank sampah mitra.
              </p>

              <button
                type="button"
                className="btn btn-light-green"
                onClick={() =>
                  setShowCreateForm(true)
                }
              >
                <Plus size={16} />
                Buat Kampanye
              </button>
            </div>
          ) : (
            <div className="org-campaign-list">
              {campaigns.map(
                (campaign) => {
                  const rawProgress =
                    Number(
                      campaign.progress_percentage ||
                        0
                    );

                  const progress =
                    Number.isFinite(
                      rawProgress
                    )
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            rawProgress
                          )
                        )
                      : 0;

                  const campaignBanks =
                    Array.isArray(
                      campaign.partner_waste_banks
                    )
                      ? campaign.partner_waste_banks
                      : [];

                  return (
                    <article
                      key={campaign.id}
                      className="org-campaign-card"
                    >
                      <div className="org-campaign-top">
                        <div>
                          <div className="org-campaign-title-row">
                            <h3>
                              {
                                campaign.title
                              }
                            </h3>

                            <span
                              className={`org-status org-status-${campaign.status}`}
                            >
                              {getStatusLabel(
                                campaign.status
                              )}
                            </span>
                          </div>

                          {campaign.description && (
                            <p className="org-campaign-description">
                              {
                                campaign.description
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="org-campaign-info-grid">
                        <div>
                          <span>
                            Terkumpul
                          </span>

                          <strong>
                            {
                              campaign.current_weight
                            }{' '}
                            /{' '}
                            {
                              campaign.target_weight
                            }{' '}
                            kg
                          </strong>
                        </div>

                        <div>
                          <span>
                            Peserta
                          </span>

                          <strong>
                            {
                              campaign.participants
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            <Calendar
                              size={13}
                            />
                            Mulai
                          </span>

                          <strong>
                            {formatDate(
                              campaign.start_date
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            <Calendar
                              size={13}
                            />
                            Berakhir
                          </span>

                          <strong>
                            {formatDate(
                              campaign.end_date
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="org-progress-block">
                        <div className="org-progress-meta">
                          <span>
                            Progress kampanye
                          </span>

                          <strong>
                            {progress.toFixed(
                              2
                            )}
                            %
                          </strong>
                        </div>

                        <div className="org-progress-track">
                          <div
                            className="org-progress-fill"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="org-campaign-footer">
                        <div className="org-campaign-partners">
                          <span className="org-campaign-footer-label">
                            Bank Sampah Mitra
                          </span>

                          <div className="org-partner-chips">
                            {campaignBanks.length ===
                            0 ? (
                              <span className="org-muted">
                                Belum ada mitra
                              </span>
                            ) : (
                              campaignBanks.map(
                                (bank) => (
                                  <span
                                    key={
                                      bank.id
                                    }
                                    className="org-small-chip"
                                  >
                                    <MapPin
                                      size={
                                        12
                                      }
                                    />
                                    {
                                      bank.name
                                    }
                                  </span>
                                )
                              )
                            )}
                          </div>
                        </div>

                        <div className="org-campaign-actions">
                          {campaign.status !==
                            'active' && (
                            <button
                              type="button"
                              className="org-action-btn"
                              disabled={
                                statusUpdatingID !==
                                null
                              }
                              onClick={() =>
                                handleStatusChange(
                                  campaign.id,
                                  'active'
                                )
                              }
                            >
                              Aktifkan
                            </button>
                          )}

                          {campaign.status !==
                            'completed' && (
                            <button
                              type="button"
                              className="org-action-btn primary"
                              disabled={
                                statusUpdatingID !==
                                null
                              }
                              onClick={() =>
                                handleStatusChange(
                                  campaign.id,
                                  'completed'
                                )
                              }
                            >
                              Selesaikan
                            </button>
                          )}

                          {campaign.status !==
                            'cancelled' && (
                            <button
                              type="button"
                              className="org-action-btn danger"
                              disabled={
                                statusUpdatingID !==
                                null
                              }
                              onClick={() =>
                                handleStatusChange(
                                  campaign.id,
                                  'cancelled'
                                )
                              }
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>

                      {statusUpdatingID ===
                        campaign.id && (
                        <p
                          className="org-updating"
                          role="status"
                        >
                          Memperbarui status...
                        </p>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* PARTNERS */}
        <section className="org-panel org-partners-panel">
          <div className="org-section-header">
            <div>
              <span className="org-section-kicker">
                Jaringan
              </span>

              <h2>
                Bank Sampah Mitra
              </h2>

              <p>
                Mitra yang terhubung dengan
                kampanye organisasimu.
              </p>
            </div>
          </div>

          {partnerWasteBanks.length ===
          0 ? (
            <div className="org-partner-empty">
              <MapPin size={20} />
              <span>
                Belum ada bank sampah mitra.
              </span>
            </div>
          ) : (
            <div className="org-partner-grid">
              {partnerWasteBanks.map(
                (bank) => (
                  <div
                    key={bank.id}
                    className="org-partner-card"
                  >
                    <div className="org-partner-icon">
                      <MapPin size={17} />
                    </div>

                    <div>
                      <strong>
                        {bank.name}
                      </strong>
                      <span>
                        Mitra EcoLink
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
