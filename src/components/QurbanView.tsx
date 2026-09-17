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
  ShieldCheck,
  Plus
} from 'lucide-react';

interface QurbanViewProps {
  shohibulList: ShohibulQurban[];
  onAddShohibul: (s: Omit<ShohibulQurban, 'id'>) => void;
  onEditShohibul: (s: ShohibulQurban) => void;
  onDeleteShohibul: (id: string) => void;
  installments: QurbanInstallment[];
  onAddInstallment: (inst: Omit<QurbanInstallment, 'id'>) => void;
  onEditInstallment?: (inst: QurbanInstallment) => void;
  onDeleteInstallment: (id: string) => void;
  stocks: QurbanStock[];
  onAddStock?: (s: Omit<QurbanStock, 'id'>) => void;
  onEditStock?: (s: QurbanStock) => void;
  onDeleteStock?: (id: string) => void;
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const formatJenisQurban = (jenis: ShohibulQurban['jenisQurban'], kelompok?: number): string => {
  if (jenis === 'domba') return 'Domba Qurban (1 Ekor)';
  if (jenis === 'kambing') return 'Kambing Tipe A Super';
  if (jenis === 'sapi_kolektif') return `Sapi Kolektif (Klp ${kelompok || 1})`;
  if (jenis === 'sapi_perorangan') return 'Sapi Mandiri (1 Ekor)';
  return 'Domba / Kambing';
};

export const QurbanView: React.FC<QurbanViewProps> = ({
  shohibulList,
  onAddShohibul,
  onEditShohibul,
  onDeleteShohibul,
  installments,
  onAddInstallment,
  onEditInstallment,
  onDeleteInstallment,
  stocks,
  onAddStock,
  onEditStock,
  onDeleteStock,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'bendahara_qurban';

  const [subTab, setSubTab] = useState<'peserta' | 'cicilan' | 'pembayaran_digital' | 'laporan'>('peserta');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Edit / Tambah Stok Hewan Qurban
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<QurbanStock | null>(null);
  const [stockJenis, setStockJenis] = useState('');
  const [stockHargaSatuan, setStockHargaSatuan] = useState<number | ''>(3500000);
  const [stockTersedia, setStockTersedia] = useState<number | ''>(20);
  const [stockTerpesan, setStockTerpesan] = useState<number | ''>(0);
  const [stockKeterangan, setStockKeterangan] = useState('');

  // Modal Pendaftaran Shohibul Baru
  const [isShohibulModalOpen, setIsShohibulModalOpen] = useState(false);
  const [editingShohibul, setEditingShohibul] = useState<ShohibulQurban | null>(null);
  const [namaPeserta, setNamaPeserta] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisQurban, setJenisQurban] = useState<'sapi_perorangan' | 'sapi_kolektif' | 'kambing' | 'domba'>('domba');
  const [kelompokSapi, setKelompokSapi] = useState<number>(1);
  const [atasNama, setAtasNama] = useState('');
  const [totalBiaya, setTotalBiaya] = useState<number>(3500000);
  const [cicilanAwal, setCicilanAwal] = useState<number | ''>('');
  const [metodeAwal, setMetodeAwal] = useState<'transfer_bni' | 'qris' | 'ewallet' | 'tunai'>('transfer_bni');
  const [catatan, setCatatan] = useState('');

  // Modal Form Bayar Cicilan
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedShohibulId, setSelectedShohibulId] = useState<string>('');
  const [nominalCicilan, setNominalCicilan] = useState<number | ''>('');
  const [metodeBayar, setMetodeBayar] = useState<'transfer_bni' | 'qris' | 'ewallet' | 'tunai'>('transfer_bni');
  const [catatanCicilan, setCatatanCicilan] = useState('');

  // Kwitansi Cetak Shohibul / Pendaftaran
  const [receiptShohibul, setReceiptShohibul] = useState<ShohibulQurban | null>(null);
  // Kwitansi Cetak Bukti Cicilan
  const [receiptInstallment, setReceiptInstallment] = useState<{ inst: QurbanInstallment; shohibul?: ShohibulQurban } | null>(null);

  // Modal Edit Cicilan
  const [editingInstallment, setEditingInstallment] = useState<QurbanInstallment | null>(null);
  const [editInstNominal, setEditInstNominal] = useState<number | ''>('');
  const [editInstTanggal, setEditInstTanggal] = useState('');
  const [editInstMetode, setEditInstMetode] = useState<'transfer_bni' | 'qris' | 'ewallet' | 'tunai'>('transfer_bni');
  const [editInstCatatan, setEditInstCatatan] = useState('');

