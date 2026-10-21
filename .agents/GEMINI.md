# EcoLink Project Guidebook & Rules

## BAGIAN 01: Arah Produk dan Definisi
EcoLink adalah platform kolaborasi pengelolaan sampah yang menghubungkan individu, organisasi/komunitas, dan bank sampah. Setiap aksi daur ulang dicatat melalui transaksi terverifikasi sehingga dapat membentuk Eco Passport pribadi sekaligus berkontribusi pada target campaign bersama.

### Masalah yang ingin diselesaikan
- Masyarakat/mahasiswa tidak selalu tahu bank sampah terdekat, jenis sampah yang diterima, harga, dan proses penyetoran.
- Aktivitas daur ulang sering berhenti sebagai transaksi individual dan belum terhubung dengan campaign komunitas yang terukur.
- Dampak lingkungan sering hanya berupa klaim; EcoLink mengutamakan impact yang berasal dari transaksi yang diverifikasi bank sampah.
- Organisasi/kampus membutuhkan cara sederhana untuk menjalankan campaign, memantau partisipasi, dan melihat dampak kolektif.

### Tiga Fitur Identitas EcoLink
1. **Verified Impact**: Impact hanya lahir dari transaksi bank sampah yang valid.
2. **Collaborative Campaign**: Kontribusi user otomatis masuk ke target campaign dan analytics organisasi.
3. **Eco Passport**: Profil digital berisi riwayat aksi, score, badge, campaign, dan total dampak terverifikasi.

### Acuan Lomba (UINIC 8.0 2026)
- Tema menekankan solusi web yang saling terhubung, pertukaran data, API, database relasional, keamanan, dan arsitektur yang kokoh.
- Website harus dapat diakses online, repository aktif, dan dilengkapi dokumentasi kode serta panduan penggunaan.
- Penilaian penyisihan menempatkan inovasi/relevansi sebagai bobot terbesar, kemudian kebutuhan pengguna, kualitas teknis, UI/UX, dan dokumentasi.

## BAGIAN 04: Scope yang Harus Dibuat
Scope final dipisahkan menjadi 5 bagian:
1. **Public Site**: Landing Page, Explore Campaigns, Campaign Detail, Waste Bank Discovery, Waste Bank Detail, About, Login & Register.
2. **User App**: Overview Dashboard, Eco Passport, Campaigns, Waste Banks, Transaction History, Missions & Badges, Profile & Settings.
3. **Waste Bank App**: Dashboard operasional, Scan Eco Passport, Create Transaction, Verify Transaction, Transactions, Materials & Pricing, Campaign Partnerships, Analytics.
4. **Organization App**: Dashboard, Create/Edit Campaign, Campaign Analytics, Participants, Partners, Report.
5. **Admin**: Verify waste bank/organization, Manage waste categories, Moderate campaign, System overview.

## BAGIAN 05: Landing Page Requirements
Halaman Landing Page harus membuat orang paham EcoLink dalam 5-30 detik.
Urutan Section:
1. **Navigation**: Logo, Impact, Campaigns, Waste Banks, About, Sign In, Get Started.
2. **Hero**: Headline "Recycling shouldn't end at the bin." Subheadline menjelaskan jaringan user-community-waste bank. CTA utama dan CTA kedua.
3. **Live Impact Metrics**: Total kg recycled, verified contributors, communities.
4. **How EcoLink Works**: 4 langkah (temukan -> setor -> verifikasi -> impact).
5. **Verified Impact Story**: Flow user -> waste bank -> verified transaction.
6. **Featured Campaigns**: 2-4 campaign pilihan dengan progress bar.
7. **Eco Passport Preview**: Contoh public impact profile dan QR.
8. **Waste Bank Network**: Map/list partner waste bank.
9. **For Organizations**: Value untuk BEM/kampus/komunitas.
10. **Transparency / Trust**: Data verification, security, methodology.
11. **Final CTA**: "Make your next recycling action count."
12. **Footer**: Product, resources, contact, legal.

## Aturan Arah Visual (CRITICAL RULES)
- **Tipografi**: Hierarchy kuat, mengutamakan data yang penting.
- **State Wajib**: Setiap halaman wajib memiliki loading state, empty state, error state, success feedback, keyboard focus, dan responsive mobile.

## Tes 30 Detik Landing Page
Pengunjung harus bisa menjawab:
- EcoLink itu apa?
- Siapa yang menggunakannya?
- Bagaimana sebuah setoran menjadi impact?
- Apa bedanya dengan aplikasi bank sampah biasa?
- Apa yang harus diklik berikutnya?
