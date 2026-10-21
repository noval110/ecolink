// Centralized Mock Data & State Management for EcoLink User Portal (Masyarakat Umum, Mahasiswa, Karyawan)

export const USER_PROFILES = {
  mahasiswa: {
    id: 'usr-101',
    profileType: 'mahasiswa', // mahasiswa | warga | karyawan
    name: 'Budi Santoso',
    email: 'budi.santoso@student.telkomuniversity.ac.id',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    categoryLabel: 'Mahasiswa / Pelajar',
    role: 'Mahasiswa',
    institution: 'Universitas Telkom',
    faculty: 'Fakultas Informatika',
    affiliationDetail: 'Fakultas Informatika • Universitas Telkom',
    identifierNumber: '1301223048', // NIM
    identifierLabel: 'NIM (Nomor Induk Mahasiswa)',
    phone: '+62 812-3456-7890',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    joinDate: '12 Januari 2026',
    passportId: 'ECO-9823-XYZ',
    passportQrData: 'ECOLINK:USR-101:BUDI_SANTOSO:MAHASISWA:VERIFIED',
    level: 4,
    levelTitle: 'Pelopor Hijau (Eco Pioneer)',
    currentXp: 485,
    nextLevelXp: 600,
    totalRecycledKg: 48.5,
    co2SavedKg: 72.8,
    waterSavedLiter: 1240,
    points: 1450,
    rupiahEarned: 248500,
    activeCampaignsCount: 2,
    completedTransactionsCount: 7,
    badgesCount: 5,
  },
  warga: {
    id: 'usr-102',
    profileType: 'warga',
    name: 'Ibu Ratna Dewi',
    email: 'ratna.dewi.bandung@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    categoryLabel: 'Masyarakat Umum / Warga Mandiri',
    role: 'Warga Peduli Lingkungan',
    institution: 'Komunitas Warga Sukabirus Asri',
    faculty: 'RT 04 / RW 02 Dayeuhkolot',
    affiliationDetail: 'Komunitas Peduli Lingkungan RT 04 Sukabirus',
    identifierNumber: 'KK-3204-88910', // No ID Warga / RT
    identifierLabel: 'Nomor Identitas Warga / RT',
    phone: '+62 813-8821-4455',
    city: 'Kabupaten Bandung',
    province: 'Jawa Barat',
    joinDate: '05 Februari 2026',
    passportId: 'ECO-5104-WRG',
    passportQrData: 'ECOLINK:USR-102:RATNA_DEWI:WARGA_UMUM:VERIFIED',
    level: 5,
    levelTitle: 'Pejuang Daur Ulang Lingkungan',
    currentXp: 720,
    nextLevelXp: 900,
    totalRecycledKg: 78.2,
    co2SavedKg: 115.4,
    waterSavedLiter: 2450,
    points: 2180,
    rupiahEarned: 412000,
    activeCampaignsCount: 2,
    completedTransactionsCount: 11,
    badgesCount: 7,
  },
  karyawan: {
    id: 'usr-103',
    profileType: 'karyawan',
    name: 'Hendra Wijaya',
    email: 'hendra.wijaya@telkomakses.co.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    categoryLabel: 'Pegawai / Komunitas Perusahaan',
    role: 'Senior Engineer & Satgas Hijau',
    institution: 'PT Telkom Akses Regional III',
    faculty: 'Divisi Operasional & HSE Ramah Lingkungan',
    affiliationDetail: 'Divisi HSE Ramah Lingkungan • PT Telkom Akses',
    identifierNumber: 'NIK-882910', // NIK Karyawan
    identifierLabel: 'NIK (Nomor Induk Karyawan)',
    phone: '+62 821-9988-1122',
    city: 'Kota Bandung',
    province: 'Jawa Barat',
    joinDate: '20 Februari 2026',
    passportId: 'ECO-7741-CORP',
    passportQrData: 'ECOLINK:USR-103:HENDRA_WIJAYA:KARYAWAN:VERIFIED',
    level: 4,
    levelTitle: 'Duta Keberlanjutan Kantor',
    currentXp: 510,
    nextLevelXp: 600,
    totalRecycledKg: 64.0,
    co2SavedKg: 94.6,
    waterSavedLiter: 920,
    points: 1890,
    rupiahEarned: 326000,
    activeCampaignsCount: 3,
    completedTransactionsCount: 9,
    badgesCount: 6,
  }
};

