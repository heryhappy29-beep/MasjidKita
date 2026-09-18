import { 
  FinancialTransaction, 
  BankStatementItem, 
  BabulKhairatFamily, 
  BabulKhairatPayment, 
  BabulKhairatClaim, 
  ShohibulQurban, 
  QurbanInstallment, 
  QurbanStock, 
  InfaqRecord, 
  MosqueNews, 
  MosqueEvent, 
  GalleryItem,
  FridayPrayerSchedule,
  UserAccount
} from '../types';

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    username: 'superadmin',
    name: 'Pengurus Utama (Super Admin)',
    role: 'super_admin',
    passwordHash: 'admin123',
    roleLabel: 'Super Admin (Akses Penuh Semua Menu)'
  },
  {
    username: 'bendahara.masjid',
    name: 'Bapak Imron Ardan',
    role: 'bendahara_masjid',
    passwordHash: 'masjid123',
    roleLabel: 'Bendahara Masjid As Shomad'
  },
  {
    username: 'bendahara.babul',
    name: 'Bapak Zul Khaidir',
    role: 'bendahara_babul_khairat',
    passwordHash: 'babul123',
    roleLabel: 'Bendahara Babul Khairat'
  },
  {
    username: 'bendahara.qurban',
    name: 'Bapak Herry / Bapak Jacky',
    role: 'bendahara_qurban',
    passwordHash: 'qurban123',
    roleLabel: 'Bendahara Panitia Qurban'
  },
  {
    username: 'sekretaris',
    name: 'Sekretaris Masjid',
    role: 'sekretaris_masjid',
    passwordHash: 'sekretaris123',
    roleLabel: 'Sekretaris & Humas Masjid'
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TX-2025-001',
    tanggal: '2025-01-03',
    deskripsi: 'Infaq Kotak Amal Shalat Jumat Pekan I',
    jenis: 'pemasukan',
    kategori: 'Infaq Jumat',
    jumlah: 4850000,
    metode: 'kas_tunai',
    reconciled: true,
    refNo: 'KTK-01',
    catatan: 'Dihitung bersama saksi 2 jamaah'
  },
  {
    id: 'TX-2025-002',
    tanggal: '2025-01-05',
    deskripsi: 'Pembayaran Tagihan Listrik PLN Masjid (IDPEL 54312099)',
    jenis: 'pengeluaran',
    kategori: 'Utilitas & Operasional',
    jumlah: 1350000,
    metode: 'bank_bni',
    reconciled: true,
    refNo: 'PLN-JAN',
    catatan: 'Auto debet BNI'
  },
  {
    id: 'TX-2025-003',
    tanggal: '2025-01-08',
    deskripsi: 'Donasi Transfer BNI dari Hamba Allah (Renovasi Kubah)',
    jenis: 'pemasukan',
    kategori: 'Wakaf & Renovasi',
    jumlah: 10000000,
    metode: 'bank_bni',
    reconciled: true,
    refNo: 'TRF-BNI-8821',
    catatan: 'Untuk pengecatan dan waterproofing kubah'
  },
  {
    id: 'TX-2025-004',
    tanggal: '2025-01-10',
    deskripsi: 'Infaq Kotak Amal Shalat Jumat Pekan II',
    jenis: 'pemasukan',
    kategori: 'Infaq Jumat',
    jumlah: 5210000,
    metode: 'kas_tunai',
    reconciled: true,
    refNo: 'KTK-02'
  },
  {
    id: 'TX-2025-005',
    tanggal: '2025-01-12',
    deskripsi: 'Honor Bulanan Marbot & Petugas Kebersihan',
    jenis: 'pengeluaran',
    kategori: 'Gaji & Honorarium',
    jumlah: 3000000,
    metode: 'kas_tunai',
    reconciled: true,
    refNo: 'HONOR-01',
    catatan: 'Pak Supri dan Pak Dani'
  },
  {
    id: 'TX-2025-006',
    tanggal: '2025-01-15',
    deskripsi: 'Infaq QRIS Statis Masjid Pekan II',
    jenis: 'pemasukan',
    kategori: 'Infaq Digital QRIS',
    jumlah: 1870000,
    metode: 'qris',
    reconciled: true,
    refNo: 'QRIS-SETTLE-01'
  },
  {
    id: 'TX-2025-007',
    tanggal: '2025-01-20',
    deskripsi: 'Pembelian Karpet Saf Sholat Tambahan 2 Roll',
    jenis: 'pengeluaran',
    kategori: 'Perlengkapan Masjid',
    jumlah: 4500000,
    metode: 'bank_bni',
    reconciled: true,
    refNo: 'INV-KARPET-88'
  },
  {
    id: 'TX-2025-008',
    tanggal: '2025-01-25',
    deskripsi: 'Penyetoran Kas Tunai ke Rekening BNI Masjid',
    jenis: 'transfer',
    kategori: 'Mutasi Kas ke Bank',
    jumlah: 5000000,
    metode: 'bank_bni',
    reconciled: false,
    refNo: 'SETOR-BNI-01',
    catatan: 'Menyetor hasil infaq kotak Jumat'
  }
];

