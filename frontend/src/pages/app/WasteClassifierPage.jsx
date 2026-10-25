import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { classifyWasteImage } from '../../services/api';
import './WasteClassifierPage.css';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function WasteClassifierPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');

    if (!file.type.startsWith('image/') || file.size === 0) {
      setError('Pilih file gambar yang tidak kosong.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Ukuran foto maksimal 10 MB.');
      event.target.value = '';
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClassify = async () => {
    if (loading) return;
    if (!selectedFile) {
      setError('Pilih gambar terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await classifyWasteImage(selectedFile);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.');
    } finally {
      setLoading(false);
    }
  };

  const confidencePercentage = result ? (result.confidence * 100).toFixed(2) : null;

  return (
    <div className="waste-classifier-page">
      <div className="page-header-row">
        <div>
          <div className="inline-badge-tiny"><Sparkles size={14} /> AI EcoLink</div>
          <h1 className="page-title">Klasifikasi Sampah AI</h1>
          <p className="page-sub">Upload foto sampah untuk mendapatkan prediksi kategori dari AI EcoLink.</p>
        </div>
      </div>

      <div className="dash-card waste-classifier-panel">
        <div className="form-field-group">
          <label htmlFor="waste-image"><Upload size={16} /> Upload Foto Sampah</label>
          <input
            id="waste-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            aria-describedby="waste-image-help"
          />
          <p id="waste-image-help" className="dash-card-sub">Pilih satu foto sampah, maksimal 10 MB.</p>
        </div>

        {previewUrl ? (
          <figure className="waste-classifier-preview">
            <figcaption>Preview</figcaption>
            <img src={previewUrl} alt={`Pratinjau foto sampah: ${selectedFile.name}`} />
          </figure>
        ) : (
          <div className="waste-classifier-empty">
            <ImageIcon size={36} aria-hidden="true" />
            <p>Foto yang dipilih akan ditampilkan di sini.</p>
          </div>
        )}

        <button type="button" className="btn btn-light-green" onClick={handleClassify} disabled={loading}>
          <Sparkles size={16} />
          {loading ? 'Menganalisis...' : 'Klasifikasikan'}
        </button>
        {loading && <p role="status">AI sedang menganalisis foto sampah...</p>}

        {error && <div role="alert" className="waste-classifier-error">{error}</div>}

        {result && (
          <div className="waste-classifier-result" role="status">
            <h3>Hasil Prediksi</h3>
            <h2>{result.category}</h2>
            <p>Keyakinan AI: <strong>{confidencePercentage}%</strong></p>
            <p>Pastikan kategori sesuai dengan sampah sebelum melanjutkan setoran.</p>
            <button
              type="button"
              className="btn btn-light-green"
              onClick={() => navigate('/app/deposit', { state: { aiPrediction: result } })}
            >
              Gunakan untuk Setoran
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