// Helper to get active user (defaults to mahasiswa or saved preference)
export const getActiveUser = () => {
  try {
    const savedKey = localStorage.getItem('ecolink_user_profile_type');
    const profileKey = (savedKey && USER_PROFILES[savedKey]) ? savedKey : 'mahasiswa';
    const profile = { ...USER_PROFILES[profileKey] };

    // Overlay points if updated in localStorage
    const savedPoints = localStorage.getItem(`ecolink_points_${profile.id}`);
    if (savedPoints !== null) {
      profile.points = parseInt(savedPoints, 10);
    }
    return profile;
  } catch (e) {
    return USER_PROFILES.mahasiswa;
  }
};

export const switchUserProfile = (typeKey) => {
  if (USER_PROFILES[typeKey]) {
    localStorage.setItem('ecolink_user_profile_type', typeKey);
    window.dispatchEvent(new Event('ecolink_profile_changed'));
    return USER_PROFILES[typeKey];
  }
  return USER_PROFILES.mahasiswa;
};

export const CURRENT_USER = getActiveUser();

export const USER_TRANSACTIONS = [
  {
    id: 'TX-2026-0891',
    date: '18 Okt 2026, 14:20 WIB',
    bankName: 'Bank Sampah Berseri Sukabirus',
    bankAddress: 'Jl. Sukabirus No. 12, Dayeuhkolot, Bandung',
    tellerName: 'Pak Rahmat (Petugas Resmi)',
    campaignName: 'Bebas Plastik Kampus Telkom & Dayeuhkolot',
    campaignId: 'c1',
    status: 'Terverifikasi Sah',
    verificationCode: 'VRF-BSB-883921',
    totalKg: 8.4,
    pointsEarned: 84,
    rupiahAmount: 37800,
    items: [
      { name: 'Botol Plastik PET Bening', category: 'Plastik', weightKg: 5.2, pricePerKg: 4500, subtotal: 23400 },
      { name: 'Gelas Plastik PP Bersih', category: 'Plastik', weightKg: 3.2, pricePerKg: 4500, subtotal: 14400 }
    ],
    notes: 'Kondisi botol bersih dan sudah dipipihkan. Tutup botol dipilah terpisah.'
  },
  {
    id: 'TX-2026-0842',
    date: '12 Okt 2026, 10:45 WIB',
    bankName: 'Bank Sampah Berseri Sukabirus',
    bankAddress: 'Jl. Sukabirus No. 12, Dayeuhkolot, Bandung',
    tellerName: 'Bu Siti (Petugas Resmi)',
    campaignName: 'Bebas Plastik Kampus Telkom & Dayeuhkolot',
    campaignId: 'c1',
    status: 'Terverifikasi Sah',
    verificationCode: 'VRF-BSB-772109',
    totalKg: 14.6,
    pointsEarned: 116,
    rupiahAmount: 32120,
    items: [
      { name: 'Kardus Cokelat Tebal', category: 'Kertas', weightKg: 10.4, pricePerKg: 2200, subtotal: 22880 },
      { name: 'Kertas HVS Bekas Modul & Dokumen', category: 'Kertas', weightKg: 4.2, pricePerKg: 2200, subtotal: 9240 }
    ],
    notes: 'Kardus terikat rapi dan kering sempurna.'
  },
  {
    id: 'TX-2026-0799',
    date: '04 Okt 2026, 15:10 WIB',
    bankName: 'Bank Sampah Resik Jogja',
    bankAddress: 'Jl. Kaliurang Km 5.2 No. 18, Sleman, Yogyakarta',
    tellerName: 'Mas Agus (Petugas Resmi)',
    campaignName: 'Sedekah Jelantah Berkah Dapur Yogyakarta',
    campaignId: 'c4',
    status: 'Terverifikasi Sah',
    verificationCode: 'VRF-BSR-663842',
    totalKg: 9.5,
    pointsEarned: 237,
    rupiahAmount: 76000,
    items: [
      { name: 'Minyak Jelantah Dapur Disaring', category: 'Minyak', weightKg: 9.5, pricePerKg: 8000, subtotal: 76000 }
    ],
    notes: 'Minyak jelantah jernih tanpa remahan dan disimpan dalam jeriken tertutup rapat.'
  },
  {
    id: 'TX-2026-0731',
    date: '25 Sep 2026, 11:30 WIB',
    bankName: 'Bank Sampah Berseri Sukabirus',
    bankAddress: 'Jl. Sukabirus No. 12, Dayeuhkolot, Bandung',
    tellerName: 'Pak Rahmat (Petugas Resmi)',
    campaignName: 'Bebas Plastik Kampus Telkom & Dayeuhkolot',
    campaignId: 'c1',
    status: 'Terverifikasi Sah',
    verificationCode: 'VRF-BSB-551980',
    totalKg: 7.2,
    pointsEarned: 72,
    rupiahAmount: 32400,
    items: [
      { name: 'Botol Plastik PET', category: 'Plastik', weightKg: 7.2, pricePerKg: 4500, subtotal: 32400 }
    ],
    notes: 'Penyetoran rutin mingguan material daur ulang.'
  },
  {
    id: 'TX-2026-0690',
    date: '18 Sep 2026, 09:15 WIB',
    bankName: 'Bank Sampah Berseri Sukabirus',
    bankAddress: 'Jl. Sukabirus No. 12, Dayeuhkolot, Bandung',
    tellerName: 'Bu Siti (Petugas Resmi)',
    campaignName: 'Bebas Plastik Kampus Telkom & Dayeuhkolot',
    campaignId: 'c1',
    status: 'Terverifikasi Sah',
    verificationCode: 'VRF-BSB-442817',
    totalKg: 8.8,
    pointsEarned: 88,
    rupiahAmount: 39600,
    items: [
      { name: 'Kaleng Minuman Aluminium', category: 'Logam', weightKg: 2.1, pricePerKg: 14000, subtotal: 29400 },
      { name: 'Plastik Keras HDPE', category: 'Plastik', weightKg: 6.7, pricePerKg: 3500, subtotal: 23450 }
    ],
    notes: 'Penyetoran perdana pembukaan akun Eco Passport.'
  }
];