export const INITIAL_BANK_MUTATION: BankStatementItem[] = [
  {
    id: 'BNI-01',
    tanggal: '2025-01-05',
    keterangan: 'DB PLN PERSERO ID 54312099',
    debit: 1350000,
    kredit: 0,
    saldo: 45200000,
    statusMatch: true,
    matchedTxId: 'TX-2025-002'
  },
  {
    id: 'BNI-02',
    tanggal: '2025-01-08',
    keterangan: 'CR TRF HAMBA ALLAH WAKAF KUBAH',
    debit: 0,
    kredit: 10000000,
    saldo: 55200000,
    statusMatch: true,
    matchedTxId: 'TX-2025-003'
  },
  {
    id: 'BNI-03',
    tanggal: '2025-01-16',
    keterangan: 'CR SETTLEMENT QRIS MASJID AS SHOMAD',
    debit: 0,
    kredit: 1870000,
    saldo: 57070000,
    statusMatch: true,
    matchedTxId: 'TX-2025-006'
  },
  {
    id: 'BNI-04',
    tanggal: '2025-01-20',
    keterangan: 'DB TOKO KARPET MADINAH INDAH',
    debit: 4500000,
    kredit: 0,
    saldo: 52570000,
    statusMatch: true,
    matchedTxId: 'TX-2025-007'
  },
  {
    id: 'BNI-05',
    tanggal: '2025-01-26',
    keterangan: 'CR SETORAN TUNAI TELLER CABANG BNI',
    debit: 0,
    kredit: 5000000,
    saldo: 57570000,
    statusMatch: false
  }
];

// Babul Khairat Data
export const INITIAL_BABUL_FAMILIES: BabulKhairatFamily[] = [
  {
    id: 'BK-001',
    noKk: '2171012903880001',
    namaKepalaKeluarga: 'H. Syaripudin',
    alamat: 'RT 02 / RW 04 Kelurahan As Shomad',
    noHp: '085264455564',
    anggotaList: ['H. Syaripudin', 'Hj. Siti Aisyah', 'Rizky Fauzan', 'Nurul Fadhilah'],
    jumlahJiwa: 4,
    tanggalDaftar: '2023-01-10',
    status: 'aktif'
  },
  {
    id: 'BK-002',
    noKk: '2171011405900002',
    namaKepalaKeluarga: 'Imron Ardan',
    alamat: 'RT 01 / RW 04 Komplek Masjid',
    noHp: '08127718440',
    anggotaList: ['Imron Ardan', 'Fatimah Zahra', 'Ahmad Fadlan'],
    jumlahJiwa: 3,
    tanggalDaftar: '2023-01-12',
    status: 'aktif'
  },
  {
    id: 'BK-003',
    noKk: '2171012208850003',
    namaKepalaKeluarga: 'Zul Khaidir',
    alamat: 'RT 03 / RW 04 Blok C No. 12',
    noHp: '081364498575',
    anggotaList: ['Zul Khaidir', 'Mariana', 'Zaky Al-Farizi', 'Zahra Amelia', 'Zidan Pratama'],
    jumlahJiwa: 5,
    tanggalDaftar: '2023-02-01',
    status: 'aktif'
  },
  {
    id: 'BK-004',
    noKk: '2171011904780004',
    namaKepalaKeluarga: 'Herry Santoso',
    alamat: 'RT 02 / RW 04 Blok B No. 05',
    noHp: '085264118090',
    anggotaList: ['Herry Santoso', 'Dewi Susanti', 'Irfan Maulana'],
    jumlahJiwa: 3,
    tanggalDaftar: '2023-02-15',
    status: 'aktif'
  },
  {
    id: 'BK-005',
    noKk: '2171010912800005',
    namaKepalaKeluarga: 'Jacky Rusli',
    alamat: 'RT 04 / RW 04 Jl. Merpati No. 17',
    noHp: '082261122454',
    anggotaList: ['Jacky Rusli', 'Linda Marlina'],
    jumlahJiwa: 2,
    tanggalDaftar: '2023-03-05',
    status: 'aktif'
  }
];

