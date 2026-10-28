import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, RotateCcw, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { classifyWasteImage } from '../../services/api';
import './WasteClassifierPage.css';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_CAPTURE_DIMENSION = 1600;

function cameraErrorMessage(error) {
  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Izin kamera ditolak atau diblokir. Izinkan kamera di pengaturan browser, atau gunakan Upload Foto.';
    case 'NotFoundError':
      return 'Kamera tidak ditemukan. Gunakan Upload Foto atau coba kamera perangkat.';
    case 'NotReadableError':
      return 'Kamera tidak dapat dibuka. Tutup aplikasi lain yang menggunakan kamera, lalu coba lagi.';
    default:
      return 'Kamera langsung tidak dapat dibuka. Gunakan kamera perangkat atau Upload Foto.';
  }
}

export default function WasteClassifierPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraState, setCameraState] = useState('closed');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraFallback, setCameraFallback] = useState(false);
  const [imageSource, setImageSource] = useState('upload');
  const uploadInputRef = useRef(null);
  const captureInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRequestRef = useRef(0);
  const cameraOpen = cameraState !== 'closed';

  const stopCamera = useCallback(() => {
    // Invalidate pending permission requests and image conversions as well.
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setCameraState('closed');
    setCameraReady(false);
  }, [stopCamera]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) closeCamera();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', closeCamera);
    return () => {
      stopCamera();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', closeCamera);
    };
  }, [closeCamera, stopCamera]);

  useEffect(() => {
    if (cameraState !== 'live' || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const requestId = cameraRequestRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {
      if (requestId !== cameraRequestRef.current) return;
      closeCamera();
      setCameraFallback(true);
      setError('Preview kamera tidak dapat diputar. Gunakan kamera perangkat atau Upload Foto.');
    });
    return () => {
      video.srcObject = null;
    };
  }, [cameraState, closeCamera]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectImage = (file, source) => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    setCameraFallback(false);

    if (!file.type.startsWith('image/') || file.size === 0) {
      setError('Pilih file gambar yang tidak kosong.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Ukuran foto maksimal 10 MB.');
      return;
    }
    setImageSource(source);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event, source = 'upload') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || loading) return;
    closeCamera();
    selectImage(file, source);
  };

  const openUpload = () => {
    closeCamera();
    uploadInputRef.current?.click();
  };

  const openDeviceCamera = () => {
    closeCamera();
    captureInputRef.current?.click();
  };

  const openCamera = async () => {
    if (loading || cameraOpen) return;
    setError('');
    setResult(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraFallback(true);
      setError('Kamera langsung tidak tersedia di browser ini. Gunakan kamera perangkat atau Upload Foto.');
      // Keep this synchronous with the click so mobile browsers can open it.
      openDeviceCamera();
      return;
    }

    stopCamera();
    const requestId = cameraRequestRef.current;
    setCameraFallback(false);
    setCameraReady(false);
    setCameraState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (requestId !== cameraRequestRef.current || document.hidden) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraState('live');
    } catch (err) {
      if (requestId !== cameraRequestRef.current) return;
      closeCamera();
      setCameraFallback(true);
      setError(cameraErrorMessage(err));
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (cameraState !== 'live' || !cameraReady || !video?.videoWidth || !video.videoHeight) return;
    let requestId = cameraRequestRef.current;
    setError('');
    try {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, MAX_CAPTURE_DIMENSION / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
      canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Gagal menyiapkan foto. Silakan coba lagi.');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // The frame is already on canvas; release the camera before encoding.
      stopCamera();
      requestId = cameraRequestRef.current;
      setCameraReady(false);
      setCameraState('capturing');
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (requestId !== cameraRequestRef.current) return;
      if (!blob) throw new Error('Foto tidak dapat disimpan. Silakan ambil foto ulang.');
      const file = new File([blob], `ecolink-camera-${Date.now()}.jpg`, { type: blob.type });
      setCameraState('closed');
      selectImage(file, 'camera');
    } catch (err) {
      if (requestId !== cameraRequestRef.current) return;
      closeCamera();
      setError(err.message || 'Gagal mengambil foto. Silakan coba lagi.');
    }
  };

  const handleClassify = async () => {
    if (loading || cameraOpen) return;
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
          <p className="page-sub">Upload atau ambil foto sampah untuk mendapatkan prediksi kategori dari AI EcoLink.</p>
        </div>
      </div>

      <div className="dash-card waste-classifier-panel">
        <div className="form-field-group">
          <label htmlFor="waste-image">Foto Sampah</label>
          <div className="waste-classifier-source-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={openUpload} disabled={loading || cameraState === 'capturing'}>
              <Upload size={16} aria-hidden="true" /> Upload Foto
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={openCamera} disabled={loading || cameraOpen}>
              <Camera size={16} aria-hidden="true" /> Ambil Foto
            </button>
          </div>
          <input
            id="waste-image"
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            aria-describedby="waste-image-help"
            hidden
          />
          <input
            ref={captureInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="Ambil foto dengan kamera perangkat"
            onChange={(event) => handleFileChange(event, 'camera')}
            disabled={loading}
            hidden
          />
          <p id="waste-image-help" className="dash-card-sub">Pilih satu foto sampah, maksimal 10 MB.</p>
        </div>

        {cameraOpen ? (
          <figure className="waste-classifier-preview">
            <figcaption>Preview Kamera</figcaption>
            <video
              ref={videoRef}
              className="waste-classifier-camera"
              autoPlay
              playsInline
              muted
              aria-label="Preview kamera untuk foto sampah"
              onCanPlay={() => {
                if (streamRef.current && videoRef.current?.videoWidth) setCameraReady(true);
              }}
            />
            {(cameraState === 'starting' || cameraState === 'capturing') && (
              <p className="dash-card-sub" role="status">
                {cameraState === 'starting' ? 'Menunggu izin dan menyiapkan kamera...' : 'Menyiapkan foto...'}
              </p>
            )}
            <div className="waste-classifier-camera-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={takePhoto} disabled={!cameraReady || cameraState !== 'live'}>
                <Camera size={16} aria-hidden="true" /> Ambil Foto
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={closeCamera}>
                <X size={16} aria-hidden="true" /> Tutup Kamera
              </button>
            </div>
          </figure>
        ) : previewUrl ? (
          <figure className="waste-classifier-preview">
            <figcaption>Preview</figcaption>
            <img src={previewUrl} alt={`Pratinjau foto sampah: ${selectedFile.name}`} />
            {imageSource === 'camera' && (
              <div className="waste-classifier-camera-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={openCamera} disabled={loading}>
                  <RotateCcw size={16} aria-hidden="true" /> Foto Ulang
                </button>
              </div>
            )}
          </figure>
        ) : (
          <div className="waste-classifier-empty">
            <ImageIcon size={36} aria-hidden="true" />
            <p>Foto yang dipilih akan ditampilkan di sini.</p>
          </div>
        )}

        <button type="button" className="btn btn-light-green" onClick={handleClassify} disabled={loading || cameraOpen}>
          <Sparkles size={16} />
          {loading ? 'Menganalisis...' : 'Klasifikasikan'}
        </button>
        {loading && <p role="status">AI sedang menganalisis foto sampah...</p>}

        {error && <div role="alert" className="waste-classifier-error">{error}</div>}
        {cameraFallback && (
          <button type="button" className="btn btn-outline btn-sm" onClick={openDeviceCamera} disabled={loading}>
            <Camera size={16} aria-hidden="true" /> Buka Kamera Perangkat
          </button>
        )}

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