export const USER_CAMPAIGNS = [
  {
    id: 'c1',
    title: 'Bebas Plastik Kampus Telkom & Dayeuhkolot',
    organizer: 'BEM Universitas Telkom & Karang Taruna Sukabirus',
    scope: 'Kampus & Lingkungan Sekitar',
    scopeType: 'Kolaborasi Terbuka', // Umum, Mahasiswa & Warga
    userContributionKg: 32.4,
    userRank: 3,
    userPoints: 942,
    totalTargetKg: 5000,
    totalCollectedKg: 3820,
    daysRemaining: 12,
    status: 'Aktif',
    category: 'Kolaborasi Kampus & Warga',
    image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=600&auto=format&fit=crop',
    partnerWasteBank: 'Bank Sampah Berseri Sukabirus'
  },
  {
    id: 'c4',
    title: 'Sedekah Jelantah Berkah Dapur Yogyakarta',
    organizer: 'Forum Komunitas Peduli Lingkungan DIY & PKK Sleman',
    scope: 'Masyarakat & Dapur Keluarga',
    scopeType: 'Terbuka untuk Umum',
    userContributionKg: 16.1,
    userRank: 12,
    userPoints: 508,
    totalTargetKg: 3000,
    totalCollectedKg: 2890,
    daysRemaining: 5,
    status: 'Aktif',
    category: 'Masyarakat Umum & Pedagang',
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=600&auto=format&fit=crop',
    partnerWasteBank: 'Bank Sampah Resik Jogja'
  }
];