export const INITIAL_BABUL_PAYMENTS: BabulKhairatPayment[] = [
  {
    id: 'PAY-BK-001',
    familyId: 'BK-001',
    namaKk: 'H. Syaripudin',
    bulan: 'Januari 2025',
    tahun: 2025,
    nominalPerJiwa: 20000,
    jumlahJiwa: 4,
    totalNominal: 80000,
    tanggalBayar: '2025-01-05',
    metode: 'transfer_bni',
    status: 'lunas',
    petugas: 'Bapak Zul Khaidir'
  },
  {
    id: 'PAY-BK-002',
    familyId: 'BK-002',
    namaKk: 'Imron Ardan',
    bulan: 'Januari 2025',
    tahun: 2025,
    nominalPerJiwa: 20000,
    jumlahJiwa: 3,
    totalNominal: 60000,
    tanggalBayar: '2025-01-06',
    metode: 'tunai',
    status: 'lunas',
    petugas: 'Bapak Zul Khaidir'
  },
  {
    id: 'PAY-BK-003',
    familyId: 'BK-003',
    namaKk: 'Zul Khaidir',
    bulan: 'Januari 2025',
    tahun: 2025,
    nominalPerJiwa: 20000,
    jumlahJiwa: 5,
    totalNominal: 100000,
    tanggalBayar: '2025-01-07',
    metode: 'tunai',
    status: 'lunas',
    petugas: 'Bapak Zul Khaidir'
  },
  {
    id: 'PAY-BK-004',
    familyId: 'BK-004',
    namaKk: 'Herry Santoso',
    bulan: 'Januari 2025',
    tahun: 2025,
    nominalPerJiwa: 20000,
    jumlahJiwa: 3,
    totalNominal: 60000,
    tanggalBayar: '',
    metode: 'tunai',
    status: 'menunggak',
    petugas: '-'
  }
];

export const INITIAL_BABUL_CLAIMS: BabulKhairatClaim[] = [
  {
    id: 'CLM-001',
    tanggal: '2024-12-18',
    namaAlmarhum: 'Alm. Bapak H. Hasan Basri',
    ahliWaris: 'Hj. Aminah (Istri)',
    noHp: '081234567890',
    alamat: 'RT 03 / RW 04 Kelurahan As Shomad',
    biayaAmbulans: 350000,
    biayaKainKafan: 400000,
    biayaMakam: 1000000,
    santunanKeluarga: 1500000,
    totalKlaim: 3250000,
    status: 'dicairkan',
    keterangan: 'Pelayanan fardhu kifayah dan santunan duka lengkap diserahkan ke ahli waris'
  }
];

