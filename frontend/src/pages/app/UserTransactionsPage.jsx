import React, { useEffect, useMemo, useState } from 'react';

import {
  Search,
  ReceiptText,
  ShieldCheck,
  MapPin,
  X,
  Clock,
  Target,
  ChevronRight,
} from 'lucide-react';

import {
  getMyTransactions,
  getTransactionById,
} from '../../services/api';

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRupiah(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activeReceipt, setActiveReceipt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      try {
        const result = await getMyTransactions();

        if (!active) return;

        setTransactions(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'Gagal memuat riwayat transaksi.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTransactions();

    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const keyword =
        searchQuery.toLowerCase();

      const matchesSearch =
        String(tx.id)
          .toLowerCase()
          .includes(keyword) ||
        tx.waste_bank
          ?.toLowerCase()
          .includes(keyword) ||
        tx.campaign
          ?.toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === 'all' ||
        tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    transactions,
    searchQuery,
    statusFilter,
  ]);

  const verifiedTransactions =
    transactions.filter(
      (tx) => tx.status === 'verified'
    );

  const totalKg = verifiedTransactions.reduce(
    (total, tx) =>
      total + Number(tx.total_weight || 0),
    0
  );

  const totalValue =
    verifiedTransactions.reduce(
      (total, tx) =>
        total + Number(tx.total_value || 0),
      0
    );

  const totalEcoScore =
    Math.round(totalKg * 10);

  const openTransaction = async (id) => {
    setDetailLoading(true);
    setError('');

    try {
      const result =
        await getTransactionById(id);

      setActiveReceipt(result.data);
    } catch (err) {
      setError(
        err.message ||
          'Gagal memuat detail transaksi.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="user-transactions-page">

      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny">
            <ShieldCheck
              size={14}
              className="text-emerald"
            />

            <span>
              Jejak Audit Terverifikasi
            </span>
          </div>

          <h1 className="page-title">
            Riwayat Transaksi Penyetoran
          </h1>

          <p className="page-sub">
            Riwayat penyetoran sampah yang
            tercatat pada akun EcoLink kamu.
          </p>
        </div>
      </div>

      <div className="transactions-summary-strip">

        <div className="tx-summary-card">
          <span className="lbl">
            Transaksi Terverifikasi
          </span>

          <strong className="val">
            {verifiedTransactions.length}{' '}
            Transaksi
          </strong>

          <span className="sub text-emerald">
            Validasi Bank Sampah
          </span>
        </div>

        <div className="tx-summary-card">
          <span className="lbl">
            Total Sampah Terverifikasi
          </span>

          <strong className="val text-emerald">
            {totalKg.toFixed(1)} kg
          </strong>

          <span className="sub">
            Berdasarkan transaksi verified
          </span>
        </div>

        <div className="tx-summary-card">
          <span className="lbl">
            Total Nilai Transaksi
          </span>

          <strong className="val text-gold">
            Rp {formatRupiah(totalValue)}
          </strong>

          <span className="sub">
            Nilai material yang tercatat
          </span>
        </div>

        <div className="tx-summary-card">
          <span className="lbl">
            Eco Score
          </span>

          <strong className="val">
            {totalEcoScore}
          </strong>

          <span className="sub">
            Berdasarkan sampah terverifikasi
          </span>
        </div>

      </div>

      <div
        className="discovery-filter-box"
        style={{
          marginBottom: '2rem',
        }}
      >
        <div className="discovery-search-row">

          <div className="search-input-wrapper">

            <Search
              size={18}
              className="search-icon"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder="Cari ID, bank sampah, atau kampanye..."
              className="discovery-search-input"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery('')
                }
                className="clear-search-btn"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}

          </div>
        </div>

        <div className="material-filter-scroll">
          <span className="material-filter-label">
            Status:
          </span>

          <div className="material-filter-chips">

            {[
              ['all', 'Semua'],
              ['verified', 'Terverifikasi'],
              ['pending', 'Menunggu Verifikasi'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStatusFilter(value)
                }
                className={`filter-chip ${
                  statusFilter === value
                    ? 'active'
                    : ''
                }`}
              >
                {label}
              </button>
            ))}

          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '1rem',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="discovery-empty-state">
          <h4>
            Memuat transaksi...
          </h4>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="discovery-empty-state">

          <div className="empty-icon-box">
            <ReceiptText
              size={32}
              color="rgba(255,255,255,0.4)"
            />
          </div>

          <h4>
            Tidak Ada Transaksi
          </h4>

          <p>
            Belum ada transaksi yang sesuai
            dengan pencarian atau filter.
          </p>

        </div>
      ) : (
        <div className="transactions-stack">

          {filteredTransactions.map(
            (tx) => (
              <div
                key={tx.id}
                className="tx-full-card"
                onClick={() =>
                  openTransaction(tx.id)
                }
              >

                <div className="tx-full-header">

                  <div className="tx-id-badge-col">

                    <div className="tx-id-row">

                      <ReceiptText
                        size={18}
                        className="text-emerald"
                      />

                      <strong className="tx-code">
                        TRX-{tx.id}
                      </strong>

                      <span className="tx-pill-sah">
                        <ShieldCheck size={13} />
                        {tx.status === 'verified'
                          ? 'Terverifikasi'
                          : 'Menunggu Verifikasi'}
                      </span>

                    </div>

                    <span className="tx-time-text">
                      <Clock size={13} />
                      {formatDate(
                        tx.created_at
                      )}
                    </span>

                  </div>

                  <div className="tx-total-amounts">

                    <span className="tx-kg-pill">
                      {tx.total_weight} kg
                    </span>

                    <span className="tx-rp-pill">
                      Rp{' '}
                      {formatRupiah(
                        tx.total_value
                      )}
                    </span>

                  </div>
                </div>

                <div className="tx-full-body">

                  <div className="tx-bank-row">

                    <MapPin
                      size={15}
                      className="text-emerald shrink-0"
                    />

                    <strong>
                      {tx.waste_bank}
                    </strong>

                  </div>

                  {tx.campaign && (
                    <div className="tx-campaign-link-row">

                      <Target
                        size={14}
                        className="text-blue shrink-0"
                      />

                      <span>
                        Kampanye:{' '}
                        <strong>
                          {tx.campaign}
                        </strong>
                      </span>

                    </div>
                  )}

                </div>

                <div className="tx-full-footer">

                  <span className="tx-teller-info">
                    Status:{' '}
                    <strong>
                      {tx.status}
                    </strong>
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline btn-xs btn-open-receipt"
                  >
                    <span>
                      Lihat Detail
                    </span>

                    <ChevronRight
                      size={14}
                    />
                  </button>

                </div>
              </div>
            )
          )}

        </div>
      )}

      {detailLoading && (
        <div
          style={{
            marginTop: '1rem',
            opacity: 0.7,
          }}
        >
          Memuat detail transaksi...
        </div>
      )}

      {activeReceipt && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setActiveReceipt(null)
          }
        >
          <div
            className="tx-receipt-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="receipt-modal-header">

              <div>
                <span className="receipt-tag">
                  DETAIL TRANSAKSI ECOLINK
                </span>

                <h3 className="receipt-id">
                  TRX-{activeReceipt.transaction_id}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                aria-label="Tutup detail transaksi"
                onClick={() =>
                  setActiveReceipt(null)
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="receipt-modal-body">

              <div className="receipt-verified-banner">

                <ShieldCheck
                  size={20}
                  className="text-emerald"
                />

                <div>
                  <strong>
                    {activeReceipt.status ===
                    'verified'
                      ? 'Transaksi Terverifikasi'
                      : 'Menunggu Verifikasi'}
                  </strong>

                  <p>
                    Status transaksi:{' '}
                    {activeReceipt.status}
                  </p>
                </div>

              </div>

              <div className="receipt-info-grid">

                <div>
                  <span className="lbl">
                    Bank Sampah:
                  </span>

                  <strong>
                    {activeReceipt.waste_bank}
                  </strong>
                </div>

                <div>
                  <span className="lbl">
                    Waktu Transaksi:
                  </span>

                  <strong>
                    {formatDate(
                      activeReceipt.created_at
                    )}
                  </strong>
                </div>

              </div>

              {activeReceipt.campaign && (
                <div className="receipt-campaign-ref">

                  <Target
                    size={15}
                    className="text-emerald"
                  />

                  <span>
                    Kontribusi untuk:{' '}
                    <strong>
                      {activeReceipt.campaign}
                    </strong>
                  </span>

                </div>
              )}

              <div className="receipt-items-table">

                <div className="receipt-table-header">
                  <span>Material</span>
                  <span>Bobot</span>
                  <span className="text-right">
                    Harga/kg
                  </span>
                  <span className="text-right">
                    Subtotal
                  </span>
                </div>

                {activeReceipt.items.map(
                  (item) => (
                    <div
                      key={
                        item.waste_category_id
                      }
                      className="receipt-table-row"
                    >

                      <div>
                        <strong>
                          {
                            item.waste_category_name
                          }
                        </strong>
                      </div>

                      <span>
                        {item.weight} kg
                      </span>

                      <span className="text-right">
                        Rp{' '}
                        {formatRupiah(
                          item.unit_price
                        )}
                      </span>

                      <span className="text-right font-semibold">
                        Rp{' '}
                        {formatRupiah(
                          item.subtotal
                        )}
                      </span>

                    </div>
                  )
                )}

              </div>

              <div className="receipt-total-box">

                <div className="total-row">
                  <span>
                    Total Berat:
                  </span>

                  <strong>
                    {activeReceipt.total_weight}{' '}
                    kg
                  </strong>
                </div>

                <div className="total-row">
                  <span>
                    Eco Score:
                  </span>

                  <strong>
                    +
                    {Math.round(
                      activeReceipt.total_weight *
                        10
                    )}
                  </strong>
                </div>

                <div className="total-row grand-total">
                  <span>
                    Total Nilai:
                  </span>

                  <strong className="text-emerald">
                    Rp{' '}
                    {formatRupiah(
                      activeReceipt.total_value
                    )}
                  </strong>
                </div>

              </div>

            </div>

            <div className="receipt-modal-footer">

              <button
                type="button"
                className="btn btn-outline w-100 justify-center"
                onClick={() =>
                  setActiveReceipt(null)
                }
              >
                Tutup Detail
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