  const handleOpenEditInstallment = (inst: QurbanInstallment) => {
    setEditingInstallment(inst);
    setEditInstNominal(inst.nominal);
    setEditInstTanggal(inst.tanggal);
    setEditInstMetode(inst.metode);
    setEditInstCatatan(inst.catatan || '');
  };

  const handleSaveEditInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstallment || !onEditInstallment || !editInstNominal || Number(editInstNominal) <= 0) return;

    const newNominal = Number(editInstNominal);
    const diff = newNominal - editingInstallment.nominal;

    const updatedInst: QurbanInstallment = {
      ...editingInstallment,
      nominal: newNominal,
      tanggal: editInstTanggal || editingInstallment.tanggal,
      metode: editInstMetode,
      catatan: editInstCatatan
    };

    onEditInstallment(updatedInst);

    // Synchronize Shohibul balance
    const shohibul = shohibulList.find((s) => s.id === editingInstallment.shohibulId);
    if (shohibul && diff !== 0) {
      const newTerbayar = Math.max(0, shohibul.terbayar + diff);
      const isLunas = newTerbayar >= shohibul.totalBiaya;
      onEditShohibul({
        ...shohibul,
        terbayar: newTerbayar,
        status: isLunas ? 'lunas' : (newTerbayar > 0 ? 'belum_lunas' : 'belum_bayar')
      });
    }

    setEditingInstallment(null);
  };

  // Perhitungan Ringkasan Qurban
  const qurbanSummary = useMemo(() => {
    let totalTargetDana = 0;
    let totalDanaTerkumpul = 0;
    let totalShohibul = shohibulList.length;
    let lunasCount = 0;
    let belumLunasCount = 0;

    shohibulList.forEach((s) => {
      totalTargetDana += s.totalBiaya;
      totalDanaTerkumpul += s.terbayar;
      if (s.terbayar >= s.totalBiaya || s.status === 'lunas') {
        lunasCount++;
      } else {
        belumLunasCount++;
      }
    });

    return {
      totalTargetDana,
      totalDanaTerkumpul,
      sisaPiutang: Math.max(0, totalTargetDana - totalDanaTerkumpul),
      totalShohibul,
      lunasCount,
      belumLunasCount
    };
  }, [shohibulList]);

  // Handle Buka Form Tambah Shohibul
  const handleOpenAddShohibul = () => {
    setEditingShohibul(null);
    setNamaPeserta('');
    setNoHp('');
    setAlamat('');
    setJenisQurban('domba');
    setKelompokSapi(1);
    setAtasNama('');
    setTotalBiaya(3500000);
    setCicilanAwal('');
    setMetodeAwal('transfer_bni');
    setCatatan('Qurban 1 ekor domba');
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
    setCicilanAwal('');
    setCatatan(s.catatan || '');
    setIsShohibulModalOpen(true);
  };

  // Submit Shohibul
  const handleSubmitShohibul = (e: React.FormEvent) => {
    e.preventDefault();
    const namaList = atasNama.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    if (editingShohibul) {
      const isLunas = editingShohibul.terbayar >= totalBiaya;
      onEditShohibul({
        ...editingShohibul,
        nama: namaPeserta,
        noHp,
        alamat,
        jenisQurban,
        kelompokSapi: jenisQurban === 'sapi_kolektif' ? kelompokSapi : undefined,
        atasNama: namaList.length > 0 ? namaList : [namaPeserta],
        totalBiaya,
        status: isLunas ? 'lunas' : 'belum_lunas',
        catatan
      });
    } else {
      const newNomor = `Q-2025-00${shohibulList.length + 1}`;
      const nomAwal = Number(cicilanAwal) || 0;
      const isLunas = nomAwal >= totalBiaya;
      const newStatus = isLunas ? 'lunas' : 'belum_lunas';
      const sisa = Math.max(0, totalBiaya - nomAwal);
      const newId = `QUR-${Date.now().toString().slice(-4)}`;

      onAddShohibul({
        nomorPeserta: newNomor,
        nama: namaPeserta,
        noHp,
        alamat,
        jenisQurban,
        kelompokSapi: jenisQurban === 'sapi_kolektif' ? kelompokSapi : undefined,
        atasNama: namaList.length > 0 ? namaList : [namaPeserta],
        totalBiaya,
        terbayar: nomAwal,
        status: newStatus,
        tanggalDaftar: new Date().toISOString().split('T')[0],
        catatan: catatan || (nomAwal > 0 
          ? `Cicilan pertama ${formatRupiah(nomAwal)}, sisa yang harus dibayar ${formatRupiah(sisa)} (Status: ${newStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'})` 
          : undefined)
      });

      if (nomAwal > 0) {
        onAddInstallment({
          shohibulId: newId,
          namaPeserta: namaPeserta,
          tanggal: new Date().toISOString().split('T')[0],
          nominal: nomAwal,
          metode: metodeAwal,
          kuitansiNo: `KWT-Q25-${Math.floor(1000 + Math.random() * 9000)}`,
          catatan: `Cicilan pertama pendaftaran qurban ${formatJenisQurban(jenisQurban, kelompokSapi)} seharga ${formatRupiah(totalBiaya)}. Sisa: ${formatRupiah(sisa)} (${newStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'})`
        });
      }
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
    const isLunas = newTerbayar >= shohibul.totalBiaya;
    const newStatus: 'lunas' | 'belum_lunas' = isLunas ? 'lunas' : 'belum_lunas';
    const sisa = Math.max(0, shohibul.totalBiaya - newTerbayar);
    const instCount = installments.filter((i) => i.shohibulId === shohibul.id).length + 1;

    onAddInstallment({
      shohibulId: shohibul.id,
      namaPeserta: shohibul.nama,
      tanggal: new Date().toISOString().split('T')[0],
      nominal: nom,
      metode: metodeBayar,
      kuitansiNo: `KWT-Q25-${Math.floor(1000 + Math.random() * 9000)}`,
      catatan: catatanCicilan || `Cicilan ke-${instCount} qurban ${formatJenisQurban(shohibul.jenisQurban, shohibul.kelompokSapi)}. Sisa yang harus dibayar: ${formatRupiah(sisa)} (${isLunas ? 'Lunas' : 'Belum Lunas'})`
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
      ['No', 'No Peserta', 'Nama Shohibul', 'No WhatsApp', 'Jenis Qurban', 'Kelompok Sapi', 'Atas Nama Qurban', 'Total Biaya (Rp)', 'Terbayar (Rp)', 'Sisa Yang Harus Dibayar (Rp)', 'Status Pembayaran']
    ];

    shohibulList.forEach((s, idx) => {
      const isLunas = s.terbayar >= s.totalBiaya || s.status === 'lunas';
      rows.push([
        idx + 1,
        s.nomorPeserta,
        s.nama,
        s.noHp,
        formatJenisQurban(s.jenisQurban, s.kelompokSapi),
        s.kelompokSapi ? `Kelompok ${s.kelompokSapi}` : '-',
        s.atasNama.join(', '),
        s.totalBiaya,
        s.terbayar,
        Math.max(0, s.totalBiaya - s.terbayar),
        isLunas ? 'LUNAS' : 'BELUM LUNAS'
      ]);
    });

    rows.push([]);
    rows.push(['TOTAL DANA TERKUMPUL', qurbanSummary.totalDanaTerkumpul]);
    rows.push(['SISA YANG HARUS DIBAYAR (PIUTANG)', qurbanSummary.sisaPiutang]);

    exportToCSV(`Rekapitulasi_Qurban_Masjid_As_Shomad_${new Date().toISOString().split('T')[0]}`, rows);
  };

  // Handlers untuk Manajemen Stok Hewan Qurban (Edit & Hapus)
  const handleOpenAddStock = () => {
    setEditingStock(null);
    setStockJenis('');
    setStockHargaSatuan(3500000);
    setStockTersedia(20);
    setStockTerpesan(0);
    setStockKeterangan('');
    setIsStockModalOpen(true);
  };

  const handleOpenEditStock = (stk: QurbanStock) => {
    setEditingStock(stk);
    setStockJenis(stk.jenis);
    setStockHargaSatuan(stk.hargaSatuan);
    setStockTersedia(stk.stokTersedia);
    setStockTerpesan(stk.terpesan);
    setStockKeterangan(stk.keterangan || '');
    setIsStockModalOpen(true);
  };

  const handleSubmitStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockJenis.trim()) {
      alert('Mohon masukkan jenis/nama hewan qurban.');
      return;
    }
    const harga = Number(stockHargaSatuan) || 0;
    const tersedia = Number(stockTersedia) || 0;
    const terpesan = Number(stockTerpesan) || 0;

    if (editingStock && onEditStock) {
      onEditStock({
        ...editingStock,
        jenis: stockJenis.trim(),
        hargaSatuan: harga,
        stokTersedia: tersedia,
        terpesan: terpesan,
        keterangan: stockKeterangan.trim()
      });
    } else if (onAddStock) {
      onAddStock({
        jenis: stockJenis.trim(),
        hargaSatuan: harga,
        stokTersedia: tersedia,
        terpesan: terpesan,
        targetKebutuhan: tersedia,
        keterangan: stockKeterangan.trim()
      });
    }
    setIsStockModalOpen(false);
  };

  const handleDeleteStockItem = (stk: QurbanStock) => {
    if (!onDeleteStock) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus data hewan qurban "${stk.jenis}"?`)) {
      onDeleteStock(stk.id);
    }
  };

  return (
    <div className="space-y-6">
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
              <p className="text-xs text-slate-500 mt-1">
                Lunas: <span className="font-bold text-emerald-700">{qurbanSummary.lunasCount}</span> • Belum Lunas: <span className="font-bold text-amber-700">{qurbanSummary.belumLunasCount}</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Dana Terkumpul</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                {formatRupiah(qurbanSummary.totalDanaTerkumpul)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Dari target {formatRupiah(qurbanSummary.totalTargetDana)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Yang Harus Dibayar (Piutang)</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-2">
                {formatRupiah(qurbanSummary.sisaPiutang)}
              </div>
              <p className="text-xs text-amber-600 mt-1">Sisa cicilan pequrban (Status Belum Lunas)</p>
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
                Pencetakan Bukti Pendaftaran & Kwitansi Resmi Tersedia Otomatis
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
                    <th className="px-4 py-3 text-right">Cicilan Terbayar</th>
                    <th className="px-4 py-3 text-right">Sisa Yang Harus Dibayar</th>
                    <th className="px-4 py-3 text-center">Status Pembayaran</th>
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
                    .map((s) => {
                      const sisa = Math.max(0, s.totalBiaya - s.terbayar);
                      const isLunas = s.terbayar >= s.totalBiaya || s.status === 'lunas';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{s.nama}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{s.nomorPeserta} • {s.noHp}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              s.jenisQurban === 'sapi_perorangan'
                                ? 'bg-amber-100 text-amber-800'
                                : s.jenisQurban === 'sapi_kolektif'
                                ? 'bg-blue-100 text-blue-800'
                                : s.jenisQurban === 'domba'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {formatJenisQurban(s.jenisQurban, s.kelompokSapi)}
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
                            {formatRupiah(sisa)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
                              isLunas
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => setReceiptShohibul(s)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 border border-slate-300 transition"
                                title="Cetak Bukti Pendaftaran Qurban"
                              >
                                <Printer className="w-3 h-3 text-blue-700" />
                                <span>Kwitansi</span>
                              </button>
                              {canManage && !isLunas && (
                                <button
                                  onClick={() => {
                                    setSelectedShohibulId(s.id);
                                    setNominalCicilan(sisa);
                                    setIsInstallmentModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-[11px] font-bold flex items-center gap-1 border border-amber-300 transition"
                                  title="Input Pembayaran Cicilan / Pelunasan"
                                >
                                  <CreditCard className="w-3 h-3 text-amber-700" />
                                  <span>Cicil</span>
                                </button>
                              )}
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
                      );
                    })}
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
                  <th className="px-4 py-3 text-center">Aksi & Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {installments.map((inst) => {
                  const shohibul = shohibulList.find((s) => s.id === inst.shohibulId || s.nama.toLowerCase() === inst.namaPeserta.toLowerCase());
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-blue-800">{inst.kuitansiNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{inst.namaPeserta}</div>
                        {shohibul && (
                          <div className="text-[11px] text-slate-500">
                            Status: <span className={`font-bold ${shohibul.terbayar >= shohibul.totalBiaya || shohibul.status === 'lunas' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {shohibul.terbayar >= shohibul.totalBiaya || shohibul.status === 'lunas' ? 'Lunas' : `Belum Lunas (Sisa: ${formatRupiah(Math.max(0, shohibul.totalBiaya - shohibul.terbayar))})`}
                            </span>
                          </div>
                        )}
                      </td>
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
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setReceiptInstallment({ inst, shohibul })}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 border border-slate-300 transition"
                            title="Cetak Kuitansi Cicilan"
                          >
                            <Printer className="w-3 h-3 text-blue-700" />
                            <span>Kwitansi</span>
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleOpenEditInstallment(inst)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Edit Mutasi Cicilan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus mutasi cicilan ${inst.kuitansiNo} (${formatRupiah(inst.nominal)})?`)) {
                                    onDeleteInstallment(inst.id);
                                    if (shohibul) {
                                      const newTerbayar = Math.max(0, shohibul.terbayar - inst.nominal);
                                      const isLunas = newTerbayar >= shohibul.totalBiaya;
                                      onEditShohibul({
                                        ...shohibul,
                                        terbayar: newTerbayar,
                                        status: isLunas ? 'lunas' : (newTerbayar > 0 ? 'belum_lunas' : 'belum_bayar')
                                      });
                                    }
                                  }
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Hapus Mutasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>Manajemen Stok Hewan & Rekapitulasi Qurban</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau kuota slot sapi kemitraan kolektif, sapi mandiri, dan stok kambing qurban Idul Adha 1446 H sesuai dinamika harga pasar.
              </p>
            </div>
            {canManage && (
              <button
                onClick={handleOpenAddStock}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Info Hewan</span>
              </button>
            )}
          </div>

          {/* Ringkasan Cepat Kuota Pasar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Jenis Kategori</span>
              <strong className="text-base font-extrabold text-slate-800">{stocks.length} Macam</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-medium text-slate-500 block">Total Kuota Stok</span>
              <strong className="text-base font-extrabold text-slate-800">
                {stocks.reduce((acc, curr) => acc + curr.stokTersedia, 0)} Slot
              </strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] font-medium text-emerald-700 block">Sudah Terpesan</span>
              <strong className="text-base font-extrabold text-emerald-800">
                {stocks.reduce((acc, curr) => acc + curr.terpesan, 0)} Slot
              </strong>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <span className="text-[11px] font-medium text-blue-700 block">Sisa Kuota Tersedia</span>
              <strong className="text-base font-extrabold text-blue-800">
                {stocks.reduce((acc, curr) => acc + Math.max(0, curr.stokTersedia - curr.terpesan), 0)} Slot
              </strong>
            </div>
          </div>

          {stocks.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-700">Belum ada data jenis hewan qurban</p>
              <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menambahkan daftar hewan qurban dan harga pasarnya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stocks.map((stk, idx) => {
                const sisa = Math.max(0, stk.stokTersedia - stk.terpesan);
                const percent = stk.stokTersedia > 0 ? Math.min(100, Math.round((stk.terpesan / stk.stokTersedia) * 100)) : 0;
                return (
                  <div key={stk.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{stk.jenis}</h4>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                          {formatRupiah(stk.hargaSatuan)}
                        </span>
                      </div>

                      {stk.keterangan && (
                        <p className="text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                          {stk.keterangan}
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs bg-white/60 p-2.5 rounded-lg border border-slate-200/50">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Stok Tersedia:</span>
                          <strong className="text-slate-800">{stk.stokTersedia} Ekor/Bagian</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sudah Terpesan:</span>
                          <strong className="text-emerald-700">{stk.terpesan} Slot</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sisa Kuota Bebas:</span>
                          <strong className="text-blue-700">{sisa} Slot</strong>
                        </div>
                      </div>

                      {/* Progress bar stok */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>Keterisian Kuota</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons untuk Panitia */}
                    {canManage && (
                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditStock(stk)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-slate-300 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          title="Edit Info & Harga Pasar"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStockItem(stk)}
                          className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          title="Hapus Hewan Qurban"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                      if (val === 'domba') setTotalBiaya(3500000);
                      else if (val === 'kambing') setTotalBiaya(3500000);
                      else if (val === 'sapi_kolektif') setTotalBiaya(3300000);
                      else if (val === 'sapi_perorangan') setTotalBiaya(21000000);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value="domba">Domba Qurban (1 Ekor) - Rp 3.500.000</option>
                    <option value="kambing">Kambing Tipe A Super - Rp 3.500.000</option>
                    <option value="sapi_kolektif">Sapi Kolektif (1/7 Bagian) - Rp 3.300.000</option>
                    <option value="sapi_perorangan">Sapi Mandiri (1 Ekor Penuh) - Rp 21.000.000</option>
                  </select>
                </div>
                {jenisQurban === 'sapi_kolektif' ? (
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
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Hewan</label>
                    <input
                      type="text"
                      readOnly
                      value={jenisQurban === 'domba' ? 'Ternak Domba Sehat & Gemuk' : jenisQurban === 'kambing' ? 'Ternak Kambing Sehat' : 'Sapi Madura / Bali Super'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl outline-none text-slate-600 font-medium"
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
                  placeholder="Contoh: Heri bin Ahmad"
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

              {/* Cicilan Pertama saat pendaftaran baru */}
              {!editingShohibul && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      Cicilan Pertama / Pembayaran Awal (Rp)
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Bisa kosong atau dicicil bertahap</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      max={totalBiaya}
                      value={cicilanAwal}
                      onChange={(e) => setCicilanAwal(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Contoh: 1000000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold text-emerald-700 bg-white"
                    />
                    <select
                      value={metodeAwal}
                      onChange={(e) => setMetodeAwal(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white font-medium"
                    >
                      <option value="transfer_bni">Transfer BNI</option>
                      <option value="qris">QRIS Digital</option>
                      <option value="ewallet">E-Wallet</option>
                      <option value="tunai">Tunai ke Panitia</option>
                    </select>
                  </div>

                  {/* Simulasi perhitungan real-time */}
                  {(() => {
                    const nom = Number(cicilanAwal) || 0;
                    const sisa = Math.max(0, totalBiaya - nom);
                    const status = nom >= totalBiaya ? 'Lunas' : 'Belum Lunas';
                    return (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Total Biaya:</span>
                          <strong className="text-slate-800">{formatRupiah(totalBiaya)}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Cicilan Pertama:</span>
                          <strong className="text-emerald-700">{formatRupiah(nom)}</strong>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1 text-slate-700">
                          <span>Sisa yang harus dibayar:</span>
                          <strong className="text-amber-700 font-extrabold">{formatRupiah(sisa)}</strong>
                        </div>
                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-slate-500">Status Pembayaran:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan permintaan bagian daging atau jadwal cicilan"
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
              <div>
                <h3 className="font-bold text-base">Input Pembayaran Cicilan Qurban</h3>
                <p className="text-[11px] text-blue-200">Perhitungan sisa angsuran dan status pembayaran otomatis</p>
              </div>
              <button onClick={() => setIsInstallmentModalOpen(false)} className="text-blue-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitInstallment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Shohibul Qurban</label>
                <select
                  value={selectedShohibulId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setSelectedShohibulId(sid);
                    const sel = shohibulList.find((s) => s.id === sid);
                    if (sel) {
                      const sisa = Math.max(0, sel.totalBiaya - sel.terbayar);
                      setNominalCicilan(sisa > 0 ? sisa : '');
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                >
                  {shohibulList.map((s) => {
                    const sisa = Math.max(0, s.totalBiaya - s.terbayar);
                    const isLunas = s.terbayar >= s.totalBiaya || s.status === 'lunas';
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nama} • {formatJenisQurban(s.jenisQurban, s.kelompokSapi)} ({isLunas ? 'Lunas' : `Sisa: ${formatRupiah(sisa)} - Belum Lunas`})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Kartu Status Shohibul Terpilih */}
              {(() => {
                const targetShohibul = shohibulList.find((s) => s.id === selectedShohibulId) || shohibulList[0];
                if (!targetShohibul) return null;
                const sisa = Math.max(0, targetShohibul.totalBiaya - targetShohibul.terbayar);
                const isLunas = targetShohibul.terbayar >= targetShohibul.totalBiaya || targetShohibul.status === 'lunas';
                const nom = Number(nominalCicilan) || 0;
                const newTerbayar = targetShohibul.terbayar + nom;
                const newSisa = Math.max(0, targetShohibul.totalBiaya - newTerbayar);
                const newStatus = newTerbayar >= targetShohibul.totalBiaya ? 'Lunas' : 'Belum Lunas';

                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800">{targetShohibul.nama}</span>
                        <div className="text-[10px] text-slate-500">{formatJenisQurban(targetShohibul.jenisQurban, targetShohibul.kelompokSapi)}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Total Biaya:</span>
                        <strong className="text-slate-800">{formatRupiah(targetShohibul.totalBiaya)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sudah Dibayar:</span>
                        <strong className="text-emerald-700">{formatRupiah(targetShohibul.terbayar)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sisa Pembayaran:</span>
                        <strong className="text-amber-700 font-extrabold">{formatRupiah(sisa)}</strong>
                      </div>
                    </div>

                    {!isLunas && sisa > 0 && (
                      <button
                        type="button"
                        onClick={() => setNominalCicilan(sisa)}
                        className="w-full py-1 text-center bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px] transition border border-amber-300"
                      >
                        Set Nominal Pelunasan Penuh ({formatRupiah(sisa)})
                      </button>
                    )}

                    {/* Simulasi setelah pembayaran ini */}
                    {nom > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] bg-white p-2 rounded-lg border">
                        <div className="text-slate-500 font-semibold mb-1">Simulasi Setelah Pembayaran Ini:</div>
                        <div className="flex justify-between">
                          <span>Total Terbayar Baru:</span>
                          <strong className="text-emerald-700">{formatRupiah(newTerbayar)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Sisa Yang Harus Dibayar:</span>
                          <strong className="text-amber-700 font-bold">{formatRupiah(newSisa)}</strong>
                        </div>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-700">Status Baru:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            newStatus === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {newStatus}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-medium"
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
                  placeholder="Contoh: Cicilan pertama 1.000.000 sisa 2.500.000 (Belum Lunas)"
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
                  <span className="w-36 text-slate-500">Nama Shohibul:</span>
                  <span className="font-extrabold text-slate-900">{receiptShohibul.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Atas Nama:</span>
                  <span className="font-bold text-slate-800">{receiptShohibul.atasNama.join(', ')}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Jenis Qurban:</span>
                  <span className="font-semibold text-slate-800">
                    {formatJenisQurban(receiptShohibul.jenisQurban, receiptShohibul.kelompokSapi)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Total Biaya:</span>
                  <span className="font-extrabold text-slate-900">{formatRupiah(receiptShohibul.totalBiaya)}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Cicilan Terbayar:</span>
                  <span className="font-extrabold text-emerald-800">{formatRupiah(receiptShohibul.terbayar)}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Sisa Yang Harus Dibayar:</span>
                  <span className="font-bold text-amber-700">
                    {formatRupiah(Math.max(0, receiptShohibul.totalBiaya - receiptShohibul.terbayar))}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-36 text-slate-500">Status Pembayaran:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                    receiptShohibul.terbayar >= receiptShohibul.totalBiaya || receiptShohibul.status === 'lunas'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {receiptShohibul.terbayar >= receiptShohibul.totalBiaya || receiptShohibul.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </div>
                {receiptShohibul.terbayar < receiptShohibul.totalBiaya && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                    *Catatan: Sisa pembayaran sebesar <strong>{formatRupiah(receiptShohibul.totalBiaya - receiptShohibul.terbayar)}</strong> dapat diangsur hingga batas waktu sebelum hari H Idul Adha 1446 H.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Tanggal Pendaftaran:</div>
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

      {/* MODAL KWITANSI PEMBAYARAN CICILAN QURBAN */}
      {receiptInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
            <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center no-print">
              <h3 className="font-bold text-sm">Kuitansi Pembayaran Cicilan Qurban</h3>
              <button onClick={() => setReceiptInstallment(null)} className="text-blue-200 hover:text-white">✕</button>
            </div>

            <div className="p-8 space-y-4 text-slate-800 border-4 border-double border-blue-800 m-4 rounded-xl bg-blue-50/20">
              <div className="flex items-center justify-between border-b-2 border-blue-800 pb-3">
                <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                  <MosqueLogo className="w-full h-full" />
                </div>
                <div className="text-center flex-1 px-3">
                  <h2 className="text-base font-extrabold text-blue-950 tracking-wider">
                    PANITIA IBADAH QURBAN MASJID AS SHOMAD
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Tanda Terima Kuitansi Cicilan Qurban 1446 H / Griya Praja
                  </p>
                  <div className="mt-1 font-mono text-[11px] font-bold text-blue-800">
                    No. Kuitansi: {receiptInstallment.inst.kuitansiNo}
                  </div>
                </div>
                <div className="w-14 h-14 shrink-0 flex items-center justify-center opacity-0 pointer-events-none">
                  <MosqueLogo className="w-full h-full" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex">
                  <span className="w-36 text-slate-500">Telah Diterima Dari:</span>
                  <span className="font-extrabold text-slate-900">{receiptInstallment.inst.namaPeserta}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Uang Sejumlah:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">{formatRupiah(receiptInstallment.inst.nominal)}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Terbilang:</span>
                  <span className="font-semibold text-slate-700 italic">
                    "{angkaTerbilang(receiptInstallment.inst.nominal)}"
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Metode Bayar:</span>
                  <span className="font-bold text-slate-800 uppercase">{receiptInstallment.inst.metode.replace('_', ' ')}</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-500">Untuk Pembayaran:</span>
                  <span className="text-slate-800">{receiptInstallment.inst.catatan || 'Cicilan qurban'}</span>
                </div>

                {receiptInstallment.shohibul && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <div className="font-bold text-slate-700 border-b pb-1 mb-1">Status Akumulasi Pembayaran:</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Biaya Qurban:</span>
                      <strong>{formatRupiah(receiptInstallment.shohibul.totalBiaya)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Terbayar Kumulatif:</span>
                      <strong className="text-emerald-700">{formatRupiah(receiptInstallment.shohibul.terbayar)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sisa Yang Harus Dibayar:</span>
                      <strong className="text-amber-700">{formatRupiah(Math.max(0, receiptInstallment.shohibul.totalBiaya - receiptInstallment.shohibul.terbayar))}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-slate-500">Status Pembayaran:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        receiptInstallment.shohibul.terbayar >= receiptInstallment.shohibul.totalBiaya
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {receiptInstallment.shohibul.terbayar >= receiptInstallment.shohibul.totalBiaya ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Tanggal Pembayaran:</div>
                  <div className="font-bold text-xs">{formatDateIndo(receiptInstallment.inst.tanggal)}</div>
                </div>
                <div className="text-center text-[10px]">
                  <p>Bendahara Penerima,</p>
                  <p className="font-bold mt-6 text-slate-900">Bapak Herry / Bapak Jacky</p>
                  <p className="text-[9px] text-slate-500">0852-6411-8090</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end space-x-2 no-print">
              <button
                onClick={() => setReceiptInstallment(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kuitansi Cicilan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT & TAMBAH INFO STOK / HARGA PASAR HEWAN QURBAN */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingStock ? 'Edit Informasi & Harga Pasar Hewan Qurban' : 'Tambah Jenis / Info Hewan Qurban'}
                </h3>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Sesuaikan jenis hewan, kuota stok, dan harga sesuai pasar yang berlaku saat ini.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsStockModalOpen(false)} 
                className="text-emerald-200 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStock} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis / Kategori Hewan Qurban <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stockJenis}
                  onChange={(e) => setStockJenis(e.target.value)}
                  placeholder="Contoh: Domba / Kambing Qurban (1 Ekor), Sapi Limousin Mandiri"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700">
                    Harga Satuan Pasar Saat Ini (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {formatRupiah(Number(stockHargaSatuan) || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={stockHargaSatuan}
                  onChange={(e) => setStockHargaSatuan(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 3500000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-hidden font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Harga ini dapat disesuaikan sewaktu-waktu mengikuti fluktuasi harga pasar hewan qurban.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kuota Stok Tersedia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockTersedia}
                    onChange={(e) => setStockTersedia(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 20"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-hidden font-mono font-semibold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Jumlah ekor/slot disiapkan</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sudah Dipesan (Slot) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockTerpesan}
                    onChange={(e) => setStockTerpesan(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-hidden font-mono font-semibold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Sisa Bebas: <strong className="text-blue-700">{Math.max(0, (Number(stockTersedia) || 0) - (Number(stockTerpesan) || 0))} slot</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Keterangan / Spesifikasi Pasar (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={stockKeterangan}
                  onChange={(e) => setStockKeterangan(e.target.value)}
                  placeholder="Contoh: Kisaran bobot hidup 30-35 kg, sehat, bersertifikat dokter hewan, bebas PMK"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-hidden text-xs"
                />
              </div>

              {/* Preview Mini Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Pratinjau Tampilan Kartu Stok
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">{stockJenis || '(Nama Jenis Hewan)'}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {formatRupiah(Number(stockHargaSatuan) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Stok: <strong>{Number(stockTersedia) || 0}</strong></span>
                  <span>Terpesan: <strong className="text-emerald-700">{Number(stockTerpesan) || 0}</strong></span>
                  <span>Sisa Kuota: <strong className="text-blue-700">{Math.max(0, (Number(stockTersedia) || 0) - (Number(stockTerpesan) || 0))}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingStock ? 'Simpan Perubahan' : 'Tambah Hewan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT CICILAN QURBAN */}
      {editingInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Edit Mutasi Cicilan Qurban</h3>
              </div>
              <button
                onClick={() => setEditingInstallment(null)}
                className="text-emerald-200 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditInstallment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Informasi Peserta & Kuitansi
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{editingInstallment.namaPeserta}</p>
                <p className="text-xs text-slate-500 font-mono">No. Kuitansi: {editingInstallment.kuitansiNo}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nominal Pembayaran (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={editInstNominal}
                    onChange={(e) => setEditInstNominal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Pembayaran *
                  </label>
                  <input
                    type="date"
                    required
                    value={editInstTanggal}
                    onChange={(e) => setEditInstTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Metode Pembayaran *
                </label>
                <select
                  value={editInstMetode}
                  onChange={(e) => setEditInstMetode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="transfer_bni">Transfer Bank BNI (8881-2072-09)</option>
                  <option value="qris">QRIS Standar Masjid</option>
                  <option value="ewallet">E-Wallet (GoPay / OVO / Dana)</option>
                  <option value="tunai">Setoran Tunai ke Panitia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={editInstCatatan}
                  onChange={(e) => setEditInstCatatan(e.target.value)}
                  placeholder="Keterangan tambahan mutasi cicilan"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingInstallment(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