// Qurban Data
export const INITIAL_SHOHIBUL_QURBAN: ShohibulQurban[] = [
  {
    id: 'QUR-001',
    nomorPeserta: 'Q-2025-001',
    nama: 'Bapak Heri',
    noHp: '085264118090',
    alamat: 'RT 02 / RW 04 Komplek Masjid As Shomad',
    jenisQurban: 'domba',
    atasNama: ['Heri bin Abdullah'],
    totalBiaya: 3500000,
    terbayar: 1000000,
    status: 'belum_lunas',
    tanggalDaftar: '2025-01-15',
    catatan: 'Qurban 1 ekor domba seharga Rp 3.500.000,-. Cicilan pertama Rp 1.000.000,-, sisa yang harus dibayar Rp 2.500.000,- (Status: Belum Lunas)'
  },
  {
    id: 'QUR-002',
    nomorPeserta: 'Q-2025-002',
    nama: 'Keluarga Bapak H. Syaripudin',
    noHp: '085264455564',
    alamat: 'RT 02 / RW 04',
    jenisQurban: 'sapi_perorangan',
    atasNama: ['H. Syaripudin bin Abdullah'],
    totalBiaya: 21000000,
    terbayar: 21000000,
    status: 'lunas',
    tanggalDaftar: '2025-01-10',
    catatan: 'Sapi Bobot ± 320 kg (Tipe Super A) - Lunas'
  },
  {
    id: 'QUR-003',
    nomorPeserta: 'Q-2025-003',
    nama: 'Bapak Imron Ardan',
    noHp: '08127718440',
    alamat: 'RT 01 / RW 04',
    jenisQurban: 'sapi_kolektif',
    kelompokSapi: 1,
    atasNama: ['Imron Ardan bin Ardan'],
    totalBiaya: 3300000,
    terbayar: 3300000,
    status: 'lunas',
    tanggalDaftar: '2025-01-12',
    catatan: 'Kelompok Sapi 01 (Slot 1/7) - Lunas'
  },
  {
    id: 'QUR-004',
    nomorPeserta: 'Q-2025-004',
    nama: 'Bapak Zul Khaidir',
    noHp: '081364498575',
    alamat: 'RT 03 / RW 04 Blok C No. 12',
    jenisQurban: 'sapi_kolektif',
    kelompokSapi: 1,
    atasNama: ['Zul Khaidir bin Khaidir'],
    totalBiaya: 3300000,
    terbayar: 2000000,
    status: 'belum_lunas',
    tanggalDaftar: '2025-01-15',
    catatan: 'Kelompok Sapi 01 (Slot 2/7) - Cicilan Rp 2.000.000, sisa Rp 1.300.000 (Belum Lunas)'
  },
  {
    id: 'QUR-005',
    nomorPeserta: 'Q-2025-005',
    nama: 'Ibu Rahmawati',
    noHp: '081987654321',
    alamat: 'RT 02 / RW 04',
    jenisQurban: 'kambing',
    atasNama: ['Rahmawati binti Soleh'],
    totalBiaya: 3500000,
    terbayar: 3500000,
    status: 'lunas',
    tanggalDaftar: '2025-01-18',
    catatan: 'Kambing Jantan Tipe A - Lunas'
  }
];

export const INITIAL_QURBAN_INSTALLMENTS: QurbanInstallment[] = [
  {
    id: 'INST-001',
    shohibulId: 'QUR-001',
    namaPeserta: 'Bapak Heri',
    tanggal: '2025-01-15',
    nominal: 1000000,
    metode: 'transfer_bni',
    kuitansiNo: 'KWT-Q25-001',
    catatan: 'Cicilan ke-1 Qurban 1 Ekor Domba (Total Rp 3.500.000, Sisa Rp 2.500.000, Belum Lunas)'
  },
  {
    id: 'INST-002',
    shohibulId: 'QUR-002',
    namaPeserta: 'Keluarga Bapak H. Syaripudin',
    tanggal: '2025-01-10',
    nominal: 21000000,
    metode: 'transfer_bni',
    kuitansiNo: 'KWT-Q25-002',
    catatan: 'Pelunasan 1 Ekor Sapi Mandiri'
  },
  {
    id: 'INST-003',
    shohibulId: 'QUR-003',
    namaPeserta: 'Bapak Imron Ardan',
    tanggal: '2025-01-12',
    nominal: 3300000,
    metode: 'qris',
    kuitansiNo: 'KWT-Q25-003',
    catatan: 'Pelunasan 1/7 Sapi Kelompok 1'
  },
  {
    id: 'INST-004',
    shohibulId: 'QUR-004',
    namaPeserta: 'Bapak Zul Khaidir',
    tanggal: '2025-01-15',
    nominal: 2000000,
    metode: 'transfer_bni',
    kuitansiNo: 'KWT-Q25-004',
    catatan: 'Pembayaran DP / Cicilan Sapi Kelompok 1 (Sisa Rp 1.300.000)'
  },
  {
    id: 'INST-005',
    shohibulId: 'QUR-005',
    namaPeserta: 'Ibu Rahmawati',
    tanggal: '2025-01-18',
    nominal: 3500000,
    metode: 'transfer_bni',
    kuitansiNo: 'KWT-Q25-005',
    catatan: 'Pelunasan Kambing Jantan Tipe A'
  }
];

