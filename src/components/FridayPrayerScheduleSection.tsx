import React, { useState, useEffect } from 'react';
import { FridayPrayerSchedule, UserRole } from '../types';
import { 
  formatDateIndo, 
  createWhatsAppUrl, 
  calculateAutomaticFridayPrayerTime, 
  getIndonesianDayName, 
  getNextFridayDate 
} from '../utils/formatters';
import { 
  Clock, 
  CalendarDays, 
  Mic, 
  BookOpen, 
  Users, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle,
  Info,
  CalendarCheck2
} from 'lucide-react';

interface FridayPrayerScheduleSectionProps {
  schedules: FridayPrayerSchedule[];
  onAddSchedule: (s: Omit<FridayPrayerSchedule, 'id'>) => void;
  onEditSchedule: (s: FridayPrayerSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const FridayPrayerScheduleSection: React.FC<FridayPrayerScheduleSectionProps> = ({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'sekretaris_masjid' || currentUserRole === 'bendahara_masjid';

  // State Jam Digital & Countdown
  const [currentTime, setCurrentTime] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FridayPrayerSchedule | null>(null);

  // Form Fields
  const [formTanggal, setFormTanggal] = useState('');
  const [formHari, setFormHari] = useState("Jum'at");
  const [formWaktu, setFormWaktu] = useState('');
  const [formMuadzin, setFormMuadzin] = useState('');
  const [formKhatib, setFormKhatib] = useState('');
  const [formImam, setFormImam] = useState('');
  const [formTema, setFormTema] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [isAutoTimeActive, setIsAutoTimeActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Update Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sort schedules by date (ascending)
  const sortedSchedules = [...schedules].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  // Determine closest upcoming / today's Friday schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingSchedule = sortedSchedules.find((s) => s.tanggal >= todayStr) || sortedSchedules[sortedSchedules.length - 1] || sortedSchedules[0];

  // Filtered schedules for search
  const filteredSchedules = sortedSchedules.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.tanggal.includes(q) ||
      s.hari.toLowerCase().includes(q) ||
      s.khatib.toLowerCase().includes(q) ||
      s.imam.toLowerCase().includes(q) ||
      s.muadzin.toLowerCase().includes(q) ||
      (s.temaKhutbah && s.temaKhutbah.toLowerCase().includes(q))
    );
  });

  // Open Add Modal with smart defaults
  const handleOpenAdd = () => {
    setEditingSchedule(null);
    const nextFri = getNextFridayDate();
    setFormTanggal(nextFri);
    setFormHari(getIndonesianDayName(nextFri));
    setFormWaktu(calculateAutomaticFridayPrayerTime(nextFri));
    setIsAutoTimeActive(true);
    setFormMuadzin('');
    setFormKhatib('');
    setFormImam('');
    setFormTema('');
    setFormKeterangan('Dihimbau hadir 15 menit sebelum adzan. Disediakan kotak infaq.');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (s: FridayPrayerSchedule) => {
    setEditingSchedule(s);
    setFormTanggal(s.tanggal);
    setFormHari(s.hari);
    setFormWaktu(s.waktu);
    setIsAutoTimeActive(false);
    setFormMuadzin(s.muadzin);
    setFormKhatib(s.khatib);
    setFormImam(s.imam);
    setFormTema(s.temaKhutbah || '');
    setFormKeterangan(s.keterangan || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // When date changes in form, automatically update Day and Prayer Time
  const handleDateChange = (newDate: string) => {
    setFormTanggal(newDate);
    if (newDate) {
      const dayName = getIndonesianDayName(newDate);
      setFormHari(dayName);
      if (isAutoTimeActive) {
        const autoWaktu = calculateAutomaticFridayPrayerTime(newDate);
        setFormWaktu(autoWaktu);
      }
    }
  };

  // Recalculate automatic time manually
  const handleRecalculateAutoTime = () => {
    if (formTanggal) {
      const autoWaktu = calculateAutomaticFridayPrayerTime(formTanggal);
      setFormWaktu(autoWaktu);
      setIsAutoTimeActive(true);
    }
  };

  // Submit Add / Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTanggal || !formMuadzin.trim() || !formKhatib.trim() || !formImam.trim()) {
      setFormError('Mohon lengkapi tanggal serta nama Muadzin, Khatib, dan Imam.');
      return;
    }

    const payload: Omit<FridayPrayerSchedule, 'id'> = {
      tanggal: formTanggal,
      hari: formHari || "Jum'at",
      waktu: formWaktu || calculateAutomaticFridayPrayerTime(formTanggal),
      muadzin: formMuadzin.trim(),
      khatib: formKhatib.trim(),
      imam: formImam.trim(),
      temaKhutbah: formTema.trim() || undefined,
      keterangan: formKeterangan.trim() || undefined
    };

    if (editingSchedule) {
      onEditSchedule({
        ...payload,
        id: editingSchedule.id
      });
    } else {
      onAddSchedule(payload);
    }

    setIsModalOpen(false);
  };

  // Share message generator
  const getShareText = (s: FridayPrayerSchedule) => {
    return (
      `🕌 *JADWAL & PETUGAS SHOLAT JUM'AT*\n` +
      `*MASJID AS SHOMAD - GRIYA PRAJA KARIMUN*\n\n` +
      `📅 *Hari & Tanggal:* ${s.hari}, ${formatDateIndo(s.tanggal)}\n` +
      `⏰ *Waktu Masuk:* ${s.waktu} (Adzan Pertama)\n\n` +
      `👥 *PETUGAS SHOLAT JUM'AT:*\n` +
      `• 🎙️ *Muadzin:* ${s.muadzin}\n` +
      `• 📖 *Khatib:* ${s.khatib}\n` +
      `• 🤲 *Imam:* ${s.imam}\n` +
      (s.temaKhutbah ? `• 💡 *Tema Khutbah:* "${s.temaKhutbah}"\n` : '') +
      (s.keterangan ? `\n📌 *Catatan:* ${s.keterangan}\n` : '') +
      `\nMari bersama makmurkan rumah Allah SWT, datang lebih awal dan jaga adab sholat Jum'at.\n` +
      `Portal Informasi & Keuangan Transparan: ${window.location.href}`
    );
  };

  const handleCopy = (s: FridayPrayerSchedule) => {
    const text = getShareText(s);
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWA = (s: FridayPrayerSchedule) => {
    const text = getShareText(s);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION DENGAN JAM DIGITAL & INFO OTOMATIS */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-7 rounded-2xl shadow-sm border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Waktu Sholat Jum'at Terhitung Otomatis (Hisab & Astronomis WIB)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Jadwal & Petugas Sholat Jum'at</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Informasi lengkap hari, tanggal, waktu sholat otomatis, serta petugas Muadzin, Khatib, dan Imam Sholat Jum'at di Masjid As Shomad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Clock Card */}
            <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-xl px-4 py-3 text-center sm:text-right flex flex-col justify-center min-w-[170px]">
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Waktu Sekarang</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-amber-300 tracking-wider">
                {currentTime || '12:00:00 WIB'}
              </span>
            </div>

            {/* Action Tambah Jadwal */}
            {canManage ? (
              <button
                id="btn-tambah-jadwal-jumat"
                onClick={handleOpenAdd}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-emerald-950 font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Atur Petugas Jum'at</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs transition border border-white/20 flex items-center justify-center gap-2"
              >
                <span>Login Pengurus DKM</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HERO CARD: JADWAL SHOLAT JUM'AT TERDEKAT / AKTIF */}
      {upcomingSchedule ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-sm overflow-hidden transition hover:border-emerald-600/60">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/40 p-5 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
                  {upcomingSchedule.tanggal === todayStr ? "⭐ Sholat Jum'at Hari Ini" : "Jum'at Terdekat"}
                </span>
                <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {upcomingSchedule.hari}, {formatDateIndo(upcomingSchedule.tanggal)}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Pekan Ibadah Sholat Jum'at Berjamaah
              </h3>
            </div>

            {/* Waktu Otomatis Badge */}
            <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>Waktu Sholat (Otomatis)</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </p>
                <p className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono">
                  {upcomingSchedule.waktu}
                </p>
              </div>
            </div>
          </div>

          {/* 3 KARTU PETUGAS: MUADZIN, KHATIB, IMAM */}
          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. KHATIB */}
              <div className="bg-gradient-to-b from-amber-50/60 to-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-2 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Khatib
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {upcomingSchedule.khatib}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Menyampaikan Khutbah Jum'at</p>
                </div>
                {upcomingSchedule.temaKhutbah && (
                  <div className="pt-2 border-t border-amber-100/80">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Tema Khutbah:</p>
                    <p className="text-xs text-slate-700 italic font-medium mt-0.5 line-clamp-2">
                      "{upcomingSchedule.temaKhutbah}"
                    </p>
                  </div>
                )}
              </div>

              {/* 2. IMAM */}
              <div className="bg-gradient-to-b from-emerald-50/60 to-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    Imam
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {upcomingSchedule.imam}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Memimpin Sholat Berjamaah</p>
                </div>
                <div className="pt-2 border-t border-emerald-100/80">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Tata Cara:</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    2 Rakaat Berjamaah dengan bacaan Jahar (keras)
                  </p>
                </div>
              </div>

              {/* 3. MUADZIN */}
              <div className="bg-gradient-to-b from-teal-50/60 to-white p-4 rounded-xl border border-teal-200 shadow-xs space-y-2 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-900 bg-teal-100 px-2 py-0.5 rounded">
                    Muadzin & Bilal
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {upcomingSchedule.muadzin}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Adzan, Tarhim & Pengantar Khutbah</p>
                </div>
                <div className="pt-2 border-t border-teal-100/80">
                  <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">Panggilan Adzan:</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tepat masuk waktu pukul {upcomingSchedule.waktu}
                  </p>
                </div>
              </div>
            </div>

            {/* Himbauan / Catatan Tambahan */}
            {upcomingSchedule.keterangan && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-700">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-slate-900">Catatan Pengurus: </span>
                  {upcomingSchedule.keterangan}
                </p>
              </div>
            )}

            {/* Action Buttons: Bagikan ke WhatsApp, Salin, Edit, Hapus */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareWA(upcomingSchedule)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan ke WhatsApp</span>
                </button>
                <button
                  onClick={() => handleCopy(upcomingSchedule)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === upcomingSchedule.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Info</span>
                    </>
                  )}
                </button>
              </div>

              {canManage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(upcomingSchedule)}
                    className="px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Jadwal</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus jadwal sholat Jum'at tanggal ${upcomingSchedule.tanggal}?`)) {
                        onDeleteSchedule(upcomingSchedule.id);
                      }
                    }}
                    className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Belum ada jadwal sholat Jum'at yang dicatat.</p>
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
            >
              Tambah Jadwal Sekarang
            </button>
          )}
        </div>
      )}

      {/* DAFTAR JADWAL LAINNYA (TABEL & KARTU) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-emerald-700" />
              <span>Daftar Agenda Petugas Sholat Jum'at</span>
            </h4>
            <p className="text-xs text-slate-500">
              Rangkaian jadwal pekanan dan riwayat penugasan khatib, imam, dan muadzin.
            </p>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari khatib / imam / tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Tidak ada jadwal sholat Jum'at yang cocok dengan kata kunci "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((item) => {
              const isPast = item.tanggal < todayStr;
              const isToday = item.tanggal === todayStr;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4.5 space-y-3 transition shadow-xs ${
                    isToday
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : isPast
                      ? 'border-slate-200 bg-slate-50/40 opacity-90'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isToday
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPast
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isToday ? 'Hari Ini' : isPast ? 'Telah Selesai' : 'Mendatang'}
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-1">
                        {item.hari}, {formatDateIndo(item.tanggal)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        {item.waktu}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">WIB (Otomatis)</span>
                    </div>
                  </div>

                  {/* Rincian 3 Petugas */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-slate-500 text-[11px] w-14 shrink-0">Khatib:</span>
                      <span className="font-semibold text-slate-800 truncate" title={item.khatib}>
                        {item.khatib}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-500 text-[11px] w-14 shrink-0">Imam:</span>
                      <span className="font-semibold text-slate-800 truncate" title={item.imam}>
                        {item.imam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="text-slate-500 text-[11px] w-14 shrink-0">Muadzin:</span>
                      <span className="font-semibold text-slate-800 truncate" title={item.muadzin}>
                        {item.muadzin}
                      </span>
                    </div>
                  </div>

                  {item.temaKhutbah && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-100 line-clamp-2">
                      "{item.temaKhutbah}"
                    </p>
                  )}

                  {/* Footer Card */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareWA(item)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share WA</span>
                      </button>
                      <button
                        onClick={() => handleCopy(item)}
                        className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === item.id ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>

                    {canManage && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus jadwal sholat Jum'at tanggal ${item.tanggal}?`)) {
                              onDeleteSchedule(item.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL INPUT / EDIT JADWAL SHOLAT JUM'AT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSchedule ? "Edit Petugas Sholat Jum'at" : "Atur Petugas Sholat Jum'at"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Masjid As Shomad Griya Praja Karimun
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tanggal & Hari */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hari (Otomatis Terdeteksi)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formHari}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold"
                  />
                  {formHari !== "Jum'at" && formTanggal && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                      ⚠️ Catatan: Tanggal ini bukan hari Jum'at ({formHari}).
                    </p>
                  )}
                </div>
              </div>

              {/* Waktu Sholat Jum'at (Otomatis) */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Waktu Sholat Jum'at (Otomatis Sesuai Tanggal)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRecalculateAutoTime}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-emerald-300 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Hitung Ulang</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formWaktu}
                    onChange={(e) => {
                      setFormWaktu(e.target.value);
                      setIsAutoTimeActive(false);
                    }}
                    placeholder="12:08 WIB"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-bold text-emerald-900"
                  />
                </div>
                <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                  💡 Jam masuk waktu dzuhur dihitung otomatis berdasarkan hisab astronomis wilayah WIB untuk tanggal tersebut.
                </p>
              </div>

              {/* PETUGAS: MUADZIN, KHATIB, IMAM */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Petugas Sholat Jum'at:
                </h4>

                {/* Muadzin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-teal-600" />
                      <span>Muadzin / Bilal <span className="text-rose-500">*</span></span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Bilal Ramadhan / Bapak Syamsul"
                    value={formMuadzin}
                    onChange={(e) => setFormMuadzin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Khatib */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Khatib (Penyampai Khutbah) <span className="text-rose-500">*</span></span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Dr. H. Ahmad Fauzi, M.Ag"
                    value={formKhatib}
                    onChange={(e) => {
                      setFormKhatib(e.target.value);
                      if (!formImam) {
                        setFormImam(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Imam */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Imam Sholat Jum'at <span className="text-rose-500">*</span></span>
                    </label>
                    {formKhatib && (
                      <button
                        type="button"
                        onClick={() => setFormImam(formKhatib)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        Sama dengan Khatib
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Muhammad Ridwan, Al-Hafidz"
                    value={formImam}
                    onChange={(e) => setFormImam(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Tema Khutbah */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul / Tema Khutbah (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Membangun Generasi Qur'ani dan Kepedulian Sosial"
                    value={formTema}
                    onChange={(e) => setFormTema(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Catatan / Keterangan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Himbauan Jama'ah (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dihimbau membawa sajadah dan infaq terbaik"
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
