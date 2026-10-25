import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

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
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
      timeZone: 'Asia/Jakarta',
    }
  ).format(date);
}

export default function OrganizationDashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem('ecolink_token');
    localStorage.removeItem('ecolink_user');
    navigate('/login', { replace: true });
  };

  const logoutButton = (
    <button
      type="button"
      className="btn btn-outline"
      onClick={handleLogout}
      style={{ marginTop: '1.25rem' }}
    >
      Keluar Akun
    </button>
  );

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [wasteBanks, setWasteBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState(emptyCampaignForm);
  const [statusUpdatingID, setStatusUpdatingID] = useState(null);

  const loadDashboard = useCallback(async (isActive = () => true) => {
    try {
      const result = await getOrganizationDashboard();
      if (!isActive()) return;
      if (!result.data?.organization) throw new Error('Data organisasi tidak tersedia.');
      setDashboard(result.data);
    } catch (err) {
      if (!isActive()) return;
      setError(err.message || 'Gagal memuat dashboard organisasi.');
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    // oxlint-disable-next-line react/set-state-in-effect -- State updates follow an asynchronous API request.
    loadDashboard(() => active);
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const loadWasteBanks = useCallback(async (isActive = () => true) => {
    try {
      const result = await getWasteBanks();
      if (isActive()) setWasteBanks(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if (isActive()) setBanksError(err.message || 'Gagal memuat daftar bank sampah.');
    } finally {
      if (isActive()) setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    // oxlint-disable-next-line react/set-state-in-effect -- State updates follow an asynchronous API request.
    loadWasteBanks(() => active);
    return () => {
      active = false;
    };
  }, [loadWasteBanks]);

  const toggleWasteBank = (bankID) => {
    setFormData((current) => ({
      ...current,
      partner_waste_bank_ids: current.partner_waste_bank_ids.includes(bankID)
        ? current.partner_waste_bank_ids.filter((id) => id !== bankID)
        : [...current.partner_waste_bank_ids, bankID],
    }));
  };

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    if (creating) return;
    setCreateError('');
    if (!formData.title.trim()) {
      setCreateError('Nama kampanye wajib diisi.');
      return;
    }
    if (formData.end_date < formData.start_date) {
      setCreateError('Tanggal berakhir tidak boleh sebelum tanggal mulai.');
      return;
    }
    if (formData.partner_waste_bank_ids.length === 0) {
      setCreateError('Pilih minimal satu bank sampah mitra.');
      return;
    }

    setCreating(true);
    try {
      await createOrganizationCampaign({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_kg: Number(formData.target_kg),
        partner_waste_bank_ids: formData.partner_waste_bank_ids,
      });
      setFormData(emptyCampaignForm());
      setShowCreateForm(false);
      setLoading(true);
      setError('');
      await loadDashboard();
    } catch (err) {
      setCreateError(err.message || 'Gagal membuat kampanye.');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (campaignID, status) => {
    if (statusUpdatingID !== null) return;
    setStatusUpdatingID(campaignID);
    try {
      await updateOrganizationCampaignStatus(campaignID, status);
      await loadDashboard();
    } catch (err) {
      window.alert(err.message || 'Gagal mengubah status kampanye.');
    } finally {
      setStatusUpdatingID(null);
    }
  };

  if (loading) {
    return (
      <div
        className="organization-dashboard-page"
        role="status"
        style={{
          minHeight: '100vh',
          background: '#031c12',
          color: 'white',
          padding: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <h3>
          Memuat dashboard organisasi...
        </h3>
        {logoutButton}
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div
        className="organization-dashboard-page"
        style={{
          minHeight: '100vh',
          background: '#031c12',
          color: 'white',
          padding: 'clamp(1rem, 4vw, 3rem)',
        }}
      >
        <h3>
          Dashboard tidak dapat dimuat
        </h3>

        <p role="alert">{error || 'Data organisasi tidak tersedia.'}</p>
        {logoutButton}
      </div>
    );
  }

  const { organization } = dashboard;
  const campaigns = Array.isArray(dashboard.campaigns) ? dashboard.campaigns : [];
  const partner_waste_banks = Array.isArray(dashboard.partner_waste_banks) ? dashboard.partner_waste_banks : [];

  return (
    <div
      className="organization-dashboard-page"
      style={{
        minHeight: '100vh',
        background: '#031c12',
        color: 'white',
        padding: 'clamp(1rem, 4vw, 3rem)',
      }}
    >
      <div
        style={{
          maxWidth: '1250px',
          margin: '0 auto',
        }}
      >

        <div className="inline-badge-tiny">
          <Building2 size={14} />
          <span>
            Dashboard Organisasi
          </span>
        </div>

        <h1
          style={{
            marginTop: '1rem',
            marginBottom: '.5rem',
          }}
        >
          {organization.name}
        </h1>

        <p>
          Selamat datang,{' '}
          <strong>
            {user?.full_name ||
              'Admin Organisasi'}
          </strong>
        </p>
        {logoutButton}

        {organization.description && (
          <p
            style={{
              marginTop: '.5rem',
              opacity: '.75',
            }}
          >
            {organization.description}
          </p>
        )}

        <button
          type="button"
          className="btn btn-light-green"
          aria-expanded={showCreateForm}
          aria-controls="organization-create-campaign"
          onClick={() => setShowCreateForm(true)}
          style={{ marginTop: '1.25rem' }}
        >
          <Plus size={16} />
          Buat Kampanye
        </button>

        {showCreateForm && (
          <section
            id="organization-create-campaign"
            className="dash-card organization-campaign-form"
            aria-labelledby="create-campaign-title"
            style={{ marginTop: '2rem' }}
          >
            <div className="organization-campaign-form-header">
              <div>
                <h3 id="create-campaign-title" className="dash-card-title">Buat Kampanye Baru</h3>
                <span className="dash-card-sub">
                  Kampanye akan langsung terhubung dengan organisasi ini.
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Tutup form kampanye"
                disabled={creating}
                onClick={() => setShowCreateForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ marginTop: '1.5rem' }}>
              <fieldset disabled={creating} className="organization-campaign-fields">
                <div className="profile-form-fields">
                  <div className="form-field-group">
                    <label htmlFor="campaign-title">Nama Kampanye</label>
                    <input
                      id="campaign-title"
                      type="text"
                      value={formData.title}
                      onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Contoh: Green Campus Challenge"
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label htmlFor="campaign-target">Target Sampah (kg)</label>
                    <input
                      id="campaign-target"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.target_kg}
                      onChange={(event) => setFormData((current) => ({ ...current, target_kg: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label htmlFor="campaign-start">Tanggal Mulai</label>
                    <input
                      id="campaign-start"
                      type="date"
                      value={formData.start_date}
                      onChange={(event) => setFormData((current) => ({ ...current, start_date: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label htmlFor="campaign-end">Tanggal Berakhir</label>
                    <input
                      id="campaign-end"
                      type="date"
                      min={formData.start_date || undefined}
                      value={formData.end_date}
                      onChange={(event) => setFormData((current) => ({ ...current, end_date: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label htmlFor="campaign-description">Deskripsi</label>
                  <textarea
                    id="campaign-description"
                    value={formData.description}
                    onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    placeholder="Jelaskan tujuan kampanye..."
                  />
                </div>

                <div role="group" aria-labelledby="campaign-partner-label" style={{ marginTop: '1.5rem' }}>
                  <p id="campaign-partner-label">Bank Sampah Mitra <small>(pilih minimal satu)</small></p>
                  {banksLoading && <p role="status">Memuat bank sampah...</p>}
                  {banksError && (
                    <div>
                      <p role="alert" className="organization-campaign-error">{banksError}</p>
                      <button
                        type="button"
                        className="filter-chip"
                        onClick={() => {
                          setBanksLoading(true);
                          setBanksError('');
                          loadWasteBanks();
                        }}
                      >
                        Coba lagi
                      </button>
                    </div>
                  )}
                  {!banksLoading && !banksError && wasteBanks.length === 0 && (
                    <p>Belum ada bank sampah yang tersedia sebagai mitra.</p>
                  )}
                  <div className="organization-campaign-partners">
                    {wasteBanks.map((bank) => {
                      const selected = formData.partner_waste_bank_ids.includes(bank.id);
                      return (
                        <button
                          type="button"
                          key={bank.id}
                          className={`filter-chip ${selected ? 'active' : ''}`}
                          aria-pressed={selected}
                          onClick={() => toggleWasteBank(bank.id)}
                        >
                          <MapPin size={13} />
                          {bank.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </fieldset>

              {createError && <p role="alert" className="organization-campaign-error">{createError}</p>}

              <button
                type="submit"
                className="btn btn-light-green"
                disabled={creating || banksLoading || Boolean(banksError) || wasteBanks.length === 0}
                style={{ marginTop: '1.5rem' }}
              >
                <Plus size={16} />
                {creating ? 'Membuat...' : 'Buat Kampanye'}
              </button>
            </form>
          </section>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >

          <div className="dash-card">
            <Target
              size={22}
              className="text-emerald"
            />

            <strong
              style={{
                display: 'block',
                fontSize: '1.8rem',
                marginTop: '.75rem',
              }}
            >
              {dashboard.campaign_count}
            </strong>

            <span>Total Kampanye</span>
          </div>

          <div className="dash-card">
            <ShieldCheck
              size={22}
              className="text-emerald"
            />

            <strong
              style={{
                display: 'block',
                fontSize: '1.8rem',
                marginTop: '.75rem',
              }}
            >
              {dashboard.active_campaigns}
            </strong>

            <span>Kampanye Aktif</span>
          </div>

          <div className="dash-card">
            <Users
              size={22}
              className="text-emerald"
            />

            <strong
              style={{
                display: 'block',
                fontSize: '1.8rem',
                marginTop: '.75rem',
              }}
            >
              {dashboard.total_participants}
            </strong>

            <span>Total Peserta</span>
          </div>

          <div className="dash-card">
            <Scale
              size={22}
              className="text-emerald"
            />

            <strong
              style={{
                display: 'block',
                fontSize: '1.8rem',
                marginTop: '.75rem',
              }}
            >
              {dashboard.total_waste_collected} kg
            </strong>

            <span>Sampah Terkumpul</span>
          </div>

        </div>

        <div
          className="dash-card"
          style={{
            marginTop: '2rem',
          }}
        >

          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">
                Kampanye Organisasi
              </h3>

              <span className="dash-card-sub">
                Campaign yang dikelola oleh{' '}
                {organization.name}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >

            {campaigns.length === 0 && <p>Belum ada kampanye organisasi.</p>}
            {campaigns.map((campaign) => {

              const value = Number(campaign.progress_percentage || 0);
              const progress = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
              const campaignBanks = Array.isArray(campaign.partner_waste_banks) ? campaign.partner_waste_banks : [];

              return (
                <div
                  key={campaign.id}
                  style={{
                    border:
                      '1px solid rgba(255,255,255,.1)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    background:
                      'rgba(0,0,0,.14)',
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >

                    <div>
                      <h3>
                        {campaign.title}
                      </h3>

                      <p
                        style={{
                          opacity: '.7',
                          marginTop: '.35rem',
                        }}
                      >
                        {
                          campaign.description
                        }
                      </p>
                    </div>

                    <span
                      className="status-unlocked-text"
                    >
                      {campaign.status}
                    </span>

                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(min(150px, 100%), 1fr))',
                      gap: '1rem',
                      marginTop: '1.25rem',
                    }}
                  >

                    <div>
                      <small>
                        Terkumpul
                      </small>

                      <strong
                        style={{
                          display: 'block',
                        }}
                      >
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
                      <small>
                        Peserta
                      </small>

                      <strong
                        style={{
                          display: 'block',
                        }}
                      >
                        {
                          campaign.participants
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        <Calendar size={12} />{' '}
                        Mulai
                      </small>

                      <strong
                        style={{
                          display: 'block',
                        }}
                      >
                        {formatDate(
                          campaign.start_date
                        )}
                      </strong>
                    </div>

                    <div>
                      <small>
                        <Calendar size={12} />{' '}
                        Berakhir
                      </small>

                      <strong
                        style={{
                          display: 'block',
                        }}
                      >
                        {formatDate(
                          campaign.end_date
                        )}
                      </strong>
                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginBottom: '.4rem',
                      }}
                    >
                      <span>Progress</span>

                      <strong>
                        {progress.toFixed(
                          2
                        )}
                        %
                      </strong>
                    </div>

                    <div className="progress-track-bg" role="progressbar" aria-label={campaign.title} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                      <div
                        className="progress-fill-bar"
                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    <div
                      role="group"
                      aria-label={`Ubah status ${campaign.title}`}
                      style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}
                    >
                      {campaign.status !== 'active' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={statusUpdatingID !== null}
                          onClick={() => handleStatusChange(campaign.id, 'active')}
                        >
                          Aktifkan
                        </button>
                      )}
                      {campaign.status !== 'completed' && (
                        <button
                          type="button"
                          className="btn btn-light-green btn-sm"
                          disabled={statusUpdatingID !== null}
                          onClick={() => handleStatusChange(campaign.id, 'completed')}
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {campaign.status !== 'cancelled' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={statusUpdatingID !== null}
                          onClick={() => handleStatusChange(campaign.id, 'cancelled')}
                        >
                          Batalkan
                        </button>
                      )}
                      {statusUpdatingID === campaign.id && <span role="status">Memperbarui status...</span>}
                    </div>
                    <small>
                      Bank Sampah Mitra
                    </small>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '.5rem',
                        marginTop: '.5rem',
                      }}
                    >

                      {campaignBanks.length === 0 && <span>Belum ada bank sampah mitra untuk kampanye ini.</span>}
                      {campaignBanks.map((bank) => (
                          <span
                            key={bank.id}
                            className="filter-chip"
                          >
                            <MapPin size={12} />
                            {bank.name}
                          </span>
                        ))}

                    </div>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

        <div
          className="dash-card"
          style={{
            marginTop: '2rem',
          }}
        >

          <h3 className="dash-card-title">
            Jaringan Bank Sampah Mitra
          </h3>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '.75rem',
              marginTop: '1rem',
            }}
          >

            {partner_waste_banks.length === 0 && <p>Belum ada bank sampah mitra.</p>}
            {partner_waste_banks.map(
              (bank) => (
                <div
                  key={bank.id}
                  className="filter-chip"
                >
                  <MapPin size={14} />
                  {bank.name}
                </div>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
