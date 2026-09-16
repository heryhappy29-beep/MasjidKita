import React, { useState, useMemo } from 'react';
import { 
  BabulKhairatFamily, 
  BabulKhairatPayment, 
  BabulKhairatClaim, 
  UserRole 
} from '../types';
import { formatRupiah, formatDateIndo, createWhatsAppUrl, angkaTerbilang } from '../utils/formatters';
import { MosqueLogo } from './MosqueLogo';
import { 
  Users, 
  UserPlus, 
  Receipt, 
  HeartHandshake, 
  Send, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Printer, 
  Search, 
  Lock,
  Phone,
  MessageCircle,
  FileCheck
} from 'lucide-react';

interface BabulKhairatViewProps {
  families: BabulKhairatFamily[];
  onAddFamily: (f: Omit<BabulKhairatFamily, 'id'>) => void;
  onEditFamily: (f: BabulKhairatFamily) => void;
  onDeleteFamily: (id: string) => void;
  payments: BabulKhairatPayment[];
  onAddPayment: (p: Omit<BabulKhairatPayment, 'id'>) => void;
  onEditPayment: (p: BabulKhairatPayment) => void;
  onDeletePayment: (id: string) => void;
  claims: BabulKhairatClaim[];
  onAddClaim: (c: Omit<BabulKhairatClaim, 'id'>) => void;
  onEditClaim: (c: BabulKhairatClaim) => void;
  onDeleteClaim: (id: string) => void;
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const BabulKhairatView: React.FC<BabulKhairatViewProps> = ({
  families,
  onAddFamily,
  onEditFamily,
  onDeleteFamily,
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  claims,
  onAddClaim,
  onEditClaim,
  onDeleteClaim,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'bendahara_babul_khairat';

  // Sub Tab
  const [subTab, setSubTab] = useState<'transparansi' | 'keanggotaan' | 'iuran' | 'klaim' | 'notifikasi'>('transparansi');

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Tarif Iuran per Jiwa (ditentukan admin, default Rp 20.000/orang)
  const [tarifPerJiwa, setTarifPerJiwa] = useState<number>(20000);

  // Modal State: Tambah/Edit KK
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<BabulKhairatFamily | null>(null);
  const [noKk, setNoKk] = useState('');
  const [namaKk, setNamaKk] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [anggotaStr, setAnggotaStr] = useState(''); // dipisah koma
  const [jumlahJiwaInput, setJumlahJiwaInput] = useState<number>(1);

  // Modal State: Kasir Bayar Iuran
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState('Februari 2025');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer_bni'>('tunai');
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'menunggak'>('lunas');

  // Modal State: Tambah Klaim Jenazah
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimAlmarhum, setClaimAlmarhum] = useState('');
  const [claimAhliWaris, setClaimAhliWaris] = useState('');
  const [claimNoHp, setClaimNoHp] = useState('');
  const [claimAlamat, setClaimAlamat] = useState('');
  const [biayaAmbulans, setBiayaAmbulans] = useState<number>(350000);
  const [biayaKafan, setBiayaKafan] = useState<number>(400000);
  const [biayaMakam, setBiayaMakam] = useState<number>(1000000);
  const [santunanDuka, setSantunanDuka] = useState<number>(1500000);
  const [claimKeterangan, setClaimKeterangan] = useState('');

  // Cetak Kwitansi Iuran
  const [receiptPayment, setReceiptPayment] = useState<BabulKhairatPayment | null>(null);

  // Perhitungan Keuangan Babul Khairat
  const financeSummary = useMemo(() => {
    const totalPemasukanIuran = payments
      .filter((p) => p.status === 'lunas')
      .reduce((sum, p) => sum + p.totalNominal, 0);

    const totalPengeluaranKlaim = claims
      .reduce((sum, c) => sum + c.totalKlaim, 0);

    const totalJiwaTerdaftar = families.reduce((sum, f) => sum + f.jumlahJiwa, 0);
    const saldoKasBabulKhairat = 15000000 + totalPemasukanIuran - totalPengeluaranKlaim; // Saldo awal kas kas rukun kematian

    return {
      totalPemasukanIuran,
      totalPengeluaranKlaim,
      totalJiwaTerdaftar,
      saldoKasBabulKhairat,
      totalKk: families.length
    };
  }, [payments, claims, families]);

  // Handle Tambah/Edit KK
  const handleAnggotaChange = (val: string) => {
    setAnggotaStr(val);
    const names = val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    if (names.length > 0) {
      setJumlahJiwaInput(names.length);
    }
  };

  const handleSubmitFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const anggotaList = anggotaStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const calculatedJiwa = Math.max(1, Number(jumlahJiwaInput) || (anggotaList.length > 0 ? anggotaList.length : 1));

    if (editingFamily) {
      onEditFamily({
        ...editingFamily,
        noKk,
        namaKepalaKeluarga: namaKk,
        alamat,
        noHp,
        anggotaList: anggotaList.length > 0 ? anggotaList : [namaKk],
        jumlahJiwa: calculatedJiwa
      });
    } else {
      onAddFamily({
        noKk,
        namaKepalaKeluarga: namaKk,
        alamat,
        noHp,
        anggotaList: anggotaList.length > 0 ? anggotaList : [namaKk],
        jumlahJiwa: calculatedJiwa,
        tanggalDaftar: new Date().toISOString().split('T')[0],
        status: 'aktif'
      });
    }
    setIsFamilyModalOpen(false);
  };