export const INITIAL_QURBAN_STOCK: QurbanStock[] = [
  {
    id: 'STK-001',
    jenis: 'Domba / Kambing Qurban (1 Ekor)',
    stokTersedia: 20,
    terpesan: 2,
    targetKebutuhan: 25,
    hargaSatuan: 3500000,
    keterangan: 'Ternak domba / kambing sehat bersertifikat dokter hewan'
  },
  {
    id: 'STK-002',
    jenis: 'Sapi Kelompok (1/7 Bagian)',
    stokTersedia: 28, // 4 sapi x 7
    terpesan: 2,
    targetKebutuhan: 35,
    hargaSatuan: 3300000,
    keterangan: 'Slot kolektif 1/7 bagian per ekor sapi'
  },
  {
    id: 'STK-003',
    jenis: 'Sapi Mandiri (1 Ekor)',
    stokTersedia: 5,
    terpesan: 1,
    targetKebutuhan: 6,
    hargaSatuan: 21000000,
    keterangan: 'Sapi limousin / simmental / bali utuh 1 ekor'
  }
];

// Infaq Records
export const INITIAL_INFAQ_RECORDS: InfaqRecord[] = [
  {
    id: 'INF-001',
    nama: 'Hamba Allah',
    noHp: '081299887766',
    nominal: 500000,
    jenis: 'Infaq Jumat',
    metode: 'QRIS',
    tanggal: '2025-01-10',
    keterangan: 'Semoga berkah untuk kemakmuran masjid'
  },
  {
    id: 'INF-002',
    nama: 'Bapak Hendra Gunawan',
    noHp: '081377889900',
    nominal: 2000000,
    jenis: 'Renovasi Masjid',
    metode: 'Transfer BNI',
    tanggal: '2025-01-14',
    keterangan: 'Bantuan renovasi kanopi parkir jamaah'
  },
  {
    id: 'INF-003',
    nama: 'Ibu Fatimah',
    noHp: '085211223344',
    nominal: 300000,
    jenis: 'Sedekah Subuh',
    metode: 'QRIS',
    tanggal: '2025-01-15',
    keterangan: 'Sedekah subuh doa keselamatan keluarga'
  }
];

// Informasi & Berita Masjid
export const INITIAL_MOSQUE_NEWS: MosqueNews[] = [
  {
    id: 'NEWS-01',
    judul: 'Laporan Progres Renovasi Kubah & Pemasangan Kanopi Parkir',
    ringkasan: 'Alhamdulillah proses renovasi pengecatan kubah dan pelapisan anti bocor telah selesai 80%.',
    isi: 'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nKami pengurus DKM Masjid As Shomad menyampaikan laporan perkembangan pemeliharaan fisik masjid. Pekerjaan perbaikan kubah utama yang mengalami rembesan air kini telah rampung 80% dan dilanjutkan dengan pemasangan kanopi pelindung motor jamaah di area parkir timur.\n\nKami mengucapkan jazakumullah khairan katsiran kepada seluruh jamaah dan para muhsinin yang telah menyalurkan infaq & shadaqah.',
    kategori: 'Berita',
    tanggal: '2025-01-16',
    penulis: 'Sekretaris DKM As Shomad',
    fotoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'NEWS-02',
    judul: 'Pembukaan Pendaftaran Tabungan dan Peserta Qurban 1446 H',
    ringkasan: 'Panitia Qurban Masjid As Shomad resmi membuka pendaftaran shohibul qurban sapi kolektif dan kambing.',
    isi: 'Menyambut Hari Raya Idul Adha 1446 H, Panitia Qurban Masjid As Shomad membuka kesempatan seluas-luasnya bagi jamaah yang berniat menunaikan ibadah qurban.\n\nTersedia pilihan sapi kolektif (7 orang per sapi) dengan biaya Rp 3.300.000/orang yang dapat dicicil hingga 5 bulan sebelum hari raya. Pembayaran dapat melalui transfer BNI atau kasir panitia qurban.',
    kategori: 'Pengumuman',
    tanggal: '2025-01-12',
    penulis: 'Panitia Qurban',
    fotoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'NEWS-03',
    judul: 'Kajian Rutin Ahad Subuh: Menjaga Ukhuwah & Amanah Harta',
    ringkasan: 'Kajian bedah kitab bersama Ustadz Dr. H. Abdullah Faqih, MA dihadiri oleh ratusan jamaah.',
    isi: 'Kajian ahad subuh pekan kedua berlangsung khidmat. Pembahasan difokuskan pada pentingnya transparansi dan kehati-hatian dalam mengelola harta titipan umat, serta keutamaan tolong-menolong sesama warga melalui wadah Babul Khairat.',
    kategori: 'Kajian',
    tanggal: '2025-01-08',
    penulis: 'Humas DKM',
    fotoUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1200&q=80'
  }
];

