import React, { useState } from 'react';
import { 
  MosqueNews, 
  MosqueEvent, 
  GalleryItem, 
  FridayPrayerSchedule,
  UserRole 
} from '../types';
import { formatDateIndo, createWhatsAppUrl } from '../utils/formatters';
import { MOSQUE_INFO } from '../data/initialData';
import { FridayPrayerScheduleSection } from './FridayPrayerScheduleSection';
import { 
  CalendarDays, 
  Newspaper, 
  Image as ImageIcon, 
  PhoneCall, 
  Search, 
  Share2, 
  Clock, 
  MapPin, 
  User, 
  PlusCircle, 
  Plus,
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  X, 
  Lock,
  Phone,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface InformasiKegiatanViewProps {
  newsList: MosqueNews[];
  onAddNews: (n: Omit<MosqueNews, 'id'>) => void;
  onEditNews: (n: MosqueNews) => void;
  onDeleteNews: (id: string) => void;
  events: MosqueEvent[];
  onAddEvent: (e: Omit<MosqueEvent, 'id'>) => void;
  onEditEvent: (e: MosqueEvent) => void;
  onDeleteEvent: (id: string) => void;
  gallery: GalleryItem[];
  onAddGallery: (g: Omit<GalleryItem, 'id'>) => void;
  onEditGallery?: (g: GalleryItem) => void;
  onDeleteGallery: (id: string) => void;
  jumatSchedules: FridayPrayerSchedule[];
  onAddJumatSchedule: (s: Omit<FridayPrayerSchedule, 'id'>) => void;
  onEditJumatSchedule: (s: FridayPrayerSchedule) => void;
  onDeleteJumatSchedule: (id: string) => void;
  currentUserRole: UserRole;
  onOpenLogin: () => void;
}

export const InformasiKegiatanView: React.FC<InformasiKegiatanViewProps> = ({
  newsList,
  onAddNews,
  onEditNews,
  onDeleteNews,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  gallery,
  onAddGallery,
  onEditGallery,
  onDeleteGallery,
  jumatSchedules,
  onAddJumatSchedule,
  onEditJumatSchedule,
  onDeleteJumatSchedule,
  currentUserRole,
  onOpenLogin
}) => {
  const canManage = currentUserRole === 'super_admin' || currentUserRole === 'sekretaris_masjid' || currentUserRole === 'bendahara_masjid';

  const [subTab, setSubTab] = useState<'jumat' | 'berita' | 'agenda' | 'galeri' | 'kontak'>('jumat');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Detail Berita / Kegiatan
  const [selectedNews, setSelectedNews] = useState<MosqueNews | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MosqueEvent | null>(null);

  // Modal Input Berita Baru
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<MosqueNews | null>(null);
  const [newsJudul, setNewsJudul] = useState('');
  const [newsRingkasan, setNewsRingkasan] = useState('');
  const [newsIsi, setNewsIsi] = useState('');
  const [newsKategori, setNewsKategori] = useState<'Berita' | 'Pengumuman' | 'Kajian' | 'Sosial'>('Berita');
  const [newsFotoUrl, setNewsFotoUrl] = useState('');

  // Modal Input Agenda Baru
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MosqueEvent | null>(null);
  const [eventJudul, setEventJudul] = useState('');
  const [eventDeskripsi, setEventDeskripsi] = useState('');
  const [eventTanggal, setEventTanggal] = useState('');
  const [eventWaktu, setEventWaktu] = useState('');
  const [eventLokasi, setEventLokasi] = useState('Masjid As Shomad');
  const [eventNarasumber, setEventNarasumber] = useState('');
  const [eventStatus, setEventStatus] = useState<'akan_datang' | 'berlangsung' | 'selesai'>('akan_datang');

  // Modal Input / Edit Galeri
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryJudul, setGalleryJudul] = useState('');
  const [galleryDeskripsi, setGalleryDeskripsi] = useState('');
  const [galleryMediaUrl, setGalleryMediaUrl] = useState('');
  const [galleryTanggal, setGalleryTanggal] = useState('');

  const handleOpenAddGallery = () => {
    setEditingGallery(null);
    setGalleryJudul('');
    setGalleryDeskripsi('');
    setGalleryMediaUrl('');
    setGalleryTanggal(new Date().toISOString().split('T')[0]);
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (g: GalleryItem) => {
    setEditingGallery(g);
    setGalleryJudul(g.judul);
    setGalleryDeskripsi(g.deskripsi);
    setGalleryMediaUrl(g.mediaUrl);
    setGalleryTanggal(g.tanggal);
    setIsGalleryModalOpen(true);
  };

  const handleSubmitGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGallery && onEditGallery) {
      onEditGallery({
        ...editingGallery,
        judul: galleryJudul,
        deskripsi: galleryDeskripsi,
        mediaUrl: galleryMediaUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        tanggal: galleryTanggal || editingGallery.tanggal
      });
    } else {
      onAddGallery({
        judul: galleryJudul,
        deskripsi: galleryDeskripsi,
        mediaUrl: galleryMediaUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        tanggal: galleryTanggal || new Date().toISOString().split('T')[0],
        tipe: 'foto'
      });
    }
    setIsGalleryModalOpen(false);
  };

  // Share Notification Tooltip
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const handleShare = (title: string, desc: string, id: string) => {
    const text = `*${title}* - Masjid As Shomad\n\n${desc}\n\nKunjungi portal keuangan & informasi resmi: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShareId(id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  // Submit Berita
  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      onEditNews({
        ...editingNews,
        judul: newsJudul,
        ringkasan: newsRingkasan,
        isi: newsIsi,
        kategori: newsKategori,
        fotoUrl: newsFotoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
      });
    } else {
      onAddNews({
        judul: newsJudul,
        ringkasan: newsRingkasan,
        isi: newsIsi,
        kategori: newsKategori,
        tanggal: new Date().toISOString().split('T')[0],
        penulis: 'Sekretariat DKM As Shomad',
        fotoUrl: newsFotoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
      });
    }
    setIsNewsModalOpen(false);
  };

  // Submit Agenda
  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onEditEvent({
        ...editingEvent,
        judul: eventJudul,
        deskripsi: eventDeskripsi,
        tanggal: eventTanggal,
        waktu: eventWaktu,
        lokasi: eventLokasi,
        narasumber: eventNarasumber,
        status: eventStatus
      });
    } else {
      onAddEvent({
        judul: eventJudul,
        deskripsi: eventDeskripsi,
        tanggal: eventTanggal,
        waktu: eventWaktu,
        lokasi: eventLokasi,
        narasumber: eventNarasumber,
        status: eventStatus
      });
    }
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigasi Menu */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab('jumat')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'jumat'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Info Sholat Jum'at</span>
          </button>
          <button
            onClick={() => setSubTab('berita')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'berita'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Berita & Pengumuman</span>
          </button>
          <button
            onClick={() => setSubTab('agenda')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'agenda'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Agenda Kegiatan</span>
          </button>
          <button
            onClick={() => setSubTab('galeri')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'galeri'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeri Foto & Video</span>
          </button>
          <button
            onClick={() => setSubTab('kontak')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'kontak'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Kontak Pengurus DKM</span>
          </button>
        </div>

        {/* Action Button & Search */}
        <div className="flex items-center space-x-2">
          {canManage && subTab === 'berita' && (
            <button
              onClick={() => {
                setEditingNews(null);
                setNewsJudul('');
                setNewsRingkasan('');
                setNewsIsi('');
                setNewsFotoUrl('');
                setIsNewsModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tulis Berita</span>
            </button>
          )}

          {canManage && subTab === 'agenda' && (
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventJudul('');
                setEventDeskripsi('');
                setEventTanggal(new Date().toISOString().split('T')[0]);
                setEventWaktu('Ba’da Maghrib');
                setEventNarasumber('');
                setIsEventModalOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Kolom Pencarian (Search Bar) */}
      <div className="relative w-full max-w-lg">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berita, agenda kajian, nama penceramah, atau pengumuman..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* 0. JADWAL & PETUGAS SHOLAT JUM'AT */}
      {subTab === 'jumat' && (
        <FridayPrayerScheduleSection
          schedules={jumatSchedules}
          onAddSchedule={onAddJumatSchedule}
          onEditSchedule={onEditJumatSchedule}
          onDeleteSchedule={onDeleteJumatSchedule}
          currentUserRole={currentUserRole}
          onOpenLogin={onOpenLogin}
        />
      )}

      {/* 1. DAFTAR BERITA & PENGUMUMAN (NEWS FEED) */}
      {subTab === 'berita' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList
            .filter((n) => 
              n.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
              n.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
              n.kategori.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="h-44 overflow-hidden relative group">
                  <img
                    src={news.fotoUrl}
                    alt={news.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-800/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    {news.kategori}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium mb-1">
                      {formatDateIndo(news.tanggal)} • {news.penulis}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {news.judul}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {news.ringkasan}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedNews(news)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Baca Selengkapnya</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleShare(news.judul, news.ringkasan, news.id)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Bagikan ke WhatsApp / Media Sosial"
                      >
                        {copiedShareId === news.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => {
                              setEditingNews(news);
                              setNewsJudul(news.judul);
                              setNewsRingkasan(news.ringkasan);
                              setNewsIsi(news.isi);
                              setNewsKategori(news.kategori);
                              setNewsFotoUrl(news.fotoUrl);
                              setIsNewsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Berita"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus berita "${news.judul}"?`)) {
                                onDeleteNews(news.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Berita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 2. AGENDA / KALENDER KEGIATAN */}
      {subTab === 'agenda' && (
        <div className="space-y-4">
          {/* Highlight Sholat Jum'at di Tab Agenda */}
          {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const upcomingJumat = [...jumatSchedules]
              .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
              .find((s) => s.tanggal >= todayStr) || jumatSchedules[0];

            if (!upcomingJumat) return null;

            return (
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4.5 rounded-2xl shadow-sm border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800/90 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-emerald-950 uppercase tracking-wide">
                        Petugas Sholat Jum'at Pekan Ini
                      </span>
                      <span className="text-xs text-emerald-200 font-semibold">
                        {upcomingJumat.hari}, {formatDateIndo(upcomingJumat.tanggal)} • {upcomingJumat.waktu}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">
                      Khatib: <span className="text-amber-200">{upcomingJumat.khatib}</span> • Imam: <span className="text-emerald-200">{upcomingJumat.imam}</span> • Muadzin: <span className="text-teal-200">{upcomingJumat.muadzin}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSubTab('jumat')}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <span>Lihat Jadwal Jum'at Lengkap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events
            .filter((e) =>
              e.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.narasumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ev.status === 'akan_datang'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ev.status === 'akan_datang' ? 'Akan Datang' : 'Telah Selesai'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5">{ev.judul}</h3>
                  </div>
                  <button
                    onClick={() => handleShare(ev.judul, `${ev.waktu} di ${ev.lokasi}. Pemateri: ${ev.narasumber}`, ev.id)}
                    className="p-1 text-slate-400 hover:text-emerald-700"
                    title="Bagikan Agenda"
                  >
                    {copiedShareId === ev.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatDateIndo(ev.tanggal)} • {ev.waktu}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>{ev.lokasi}</span>
                  </div>
                </div>

                {ev.narasumber && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <User className="w-3.5 h-3.5" />
                    <span>Narasumber: {ev.narasumber}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ev.deskripsi}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Lihat Rincian Kegiatan
                  </button>

                  {canManage && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingEvent(ev);
                          setEventJudul(ev.judul);
                          setEventDeskripsi(ev.deskripsi);
                          setEventTanggal(ev.tanggal);
                          setEventWaktu(ev.waktu);
                          setEventLokasi(ev.lokasi);
                          setEventNarasumber(ev.narasumber);
                          setEventStatus(ev.status);
                          setIsEventModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus agenda "${ev.judul}"?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GALERI FOTO DAN VIDEO */}
      {subTab === 'galeri' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Dokumentasi pelaksanaan ibadah, kajian, fardhu kifayah, kerja bakti, dan kegiatan sosial Masjid As Shomad.
            </p>
            {canManage && (
              <button
                onClick={handleOpenAddGallery}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto Dokumentasi</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={item.mediaUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                      {formatDateIndo(item.tanggal)}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-slate-900 text-xs">{item.judul}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.deskripsi}</p>
                  </div>
                </div>

                {canManage && (
                  <div className="px-3.5 pb-3 pt-2 border-t border-slate-100 flex items-center justify-end space-x-1.5">
                    <button
                      onClick={() => handleOpenEditGallery(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Edit Foto Dokumentasi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus foto dokumentasi "${item.judul}"?`)) {
                          onDeleteGallery(item.id);
                        }
                      }}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Hapus Foto Dokumentasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. KOLOM CONTACT PERSON PENGURUS MASJID AS SHOMAD (LENGKAP SESUAI PROMPT) */}
      {subTab === 'kontak' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Susunan Kontak Person Pengurus Masjid As Shomad
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Silakan hubungi jajaran pengurus DKM Masjid As Shomad untuk keperluan ibadah, administrasi kas, santunan Babul Khairat, dan qurban.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOSQUE_INFO.contacts.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {c.title.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {c.title}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{c.name}</h4>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{c.phone}</span>
                  <a
                    href={`https://wa.me/62${c.rawPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Informasi Tambahan Sekretariat */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-amber-300 block">Kantor Sekretariat DKM As Shomad</span>
              <span className="text-slate-300">Buka setiap hari shalat 5 waktu & kegiatan fardhu kifayah 24 jam</span>
            </div>
            <div className="font-mono text-emerald-300">
              Rek BNI: 8881-2072-09 a.n. Masjid As Shomad
            </div>
          </div>
        </div>
      )}

      {/* MODAL BACA DETAIL BERITA LENGKAP */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="relative h-64">
              <img src={selectedNews.fotoUrl} alt={selectedNews.judul} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-xs transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selectedNews.kategori}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-xs text-slate-400 font-semibold">
                Dipublikasikan: {formatDateIndo(selectedNews.tanggal)} • Oleh: {selectedNews.penulis}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {selectedNews.judul}
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-4">
                {selectedNews.isi}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleShare(selectedNews.judul, selectedNews.ringkasan, selectedNews.id)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan Berita Ini</span>
                </button>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL AGENDA KEGIATAN */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold bg-emerald-700 px-2 py-0.5 rounded">
                  Detail Agenda Kegiatan
                </span>
                <h3 className="text-base font-extrabold mt-1">{selectedEvent.judul}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span><strong>Waktu:</strong> {formatDateIndo(selectedEvent.tanggal)} ({selectedEvent.waktu})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-700" />
                  <span><strong>Lokasi:</strong> {selectedEvent.lokasi}</span>
                </div>
                {selectedEvent.narasumber && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-700" />
                    <span><strong>Narasumber:</strong> {selectedEvent.narasumber}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Deskripsi Kegiatan:</h4>
                <p className="text-slate-600 leading-relaxed">{selectedEvent.deskripsi}</p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT BERITA BARU */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">{editingNews ? 'Edit Berita' : 'Tulis Berita / Pengumuman Baru'}</h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitNews} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  value={newsJudul}
                  onChange={(e) => setNewsJudul(e.target.value)}
                  placeholder="Judul pengumuman / artikel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newsKategori}
                    onChange={(e) => setNewsKategori(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-bold"
                  >
                    <option value="Berita">Berita</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Kajian">Kajian</option>
                    <option value="Sosial">Sosial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Foto (Opsional)</label>
                  <input
                    type="url"
                    value={newsFotoUrl}
                    onChange={(e) => setNewsFotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Singkat</label>
                <input
                  type="text"
                  required
                  value={newsRingkasan}
                  onChange={(e) => setNewsRingkasan(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Lengkap Berita</label>
                <textarea
                  rows={4}
                  required
                  value={newsIsi}
                  onChange={(e) => setNewsIsi(e.target.value)}
                  placeholder="Tuliskan berita lengkap..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Simpan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT AGENDA BARU */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">{editingEvent ? 'Edit Agenda' : 'Tambah Jadwal Kegiatan Baru'}</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-emerald-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Agenda Kegiatan</label>
                <input
                  type="text"
                  required
                  value={eventJudul}
                  onChange={(e) => setEventJudul(e.target.value)}
                  placeholder="Contoh: Kajian Rutin Malam Jumat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={eventTanggal}
                    onChange={(e) => setEventTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    required
                    value={eventWaktu}
                    onChange={(e) => setEventWaktu(e.target.value)}
                    placeholder="Contoh: 19.30 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={eventLokasi}
                    onChange={(e) => setEventLokasi(e.target.value)}
                    placeholder="Ruang Utama / Serambi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Narasumber / Penceramah</label>
                  <input
                    type="text"
                    value={eventNarasumber}
                    onChange={(e) => setEventNarasumber(e.target.value)}
                    placeholder="Ustadz..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  required
                  value={eventDeskripsi}
                  onChange={(e) => setEventDeskripsi(e.target.value)}
                  placeholder="Uraian tema pembahasan dan ketentuan jamaah..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT DOKUMENTASI GALERI */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingGallery ? 'Edit Dokumentasi Kegiatan' : 'Tambah Dokumentasi Kegiatan'}
                </h3>
              </div>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="text-emerald-200 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGallery} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul / Kegiatan Dokumentasi *</label>
                <input
                  type="text"
                  required
                  value={galleryJudul}
                  onChange={(e) => setGalleryJudul(e.target.value)}
                  placeholder="Contoh: Kerja Bakti & Pembersihan Karpet Masjid"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Kegiatan *</label>
                <input
                  type="date"
                  required
                  value={galleryTanggal}
                  onChange={(e) => setGalleryTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Foto / Media (Opsional)</label>
                <input
                  type="url"
                  value={galleryMediaUrl}
                  onChange={(e) => setGalleryMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Kosongkan untuk menggunakan gambar standar bertema masjid
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat *</label>
                <textarea
                  rows={3}
                  required
                  value={galleryDeskripsi}
                  onChange={(e) => setGalleryDeskripsi(e.target.value)}
                  placeholder="Keterangan singkat mengenai dokumentasi kegiatan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                >
                  {editingGallery ? 'Simpan Perubahan' : 'Simpan Dokumentasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
