# Catatan refinement frontend EcoLink

29 Oktober 2026

## Cakupan

Refinement mempertahankan dark green, Plus Jakarta Sans, susunan section, navigasi, penempatan kartu, dan fitur yang sudah ada. Sidebar pengguna tetap dipertahankan; dashboard organisasi dan bank tetap tanpa sidebar.

- Skala teks bersama: judul halaman desktop 30–34 px, judul section 18–22 px, judul kartu sekitar 17 px, body 14 px, teks sekunder 13 px, dan angka metrik 24–28 px.
- Padding, radius, tombol, kontras teks sekunder, fokus keyboard, serta jarak antarkartu diselaraskan melalui token yang ada di `src/index.css` dan helper di `src/styles/ui-utilities.css`.
- Dashboard organisasi mempertahankan header → empat metrik → kampanye → mitra. Dashboard bank memakai class CSS khusus untuk presentasi; handler transaksi dan verifikasi tetap sama.
- Landing page mempertahankan hero dan urutan section. Klaim social proof dan aktivitas statis diganti penjelasan alur; mockup, contoh kampanye, serta ilustrasi jaringan diberi label yang jelas.
- Login/register mempertahankan alur autentikasi, dengan role selector, input, label, dan error state yang dirapikan.
- Aturan padding mobile yang sebelumnya berlaku untuk semua elemen `section` dibatasi ke landing page agar panel dashboard tidak membesar.
- Modal nota mempertahankan tinggi isi tabel saat viewport pendek. Modal paspor membungkus ID panjang dan dapat digulir.

## Validasi

Pemeriksaan browser memakai Chrome headless dan API tiruan pada lapisan request browser. Tidak ada permintaan pengujian yang menulis data ke backend nyata.

| Pemeriksaan | Hasil |
| --- | --- |
| 19 route pada 1440, 1366, 1024, 768, 430, 390, dan 375 px | Route termuat, tanpa overflow horizontal yang terdeteksi |
| Pemeriksaan tampilan dan state awal | 154 pemeriksaan; tanpa error JavaScript |
| Pemeriksaan ulang desktop/mobile, modal, dan state setelah perbaikan | 59 pemeriksaan; tanpa overflow atau error JavaScript |
| Modal nota dan QR pada 375 × 568 px | Muat dalam viewport; isi tetap dapat digulir |
| Buat kampanye dan ubah status | Handler berjalan; payload yang dikirim tetap sesuai |
| Filter bank dan verifikasi transaksi | Handler berjalan; verifikasi tetap memakai konfirmasi dan request PUT |
| AI classifier → setoran | Upload, hasil klasifikasi, navigasi, dan payload setoran lolos |
| Login/register tiga role, role protection, logout | Pengalihan dan state autentikasi lolos |
| Menu publik dan sidebar mobile | Tautan bekerja dan drawer menutup setelah navigasi |
| `npm run build` | Berhasil; hanya warning ukuran bundle >500 kB |
| `npm run lint` | Tanpa error; lima warning yang sudah ada pada `CountUp` dan effect dashboard organisasi |

Route yang diperiksa:

`/`, `/login`, `/register`, `/campaigns`, `/campaigns/1`, `/waste-banks`, `/waste-banks/1`, `/about`, `/app`, `/app/passport`, `/app/missions`, `/app/transactions`, `/app/ai-classifier`, `/app/deposit`, `/app/campaigns`, `/app/rewards`, `/app/profile`, `/organization`, dan `/bank`.

Pengalihan `/dashboard`, akses tanpa login, dan akses dengan role berbeda juga diperiksa.

## Batas pemeriksaan

Pemeriksaan browser memvalidasi rendering dan alur frontend dengan data uji, bukan ketersediaan backend atau akurasi model AI produksi. Integrasi dengan layanan nyata tetap memerlukan backend yang berjalan.

Backend Go, database, migration, AI service, environment, `services/api.js`, konfigurasi route, serta dependency tidak diubah oleh refinement ini.
