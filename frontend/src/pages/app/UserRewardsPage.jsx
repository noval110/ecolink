import React, {
  useEffect,
  useState,
} from 'react';

import {
  Gift,
  Award,
  ShieldCheck,
  Clock,
  Leaf,
} from 'lucide-react';

import {
  getDashboard,
} from '../../services/api';

export default function UserRewardsPage() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const result =
          await getDashboard();

        if (!active) return;
        if (!result.data) throw new Error('Data akun tidak tersedia.');
        setDashboard(result.data);
      } catch (err) {
        if (!active) return;
        setError(
          err.message ||
            'Gagal memuat data akun.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="user-rewards-page" role="status">
        <h3>Memuat data...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-rewards-page">
        <h3>
          Data tidak dapat dimuat
        </h3>

        <p role="alert">{error}</p>
      </div>
    );
  }

  const ecoScore =
    dashboard?.stats?.eco_score ?? 0;

  const totalRecycled =
    dashboard?.stats?.total_recycled ?? 0;

  return (
    <div className="user-rewards-page">

      <div className="page-header-row">

        <div>

          <div className="inline-badge-tiny">
            <Gift
              size={14}
              className="text-emerald"
            />

            <span>
              Rewards EcoLink
            </span>
          </div>

          <h1 className="page-title">
            Hadiah & Eco Score
          </h1>

          <p className="page-sub">
            Eco Score mencerminkan
            aktivitas daur ulang
            terverifikasi yang tercatat
            di EcoLink.
          </p>

        </div>

        <div className="rewards-balance-pill">

          <div className="r-icon-box">
            <Award
              size={22}
              className="text-gold"
            />
          </div>

          <div>

            <span className="r-lbl">
              Eco Score
            </span>

            <div className="r-val-row">

              <strong className="r-val">
                {ecoScore}
              </strong>

              <span className="r-unit">
                score
              </span>

            </div>

          </div>

        </div>

      </div>

      <div
        className="dash-card"
        style={{
          marginBottom: '1.5rem',
        }}
      >

        <div className="dash-card-header">

          <div>

            <h3 className="dash-card-title">
              Status Rewards
            </h3>

            <span className="dash-card-sub">
              Sistem penukaran hadiah
              belum diaktifkan.
            </span>

          </div>

        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >

          <div className="eco-eq-card">

            <div className="eq-icon-box">
              <Award size={22} />
            </div>

            <div>
              <strong className="eq-value">
                {ecoScore}
              </strong>

              <span className="eq-title">
                Eco Score
              </span>

              <p className="eq-desc">
                Dihitung dari aktivitas
                daur ulang yang sudah
                diverifikasi.
              </p>
            </div>

          </div>

          <div className="eco-eq-card">

            <div className="eq-icon-box">
              <Leaf size={22} />
            </div>

            <div>
              <strong className="eq-value">
                {totalRecycled} kg
              </strong>

              <span className="eq-title">
                Total Daur Ulang
              </span>

              <p className="eq-desc">
                Berat sampah dari
                transaksi terverifikasi.
              </p>
            </div>

          </div>

        </div>

      </div>

      <div className="dash-card">

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >

          <ShieldCheck
            size={26}
            className="text-emerald"
          />

          <div>

            <h3 className="dash-card-title">
              Penukaran Hadiah Belum Aktif
            </h3>

            <p
              style={{
                marginTop: '.5rem',
                maxWidth: '700px',
              }}
            >
              Eco Score saat ini belum
              digunakan sebagai saldo yang
              dapat dibelanjakan. Fitur
              katalog hadiah dan riwayat
              penukaran masih dalam
              pengembangan.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                marginTop: '1rem',
              }}
            >
              <Clock size={16} />

              <span>
                Fitur dalam pengembangan
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
