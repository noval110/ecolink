import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CheckCircle2,
  Clock,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import {
  getBankTransactions,
  getStoredUser,
  verifyTransaction,
} from '../../services/api';

function formatRupiah(value) {
  return Number(value || 0)
    .toLocaleString('id-ID');
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }
  ).format(date);
}

export default function BankDashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem('ecolink_token');
    localStorage.removeItem('ecolink_user');
    navigate('/login', { replace: true });
  };

  const [transactions, setTransactions] =
    useState([]);

  const [filter, setFilter] =
    useState('pending');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [verifyingId, setVerifyingId] =
    useState(null);
  const [success, setSuccess] = useState('');
  const latestRequest = useRef(0);

  const loadTransactions = useCallback((selectedStatus) => {
    const requestId = ++latestRequest.current;

    return getBankTransactions(selectedStatus)
      .then((result) => {
        if (requestId !== latestRequest.current) return;
        setTransactions(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        setError(err.message || 'Gagal memuat transaksi.');
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTransactions(filter);
    return () => {
      latestRequest.current += 1;
    };
  }, [filter, loadTransactions]);

  const reloadTransactions = async () => {
    setLoading(true);
    setError('');
    await loadTransactions(filter);
  };

  const handleFilterChange = (selectedStatus) => {
    if (selectedStatus === filter) return;
    setLoading(true);
    setError('');
    setFilter(selectedStatus);
  };

  const handleVerify = async (id) => {
    if (verifyingId !== null) return;
    const confirmed =
      window.confirm(
        `Verifikasi transaksi #${id}?`
      );

    if (!confirmed) return;

    setVerifyingId(id);
    setSuccess('');

    try {
      await verifyTransaction(id);
      setSuccess(`Transaksi #${id} berhasil diverifikasi.`);

      await reloadTransactions();
    } catch (err) {
      alert(
        err.message ||
          'Gagal memverifikasi transaksi.'
      );
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#031c12',
        color: 'white',
        padding: 'clamp(1rem, 4vw, 3rem)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >

        <div className="inline-badge-tiny">
          <ShieldCheck size={14} />
          <span>
            Bank Sampah EcoLink
          </span>
        </div>

        <h1
          style={{
            marginTop: '1rem',
            marginBottom: '.5rem',
          }}
        >
          Dashboard Bank Sampah
        </h1>

        <p>
          Selamat datang,{' '}
          <strong>
            {user?.full_name ||
              user?.name ||
              'Petugas Bank Sampah'}
          </strong>
        </p>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleLogout}
          style={{ marginTop: '1.25rem' }}
        >
          Keluar Akun
        </button>

        <div
          className="dash-card"
          style={{
            marginTop: '2rem',
          }}
        >
          <div className="dash-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>

            <div>
              <h3 className="dash-card-title">
                Verifikasi Transaksi
              </h3>

              <span className="dash-card-sub">
                Transaksi penyetoran yang
                terhubung dengan bank
                sampahmu.
              </span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={loading || verifyingId !== null}
              onClick={reloadTransactions}
            >
              <RefreshCw size={14} />
              Refresh
            </button>

          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '.75rem',
              margin:
                '1.5rem 0',
            }}
          >
            <button
              type="button"
              disabled={verifyingId !== null}
              aria-pressed={filter === 'pending'}
              className={`filter-chip ${
                filter === 'pending'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleFilterChange('pending')
              }
            >
              Pending
            </button>

            <button
              type="button"
              disabled={verifyingId !== null}
              aria-pressed={filter === 'verified'}
              className={`filter-chip ${
                filter === 'verified'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleFilterChange('verified')
              }
            >
              Verified
            </button>

            <button
              type="button"
              disabled={verifyingId !== null}
              aria-pressed={filter === ''}
              className={`filter-chip ${
                filter === ''
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleFilterChange('')
              }
            >
              Semua
            </button>
          </div>

          {success && <p role="status">{success}</p>}

          {loading ? (
            <p role="status">
              Memuat transaksi...
            </p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : transactions.length === 0 ? (
            <div
              className="discovery-empty-state"
              style={{
                marginTop: '1rem',
              }}
            >
              <ReceiptText size={30} />

              <h4>
                Tidak Ada Transaksi
              </h4>

              <p>
                {filter
                  ? `Belum ada transaksi dengan status ${filter}.`
                  : 'Belum ada transaksi di bank sampahmu.'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
              }}
            >
              {transactions.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      border:
                        '1px solid rgba(255,255,255,.1)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      background:
                        'rgba(0,0,0,.15)',
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
                        <strong
                          style={{
                            fontSize:
                              '1.05rem',
                          }}
                        >
                          Transaksi #
                          {transaction.id}
                        </strong>

                        <p>
                          {
                            transaction.user_name
                          }
                        </p>
                      </div>

                      <span
                        className={
                          transaction.status ===
                          'verified'
                            ? 'status-unlocked-text'
                            : 'badge-in-progress'
                        }
                      >
                        {transaction.status ===
                        'verified' ? (
                          <CheckCircle2
                            size={14}
                          />
                        ) : (
                          <Clock
                            size={14}
                          />
                        )}

                        {transaction.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(160px, 100%), 1fr))',
                        gap: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      <div>
                        <small>
                          Berat
                        </small>
                        <div>
                          <strong>
                            {
                              transaction.total_weight
                            }{' '}
                            kg
                          </strong>
                        </div>
                      </div>

                      <div>
                        <small>
                          Nilai
                        </small>
                        <div>
                          <strong>
                            Rp{' '}
                            {formatRupiah(
                              transaction.total_value
                            )}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <small>
                          Kampanye
                        </small>
                        <div>
                          <strong>
                            {transaction.campaign_title ||
                              '-'}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <small>
                          Dibuat
                        </small>
                        <div>
                          {formatDate(
                            transaction.created_at
                          )}
                        </div>
                      </div>
                    </div>

                    {transaction.status ===
                      'pending' && (
                      <button
                        type="button"
                        className="btn btn-light-green"
                        style={{
                          marginTop:
                            '1.25rem',
                        }}
                        disabled={
                          verifyingId !== null
                        }
                        onClick={() =>
                          handleVerify(
                            transaction.id
                          )
                        }
                      >
                        <ShieldCheck
                          size={15}
                        />

                        {verifyingId ===
                        transaction.id
                          ? 'Memverifikasi...'
                          : 'Verifikasi Transaksi'}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