export const USER_MISSIONS = [
  {
    id: 'm1',
    title: 'Setor Min. 5 kg Botol PET Minggu Ini',
    desc: 'Bawa botol plastik terpilah ke bank sampah mitra resmi.',
    progress: 5.2,
    target: 5.0,
    unit: 'kg',
    rewardPoints: 50,
    rewardXp: 40,
    isCompleted: true,
    claimed: true,
    badgeAward: 'Pemilah Ahli'
  },
  {
    id: 'm2',
    title: 'Kumpulkan 10 kg Kardus / Kertas Berkas',
    desc: 'Pilah kardus paket online, dokumen arsip, atau kertas bersih.',
    progress: 6.4,
    target: 10.0,
    unit: 'kg',
    rewardPoints: 80,
    rewardXp: 60,
    isCompleted: false,
    claimed: false,
    badgeAward: null
  },
  {
    id: 'm3',
    title: 'Kunjungi 2 Mitra Bank Sampah Berbeda',
    desc: 'Lakukan transaksi terverifikasi di dua titik lokasi mitra.',
    progress: 2,
    target: 2,
    unit: 'lokasi',
    rewardPoints: 100,
    rewardXp: 75,
    isCompleted: true,
    claimed: false,
    badgeAward: 'Penjelajah Hijau'
  },
  {
    id: 'm4',
    title: 'Ajak Tetangga / Rekan Berpartisipasi',
    desc: 'Bantu kenalkan sistem setor terverifikasi pada keluarga atau teman.',
    progress: 1,
    target: 1,
    unit: 'orang',
    rewardPoints: 60,
    rewardXp: 50,
    isCompleted: true,
    claimed: true,
    badgeAward: null
  }
];

export const USER_BADGES = [
  {
    id: 'b1',
    title: 'Pemilah Ahli',
    titleEn: 'Master Sorter',
    category: 'Presisi Pemilahan',
    desc: 'Berhasil melakukan 5 kali penyetoran sampah terpilah tanpa catatan anomali oleh petugas.',
    iconName: 'Trophy',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    unlockedAt: '12 Okt 2026',
    isUnlocked: true,
    rarity: 'Langka'
  },
  {
    id: 'b2',
    title: 'Pejuang Lingkungan Bersih',
    titleEn: 'Clean Community Champion',
    category: 'Kontribusi Kampanye',
    desc: 'Menyumbang lebih dari 30 kg sampah ke kampanye kolaboratif dan masuk 5 besar kontributor.',
    iconName: 'ShieldCheck',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.15)',
    unlockedAt: '18 Okt 2026',
    isUnlocked: true,
    rarity: 'Istimewa'
  },
  {
    id: 'b3',
    title: 'Penyetor Perdana Terverifikasi',
    titleEn: 'Verified First Deposit',
    category: 'Langkah Awal',
    desc: 'Menuntaskan transaksi fisik pertama dan terdata resmi di sistem EcoLink.',
    iconName: 'CheckCircle2',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    unlockedAt: '18 Sep 2026',
    isUnlocked: true,
    rarity: 'Umum'
  },
  {
    id: 'b4',
    title: 'Penjelajah Hijau',
    titleEn: 'Eco Explorer',
    category: 'Eksplorasi Jaringan',
    desc: 'Menyetor sampah ke minimal 2 bank sampah mitra di titik lokasi berbeda.',
    iconName: 'Compass',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.15)',
    unlockedAt: '04 Okt 2026',
    isUnlocked: true,
    rarity: 'Langka'
  },
  {
    id: 'b5',
    title: 'Penyelamat Air Bersih',
    titleEn: 'Water Guardian',
    category: 'Spesialis Jelantah',
    desc: 'Mencegah kontaminasi lebih dari 1.000 liter air tanah dengan menyetor jelantah dapur.',
    iconName: 'Droplets',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.15)',
    unlockedAt: '04 Okt 2026',
    isUnlocked: true,
    rarity: 'Langka'
  },
  {
    id: 'b6',
    title: 'Pahlawan Sirkular 100 kg',
    titleEn: 'Centurion 100kg',
    category: 'Milestone Volume',
    desc: 'Kumpulkan total akumulasi 100 kg sampah terverifikasi di Eco Passport.',
    iconName: 'Award',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    unlockedAt: null,
    isUnlocked: false,
    progress: 48.5,
    target: 100,
    rarity: 'Epik'
  },
  {
    id: 'b7',
    title: 'Penjaga Wilayah Hijau',
    titleEn: 'Green Guardian',
    category: 'Aksi Lingkungan',
    desc: 'Ikut serta dan setor sampah dalam inisiatif pembersihan lingkungan kelurahan/pantai.',
    iconName: 'Waves',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    unlockedAt: null,
    isUnlocked: false,
    progress: 0,
    target: 1,
    rarity: 'Langka'
  },
  {
    id: 'b8',
    title: 'Kolektor Sampah Elektronik',
    titleEn: 'E-Waste Sorter',
    category: 'Spesialis Limbah B3',
    desc: 'Setor minimal 3 unit barang elektronik atau kabel komputer bekas ke drop-point.',
    iconName: 'Cpu',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    unlockedAt: null,
    isUnlocked: false,
    progress: 0,
    target: 3,
    rarity: 'Epik'
  }
];