export const INITIAL_MOSQUE_EVENTS: MosqueEvent[] = [
  {
    id: 'EVT-01',
    judul: 'Tabligh Akbar Menyambut Bulan Rajab & Sya’ban',
    deskripsi: 'Pengajian akbar bersama penceramah nasional bertema mempersiapkan ruhani menyongsong bulan suci Ramadhan.',
    tanggal: '2025-02-02',
    waktu: '19.30 WIB (Ba’da Isya)',
    lokasi: 'Ruang Utama Masjid As Shomad',
    narasumber: 'Ustadz K.H. Muhammad Mansyur, Lc.',
    status: 'akan_datang'
  },
  {
    id: 'EVT-02',
    judul: 'Pelatihan Fardhu Kifayah & Pengurusan Jenazah',
    deskripsi: 'Praktik langsung tata cara memandikan, mengafani, dan mensholatkan jenazah sesuai sunnah bagi pengurus dan pemuda Babul Khairat.',
    tanggal: '2025-02-09',
    waktu: '08.30 - 12.00 WIB',
    lokasi: 'Aula Serbaguna Masjid As Shomad',
    narasumber: 'Ustadz Ahmad Zarkasyi (Tim Fardhu Kifayah)',
    status: 'akan_datang'
  },
  {
    id: 'EVT-03',
    judul: 'Santunan Yatim & Lansia Dhuafa Awal Tahun',
    deskripsi: 'Pemberian paket sembako dan uang santunan kepada 50 anak yatim dan 40 dhuafa di lingkungan RT/RW sekitar masjid.',
    tanggal: '2025-01-04',
    waktu: '09.00 WIB',
    lokasi: 'Serambi Masjid As Shomad',
    narasumber: 'Ketua DKM & Donatur Muhsinin',
    status: 'selesai'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'GAL-01',
    judul: 'Pelaksanaan Shalat Jumat Berjamaah',
    deskripsi: 'Suasana shalat jumat berjamaah di lantai utama dan serambi masjid As Shomad.',
    tanggal: '2025-01-10',
    mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    tipe: 'foto'
  },
  {
    id: 'GAL-02',
    judul: 'Kerja Bakti Bersih Masjid & Lingkungan Sekitar',
    deskripsi: 'Kegiatan gotong royong jamaah dan pemuda masjid membersihkan tempat wudhu dan area parkir.',
    tanggal: '2025-01-05',
    mediaUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    tipe: 'foto'
  },
  {
    id: 'GAL-03',
    judul: 'Kajian Muslimah Mingguan',
    deskripsi: 'Kajian fiqih wanita dan parenting islami bagi ibu-ibu jamaah As Shomad.',
    tanggal: '2025-01-11',
    mediaUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1000&q=80',
    tipe: 'foto'
  },
  {
    id: 'GAL-04',
    judul: 'Dokumentasi Santunan Anak Yatim',
    deskripsi: 'Penyerahan beasiswa pendidikan dan paket perlengkapan sekolah.',
    tanggal: '2025-01-04',
    mediaUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    tipe: 'foto'
  }
];

