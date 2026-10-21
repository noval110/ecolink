import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  Save,
  Check,
  Lock,
  QrCode,
  Bell,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Award
} from 'lucide-react';
import { USER_PROFILES, getActiveUser, switchUserProfile } from '../../data/mockUserData';

export default function UserProfilePage() {
  const [currentUser, setCurrentUser] = useState(getActiveUser());
  const [selectedType, setSelectedType] = useState(currentUser.profileType || 'mahasiswa');
  
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    institution: currentUser.institution,
    faculty: currentUser.faculty,
    identifierNumber: currentUser.identifierNumber || '',
    city: currentUser.city,
    province: currentUser.province || 'Jawa Barat',
    notifTransaction: true,
    notifCampaign: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when active user changes or user switches demo profile
  const handleSwitchDemoProfile = (typeKey) => {
    setSelectedType(typeKey);
    const newProfile = switchUserProfile(typeKey);
    setCurrentUser(newProfile);
    setFormData({
      name: newProfile.name,
      email: newProfile.email,
      phone: newProfile.phone,
      institution: newProfile.institution,
      faculty: newProfile.faculty,
      identifierNumber: newProfile.identifierNumber || '',
      city: newProfile.city,
      province: newProfile.province || 'Jawa Barat',
      notifTransaction: true,
      notifCampaign: true
    });
    setSavedSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update active profile in state
    const updated = {
      ...currentUser,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      institution: formData.institution,
      faculty: formData.faculty,
      identifierNumber: formData.identifierNumber,
      city: formData.city,
      province: formData.province
    };
    setCurrentUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="user-profile-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <User size={14} className="text-emerald" />
            <span>Pengaturan Akun & Identitas Inklusif</span>
          </div>
          <h1 className="page-title">Profil Pengguna EcoLink</h1>
          <p className="page-sub">
            EcoLink dapat digunakan oleh seluruh elemen masyarakat: warga mandiri, komunitas perumahan/RT-RW, pelajar/mahasiswa, maupun pegawai perusahaan.
          </p>
        </div>
      </div>

      {/* Profile Type Selector Banner (Inclusivity Showcase) */}
      <div className="dash-card profile-type-selector-banner">
        <div className="selector-banner-intro">
          <div className="intro-badge">
            <Sparkles size={15} className="text-emerald" />
            <span>Kategori Pengguna Aktif</span>
          </div>
          <h3>Pilih Tipe Profil / Afiliasi Kamu</h3>
          <p>
            EcoLink tidak hanya untuk mahasiswa. Setiap individu berhak mencatat dampak daur ulang terverifikasi melalui komunitas atau instansinya masing-masing.
          </p>
        </div>

        <div className="profile-type-cards-row">
          {/* Card 1: Warga Umum */}
          <div
            className={`type-option-card ${selectedType === 'warga' ? 'active' : ''}`}
            onClick={() => handleSwitchDemoProfile('warga')}
          >
            <div className="type-icon-circle warga">
              <Users size={20} />
            </div>
            <div className="type-card-text">
              <strong>Masyarakat Umum / Warga</strong>
              <span>Warga mandiri, ibu rumah tangga, komunitas RT/RW & kelurahan</span>
            </div>
            {selectedType === 'warga' && (
              <span className="type-active-badge">
                <Check size={12} /> Aktif
              </span>
            )}
          </div>

          {/* Card 2: Mahasiswa / Pelajar */}
          <div
            className={`type-option-card ${selectedType === 'mahasiswa' ? 'active' : ''}`}
            onClick={() => handleSwitchDemoProfile('mahasiswa')}
          >
            <div className="type-icon-circle mahasiswa">
              <GraduationCap size={20} />
            </div>
            <div className="type-card-text">
              <strong>Mahasiswa & Pelajar</strong>
              <span>Terhubung dengan BEM, program studi, dan kompetisi hijau kampus</span>
            </div>
            {selectedType === 'mahasiswa' && (
              <span className="type-active-badge">
                <Check size={12} /> Aktif
              </span>
            )}
          </div>

          {/* Card 3: Pegawai / Komunitas Kantor */}
          <div
            className={`type-option-card ${selectedType === 'karyawan' ? 'active' : ''}`}
            onClick={() => handleSwitchDemoProfile('karyawan')}
          >
            <div className="type-icon-circle karyawan">
              <Briefcase size={20} />
            </div>
            <div className="type-card-text">
              <strong>Karyawan & Profesional</strong>
              <span>Program keberlanjutan kantor, instansi, atau program ESG korporasi</span>
            </div>
            {selectedType === 'karyawan' && (
              <span className="type-active-badge">
                <Check size={12} /> Aktif
              </span>
            )}
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="claim-reward-toast fade-in" style={{ borderColor: 'var(--color-primary)' }}>
          <Check size={18} className="text-emerald shrink-0" />
          <span>Profil berhasil diperbarui dan diselaraskan dengan Eco Passport!</span>
        </div>
      )}

      <div className="profile-layout-grid">
        {/* Left Column: Profile Card Overview */}
        <div className="profile-overview-col">
          <div className="dash-card profile-card-hero">
            <div className="profile-hero-avatar-wrap">
              <img src={currentUser.avatar} alt={currentUser.name} className="profile-hero-avatar" />
              <div className="verify-seal" title="Identitas Terverifikasi Resmi">
                <ShieldCheck size={14} color="#062415" />
              </div>
            </div>

            <div className="profile-category-tag">
              {currentUser.categoryLabel}
            </div>

            <h3 className="profile-hero-name">{currentUser.name}</h3>
            <span className="profile-hero-role">{currentUser.role}</span>
            <span className="profile-hero-inst">{currentUser.affiliationDetail}</span>

            <div className="profile-passport-id-box">
              <span className="lbl">ID PASPOR LINGKUNGAN RESMI</span>
              <strong className="val">{currentUser.passportId}</strong>
            </div>

            <div className="profile-quick-stats">
              <div className="p-stat">
                <strong className="p-val">{currentUser.totalRecycledKg} kg</strong>
                <span className="p-lbl">Daur Ulang</span>
              </div>
              <div className="p-divider" />
              <div className="p-stat">
                <strong className="p-val text-gold">{currentUser.points}</strong>
                <span className="p-lbl">Poin</span>
              </div>
              <div className="p-divider" />
              <div className="p-stat">
                <strong className="p-val text-emerald">Lv {currentUser.level}</strong>
                <span className="p-lbl">Level</span>
              </div>
            </div>
          </div>

          <div className="dash-card security-note-card">
            <div className="security-note-top">
              <Lock size={18} className="text-emerald" />
              <strong>Keamanan Akun & Validasi Timbangan</strong>
            </div>
            <p>
              Akunmu terhubung dengan standar audit transaksi EcoLink. Setiap timbangan fisik wajib diotorisasi oleh petugas resmi Bank Sampah menggunakan kode QR paspormu.
            </p>
            <span className="security-date">Terdaftar sejak: {currentUser.joinDate}</span>
          </div>
        </div>

        {/* Right Column: Dynamic Form Fields */}
        <div className="profile-form-col">
          <form className="dash-card profile-form-card" onSubmit={handleSubmit}>
            <div className="form-card-header">
              <div>
                <h3 className="dash-card-title">Informasi Pribadi & Identitas Afiliasi</h3>
                <span className="dash-card-sub">
                  {selectedType === 'warga' && 'Data wilayah domisili dan komunitas untuk pencatatan di Bank Sampah kelurahan'}
                  {selectedType === 'mahasiswa' && 'Data universitas dan program studi untuk penghitungan leaderboard fakultas'}
                  {selectedType === 'karyawan' && 'Data instansi/perusahaan untuk laporan keberlanjutan kantor'}
                </span>
              </div>
            </div>

            <div className="profile-form-fields">
              {/* Field: Nama Lengkap */}
              <div className="form-field-group">
                <label>Nama Lengkap</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Field 1: Institution / Community / Company */}
              <div className="form-field-group">
                <label>
                  {selectedType === 'warga' && 'Komunitas Warga / Wilayah RT-RW'}
                  {selectedType === 'mahasiswa' && 'Institusi / Universitas / Sekolah'}
                  {selectedType === 'karyawan' && 'Nama Perusahaan / Instansi Kantor'}
                </label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder={
                      selectedType === 'warga' ? 'Contoh: Komunitas Sukabirus Asri' :
                      selectedType === 'mahasiswa' ? 'Contoh: Universitas Telkom' : 'Contoh: PT Telkom Akses'
                    }
                    required
                  />
                </div>
              </div>

              {/* Dynamic Field 2: Faculty / Sub-community / Division */}
              <div className="form-field-group">
                <label>
                  {selectedType === 'warga' && 'Lingkungan / RW / Kelurahan'}
                  {selectedType === 'mahasiswa' && 'Fakultas / Program Studi'}
                  {selectedType === 'karyawan' && 'Divisi / Unit Kerja'}
                </label>
                <div className="input-with-icon">
                  {selectedType === 'warga' && <MapPin size={16} className="input-icon" />}
                  {selectedType === 'mahasiswa' && <GraduationCap size={16} className="input-icon" />}
                  {selectedType === 'karyawan' && <Briefcase size={16} className="input-icon" />}
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    placeholder={
                      selectedType === 'warga' ? 'Contoh: RT 04 / RW 02 Dayeuhkolot' :
                      selectedType === 'mahasiswa' ? 'Contoh: Fakultas Informatika' : 'Contoh: Divisi HSE & Operasional'
                    }
                    required
                  />
                </div>
              </div>

              {/* Dynamic Field 3: Identifier (NIM, NIK, or ID Warga) */}
              <div className="form-field-group">
                <label>
                  {selectedType === 'warga' && 'Nomor Identitas Warga / KK (Opsional)'}
                  {selectedType === 'mahasiswa' && 'NIM (Nomor Induk Mahasiswa)'}
                  {selectedType === 'karyawan' && 'NIK (Nomor Induk Karyawan)'}
                </label>
                <div className="input-with-icon">
                  <ShieldCheck size={16} className="input-icon" />
                  <input
                    type="text"
                    value={formData.identifierNumber}
                    onChange={(e) => setFormData({ ...formData, identifierNumber: e.target.value })}
                    placeholder={
                      selectedType === 'warga' ? 'Opsional untuk validasi bansos lingkungan' :
                      selectedType === 'mahasiswa' ? 'Contoh: 1301223048' : 'Contoh: NIK-882910'
                    }
                  />
                </div>
              </div>

              {/* Field: Email */}
              <div className="form-field-group">
                <label>Alamat Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Field: WhatsApp */}
              <div className="form-field-group">
                <label>Nomor WhatsApp (Untuk Struk Digital)</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Field: Kota Domisili */}
              <div className="form-field-group">
                <label>Kota / Kabupaten Domisili</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Contoh: Kabupaten Bandung"
                    required
                  />
                </div>
              </div>

              {/* Field 8: Provinsi Domisili (Balances 2-column grid) */}
              <div className="form-field-group">
                <label>Provinsi Domisili</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="Contoh: Jawa Barat"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="profile-preferences-section">
              <h4 className="preferences-title">Preferensi Notifikasi</h4>
              <div className="preference-item">
                <div>
                  <strong>Notifikasi Transaksi Timbangan</strong>
                  <p>Kirimkan notifikasi segera setelah petugas Bank Sampah mengonfirmasi timbangan.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifTransaction}
                  onChange={(e) => setFormData({ ...formData, notifTransaction: e.target.checked })}
                  className="pref-checkbox"
                />
              </div>

              <div className="preference-item">
                <div>
                  <strong>Pembaruan Progres Kampanye</strong>
                  <p>Dapatkan laporan berkala tentang pencapaian target lingkungan bersama.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifCampaign}
                  onChange={(e) => setFormData({ ...formData, notifCampaign: e.target.checked })}
                  className="pref-checkbox"
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn btn-light-green">
                <Save size={16} /> Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