  const handleOpenEditFamily = (f: BabulKhairatFamily) => {
    setEditingFamily(f);
    setNoKk(f.noKk);
    setNamaKk(f.namaKepalaKeluarga);
    setAlamat(f.alamat);
    setNoHp(f.noHp);
    setAnggotaStr(f.anggotaList ? f.anggotaList.join(', ') : '');
    setJumlahJiwaInput(f.jumlahJiwa || (f.anggotaList ? f.anggotaList.length : 1) || 1);
    setIsFamilyModalOpen(true);
  };

  const handleOpenAddFamily = () => {
    setEditingFamily(null);
    setNoKk('');
    setNamaKk('');
    setAlamat('');
    setNoHp('');
    setAnggotaStr('');
    setJumlahJiwaInput(1);
    setIsFamilyModalOpen(true);
  };

  // Handle Simpan Bayar Iuran
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const fam = families.find((f) => f.id === selectedFamilyId);
    if (!fam) return;

    const totalNominal = fam.jumlahJiwa * tarifPerJiwa;

    onAddPayment({
      familyId: fam.id,
      namaKk: fam.namaKepalaKeluarga,
      bulan: selectedMonth,
      tahun: 2025,
      nominalPerJiwa: tarifPerJiwa,
      jumlahJiwa: fam.jumlahJiwa,
      totalNominal,
      tanggalBayar: paymentStatus === 'lunas' ? new Date().toISOString().split('T')[0] : '',
      metode: paymentMethod,
      status: paymentStatus,
      petugas: 'Bapak Zul Khaidir'
    });