export const MOSQUE_INFO = {
  name: 'MASJID AS SHOMAD',
  bankName: 'Bank Negara Indonesia (BNI)',
  accountNumber: '8881-2072-09',
  accountHolder: 'Masjid As Shomad',
  whatsappBendaharaMasjid: '08127718440',
  defaultMonthlyDuePerPerson: 20000,
  contacts: [
    { title: 'Ketua Masjid', name: 'Bapak Syaripudin', phone: '0852-6445-5564', rawPhone: '085264455564' },
    { title: 'Bendahara Masjid', name: 'Bapak Imron Ardan', phone: '0812-7781-440', rawPhone: '08127718440' },
    { title: 'Bendahara Babul Khairat', name: 'Bapak Zul Khaidir', phone: '0813-6449-8575', rawPhone: '081364498575' },
    { title: 'Bendahara Qurban (1)', name: 'Bapak Herry', phone: '0852-6411-8090', rawPhone: '085264118090' },
    { title: 'Bendahara Qurban (2)', name: 'Bapak Jacky', phone: '0822-6112-2454', rawPhone: '082261122454' }
  ]
};

export const INITIAL_USERS = INITIAL_ACCOUNTS;

export const INITIAL_JUMAT_SCHEDULES: FridayPrayerSchedule[] = [
  {
    id: 'JMT-2026-001',
    tanggal: '2026-09-18',
    hari: "Jum'at",
    waktu: '12:08 WIB',
    muadzin: 'Ustadz Bilal Ramadhan',
    khatib: 'Ustadz Dr. H. Ahmad Fauzi, M.Ag',
    imam: 'Ustadz Muhammad Ridwan, Al-Hafidz',
    temaKhutbah: 'Membangun Ukhuwah dan Keberkahan Rezeki Melalui Amal Jariyah',
    keterangan: 'Dihimbau hadir 15 menit sebelum adzan. Disediakan kotak infaq kemanusiaan.'
  },
  {
    id: 'JMT-2026-002',
    tanggal: '2026-09-25',
    hari: "Jum'at",
    waktu: '12:06 WIB',
    muadzin: 'Bapak Syamsul Bahri',
    khatib: 'Ustadz Ilham Hidayat, Lc., M.H.',
    imam: 'Ustadz Ilham Hidayat, Lc., M.H.',
    temaKhutbah: 'Meneladani Kesabaran dan Akhlak Mulia Rasulullah SAW',
    keterangan: 'Kajian ringkas fiqih ibadah ba’da sholat Jum’at bersama jamaah.'
  },
  {
    id: 'JMT-2026-003',
    tanggal: '2026-10-02',
    hari: "Jum'at",
    waktu: '12:04 WIB',
    muadzin: 'Ustadz Fadil Mubarak',
    khatib: 'Ustadz H. Zulkarnain Tanjung, S.Pd.I',
    imam: 'Ustadz H. Zulkarnain Tanjung, S.Pd.I',
    temaKhutbah: 'Kunci Ketenangan Jiwa Menghadapi Ujian Kehidupan',
    keterangan: 'Disiarkan langsung melalui pengeras suara dan dokumentasi DKM.'
  }
];

export const INITIAL_DATA = {
  transactions: INITIAL_TRANSACTIONS,
  reconciliations: INITIAL_BANK_MUTATION,
  babulKhairatFamilies: INITIAL_BABUL_FAMILIES,
  babulKhairatPayments: INITIAL_BABUL_PAYMENTS,
  babulKhairatClaims: INITIAL_BABUL_CLAIMS,
  shohibulQurban: INITIAL_SHOHIBUL_QURBAN,
  qurbanInstallments: INITIAL_QURBAN_INSTALLMENTS,
  qurbanStocks: INITIAL_QURBAN_STOCK,
  infaqRecords: INITIAL_INFAQ_RECORDS,
  news: INITIAL_MOSQUE_NEWS,
  events: INITIAL_MOSQUE_EVENTS,
  gallery: INITIAL_GALLERY,
  jumatSchedules: INITIAL_JUMAT_SCHEDULES
};

