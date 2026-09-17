import React, { useState } from 'react';
import { InfaqRecord, UserRole } from '../types';
import { formatRupiah, formatDateIndo, createWhatsAppUrl } from '../utils/formatters';
import { MosqueLogo } from './MosqueLogo';
import { OfficialQrisPlacard, QRIS_OFFICIAL_NMID } from './OfficialQrisPlacard';
import { 
  HeartHandshake, 
  Send, 
  CreditCard, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Building,
  Lock,
  Edit3,
  Trash2
} from 'lucide-react';

interface InfaqSadakahViewProps {
  records: InfaqRecord[];
  onAddRecord: (r: Omit<InfaqRecord, 'id'>) => void;
  onEditRecord?: (r: InfaqRecord) => void;
  onDeleteRecord: (id: string) => void;
  currentUserRole: UserRole;
}

export const InfaqSadakahView: React.FC<InfaqSadakahViewProps> = ({
  records,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  currentUserRole
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'bendahara_masjid';

  // State Form Konfirmasi Infaq
  const [namaDonatur, setNamaDonatur] = useState('');
  const [noHpDonatur, setNoHpDonatur] = useState('');
  const [nominalInfaq, setNominalInfaq] = useState<number | ''>('');
  const [jenisInfaq, setJenisInfaq] = useState<'Infaq Jumat' | 'Sedekah Subuh' | 'Renovasi Masjid' | 'Operasional' | 'Yatim & Dhuafa'>('Infaq Jumat');
  const [metodeInfaq, setMetodeInfaq] = useState<'QRIS' | 'Transfer BNI' | 'Tunai'>('Transfer BNI');
  const [keteranganDonasi, setKeteranganDonasi] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // State Modal Edit Donasi
  const [editingRecord, setEditingRecord] = useState<InfaqRecord | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editNominal, setEditNominal] = useState<number | ''>('');
  const [editJenis, setEditJenis] = useState<InfaqRecord['jenis']>('Infaq Jumat');
  const [editMetode, setEditMetode] = useState<InfaqRecord['metode']>('Transfer BNI');
  const [editTanggal, setEditTanggal] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');

  const handleOpenEditRecord = (rec: InfaqRecord) => {
    setEditingRecord(rec);
    setEditNama(rec.nama);
    setEditNoHp(rec.noHp || '');
    setEditNominal(rec.nominal);
    setEditJenis(rec.jenis);
    setEditMetode(rec.metode);
    setEditTanggal(rec.tanggal);
    setEditKeterangan(rec.keterangan || '');
  };

  const handleSaveEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onEditRecord || !editNominal || Number(editNominal) <= 0) return;

    onEditRecord({
      ...editingRecord,
      nama: editNama || 'Hamba Allah',
      noHp: editNoHp || '-',
      nominal: Number(editNominal),
      jenis: editJenis,
      metode: editMetode,
      tanggal: editTanggal || editingRecord.tanggal,
      keterangan: editKeterangan
    });

    setEditingRecord(null);
  };

  // Nomor rekening & WA Bendahara Masjid (Bpk. Imron Ardan)
  const NOMOR_REKENING_BNI = '8881-2072-09';
  const NAMA_REKENING = 'Masjid As Shomad';
  const WA_BENDAHARA_MASJID = '08127718440'; // Sesuai instruksi prompt!

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(NOMOR_REKENING_BNI.replace(/-/g, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleKirimKonfirmasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalInfaq || Number(nominalInfaq) <= 0) return;

    const nominalNum = Number(nominalInfaq);

    // Simpan ke riwayat lokal aplikasi
    onAddRecord({
      nama: namaDonatur || 'Hamba Allah',
      noHp: noHpDonatur || '-',
      nominal: nominalNum,
      jenis: jenisInfaq,
      metode: metodeInfaq,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: keteranganDonasi || 'Infaq amal jariyah kemakmuran Masjid As Shomad'
    });

    // Format Pesan WhatsApp ke Bendahara Masjid (08127718440)
    const pesanWa = `*KONFIRMASI INFAQ & SADAKAH MASJID AS SHOMAD*\n\n` +
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n` +
      `Bapak Imron Ardan (Bendahara Masjid As Shomad),\n\n` +
      `Berikut ini konfirmasi penyerahan/transfer infaq dan sadakah:\n` +
      `• *Nama Donatur:* ${namaDonatur || 'Hamba Allah'}\n` +
      `• *No. WhatsApp:* ${noHpDonatur || '-'}\n` +
      `• *Jumlah Donasi:* ${formatRupiah(nominalNum)}\n` +
      `• *Peruntukan / Jenis:* ${jenisInfaq}\n` +
      `• *Kanal Pembayaran:* ${metodeInfaq}\n` +
      `• *Tanggal:* ${formatDateIndo(new Date().toISOString().split('T')[0])}\n` +
      `• *Doa / Catatan:* ${keteranganDonasi || 'Semoga berkah & bermanfaat untuk kemakmuran masjid.'}\n\n` +
      `Mohon dicatat pada pembukuan kas masjid. Jazakumullah khairan katsiran.`;

    const waUrl = createWhatsAppUrl(WA_BENDAHARA_MASJID, pesanWa);
    window.open(waUrl, '_blank');

    // Reset Form
    setNamaDonatur('');
    setNoHpDonatur('');
    setNominalInfaq('');
    setKeteranganDonasi('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. IMAGEBOX QRIS MASJID DI TENGAH HALAMAN MENU (SESUAI PROMPT) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-200 p-0.5 bg-emerald-50 flex items-center justify-center shadow-xs">
            <MosqueLogo className="w-full h-full" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          INFAQ & SADAKAH DIGITAL MASJID AS SHOMAD
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
          Salurkan infaq, shadaqah subuh, dan wakaf pembangunan masjid secara mudah melalui scan QRIS resmi masjid di bawah ini.
        </p>

        {/* Kotak Gambar Plakat QRIS Resmi di Tengah Halaman */}
        <div className="my-8 flex justify-center">
          <OfficialQrisPlacard size="normal" />
        </div>

        {/* Informasi Kompatibilitas Pembayaran */}
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-600">
          <p className="font-bold text-emerald-950 mb-1">
            Mendukung Seluruh Aplikasi Pembayaran Nasional Berlogo QRIS:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-semibold text-slate-700">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">BCA Mobile</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">Livin' Mandiri</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">BNI Mobile</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">BRImo</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">GoPay</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">OVO</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">DANA</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">ShopeePay</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">LinkAja</span>
          </div>
        </div>

        {/* 2. INFORMASI NOMOR REKENING MASJID : 8881-2072-09 BANK NEGARA INDONESIA (BNI) */}
        <div className="max-w-xl mx-auto bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <Building className="w-4 h-4 text-amber-300" />
              BANK NEGARA INDONESIA (BNI)
            </span>
            <span className="bg-emerald-700/70 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono">
              REKENING GIRO MASJID
            </span>
          </div>

          <div className="my-2 flex items-center justify-center space-x-3">
            <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-amber-300 drop-shadow-sm">
              {NOMOR_REKENING_BNI}
            </span>
            <button
              onClick={handleCopyRekening}
              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition"
              title="Salin Nomor Rekening BNI"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-emerald-100 font-medium">
            Atas Nama: <strong className="text-white text-sm">{NAMA_REKENING}</strong>
          </p>
          {isCopied && (
            <p className="text-[11px] text-amber-300 mt-1 animate-pulse">
              Nomor rekening BNI berhasil disalin ke clipboard!
            </p>
          )}
        </div>
      </div>

      {/* 3. FORM KONFIRMASI INFAQ & SADAKAH (LANGSUNG TERKIRIM KE BENDAHARA MASJID 08127718440 VIA WHATSAPP) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Form Konfirmasi Infaq & Sadakah
            </h3>
            <p className="text-xs text-slate-500">
              Konfirmasi ini akan langsung diteruskan ke WhatsApp Bendahara Masjid (<strong>Bapak Imron Ardan: 08127718440</strong>)
            </p>
          </div>
        </div>

        <form onSubmit={handleKirimKonfirmasi} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nama Donatur / Muhsinin
              </label>
              <input
                type="text"
                value={namaDonatur}
                onChange={(e) => setNamaDonatur(e.target.value)}
                placeholder="Contoh: Hamba Allah / Bapak Ahmad"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <span className="text-[11px] text-slate-400">Bisa dikosongkan jika ingin sebagai Hamba Allah</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nomor WhatsApp Donatur
              </label>
              <input
                type="text"
                value={noHpDonatur}
                onChange={(e) => setNoHpDonatur(e.target.value)}
                placeholder="Contoh: 0812xxxx"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nominal Infaq / Donasi (Rp) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={nominalInfaq}
                onChange={(e) => setNominalInfaq(e.target.value ? Number(e.target.value) : '')}
                placeholder="Contoh: 500000"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Peruntukan / Jenis Infaq
              </label>
              <select
                value={jenisInfaq}
                onChange={(e) => setJenisInfaq(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Infaq Jumat">Infaq Jumat</option>
                <option value="Sedekah Subuh">Sedekah Subuh</option>
                <option value="Renovasi Masjid">Renovasi Masjid & Kubah</option>
                <option value="Operasional">Operasional & Listrik</option>
                <option value="Yatim & Dhuafa">Santunan Yatim & Dhuafa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Kanal Penyaluran
              </label>
              <select
                value={metodeInfaq}
                onChange={(e) => setMetodeInfaq(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Transfer BNI">Transfer Bank BNI (8881-2072-09)</option>
                <option value="QRIS">Scan Barcode QRIS Masjid</option>
                <option value="Tunai">Tunai ke Kotak Amal / Pengurus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Doa / Hajat / Catatan Donasi (Opsional)
            </label>
            <textarea
              rows={2}
              value={keteranganDonasi}
              onChange={(e) => setKeteranganDonasi(e.target.value)}
              placeholder="Contoh: Mohon doa untuk kesembuhan orang tua / keberkahan keluarga"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Kirim Konfirmasi Infaq ke WhatsApp Bendahara (08127718440)</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. RIWAYAT KONFIRMASI INFAQ MASUK (TRANSPARAN) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Catatan Konfirmasi Donatur Masjid Terakhir
            </h4>
            <p className="text-[11px] text-slate-500">
              Daftar konfirmasi infaq jamaah yang tersimpan dalam sistem informasi masjid
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800">
            Total Tercatat: {records.length} Donasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Donatur</th>
                <th className="px-4 py-3">Peruntukan</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3">Kanal</th>
                <th className="px-4 py-3">Catatan / Doa</th>
                {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateIndo(rec.tanggal)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{rec.nama}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      {rec.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-700">
                    {formatRupiah(rec.nominal)}
                  </td>
                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-600">{rec.metode}</td>
                  <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{rec.keterangan || '-'}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditRecord(rec)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Catatan Infaq"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan donasi dari ${rec.nama}?`)) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Catatan Infaq"
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

      {/* MODAL EDIT DATA INFAQ & SEDEKAH */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Edit Catatan Infaq & Sedekah</h3>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-emerald-200 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Donatur *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={editNoHp}
                    onChange={(e) => setEditNoHp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={editNominal}
                    onChange={(e) => setEditNominal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Transaksi *
                  </label>
                  <input
                    type="date"
                    required
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Alokasi / Peruntukan *
                  </label>
                  <select
                    value={editJenis}
                    onChange={(e) => setEditJenis(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Infaq Jumat">Infaq Jumat</option>
                    <option value="Sedekah Subuh">Sedekah Subuh</option>
                    <option value="Renovasi Masjid">Renovasi Masjid</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Yatim & Dhuafa">Yatim & Dhuafa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Metode Pembayaran *
                  </label>
                  <select
                    value={editMetode}
                    onChange={(e) => setEditMetode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Transfer BNI">Transfer BNI</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai">Tunai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  placeholder="Contoh: Titipan doa keluarga"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
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
