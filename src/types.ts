export type UserRole = 
  | 'super_admin'
  | 'bendahara_masjid'
  | 'bendahara_babul_khairat'
  | 'bendahara_qurban'
  | 'sekretaris_masjid'
  | 'public';

export interface UserAccount {
  username: string;
  name: string;
  role: UserRole;
  passwordHash: string; // Plain password check for local credential management
  roleLabel: string;
}

export type MainTab = 
  | 'laporan_keuangan'
  | 'babul_khairat'
  | 'qurban'
  | 'infaq_sadakah'
  | 'informasi_kegiatan';

// 1. LAPORAN KEUANGAN
export interface FinancialTransaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  deskripsi: string;
  jenis: 'pemasukan' | 'pengeluaran' | 'transfer';
  kategori: string;
  jumlah: number;
  metode: 'kas_tunai' | 'bank_bni' | 'qris';
  reconciled: boolean;
  refNo?: string;
  catatan?: string;
}

export interface BankStatementItem {
  id: string;
  tanggal: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
  statusMatch: boolean;
  matchedTxId?: string;
}

// 2. BABUL KHAIRAT
export interface BabulKhairatFamily {
  id: string;
  noKk: string;
  namaKepalaKeluarga: string;
  alamat: string;
  noHp: string;
  anggotaList: string[]; // nama-nama anggota keluarga
  jumlahJiwa: number;
  tanggalDaftar: string;
  status: 'aktif' | 'nonaktif';
}

export interface BabulKhairatPayment {
  id: string;
  familyId: string;
  namaKk: string;
  bulan: string; // e.g. "Januari 2025"
  tahun: number;
  nominalPerJiwa: number;
  jumlahJiwa: number;
  totalNominal: number;
  tanggalBayar: string;
  metode: 'tunai' | 'transfer_bni';
  status: 'lunas' | 'menunggak';
  petugas: string;
}

export interface BabulKhairatClaim {
  id: string;
  tanggal: string;
  namaAlmarhum: string;
  ahliWaris: string;
  noHp: string;
  alamat: string;
  biayaAmbulans: number;
  biayaKainKafan: number;
  biayaMakam: number;
  santunanKeluarga: number;
  totalKlaim: number;
  status: 'dicairkan' | 'diproses' | 'selesai';
  keterangan: string;
}

// 3. QURBAN
export interface ShohibulQurban {
  id: string;
  nomorPeserta: string;
  nama: string;
  noHp: string;
  alamat: string;
  jenisQurban: 'sapi_perorangan' | 'sapi_kolektif' | 'kambing' | 'domba';
  kelompokSapi?: number; // 1-10 jika kolektif
  atasNama: string[]; // 1 nama jika kambing/domba/kolektif, 7 jika perorangan sapi
  totalBiaya: number;
  terbayar: number;
  status: 'lunas' | 'belum_lunas' | 'dp' | 'belum_bayar';
  tanggalDaftar: string;
  catatan?: string;
}

export interface QurbanInstallment {
  id: string;
  shohibulId: string;
  namaPeserta: string;
  tanggal: string;
  nominal: number;
  metode: 'transfer_bni' | 'qris' | 'ewallet' | 'tunai';
  kuitansiNo: string;
  catatan?: string;
}

export interface QurbanStock {
  id: string;
  jenis: string;
  stokTersedia: number;
  terpesan: number;
  targetKebutuhan?: number;
  hargaSatuan: number;
  keterangan?: string;
}

// 4. INFAQ & SADAKAH
export interface InfaqRecord {
  id: string;
  nama: string;
  noHp: string;
  nominal: number;
  jenis: 'Infaq Jumat' | 'Sedekah Subuh' | 'Renovasi Masjid' | 'Operasional' | 'Yatim & Dhuafa';
  metode: 'QRIS' | 'Transfer BNI' | 'Tunai';
  tanggal: string;
  keterangan?: string;
}

// 5. INFORMASI & KEGIATAN
export interface MosqueNews {
  id: string;
  judul: string;
  ringkasan: string;
  isi: string;
  kategori: 'Berita' | 'Pengumuman' | 'Kajian' | 'Sosial';
  tanggal: string;
  penulis: string;
  fotoUrl: string;
}

export interface MosqueEvent {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  narasumber: string;
  status: 'akan_datang' | 'berlangsung' | 'selesai';
}

export interface GalleryItem {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  mediaUrl: string;
  tipe: 'foto' | 'video';
}

// 6. JADWAL & PETUGAS SHOLAT JUM'AT
export interface FridayPrayerSchedule {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string; // "Jum'at"
  waktu: string; // Waktu sholat Jum'at (otomatis/WIB), misal "12:08 WIB"
  muadzin: string; // Petugas Muadzin / Bilal
  khatib: string; // Petugas Khatib
  imam: string; // Petugas Imam
  temaKhutbah?: string; // Tema / Judul Khutbah
  keterangan?: string; // Catatan tambahan (misal: "Disertai pengumpulan infaq kemanusiaan")
}