    setIsPaymentModalOpen(false);
  };

  // Handle Simpan Klaim
  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(biayaAmbulans) + Number(biayaKafan) + Number(biayaMakam) + Number(santunanDuka);

    onAddClaim({
      tanggal: new Date().toISOString().split('T')[0],
      namaAlmarhum: claimAlmarhum,
      ahliWaris: claimAhliWaris,
      noHp: claimNoHp,
      alamat: claimAlamat,
      biayaAmbulans: Number(biayaAmbulans),
      biayaKainKafan: Number(biayaKafan),
      biayaMakam: Number(biayaMakam),
      santunanKeluarga: Number(santunanDuka),
      totalKlaim: total,
      status: 'dicairkan',
      keterangan: claimKeterangan || 'Santunan dan pembiayaan fardhu kifayah jenazah'
    });

    setIsClaimModalOpen(false);
  };

  // Template Notifikasi WhatsApp Tagihan
  const generateWaReminder = (family: BabulKhairatFamily) => {
    const totalTagihan = family.jumlahJiwa * tarifPerJiwa;
    const msg = `*PEMBERITAHUAN IURAN BABUL KHAIRAT MASJID AS SHOMAD*\n\nKepada Yth. Bapak/Ibu: *${family.namaKepalaKeluarga}*\nJumlah Jiwa Terdaftar: *${family.jumlahJiwa} Orang*\nTarif per Jiwa: *${formatRupiah(tarifPerJiwa)}/bulan*\nTotal Iuran Bulanan: *${formatRupiah(totalTagihan)}*\n\nMohon untuk menyelesaikan iuran bulanan untuk menjaga amanah perlindungan fardhu kifayah dan santunan duka warga.\n\nPembayaran dapat diserahkan ke Bendahara Babul Khairat (*Bapak Zul Khaidir - 0813-6449-8575*) atau transfer ke Bank BNI: *8881-2072-09* (Masjid As Shomad).\n\nJazakumullahu khairan katsiran.`;
    return createWhatsAppUrl(family.noHp, msg);
  };

  // Template Notifikasi Kabar Duka (Lelayu)
  const [lelayuNama, setLelayuNama] = useState('');
  const [lelayuAlamat, setLelayuAlamat] = useState('');
  const [lelayuWaktu, setLelayuWaktu] = useState('');

  const generateLelayuBroadcast = () => {
    const msg = `*INNA LILLAHI WA INNA ILAIHI RAJI'UN*\n\nTelah berpulang ke Rahmatullah warga/keluarga Babul Khairat Masjid As Shomad:\n\nNama: *${lelayuNama || '[Nama Almarhum/ah]'}*\nAlamat Duka: *${lelayuAlamat || '[Alamat Rumah Duka]'}*\nWaktu Pemakaman: *${lelayuWaktu || '[Jadwal Sholat Jenazah & Pemakaman]'}*\n\nSemoga almarhum/ah diampuni segala dosanya, dilipatgandakan amal ibadahnya, dan keluarga yang ditinggalkan diberikan kesabaran serta keikhlasan.\n\nPengurus Babul Khairat Masjid As Shomad siap mendampingi proses fardhu kifayah dan pengantaran jenazah.\n\n_Wassalamu'alaikum Warahmatullahi Wabarakatuh._`;
    return createWhatsAppUrl('081364498575', msg);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('transparansi')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'transparansi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Laporan Transparan Kas</span>
          </button>
          <button
            onClick={() => setSubTab('keanggotaan')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'keanggotaan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Keanggotaan KK</span>
          </button>
          <button
            onClick={() => setSubTab('iuran')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'iuran'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Kasir Iuran Bulanan</span>
          </button>
          <button
            onClick={() => setSubTab('klaim')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'klaim'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Klaim & Pengeluaran Jenazah</span>
          </button>
          <button
            onClick={() => setSubTab('notifikasi')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'notifikasi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Tagihan & Lelayu</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {canManage && (
            <div className="flex items-center space-x-2 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs">
              <span className="text-emerald-800 font-semibold">Tarif/Orang:</span>
              <input
                type="number"
                value={tarifPerJiwa}
                onChange={(e) => setTarifPerJiwa(Number(e.target.value))}
                className="w-20 px-2 py-0.5 font-bold text-slate-800 bg-white border border-slate-300 rounded text-xs text-right outline-none"
              />
            </div>
          )}
          {canManage && subTab === 'keanggotaan' && (
            <button
              onClick={handleOpenAddFamily}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar KK Baru</span>
            </button>
          )}
          {canManage && subTab === 'iuran' && (
            <button
              onClick={() => {
                if (families.length > 0) {
                  setSelectedFamilyId(families[0].id);
                }
                setIsPaymentModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Input Iuran Masuk</span>
            </button>
          )}
          {canManage && subTab === 'klaim' && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Klaim Jenazah</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. DASBOR LAPORAN TRANSPARAN KAS BABUL KHAIRAT (UNTUK WARGA & PENGURUS) */}
      {subTab === 'transparansi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Kas Babul Khairat</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                {formatRupiah(financeSummary.saldoKasBabulKhairat)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Siap disalurkan untuk santunan duka</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total KK & Jiwa Tertanggung</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {financeSummary.totalKk} KK / {financeSummary.totalJiwaTerdaftar} Jiwa
              </div>
              <p className="text-xs text-slate-500 mt-1">Tarif iuran: {formatRupiah(tarifPerJiwa)}/orang/bln</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pemasukan Iuran Periode Ini</span>
              <div className="text-2xl font-extrabold text-emerald-800 mt-2">
                {formatRupiah(financeSummary.totalPemasukanIuran)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Dari iuran warga yang telah lunas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Penyaluran Santunan Jenazah</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-2">
                {formatRupiah(financeSummary.totalPengeluaranKlaim)}
              </div>
              <p className="text-xs text-rose-600 mt-1">Ambulans, kafan, makam & santunan</p>
            </div>
          </div>

          {/* Rincian Transparansi Pengeluaran Santunan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transparansi Santunan Fardhu Kifayah Warga</h3>
                <p className="text-xs text-slate-500">
                  Setiap pengeluaran kas duka dilaporkan secara transparan untuk menjaga amanah uang umat.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Layanan 24 Jam Siaga
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <div key={claim.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{claim.namaAlmarhum}</div>
                    <div className="text-xs text-slate-500">
                      Ahli Waris: {claim.ahliWaris} • {formatDateIndo(claim.tanggal)} • {claim.alamat}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Rincian: Ambulans ({formatRupiah(claim.biayaAmbulans)}), Kafan ({formatRupiah(claim.biayaKainKafan)}), Makam ({formatRupiah(claim.biayaMakam)}), Santunan Duka ({formatRupiah(claim.santunanKeluarga)})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm text-rose-700 block">
                      {formatRupiah(claim.totalKlaim)}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAJEMEN KEANGGOTAAN KK & ANGGOTA KELUARGA */}
      {subTab === 'keanggotaan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama Kepala Keluarga, No KK, atau alamat..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total: {families.length} Kepala Keluarga
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No KK & Nama Kepala Keluarga</th>
                  <th className="px-4 py-3">Alamat Domisili</th>
                  <th className="px-4 py-3">No WhatsApp</th>
                  <th className="px-4 py-3">Jumlah Jiwa</th>
                  <th className="px-4 py-3">Daftar Anggota Keluarga</th>
                  <th className="px-4 py-3 text-right">Tarif Iuran/Bulan</th>
                  {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families
                  .filter((f) => 
                    f.namaKepalaKeluarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.noKk.includes(searchTerm) ||
                    f.alamat.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{f.namaKepalaKeluarga}</div>
                        <div className="text-[11px] text-slate-400 font-mono">KK: {f.noKk}</div>
                      </td>
                      <td className="px-4 py-3">{f.alamat}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${f.noHp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> {f.noHp}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-bold text-center">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          {f.jumlahJiwa} Jiwa
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[11px] text-slate-600 max-w-xs truncate" title={f.anggotaList.join(', ')}>
                          {f.anggotaList.join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatRupiah(f.jumlahJiwa * tarifPerJiwa)}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditFamily(f)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Data KK"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data KK "${f.namaKepalaKeluarga}"?`)) {
                                  onDeleteFamily(f.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus Data KK"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PENCATATAN IURAN BULANAN & SISTEM KASIR */}
      {subTab === 'iuran' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pencatatan Iuran Warga (Kasir Digital)
              </h3>
              <p className="text-[11px] text-slate-500">Iuran dihitung otomatis berdasarkan jumlah jiwa terdaftar (Rp {tarifPerJiwa.toLocaleString()}/jiwa)</p>
            </div>
            <div className="text-xs font-bold text-emerald-800">
              Total Iuran Lunas: {formatRupiah(financeSummary.totalPemasukanIuran)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Kepala Keluarga</th>
                  <th className="px-4 py-3">Periode Bulan</th>
                  <th className="px-4 py-3 text-center">Jumlah Jiwa</th>
                  <th className="px-4 py-3 text-right">Total Tagihan</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3 text-center">Status Bayar</th>
                  <th className="px-4 py-3 text-center">Kwitansi & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{p.namaKk}</td>
                    <td className="px-4 py-3">{p.bulan} {p.tahun}</td>
                    <td className="px-4 py-3 text-center">{p.jumlahJiwa} Orang</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-800">
                      {formatRupiah(p.totalNominal)}
                    </td>
                    <td className="px-4 py-3 uppercase text-[11px] font-semibold text-slate-600">
                      {p.metode === 'transfer_bni' ? 'Transfer BNI' : 'Tunai'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {p.status === 'lunas' ? 'Lunas' : 'Menunggak'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        {p.status === 'lunas' && (
                          <button
                            onClick={() => setReceiptPayment(p)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 border border-slate-300"
                            title="Cetak Kwitansi Iuran"
                          >
                            <Printer className="w-3 h-3 text-blue-700" />
                            <span>Kwitansi</span>
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus catatan iuran ${p.namaKk}?`)) {
                                onDeletePayment(p.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Iuran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. KLAIM SANTUNAN & PENGELUARAN JENAZAH */}
      {subTab === 'klaim' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">Klaim Santunan & Pengeluaran Jenazah Warga</h3>
              <p className="text-xs text-slate-500">
                Penyaluran dana fardhu kifayah: Biaya ambulans, kain kafan lengkap, pemakaman, dan santunan duka ahli waris.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{c.namaAlmarhum}</h4>
                    <p className="text-xs text-slate-500">Ahli Waris: {c.ahliWaris} ({c.noHp})</p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {formatRupiah(c.totalKlaim)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>Ambulans: <strong className="text-slate-800">{formatRupiah(c.biayaAmbulans)}</strong></div>
                  <div>Kain Kafan: <strong className="text-slate-800">{formatRupiah(c.biayaKainKafan)}</strong></div>
                  <div>Biaya Makam: <strong className="text-slate-800">{formatRupiah(c.biayaMakam)}</strong></div>
                  <div>Santunan Duka: <strong className="text-emerald-700">{formatRupiah(c.santunanKeluarga)}</strong></div>
                </div>

                <p className="text-[11px] text-slate-600 italic">{c.keterangan}</p>

                {canManage && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus klaim santunan ${c.namaAlmarhum}?`)) {
                          onDeleteClaim(c.id);
                        }
                      }}
                      className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus Klaim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. NOTIFIKASI WHATSAPP / SMS GATEWAY (PENGINGAT IURAN & LELAYU) */}
      {subTab === 'notifikasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Broadcast Kabar Duka (Lelayu) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-rose-700 pb-2 border-b border-slate-100">
              <HeartHandshake className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Pengumuman Lelayu (Kabar Duka Warga)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Format pengumuman resmi ke grup WhatsApp warga saat ada anggota Babul Khairat yang berpulang ke rahmatullah.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Almarhum / Almarhumah</label>
                <input
                  type="text"
                  value={lelayuNama}
                  onChange={(e) => setLelayuNama(e.target.value)}
                  placeholder="Contoh: Alm. Bapak H. Suparman"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Rumah Duka</label>
                <input
                  type="text"
                  value={lelayuAlamat}
                  onChange={(e) => setLelayuAlamat(e.target.value)}
                  placeholder="Contoh: RT 03 / RW 04 Kelurahan As Shomad"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Waktu Sholat Jenazah & Pemakaman</label>
                <input
                  type="text"
                  value={lelayuWaktu}
                  onChange={(e) => setLelayuWaktu(e.target.value)}
                  placeholder="Contoh: Ba'da Ashar di Masjid As Shomad, dimakamkan di TPU Muslim"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2">
                <a
                  href={generateLelayuBroadcast()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-xs text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Broadcast Kabar Duka via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Pengingat Tagihan Iuran Bulanan Per KK */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-emerald-800 pb-2 border-b border-slate-100">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Pengingat Tagihan Iuran Bulanan Warga
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Kirimkan notifikasi tagihan iuran langsung ke nomor WhatsApp Kepala Keluarga dengan satu kali klik.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {families.map((fam) => (
                <div key={fam.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{fam.namaKepalaKeluarga}</div>
                    <div className="text-[11px] text-slate-500">
                      {fam.jumlahJiwa} Jiwa • Tagihan: {formatRupiah(fam.jumlahJiwa * tarifPerJiwa)}
                    </div>
                  </div>
                  <a
                    href={generateWaReminder(fam)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim WA</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT KK BARU */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingFamily ? 'Edit Data Keanggotaan KK' : 'Pendaftaran Anggota KK Babul Khairat'}
              </h3>
              <button onClick={() => setIsFamilyModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitFamily} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                <input
                  type="text"
                  required
                  value={noKk}
                  onChange={(e) => setNoKk(e.target.value)}
                  placeholder="Contoh: 2171012903880001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kepala Keluarga</label>
                <input
                  type="text"
                  required
                  value={namaKk}
                  onChange={(e) => setNamaKk(e.target.value)}
                  placeholder="Nama lengkap kepala keluarga"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 08127718440"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="RT / RW / Blok"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Input Jumlah Jiwa / Tanggungan */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Jumlah Jiwa / Tanggungan
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Total tanggungan fardhu kifayah keluarga
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white border border-emerald-300 rounded-xl p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setJumlahJiwaInput((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      title="Kurangi jiwa"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={jumlahJiwaInput}
                      onChange={(e) => setJumlahJiwaInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-12 text-center font-black text-sm text-emerald-900 outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setJumlahJiwaInput((prev) => prev + 1)}
                      className="w-7 h-7 flex items-center justify-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      title="Tambah jiwa"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/70 text-[11px]">
                  <span className="text-slate-600">
                    Tarif Iuran: <strong className="text-emerald-700">{formatRupiah(tarifPerJiwa)}/jiwa</strong>
                  </span>
                  <span className="text-slate-800 font-bold">
                    Kewajiban Iuran: <span className="text-emerald-800 font-extrabold">{formatRupiah(jumlahJiwaInput * tarifPerJiwa)}/bulan</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Anggota Keluarga yang Ditanggung (Pisahkan dengan koma)
                </label>
                <textarea
                  rows={3}
                  value={anggotaStr}
                  onChange={(e) => handleAnggotaChange(e.target.value)}
                  placeholder="Contoh: H. Syaripudin, Hj. Siti Aisyah, Rizky Fauzan, Nurul Fadhilah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                ></textarea>
                <span className="text-[11px] text-slate-500">
                  Rincian nama tanggungan keluarga. Jumlah jiwa otomatis menyesuaikan atau dapat Anda atur langsung di atas.
                </span>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Data KK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT IURAN KASIR */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Kasir Pencatatan Iuran Babul Khairat</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Kepala Keluarga</label>
                <select
                  value={selectedFamilyId}
                  onChange={(e) => setSelectedFamilyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                >
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.namaKepalaKeluarga} ({f.jumlahJiwa} Jiwa - {formatRupiah(f.jumlahJiwa * tarifPerJiwa)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulan Iuran</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="Januari 2025">Januari 2025</option>
                  <option value="Februari 2025">Februari 2025</option>
                  <option value="Maret 2025">Maret 2025</option>
                  <option value="April 2025">April 2025</option>
                  <option value="Mei 2025">Mei 2025</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="tunai">Tunai</option>
                    <option value="transfer_bni">Transfer BNI</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Bayar</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-emerald-800"
                  >
                    <option value="lunas">Lunas</option>
                    <option value="menunggak">Menunggak</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT KLAIM JENAZAH */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-rose-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Formulir Klaim Santunan & Pengeluaran Jenazah</h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-rose-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Almarhum / Almarhumah</label>
                  <input
                    type="text"
                    required
                    value={claimAlmarhum}
                    onChange={(e) => setClaimAlmarhum(e.target.value)}
                    placeholder="Nama almarhum"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Ahli Waris Penerima</label>
                  <input
                    type="text"
                    required
                    value={claimAhliWaris}
                    onChange={(e) => setClaimAhliWaris(e.target.value)}
                    placeholder="Nama istri/suami/anak"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No HP Ahli Waris</label>
                  <input
                    type="text"
                    required
                    value={claimNoHp}
                    onChange={(e) => setClaimNoHp(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Rumah Duka</label>
                  <input
                    type="text"
                    required
                    value={claimAlamat}
                    onChange={(e) => setClaimAlamat(e.target.value)}
                    placeholder="Alamat lengkap"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biaya Ambulans (Rp)</label>
                  <input
                    type="number"
                    value={biayaAmbulans}
                    onChange={(e) => setBiayaAmbulans(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kain Kafan & Perlengkapan (Rp)</label>
                  <input
                    type="number"
                    value={biayaKafan}
                    onChange={(e) => setBiayaKafan(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biaya Penggalian Makam (Rp)</label>
                  <input
                    type="number"
                    value={biayaMakam}
                    onChange={(e) => setBiayaMakam(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Santunan Duka Tunai (Rp)</label>
                  <input
                    type="number"
                    value={santunanDuka}
                    onChange={(e) => setSantunanDuka(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={claimKeterangan}
                  onChange={(e) => setClaimKeterangan(e.target.value)}
                  placeholder="Keterangan saksi atau pemakaman"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md"
                >
                  Cairkan Santunan Klaim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK KWITANSI IURAN BABUL KHAIRAT */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
            <div className="bg-emerald-900 px-6 py-4 text-white flex justify-between items-center no-print">
              <h3 className="font-bold text-sm">Bukti Pembayaran Iuran Resmi (Kwitansi)</h3>
              <button onClick={() => setReceiptPayment(null)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <div className="p-8 space-y-4 text-slate-800 border-4 border-double border-emerald-800 m-4 rounded-xl bg-amber-50/20">
              {/* Kop Kwitansi */}
              <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
                <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                  <MosqueLogo className="w-full h-full" />
                </div>
                <div className="text-center flex-1 px-3">
                  <h2 className="text-base font-extrabold text-emerald-900 tracking-wider">
                    BABUL KHAIRAT MASJID AS SHOMAD
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Rukun Kematian & Fardhu Kifayah Warga Muslim Griya Praja
                  </p>
                  <div className="mt-1 font-mono text-[11px] font-bold text-slate-500">
                    No. Bukti: KWT-BK-{receiptPayment.id}
                  </div>
                </div>
                <div className="w-14 h-14 shrink-0 flex items-center justify-center opacity-0 pointer-events-none">
                  <MosqueLogo className="w-full h-full" />
                </div>
              </div>

              {/* Isi Kwitansi */}
              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-32 text-slate-500">Telah Diterima Dari:</span>
                  <span className="font-extrabold text-slate-900">{receiptPayment.namaKk}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Uang Sejumlah:</span>
                  <span className="font-bold italic text-emerald-900 bg-emerald-50 px-2 py-1 rounded w-full">
                    {angkaTerbilang(receiptPayment.totalNominal)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Untuk Pembayaran:</span>
                  <span>
                    Iuran Babul Khairat Bulan <strong>{receiptPayment.bulan}</strong> ({receiptPayment.jumlahJiwa} Jiwa @ {formatRupiah(receiptPayment.nominalPerJiwa)})
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Tanggal Bayar:</span>
                  <span>{formatDateIndo(receiptPayment.tanggalBayar)}</span>
                </div>
              </div>

              {/* Total Nominal Besar & TTD */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="bg-emerald-800 text-white font-black text-lg px-4 py-2 rounded-lg tracking-wider">
                  {formatRupiah(receiptPayment.totalNominal)}
                </div>
                <div className="text-center text-[10px]">
                  <p>Bendahara Babul Khairat,</p>
                  <p className="font-bold mt-6 text-slate-900">Bapak Zul Khaidir</p>
                  <p className="text-[9px] text-slate-500">0813-6449-8575</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end space-x-2 no-print">
              <button
                onClick={() => setReceiptPayment(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kwitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