export const USER_REWARDS = [
  {
    id: 'rew-1',
    category: 'Pulsa & Kuota',
    title: 'Voucher Pulsa Rp 25.000',
    provider: 'Semua Operator (Telkomsel, Indosat, XL, Tri)',
    costPoints: 250,
    stock: 45,
    icon: 'Smartphone',
    color: '#38bdf8',
    badge: 'Populer',
    desc: 'Langsung dikirimkan ke nomor WhatsApp / HP yang terdaftar di akun EcoLink.'
  },
  {
    id: 'rew-2',
    category: 'Dompet Digital',
    title: 'Saldo GoPay Rp 50.000',
    provider: 'GoPay Indonesia',
    costPoints: 500,
    stock: 28,
    icon: 'Wallet',
    color: '#34d399',
    badge: 'Terlaris',
    desc: 'Saldo ditransfer ke nomor e-wallet dalam 1x24 jam kerja.'
  },
  {
    id: 'rew-3',
    category: 'Dompet Digital',
    title: 'Saldo DANA Rp 25.000',
    provider: 'DANA Indonesia',
    costPoints: 250,
    stock: 35,
    icon: 'CreditCard',
    color: '#60a5fa',
    badge: null,
    desc: 'Top-up saldo dompet digital DANA secara instan dan tanpa potongan admin.'
  },
  {
    id: 'rew-4',
    category: 'Produk Sirkular Bank Sampah',
    title: 'Pupuk Kompos Super 5 kg',
    provider: 'Produksi Bank Sampah Berseri Sukabirus',
    costPoints: 200,
    stock: 50,
    icon: 'Sprout',
    color: '#10b981',
    badge: 'Organik',
    desc: 'Kompos fermentasi sampah organik kaya nutrisi untuk tanaman hias dan sayur rumahan.'
  },
  {
    id: 'rew-5',
    category: 'Produk Sirkular Bank Sampah',
    title: 'Bibit Pohon Buah Tropis',
    provider: 'Kebun Pembibitan Bank Sampah Mitra',
    costPoints: 150,
    stock: 20,
    icon: 'TreePine',
    color: '#4ade80',
    badge: 'Aksi Hijau',
    desc: 'Pilihan bibit siap tanam: Jambu Kristal, Mangga Arumanis, atau Jeruk Nipis.'
  },
  {
    id: 'rew-6',
    category: 'Produk Sirkular Bank Sampah',
    title: 'Sabun Eco-Enzyme Jeruk (500 ml)',
    provider: 'Hasil Olahan Limbah Kulit Buah',
    costPoints: 180,
    stock: 18,
    icon: 'Sparkles',
    color: '#fbbf24',
    badge: 'Ramah Alergi',
    desc: 'Pembersih lantai serbaguna dari hasil fermentasi kulit buah dapur tanpa bahan kimia keras.'
  },
  {
    id: 'rew-7',
    category: 'Merchandise Ramah Lingkungan',
    title: 'Tumbler Stainless EcoLink 750ml',
    provider: 'Official EcoLink Store',
    costPoints: 750,
    stock: 12,
    icon: 'CupSoda',
    color: '#a78bfa',
    badge: 'Eksklusif',
    desc: 'Botol minum insulasi suhu ganda (tahan dingin 24 jam & panas 12 jam) berukir nama ID Paspor.'
  },
  {
    id: 'rew-8',
    category: 'Donasi & Restorasi Alam',
    title: 'Adopsi 1 Pohon Mangrove Pesisir',
    provider: 'Konservasi Mangrove Muara Gembong',
    costPoints: 300,
    stock: 100,
    icon: 'HeartHandshake',
    color: '#f43f5e',
    badge: 'Dampak Nyata',
    desc: 'Atas namamu, 1 bibit mangrove akan ditanam untuk menahan abrasi dan menyerap 12.3 kg CO2/thn.'
  }
];
