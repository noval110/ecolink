import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createTransaction, getWasteBanks, getMyCampaigns } from '../../services/api';
import './DepositPage.css';

function responseItems(result) {
  return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
}

export default function DepositPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const aiPrediction = location.state?.aiPrediction || null;
  const categoryId = Number(aiPrediction?.waste_category_id);
  const hasPrediction = Number.isSafeInteger(categoryId) && categoryId > 0 && Boolean(aiPrediction?.category);

  const [wasteBanks, setWasteBanks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [wasteBankId, setWasteBankId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [pageError, setPageError] = useState('');
  const [error, setError] = useState('');
  const [createdTransaction, setCreatedTransaction] = useState(null);

  useEffect(() => {
    if (!hasPrediction) return;
    let active = true;
    const loadData = async () => {
      try {
        const [bankResult, campaignResult] = await Promise.all([getWasteBanks(), getMyCampaigns()]);
        if (!active) return;
        setWasteBanks(responseItems(bankResult));
        setCampaigns(responseItems(campaignResult).filter((campaign) => {
          const status = campaign.status || campaign.campaign_status;
          return !status || status === 'active';
        }));
      } catch (err) {
        if (active) setPageError(err.message || 'Gagal memuat data setoran.');
      } finally {
        if (active) setPageLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [hasPrediction, loadAttempt]);

  useEffect(() => {
    if (!createdTransaction) return;
    const timer = setTimeout(() => {
      navigate('/app/transactions', { replace: true, state: { createdTransaction } });
    }, 1200);
    return () => clearTimeout(timer);
  }, [createdTransaction, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || createdTransaction || pageLoading || pageError) return;
    setError('');
    if (!hasPrediction) {
      setError('Lakukan klasifikasi sampah terlebih dahulu.');
      return;
    }
    if (!wasteBankId) {
      setError('Pilih bank sampah.');
      return;
    }
    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      setError('Berat sampah harus lebih dari 0 kg.');
      return;
    }
    const payload = {
      waste_bank_id: Number(wasteBankId),
      campaign_id: campaignId ? Number(campaignId) : null,
      items: [{ waste_category_id: categoryId, weight: numericWeight }],
    };
    setLoading(true);
    try {
      const result = await createTransaction(payload);
      setCreatedTransaction(result?.data || result);
    } catch (err) {
      setError(err.message || 'Gagal membuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const confidence = aiPrediction ? (Number(aiPrediction.confidence) * 100).toFixed(2) : null;
  const submitted = Boolean(createdTransaction);

  return (
    <div className="deposit-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Setor Sampah</h1>
          <p className="page-sub">Lengkapi informasi setoran sebelum dikirim ke Bank Sampah.</p>
        </div>
      </div>

      {!hasPrediction ? (
        <div className="dash-card deposit-empty">
          <h2>Belum ada hasil klasifikasi</h2>
          <p>Gunakan AI Classifier terlebih dahulu untuk menentukan kategori sampah.</p>
          <button type="button" className="btn btn-light-green" onClick={() => navigate('/app/ai-classifier')}>
            Buka AI Classifier
          </button>
        </div>
      ) : pageLoading ? (
        <p role="status">Memuat data setoran...</p>
      ) : pageError ? (
        <div className="dash-card deposit-empty">
          <p role="alert" className="deposit-error">{pageError}</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setPageLoading(true);
              setPageError('');
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="dash-card">
          <div className="deposit-prediction">
            <span>Hasil klasifikasi AI</span>
            <h2>{aiPrediction.category}</h2>
            <p>Keyakinan AI: <strong>{confidence}%</strong></p>
            <button
              type="button"
              className="btn btn-sm deposit-reclassify"
              disabled={loading || submitted}
              onClick={() => navigate('/app/ai-classifier')}
            >
              Klasifikasi Ulang
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="deposit-fields" disabled={loading || submitted}>
              <div className="form-field-group">
                <label htmlFor="deposit-bank">Bank Sampah</label>
                <select id="deposit-bank" value={wasteBankId} onChange={(event) => setWasteBankId(event.target.value)} required>
                  <option value="">Pilih Bank Sampah</option>
                  {wasteBanks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                </select>
                {wasteBanks.length === 0 && <p>Belum ada bank sampah yang tersedia.</p>}
              </div>

              <div className="form-field-group">
                <label htmlFor="deposit-campaign">Kampanye (opsional)</label>
                <select id="deposit-campaign" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
                  <option value="">Tanpa kampanye</option>
                  {campaigns.map((campaign) => {
                    const id = campaign.id || campaign.campaign_id;
                    return <option key={id} value={id}>{campaign.title || campaign.campaign_title}</option>;
                  })}
                </select>
                <p className="dash-card-sub">Kampanye aktif yang Anda ikuti.</p>
              </div>

              <div className="form-field-group">
                <label htmlFor="deposit-weight">Berat Sampah (kg)</label>
                <input
                  id="deposit-weight"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="Contoh: 1.2"
                  required
                />
              </div>
            </fieldset>

            {error && <p role="alert" className="deposit-error">{error}</p>}
            {submitted && (
              <p role="status" className="deposit-success">
                Setoran berhasil dibuat dan menunggu verifikasi Bank Sampah.
              </p>
            )}
            <button type="submit" className="btn btn-light-green" disabled={loading || submitted || wasteBanks.length === 0}>
              {submitted ? 'Setoran Terkirim' : loading ? 'Membuat Setoran...' : 'Kirim Setoran'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
