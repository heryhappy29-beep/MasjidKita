import React, { useState, useMemo } from 'react';
import { 
  ShohibulQurban, 
  QurbanInstallment, 
  QurbanStock, 
  UserRole 
} from '../types';
import { formatRupiah, formatDateIndo, angkaTerbilang, exportToCSV } from '../utils/formatters';
import { MosqueLogo } from './MosqueLogo';
import { OfficialQrisPlacard } from './OfficialQrisPlacard';
import { 
  Coins, 
  UserPlus, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Printer, 
  Download, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  QrCode, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

interface QurbanViewProps {
  shohibulList: ShohibulQurban[];
  onAddShohibul: (s: Omit<ShohibulQurban, 'id'>) => void;
  onEditShohibul: (s: ShohibulQurban) => void;
  onDeleteShohibul: (id: string) => void;
  installments: QurbanInstallment[];
  onAddInstallment: (inst: Omit<QurbanInstallment, 'id'>) => void;
  onDeleteInstallment: (id: string) => void;
  stocks: QurbanStock[];
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const QurbanView: React.FC<QurbanViewProps> = ({
  shohibulList,
  onAddShohibul,
  onEditShohibul,
  onDeleteShohibul,
  installments,
  onAddInstallment,
  onDeleteInstallment,
  stocks,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'bendahara_qurban';

  const [subTab, setSubTab] = useState<'peserta' | 'cicilan' | 'pembayaran_digital' | 'laporan'>('peserta');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Pendaftaran Shohibul Baru
  const [isShohibulModalOpen, setIsShohibulModalOpen] = useState(false);
  const [editingShohibul, setEditingShohibul] = useState<ShohibulQurban | null>(null);
  const [namaPeserta, setNamaPeserta] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisQurban, setJenisQurban] = useState<'sapi_perorangan' | 'sapi_kolektif' | 'kambing'>('sapi_kolektif');
  const [kelompokSapi, setKelompokSapi] = useState<number>(1);
  const [atasNama, setAtasNama] = useState('');
  const [totalBiaya, setTotalBiaya] = useState<number>(3300000);
  const [catatan, setCatatan] = useState('');

  // Modal Form Bayar Cicilan
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedShohibulId, setSelectedShohibulId] = useState<string>('');
  const [nominalCicilan, setNominalCicilan] = useState<number | ''>('');
  const [metodeBayar, setMetodeBayar] = useState<'transfer_bni' | 'qris' | 'ewallet' | 'tunai'>('transfer_bni');
  const [catatanCicilan, setCatatanCicilan] = useState('');

  // Kwitansi Cetak Shohibul / Pendaftaran
  const [receiptShohibul, setReceiptShohibul] = useState<ShohibulQurban | null>(null);

  // Perhitungan Ringkasan Qurban
  const qurbanSummary = useMemo(() => {
    let totalTargetDana = 0;
    let totalDanaTerkumpul = 0;
    let totalShohibul = shohibulList.length;
    let lunasCount = 0;
    let dpCount = 0;
    let belumBayarCount = 0;

    shohibulList.forEach((s) => {
      totalTargetDana += s.totalBiaya;
      totalDanaTerkumpul += s.terbayar;
      if (s.status === 'lunas') lunasCount++;
      else if (s.status === 'dp') dpCount++;
      else belumBayarCount++;
    });

    return {
      totalTargetDana,
      totalDanaTerkumpul,
      sisaPiutang: totalTargetDana - totalDanaTerkumpul,
      totalShohibul,
      lunasCount,
      dpCount,
      belumBayarCount
    };
  }, [shohibulList]);

  // Handle Buka Form Tambah Shohibul
  const handleOpenAddShohibul = () => {
    setEditingShohibul(null);
    setNamaPeserta('');
    setNoHp('');
    setAlamat('');
    setJenisQurban('sapi_kolektif');
    setKelompokSapi(1);
    setAtasNama('');
    setTotalBiaya(3300000);
    setCatatan('Kelompok Sapi 01 (1/7 Bagian)');
    setIsShohibulModalOpen(true);
  };

  const handleOpenEditShohibul = (s: ShohibulQurban) => {
    setEditingShohibul(s);
    setNamaPeserta(s.nama);
    setNoHp(s.noHp);
    setAlamat(s.alamat);
    setJenisQurban(s.jenisQurban);
    setKelompokSapi(s.kelompokSapi || 1);
    setAtasNama(s.atasNama.join(', '));
    setTotalBiaya(s.totalBiaya);
    setCatatan(s.catatan || '');
    setIsShohibulModalOpen(true);
  };

  // Submit Shohibul
  const handleSubmitShohibul = (e: React.FormEvent) => {
    e.preventDefault();
    const namaList = atasNama.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    if (editingShohibul) {
      onEditShohibul({
        ...editingShohibul,
        nama: namaPeserta,
        noHp,
        alamat,
        jenisQurban,
        kelompokSapi: jenisQurban === 'sapi_kolektif' ? kelompokSapi : undefined,
        atasNama: namaList.length > 0 ? namaList : [namaPeserta],
        totalBiaya,
        status: editingShohibul.terbayar >= totalBiaya ? 'lunas' : editingShohibul.terbayar > 0 ? 'dp' : 'belum_bayar',
        catatan
      });
    } else {
      const newNomor = `Q-2025-00${shohibulList.length + 1}`;
      onAddShohibul({
        nomorPeserta: newNomor,
        nama: namaPeserta,
        noHp,
        alamat,
        jenisQurban,
        kelompokSapi: jenisQurban === 'sapi_kolektif' ? kelompokSapi : undefined,
        atasNama: namaList.length > 0 ? namaList : [namaPeserta],
        totalBiaya,
        terbayar: 0,
        status: 'belum_bayar',
        tanggalDaftar: new Date().toISOString().split('T')[0],
        catatan
      });
    }
    setIsShohibulModalOpen(false);
  };

  // Submit Pembayaran Cicilan
  const handleSubmitInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalCicilan || Number(nominalCicilan) <= 0) return;

    const shohibul = shohibulList.find((s) => s.id === selectedShohibulId);
    if (!shohibul) return;

    const nom = Number(nominalCicilan);
    const newTerbayar = shohibul.terbayar + nom;
    const newStatus: 'lunas' | 'dp' | 'belum_bayar' = newTerbayar >= shohibul.totalBiaya ? 'lunas' : 'dp';

    onAddInstallment({
      shohibulId: shohibul.id,
      namaPeserta: shohibul.nama,
      tanggal: new Date().toISOString().split('T')[0],
      nominal: nom,
      metode: metodeBayar,
      kuitansiNo: `KWT-Q25-${Math.floor(1000 + Math.random() * 9000)}`,
      catatan: catatanCicilan || `Pembayaran cicilan qurban ${shohibul.nama}`
    });

    onEditShohibul({
      ...shohibul,
      terbayar: newTerbayar,
      status: newStatus
    });

    setIsInstallmentModalOpen(false);
    setNominalCicilan('');
    setCatatanCicilan('');
  };

  // Export Rekapitulasi Qurban ke CSV
  const handleExportQurban = () => {
    const rows: (string | number)[][] = [
      ['REKAPITULASI SHOHIBUL QURBAN MASJID AS SHOMAD 1446 H'],
      ['Tanggal Laporan:', new Date().toLocaleDateString('id-ID')],
      [],
      ['No', 'No Peserta', 'Nama Shohibul', 'No WhatsApp', 'Jenis Qurban', 'Kelompok Sapi', 'Atas Nama Qurban', 'Total Biaya (Rp)', 'Terbayar (Rp)', 'Sisa (Rp)', 'Status Bayar']
    ];

    shohibulList.forEach((s, idx) => {
      rows.push([
        idx + 1,
        s.nomorPeserta,
        s.nama,
        s.noHp,
        s.jenisQurban === 'sapi_perorangan' ? 'Sapi Mandiri' : s.jenisQurban === 'sapi_kolektif' ? 'Sapi Kolektif 1/7' : 'Kambing',
        s.kelompokSapi ? `Kelompok ${s.kelompokSapi}` : '-',
        s.atasNama.join(', '),
        s.totalBiaya,
        s.terbayar,
        s.totalBiaya - s.terbayar,
        s.status.toUpperCase()
      ]);
    });

    rows.push([]);
    rows.push(['TOTAL DANA TERKUMPUL', qurbanSummary.totalDanaTerkumpul]);
    rows.push(['SISA BELUM LUNAS', qurbanSummary.sisaPiutang]);

    exportToCSV(`Rekapitulasi_Qurban_Masjid_As_Shomad_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Banner Hak Akses Pengurus */}
      {!canManage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Anda mengakses sebagai <strong>Jama'ah / Publik (Informasi Transparan Qurban)</strong>. Untuk mendata shohibul, mengelola cicilan, dan stok hewan, silakan login sebagai <strong>Bendahara Qurban</strong> (Bpk. Herry / Bpk. Jacky) atau <strong>Super Admin</strong>.
            </span>
          </div>
          <button
            onClick={onOpenLogin}
            className="ml-3 shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
          >
            Login
          </button>
        </div>
      )}

      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('peserta')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'peserta'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Daftar Shohibul Qurban</span>
          </button>
          <button
            onClick={() => setSubTab('cicilan')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'cicilan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Tabel & Form Cicilan</span>
          </button>
          <button
            onClick={() => setSubTab('pembayaran_digital')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'pembayaran_digital'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Sistem Pembayaran Digital</span>
          </button>
          <button
            onClick={() => setSubTab('laporan')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'laporan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stok Hewan & Laporan Panitia</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportQurban}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Rekap</span>
          </button>
          {canManage && (
            <>
              <button
                onClick={() => {
                  if (shohibulList.length > 0) setSelectedShohibulId(shohibulList[0].id);
                  setIsInstallmentModalOpen(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Input Cicilan</span>
              </button>
              <button
                onClick={handleOpenAddShohibul}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Shohibul</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. DAFTAR SHOHIBUL QURBAN */}
      {subTab === 'peserta' && (
        <div className="space-y-6">
          {/* Matriks Ringkasan Shohibul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Shohibul Terdaftar</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {qurbanSummary.totalShohibul} Peserta
              </div>
              <p className="text-xs text-slate-500 mt-1">Lunas: {qurbanSummary.lunasCount} • DP: {qurbanSummary.dpCount}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Dana Terkumpul</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                {formatRupiah(qurbanSummary.totalDanaTerkumpul)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Dari target {formatRupiah(qurbanSummary.totalTargetDana)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Cicilan / Piutang</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-2">
                {formatRupiah(qurbanSummary.sisaPiutang)}
              </div>
              <p className="text-xs text-amber-600 mt-1">Dalam proses angsuran pequrban</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kontak Panitia Qurban</span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="font-bold text-slate-800">Bapak Herry: 0852-6411-8090</div>
                <div className="font-bold text-slate-800">Bapak Jacky: 0822-6112-2454</div>
              </div>
            </div>
          </div>

          {/* Tabel Peserta Shohibul */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama shohibul atau nomor peserta..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <span className="text-xs text-slate-500">
                Pencetakan Bukti Pendaftaran Tersedia Otomatis
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No Peserta & Shohibul</th>
                    <th className="px-4 py-3">Jenis Qurban</th>
                    <th className="px-4 py-3">Atas Nama Qurban</th>
                    <th className="px-4 py-3 text-right">Total Biaya</th>
                    <th className="px-4 py-3 text-right">Terbayar</th>
                    <th className="px-4 py-3 text-right">Sisa Angsuran</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Kwitansi & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shohibulList
                    .filter((s) => 
                      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.nomorPeserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.noHp.includes(searchTerm)
                    )
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{s.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{s.nomorPeserta} • {s.noHp}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.jenisQurban === 'sapi_perorangan'
                              ? 'bg-amber-100 text-amber-800'
                              : s.jenisQurban === 'sapi_kolektif'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {s.jenisQurban === 'sapi_perorangan'
                              ? 'Sapi Mandiri (1 Ekor)'
                              : s.jenisQurban === 'sapi_kolektif'
                              ? `Sapi Kolektif (Klp ${s.kelompokSapi})`
                              : 'Kambing Tipe A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{s.atasNama.join(', ')}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatRupiah(s.totalBiaya)}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-emerald-700">
                          {formatRupiah(s.terbayar)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-amber-700">
                          {formatRupiah(s.totalBiaya - s.terbayar)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'lunas'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : s.status === 'dp'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {s.status === 'lunas' ? 'LUNAS' : s.status === 'dp' ? 'DP / PANJAR' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setReceiptShohibul(s)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 border border-slate-300"
                              title="Cetak Bukti Pendaftaran Qurban"
                            >
                              <Printer className="w-3 h-3 text-blue-700" />
                              <span>Kwitansi</span>
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => handleOpenEditShohibul(s)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit Data"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Hapus pendaftaran qurban ${s.nama}?`)) {
                                      onDeleteShohibul(s.id);
                                    }
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TABEL CICILAN PEMBAYARAN QURBAN */}
      {subTab === 'cicilan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Riwayat Transaksi Angsuran & Cicilan Qurban
              </h3>
              <p className="text-[11px] text-slate-500">Mencatat pembayaran DP, termin cicilan, dan pelunasan shohibul</p>
            </div>
            <span className="text-xs font-bold text-emerald-800">
              Total Mutasi: {installments.length} Pembayaran
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Kuitansi</th>
                  <th className="px-4 py-3">Nama Shohibul Qurban</th>
                  <th className="px-4 py-3">Tanggal Bayar</th>
                  <th className="px-4 py-3 text-right">Nominal Bayar</th>
                  <th className="px-4 py-3">Metode Bayar</th>
                  <th className="px-4 py-3">Catatan / Peruntukan</th>
                  {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-800">{inst.kuitansiNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{inst.namaPeserta}</td>
                    <td className="px-4 py-3">{formatDateIndo(inst.tanggal)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-800">
                      {formatRupiah(inst.nominal)}
                    </td>
                    <td className="px-4 py-3 uppercase text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inst.metode.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inst.catatan || '-'}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus mutasi cicilan ini?')) {
                              onDeleteInstallment(inst.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SISTEM PEMBAYARAN DIGITAL (QRIS, TRANSFER BANK BNI, E-WALLET) */}
      {subTab === 'pembayaran_digital' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>Rekening Resmi Panitia Qurban Masjid As Shomad</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jama'ah atau shohibul qurban dapat mentransfer dana pembelian atau cicilan qurban langsung ke rekening giro resmi masjid berikut:
            </p>

            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-emerald-200">
                <span>BANK NEGARA INDONESIA (BNI)</span>
                <span className="bg-emerald-700 px-2 py-0.5 rounded font-mono">REK UTAMA</span>
              </div>
              <div className="text-2xl font-mono font-black tracking-widest text-amber-300">
                8881-2072-09
              </div>
              <div className="text-xs font-medium">
                Atas Nama: <strong>Masjid As Shomad</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block">Konfirmasi Pembayaran Qurban:</span>
              <p className="text-slate-600">
                Setelah melakukan transfer atau pembayaran e-wallet, kirimkan bukti transfer ke Bendahara Panitia Qurban via WhatsApp:
              </p>
              <div className="pt-2 flex flex-col gap-1 font-semibold text-emerald-800">
                <a href="https://wa.me/6285264118090" target="_blank" rel="noreferrer" className="hover:underline">
                  • Bapak Herry: 0852-6411-8090
                </a>
                <a href="https://wa.me/6282261122454" target="_blank" rel="noreferrer" className="hover:underline">
                  • Bapak Jacky: 0822-6112-2454
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-700" />
              <span>QRIS Pembayaran Digital Qurban</span>
            </h3>
            <p className="text-xs text-slate-500">
              Menerima pembayaran dari BCA, Livin Mandiri, BRImo, BNI Mobile, GoPay, OVO, ShopeePay & Dana.
            </p>

            <OfficialQrisPlacard size="compact" />
          </div>
        </div>
      )}

      {/* 4. PANEL ADMIN & LAPORAN STOK HEWAN QURBAN */}
      {subTab === 'laporan' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manajemen Stok Hewan & Rekapitulasi Qurban</h3>
              <p className="text-xs text-slate-500">
                Pantau kuota slot sapi kemitraan kolektif, sapi mandiri, dan stok kambing qurban Idul Adha 1446 H.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stocks.map((stk, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-sm text-slate-900">{stk.jenis}</h4>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {formatRupiah(stk.hargaSatuan)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stok Tersedia:</span>
                    <strong className="text-slate-800">{stk.stokTersedia} Ekor/Bagian</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sudah Terpesan:</span>
                    <strong className="text-emerald-700">{stk.terpesan} Slot</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa Kuota:</span>
                    <strong className="text-blue-700">{stk.stokTersedia - stk.terpesan} Slot</strong>
                  </div>
                </div>

                {/* Progress bar stok */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(stk.terpesan / stk.stokTersedia) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PENDAFTARAN SHOHIBUL BARU */}
      {isShohibulModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingShohibul ? 'Edit Data Shohibul Qurban' : 'Pendaftaran Shohibul Qurban Baru'}
              </h3>
              <button onClick={() => setIsShohibulModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitShohibul} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pendaftar / Shohibul</label>
                  <input
                    type="text"
                    required
                    value={namaPeserta}
                    onChange={(e) => setNamaPeserta(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="RT / RW / Perumahan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Hewan Qurban</label>
                  <select
                    value={jenisQurban}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setJenisQurban(val);
                      if (val === 'sapi_kolektif') setTotalBiaya(3300000);
                      else if (val === 'sapi_perorangan') setTotalBiaya(21000000);
                      else setTotalBiaya(3500000);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value="sapi_kolektif">Sapi Kolektif (1/7 Bagian)</option>
                    <option value="sapi_perorangan">Sapi Mandiri (1 Ekor Penuh)</option>
                    <option value="kambing">Kambing Tipe A Super</option>
                  </select>
                </div>
                {jenisQurban === 'sapi_kolektif' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kelompok Sapi (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={kelompokSapi}
                      onChange={(e) => setKelompokSapi(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Diniatkan Qurban Atas Nama (Shohibul Qurban)
                </label>
                <input
                  type="text"
                  required
                  value={atasNama}
                  onChange={(e) => setAtasNama(e.target.value)}
                  placeholder="Contoh: H. Syaripudin bin Abdullah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium"
                />
                <span className="text-[11px] text-slate-500">Jika sapi mandiri, dapat diisi hingga 7 nama dipisah koma.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Biaya Qurban (Rp)</label>
                <input
                  type="number"
                  required
                  value={totalBiaya}
                  onChange={(e) => setTotalBiaya(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan permintaan bagian daging atau tanggal pelunasan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsShohibulModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT CICILAN */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-blue-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Input Pembayaran Cicilan Qurban</h3>
              <button onClick={() => setIsInstallmentModalOpen(false)} className="text-blue-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitInstallment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Shohibul Qurban</label>
                <select
                  value={selectedShohibulId}
                  onChange={(e) => setSelectedShohibulId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                >
                  {shohibulList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (Sisa: {formatRupiah(s.totalBiaya - s.terbayar)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  required
                  min="10000"
                  value={nominalCicilan}
                  onChange={(e) => setNominalCicilan(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Contoh: 1000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={metodeBayar}
                  onChange={(e) => setMetodeBayar(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="transfer_bni">Transfer Bank BNI (8881-2072-09)</option>
                  <option value="qris">QRIS Digital Masjid</option>
                  <option value="ewallet">E-Wallet (GoPay/OVO/Dana)</option>
                  <option value="tunai">Kasir Tunai Panitia</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={catatanCicilan}
                  onChange={(e) => setCatatanCicilan(e.target.value)}
                  placeholder="Contoh: Cicilan ke-2 transfer BNI"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInstallmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Cicilan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KWITANSI PENDAFTARAN / BUKTI PEMBAYARAN QURBAN RESMI */}
      {receiptShohibul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
            <div className="bg-emerald-900 px-6 py-4 text-white flex justify-between items-center no-print">
              <h3 className="font-bold text-sm">Bukti Pendaftaran & Kuitansi Qurban Resmi</h3>
              <button onClick={() => setReceiptShohibul(null)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <div className="p-8 space-y-4 text-slate-800 border-4 border-double border-emerald-800 m-4 rounded-xl bg-amber-50/20">
              <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
                <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                  <MosqueLogo className="w-full h-full" />
                </div>
                <div className="text-center flex-1 px-3">
                  <h2 className="text-base font-extrabold text-emerald-900 tracking-wider">
                    PANITIA IBADAH QURBAN MASJID AS SHOMAD
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Tanda Bukti Registrasi Shohibul Qurban 1446 H / Griya Praja
                  </p>
                  <div className="mt-1 font-mono text-[11px] font-bold text-slate-500">
                    No. Bukti: {receiptShohibul.nomorPeserta}
                  </div>
                </div>
                <div className="w-14 h-14 shrink-0 flex items-center justify-center opacity-0 pointer-events-none">
                  <MosqueLogo className="w-full h-full" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-32 text-slate-500">Nama Shohibul:</span>
                  <span className="font-extrabold text-slate-900">{receiptShohibul.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Atas Nama:</span>
                  <span className="font-bold text-slate-800">{receiptShohibul.atasNama.join(', ')}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Jenis Qurban:</span>
                  <span className="font-semibold text-slate-800">
                    {receiptShohibul.jenisQurban === 'sapi_perorangan' ? 'Sapi Mandiri (1 Ekor)' : receiptShohibul.jenisQurban === 'sapi_kolektif' ? `Sapi Kolektif 1/7 Bagian (Klp ${receiptShohibul.kelompokSapi})` : 'Kambing Tipe A Super'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Total Biaya:</span>
                  <span className="font-extrabold text-slate-900">{formatRupiah(receiptShohibul.totalBiaya)}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Jumlah Terbayar:</span>
                  <span className="font-extrabold text-emerald-800">{formatRupiah(receiptShohibul.terbayar)}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Sisa Pelunasan:</span>
                  <span className="font-bold text-amber-700">{formatRupiah(receiptShohibul.totalBiaya - receiptShohibul.terbayar)}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-500">Status Pembayaran:</span>
                  <span className="font-black uppercase tracking-wider text-emerald-800">
                    {receiptShohibul.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Tanggal Daftar:</div>
                  <div className="font-bold text-xs">{formatDateIndo(receiptShohibul.tanggalDaftar)}</div>
                </div>
                <div className="text-center text-[10px]">
                  <p>Bendahara Panitia Qurban,</p>
                  <p className="font-bold mt-6 text-slate-900">Bapak Herry / Bapak Jacky</p>
                  <p className="text-[9px] text-slate-500">0852-6411-8090</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end space-x-2 no-print">
              <button
                onClick={() => setReceiptShohibul(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kuitansi Qurban</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
