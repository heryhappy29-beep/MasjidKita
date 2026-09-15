import React, { useState, useMemo } from 'react';
import { 
  FinancialTransaction, 
  BankStatementItem, 
  UserRole 
} from '../types';
import { formatRupiah, formatDateIndo, exportToCSV } from '../utils/formatters';
import { MosqueLogo } from './MosqueLogo';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Building, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  FileSpreadsheet, 
  BarChart3, 
  Scale, 
  FileText 
} from 'lucide-react';

interface LaporanKeuanganViewProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onEditTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  bankStatements: BankStatementItem[];
  onToggleReconciled: (txId: string) => void;
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const LaporanKeuanganView: React.FC<LaporanKeuanganViewProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  bankStatements,
  onToggleReconciled,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'bendahara_masjid';

  // State Sub-Tab
  const [subTab, setSubTab] = useState<'ringkasan' | 'jurnal' | 'laporan_resmi' | 'rekonsiliasi'>('ringkasan');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form Modal Input / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);

  // Form fields
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState('');
  const [jenis, setJenis] = useState<'pemasukan' | 'pengeluaran' | 'transfer'>('pemasukan');
  const [kategori, setKategori] = useState('Infaq Jumat');
  const [jumlah, setJumlah] = useState<number | ''>('');
  const [metode, setMetode] = useState<'kas_tunai' | 'bank_bni' | 'qris'>('kas_tunai');
  const [catatan, setCatatan] = useState('');

  // Perhitungan Ringkasan Kas & Bank
  const stats = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let kasTunai = 0;
    let bankBni = 0;

    // Hitung dari transaksi
    transactions.forEach((tx) => {
      if (tx.jenis === 'pemasukan') {
        totalMasuk += tx.jumlah;
        if (tx.metode === 'kas_tunai') kasTunai += tx.jumlah;
        if (tx.metode === 'bank_bni' || tx.metode === 'qris') bankBni += tx.jumlah;
      } else if (tx.jenis === 'pengeluaran') {
        totalKeluar += tx.jumlah;
        if (tx.metode === 'kas_tunai') kasTunai -= tx.jumlah;
        if (tx.metode === 'bank_bni' || tx.metode === 'qris') bankBni -= tx.jumlah;
      } else if (tx.jenis === 'transfer') {
        // Transfer Kas ke Bank
        kasTunai -= tx.jumlah;
        bankBni += tx.jumlah;
      }
    });

    const saldoAkhir = totalMasuk - totalKeluar;

    return { totalMasuk, totalKeluar, kasTunai, bankBni, saldoAkhir };
  }, [transactions]);

  // Transaksi terfilter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.catatan && tx.catatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.refNo && tx.refNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = selectedType === 'all' || tx.jenis === selectedType;
      const matchCat = selectedCategory === 'all' || tx.kategori === selectedCategory;
      return matchSearch && matchType && matchCat;
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [transactions, searchTerm, selectedType, selectedCategory]);

  // Handle Buka Form Edit
  const handleOpenEdit = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setTanggal(tx.tanggal);
    setDeskripsi(tx.deskripsi);
    setJenis(tx.jenis);
    setKategori(tx.kategori);
    setJumlah(tx.jumlah);
    setMetode(tx.metode);
    setCatatan(tx.catatan || '');
    setIsFormOpen(true);
  };

  // Handle Buka Form Tambah
  const handleOpenAdd = () => {
    setEditingTx(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setDeskripsi('');
    setJenis('pemasukan');
    setKategori('Infaq Jumat');
    setJumlah('');
    setMetode('kas_tunai');
    setCatatan('');
    setIsFormOpen(true);
  };

  // Submit Transaksi
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || Number(jumlah) <= 0) return;

    if (editingTx) {
      onEditTransaction({
        ...editingTx,
        tanggal,
        deskripsi,
        jenis,
        kategori,
        jumlah: Number(jumlah),
        metode,
        catatan
      });
    } else {
      onAddTransaction({
        tanggal,
        deskripsi,
        jenis,
        kategori,
        jumlah: Number(jumlah),
        metode,
        reconciled: false,
        catatan
      });
    }
    setIsFormOpen(false);
  };

  // Export Excel / CSV
  const handleExportExcel = () => {
    const rows: (string | number)[][] = [
      ['LAPORAN TRANSAKSI KEUANGAN MASJID AS SHOMAD'],
      ['Tanggal Ekspor:', new Date().toLocaleDateString('id-ID')],
      [],
      ['No', 'Tanggal', 'Deskripsi', 'Jenis', 'Kategori', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Metode Kas', 'Status Rekonsiliasi', 'Catatan']
    ];

    transactions.forEach((tx, idx) => {
      rows.push([
        idx + 1,
        tx.tanggal,
        tx.deskripsi,
        tx.jenis.toUpperCase(),
        tx.kategori,
        tx.jenis === 'pemasukan' ? tx.jumlah : 0,
        tx.jenis === 'pengeluaran' ? tx.jumlah : 0,
        tx.metode === 'kas_tunai' ? 'Kas Tunai' : tx.metode === 'bank_bni' ? 'Bank BNI' : 'QRIS',
        tx.reconciled ? 'Sudah Cocok' : 'Belum Cocok',
        tx.catatan || '-'
      ]);
    });

    rows.push([]);
    rows.push(['TOTAL KAS TUNAI', stats.kasTunai]);
    rows.push(['TOTAL REKENING BANK BNI', stats.bankBni]);
    rows.push(['TOTAL SALDO AKHIR', stats.saldoAkhir]);

    exportToCSV(`Laporan_Keuangan_Masjid_As_Shomad_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Banner Hak Akses Pengurus */}
      {!canManage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Anda mengakses sebagai <strong>Jama'ah / Tamu (Mode Transparansi)</strong>. Untuk menambah, mengedit, menghapus, atau rekonsiliasi bank, silakan login sebagai <strong>Bendahara Masjid</strong> atau <strong>Super Admin</strong>.
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

      {/* Sub-Navigasi Laporan Keuangan */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('ringkasan')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'ringkasan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard & Grafik</span>
          </button>
          <button
            onClick={() => setSubTab('jurnal')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'jurnal'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Jurnal & Buku Besar</span>
          </button>
          <button
            onClick={() => setSubTab('laporan_resmi')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'laporan_resmi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Laba Rugi & Neraca</span>
          </button>
          <button
            onClick={() => setSubTab('rekonsiliasi')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'rekonsiliasi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rekonsiliasi Bank</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
            title="Download Format Excel (CSV)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition"
            title="Cetak Laporan / Simpan PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Cetak / PDF</span>
          </button>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. DASHBOARD & GRAFIK RINGKASAN */}
      {subTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Card Matriks Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Akhir Keseluruhan</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  Rp
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatRupiah(stats.saldoAkhir)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total akumulasi dana masjid</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pemasukan Kas</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                {formatRupiah(stats.totalMasuk)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Infaq, sedekah, & wakaf masuk</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengeluaran Kas</span>
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
                {formatRupiah(stats.totalKeluar)}
              </div>
              <p className="text-xs text-rose-600 mt-1">Operasional, pemeliharaan & gaji</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rincian Pos Likuiditas</span>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Kas Tunai:</span>
                  <span className="text-slate-900">{formatRupiah(stats.kasTunai)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Bank BNI (8881-2072-09):</span>
                  <span className="text-blue-700">{formatRupiah(stats.bankBni)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Cash Flow Chart (SVG Responsive Clean Graph) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Grafik Arus Kas & Komposisi Pemasukan/Pengeluaran</h3>
                <p className="text-xs text-slate-500">Perbandingan real-time pemasukan vs pengeluaran operasional masjid</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span className="font-semibold text-slate-700">Pemasukan</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="font-semibold text-slate-700">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Comparison Chart */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-800">Total Pemasukan ({formatRupiah(stats.totalMasuk)})</span>
                  <span className="text-slate-500">
                    {stats.totalMasuk + stats.totalKeluar > 0 
                      ? Math.round((stats.totalMasuk / (stats.totalMasuk + stats.totalKeluar)) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.totalMasuk + stats.totalKeluar > 0 ? (stats.totalMasuk / (stats.totalMasuk + stats.totalKeluar)) * 100 : 50}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-rose-800">Total Pengeluaran ({formatRupiah(stats.totalKeluar)})</span>
                  <span className="text-slate-500">
                    {stats.totalMasuk + stats.totalKeluar > 0 
                      ? Math.round((stats.totalKeluar / (stats.totalMasuk + stats.totalKeluar)) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.totalMasuk + stats.totalKeluar > 0 ? (stats.totalKeluar / (stats.totalMasuk + stats.totalKeluar)) * 100 : 50}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Rincian Kategori Pemasukan Terbanyak */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-2">Kategori Pemasukan Utama:</span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex justify-between">
                    <span>Infaq Kotak Jumat</span>
                    <span className="font-bold text-emerald-800">{formatRupiah(10060000)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wakaf & Renovasi Kubah</span>
                    <span className="font-bold text-emerald-800">{formatRupiah(10000000)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Infaq Digital QRIS</span>
                    <span className="font-bold text-emerald-800">{formatRupiah(1870000)}</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-900 block mb-2">Kategori Pengeluaran Terbesar:</span>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex justify-between">
                    <span>Perlengkapan Masjid (Karpet)</span>
                    <span className="font-bold text-rose-800">{formatRupiah(4500000)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Gaji & Honor Marbot</span>
                    <span className="font-bold text-rose-800">{formatRupiah(3000000)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Listrik PLN & Air PAM</span>
                    <span className="font-bold text-rose-800">{formatRupiah(1350000)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. JURNAL & BUKU BESAR (GENERAL LEDGER) */}
      {subTab === 'jurnal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Filter & Search */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi atau nomor ref..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="flex items-center space-x-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                  <option value="transfer">Transfer Kas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabel Buku Besar */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Deskripsi Transaksi</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Debit (Masuk)</th>
                  <th className="px-4 py-3 text-right">Kredit (Keluar)</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3 text-center">Rekonsiliasi</th>
                  {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Tidak ada data transaksi yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {formatDateIndo(tx.tanggal)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{tx.deskripsi}</div>
                        {tx.catatan && (
                          <div className="text-[11px] text-slate-500 italic">{tx.catatan}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {tx.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {tx.jenis === 'pemasukan' ? formatRupiah(tx.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700 whitespace-nowrap">
                        {tx.jenis === 'pengeluaran' ? formatRupiah(tx.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.metode === 'bank_bni' 
                            ? 'bg-blue-100 text-blue-800' 
                            : tx.metode === 'qris'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.metode === 'bank_bni' ? 'Bank BNI' : tx.metode === 'qris' ? 'QRIS' : 'Kas Tunai'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {tx.reconciled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cocok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Pending
                          </span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Transaksi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus transaksi "${tx.deskripsi}"?`)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LAPORAN LABA RUGI / SURPLUS DEFISIT & NERACA OTOMATIS */}
      {subTab === 'laporan_resmi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laporan Laba Rugi / Surplus Defisit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full border border-emerald-200 p-0.5 bg-emerald-50 shrink-0 flex items-center justify-center">
                <MosqueLogo className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  LAPORAN SURPLUS / DEFISIT OPERASIONAL
                </h3>
                <p className="text-xs text-slate-500">DKM MASJID AS SHOMAD GRIYA PRAJA - PERIODE BERJALAN</p>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider mb-2">1. Pendapatan / Penerimaan Kas:</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-200">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Infaq Shalat Jumat</span>
                    <span className="font-bold">{formatRupiah(10060000)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Wakaf Pembangunan & Renovasi</span>
                    <span className="font-bold">{formatRupiah(10000000)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Infaq Digital (QRIS Statis)</span>
                    <span className="font-bold">{formatRupiah(1870000)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-extrabold text-emerald-900 bg-emerald-50 px-2 rounded">
                    <span>TOTAL PENERIMAAN OPERASIONAL (A)</span>
                    <span>{formatRupiah(stats.totalMasuk)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-rose-800 uppercase tracking-wider mb-2">2. Beban & Pengeluaran Operasional:</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-rose-200">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Tagihan Listrik PLN & Air Bersih</span>
                    <span className="font-bold">{formatRupiah(1350000)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Honor Marbot & Tenaga Kebersihan</span>
                    <span className="font-bold">{formatRupiah(3000000)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Pengadaan Karpet Saf & Inventaris</span>
                    <span className="font-bold">{formatRupiah(4500000)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-extrabold text-rose-900 bg-rose-50 px-2 rounded">
                    <span>TOTAL BEBAN PENGELUARAN (B)</span>
                    <span>{formatRupiah(stats.totalKeluar)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200">
                <div className="flex justify-between items-center p-3 bg-slate-900 text-white rounded-xl">
                  <div>
                    <span className="font-extrabold text-sm block">SURPLUS BERSIH PERIODE BERJALAN (A - B)</span>
                    <span className="text-[11px] text-slate-300">Amanah kas bertambah untuk kemaslahatan umat</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatRupiah(stats.saldoAkhir)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Neraca Keuangan Sederhana */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full border border-emerald-200 p-0.5 bg-emerald-50 shrink-0 flex items-center justify-center">
                <MosqueLogo className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  NERACA POSISI KEUANGAN MASJID
                </h3>
                <p className="text-xs text-slate-500">POSISI KAS & SALDO DANA UMAT GRIYA PRAJA</p>
              </div>
            </div>

            <div className="mt-4 space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">ASET LANCAR (AKTIVA):</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-blue-200">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Kas Tunai di Brankas Bendahara</span>
                    <span className="font-bold">{formatRupiah(stats.kasTunai)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Rekening Giro BNI (8881-2072-09)</span>
                    <span className="font-bold">{formatRupiah(stats.bankBni)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-extrabold text-blue-900 bg-blue-50 px-2 rounded">
                    <span>TOTAL ASET LANCAR</span>
                    <span>{formatRupiah(stats.saldoAkhir)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">KEWAJIBAN & SALDO DANA (PASIVA):</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-teal-200">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Kewajiban / Hutang Operasional</span>
                    <span className="font-bold text-slate-500">Rp 0 (Nihil)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Saldo Kas Terikat (Wakaf & Renovasi)</span>
                    <span className="font-bold">{formatRupiah(10000000)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Saldo Kas Bebas Operasional Jamaah</span>
                    <span className="font-bold">{formatRupiah(stats.saldoAkhir - 10000000)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-extrabold text-teal-900 bg-teal-50 px-2 rounded">
                    <span>TOTAL KEWAJIBAN & EKUITAS DANA</span>
                    <span>{formatRupiah(stats.saldoAkhir)}</span>
                  </div>
                </div>
              </div>

              {/* Legalitas & Penandatangan */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-[11px] text-slate-600">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold text-slate-800 mt-8">Bapak Syaripudin</p>
                  <p className="text-[10px] text-slate-500">Ketua DKM Masjid As Shomad</p>
                </div>
                <div>
                  <p>Dibuat Oleh,</p>
                  <p className="font-bold text-slate-800 mt-8">Bapak Imron Ardan</p>
                  <p className="text-[10px] text-slate-500">Bendahara Masjid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. REKONSILIASI BANK SECARA AKURAT */}
      {subTab === 'rekonsiliasi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekonsiliasi Rekening Bank BNI</h3>
              <p className="text-xs text-slate-500">
                Mencocokkan catatan transaksi di aplikasi dengan rekening koran Bank BNI (8881-2072-09 a.n. Masjid As Shomad)
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                Rek BNI: 8881-2072-09
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sisi Mutasi Rekening Bank */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mutasi Rekening Koran Bank BNI
                </span>
                <span className="text-[11px] text-slate-500">5 Transaksi Terakhir</span>
              </div>

              <div className="space-y-2">
                {bankStatements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      item.statusMatch
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{item.keterangan}</span>
                      <span className={item.kredit > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.kredit > 0 ? `+ ${formatRupiah(item.kredit)}` : `- ${formatRupiah(item.debit)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Tgl: {formatDateIndo(item.tanggal)}</span>
                      <span className="font-semibold text-slate-700">Saldo: {formatRupiah(item.saldo)}</span>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className={item.statusMatch ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-amber-700 font-bold flex items-center gap-1'}>
                        {item.statusMatch ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Cocok dengan Jurnal
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Belum Direkonsiliasi
                          </>
                        )}
                      </span>
                      {item.matchedTxId && <span className="text-slate-400 font-mono">Ref: {item.matchedTxId}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sisi Transaksi Aplikasi Yang Melibatkan Bank BNI / QRIS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Transaksi di Aplikasi
                </span>
                <span className="text-[11px] text-slate-500">Koreksi & Status Cocok</span>
              </div>

              <div className="space-y-2">
                {transactions
                  .filter((t) => t.metode === 'bank_bni' || t.metode === 'qris')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs transition shadow-2xs"
                    >
                      <div className="flex justify-between font-bold text-slate-900 mb-1">
                        <span>{t.deskripsi}</span>
                        <span className={t.jenis === 'pemasukan' ? 'text-emerald-700' : 'text-rose-700'}>
                          {t.jenis === 'pemasukan' ? `+ ${formatRupiah(t.jumlah)}` : `- ${formatRupiah(t.jumlah)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                        <span>{formatDateIndo(t.tanggal)} ({t.metode === 'bank_bni' ? 'BNI' : 'QRIS'})</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{t.id}</span>
                      </div>

                      {canManage && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-600">Verifikasi Kecocokan:</span>
                          <button
                            onClick={() => onToggleReconciled(t.id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              t.reconciled
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {t.reconciled ? 'Terverifikasi Cocok' : 'Tandai Cocok'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM INPUT / EDIT TRANSAKSI */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingTx ? 'Edit Transaksi Kas Masjid' : 'Pencatatan Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Transaksi</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pemasukan">Pemasukan (Uang Masuk)</option>
                    <option value="pengeluaran">Pengeluaran (Beban/Biaya)</option>
                    <option value="transfer">Transfer (Kas ke Bank)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi / Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Contoh: Infaq Kotak Amal Shalat Jumat / Pembayaran Listrik"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Infaq Jumat">Infaq Jumat</option>
                    <option value="Wakaf & Renovasi">Wakaf & Renovasi</option>
                    <option value="Infaq Digital QRIS">Infaq Digital QRIS</option>
                    <option value="Utilitas & Operasional">Utilitas & Operasional (Listrik/Air)</option>
                    <option value="Gaji & Honorarium">Gaji & Honorarium Marbot/Imam</option>
                    <option value="Perlengkapan Masjid">Perlengkapan Masjid</option>
                    <option value="Kegiatan & PHBI">Kegiatan & PHBI</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 1500000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Penyimpanan / Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetode('kas_tunai')}
                    className={`py-2 text-center rounded-xl font-bold border transition ${
                      metode === 'kas_tunai'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Kas Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetode('bank_bni')}
                    className={`py-2 text-center rounded-xl font-bold border transition ${
                      metode === 'bank_bni'
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Bank BNI
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetode('qris')}
                    className={`py-2 text-center rounded-xl font-bold border transition ${
                      metode === 'qris'
                        ? 'bg-purple-50 border-purple-600 text-purple-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    QRIS
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Keterangan saksi, no resi transfer, atau peruntukan khusus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
