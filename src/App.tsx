import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { 
  MainTab, 
  UserRole, 
  FinancialTransaction, 
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
} from './types';
import { 
  INITIAL_DATA, 
  INITIAL_USERS 
} from './data/initialData';

import { Header } from './components/Header';
import { MosqueLogo } from './components/MosqueLogo';
import { AuthModals } from './components/AuthModals';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { LaporanKeuanganView } from './components/LaporanKeuanganView';
import { BabulKhairatView } from './components/BabulKhairatView';
import { QurbanView } from './components/QurbanView';
import { InfaqSadakahView } from './components/InfaqSadakahView';
import { InformasiKegiatanView } from './components/InformasiKegiatanView';

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      // Data valid ditemukan di storage; tetap gunakan meski berupa array kosong []
      if (Array.isArray(defaultData)) {
        if (Array.isArray(parsed)) {
          return parsed as unknown as T;
        }
      } else if (parsed !== null && typeof parsed === 'object') {
        return parsed as unknown as T;
      }
    }
  } catch (e) {
    console.error(`Gagal membaca ${key} dari localStorage:`, e);
  }
  // Simpan data awal hanya jika key belum pernah ada sama sekali di localStorage
  try {
    localStorage.setItem(key, JSON.stringify(defaultData));
  } catch (e) {}
  return defaultData;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Gagal menyimpan ${key} ke localStorage:`, e);
  }
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('laporan_keuangan');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('as_shomad_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Super Admin default
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('as_shomad_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // Modal Auth States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [sheetsPreselectedModule, setSheetsPreselectedModule] = useState<string | undefined>(undefined);
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  const handleOpenGoogleSheets = (moduleKey?: string) => {
    setSheetsPreselectedModule(moduleKey);
    setIsGoogleSheetsOpen(true);
  };

  // 1. Data Keuangan Masjid (Selalu dimuat dari localStorage, dipersist secara aman bahkan jika array kosong)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() =>
    loadFromStorage('as_shomad_transactions', INITIAL_DATA.transactions)
  );

  // 2. Data Babul Khairat
  const [families, setFamilies] = useState<BabulKhairatFamily[]>(() =>
    loadFromStorage('as_shomad_families', INITIAL_DATA.babulKhairatFamilies)
  );

  const [babulPayments, setBabulPayments] = useState<BabulKhairatPayment[]>(() =>
    loadFromStorage('as_shomad_babul_payments', INITIAL_DATA.babulKhairatPayments)
  );

  const [babulClaims, setBabulClaims] = useState<BabulKhairatClaim[]>(() =>
    loadFromStorage('as_shomad_babul_claims', INITIAL_DATA.babulKhairatClaims)
  );

  // 3. Data Qurban
  const [shohibulList, setShohibulList] = useState<ShohibulQurban[]>(() =>
    loadFromStorage('as_shomad_shohibul', INITIAL_DATA.shohibulQurban)
  );

  const [installments, setInstallments] = useState<QurbanInstallment[]>(() =>
    loadFromStorage('as_shomad_installments', INITIAL_DATA.qurbanInstallments)
  );

  const [qurbanStocks, setQurbanStocks] = useState<QurbanStock[]>(() =>
    loadFromStorage('as_shomad_qurban_stocks', INITIAL_DATA.qurbanStocks)
  );

  // 4. Data Infaq & Sadakah
  const [infaqRecords, setInfaqRecords] = useState<InfaqRecord[]>(() =>
    loadFromStorage('as_shomad_infaq_records', INITIAL_DATA.infaqRecords)
  );

  // 5. Data Informasi & Kegiatan
  const [newsList, setNewsList] = useState<MosqueNews[]>(() =>
    loadFromStorage('as_shomad_news', INITIAL_DATA.news)
  );

  const [events, setEvents] = useState<MosqueEvent[]>(() =>
    loadFromStorage('as_shomad_events', INITIAL_DATA.events)
  );

  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    loadFromStorage('as_shomad_gallery', INITIAL_DATA.gallery)
  );

  const [jumatSchedules, setJumatSchedules] = useState<FridayPrayerSchedule[]>(() =>
    loadFromStorage('as_shomad_jumat_schedules', INITIAL_DATA.jumatSchedules)
  );

  // Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem('as_shomad_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('as_shomad_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('as_shomad_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('as_shomad_families', JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem('as_shomad_babul_payments', JSON.stringify(babulPayments));
  }, [babulPayments]);

  useEffect(() => {
    localStorage.setItem('as_shomad_babul_claims', JSON.stringify(babulClaims));
  }, [babulClaims]);

  useEffect(() => {
    localStorage.setItem('as_shomad_shohibul', JSON.stringify(shohibulList));
  }, [shohibulList]);

  useEffect(() => {
    localStorage.setItem('as_shomad_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('as_shomad_qurban_stocks', JSON.stringify(qurbanStocks));
  }, [qurbanStocks]);

  useEffect(() => {
    localStorage.setItem('as_shomad_infaq_records', JSON.stringify(infaqRecords));
  }, [infaqRecords]);

  useEffect(() => {
    localStorage.setItem('as_shomad_news', JSON.stringify(newsList));
  }, [newsList]);

  useEffect(() => {
    localStorage.setItem('as_shomad_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('as_shomad_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('as_shomad_jumat_schedules', JSON.stringify(jumatSchedules));
  }, [jumatSchedules]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setLogoutNotice(null);
  };

  const handleLogout = () => {
    // Sinkronisasi data ke localStorage secara langsung untuk menjamin data transaksi tidak hilang
    try {
      localStorage.setItem('as_shomad_transactions', JSON.stringify(transactions));
      localStorage.setItem('as_shomad_families', JSON.stringify(families));
      localStorage.setItem('as_shomad_babul_payments', JSON.stringify(babulPayments));
      localStorage.setItem('as_shomad_babul_claims', JSON.stringify(babulClaims));
      localStorage.setItem('as_shomad_shohibul', JSON.stringify(shohibulList));
      localStorage.setItem('as_shomad_installments', JSON.stringify(installments));
      localStorage.setItem('as_shomad_qurban_stocks', JSON.stringify(qurbanStocks));
      localStorage.setItem('as_shomad_infaq_records', JSON.stringify(infaqRecords));
      localStorage.setItem('as_shomad_news', JSON.stringify(newsList));
      localStorage.setItem('as_shomad_events', JSON.stringify(events));
      localStorage.setItem('as_shomad_gallery', JSON.stringify(gallery));
      localStorage.setItem('as_shomad_jumat_schedules', JSON.stringify(jumatSchedules));
    } catch (e) {
      console.error('Gagal menyimpan data saat logout:', e);
    }

    const guestUser: UserAccount = {
      username: 'tamu',
      name: 'Jama’ah / Tamu',
      role: 'public',
      passwordHash: '',
      roleLabel: 'Masyarakat / Jama’ah (Akses Publik Transparan)'
    };
    setCurrentUser(guestUser);
    try {
      localStorage.setItem('as_shomad_current_user', JSON.stringify(guestUser));
    } catch (e) {}

    // Tampilkan notifikasi konfirmasi bahwa data tetap tersimpan
    setLogoutNotice(
      `Berhasil logout. Anda kini di mode akses publik. Seluruh data transaksi (${transactions.length} transaksi) tetap tersimpan aman di aplikasi.`
    );
    setTimeout(() => {
      setLogoutNotice(null);
    }, 7000);
  };

  const handleChangePassword = (newPassword: string) => {
    const updatedUsers = users.map((u) => 
      u.username === currentUser.username ? { ...u, passwordHash: newPassword } : u
    );
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, passwordHash: newPassword });
  };

  // Keuangan Handlers - Disimpan instan ke state & localStorage secara sinkron
  const handleAddTransaction = (t: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...t,
      id: `TX-${Date.now().toString().slice(-6)}`
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveToStorage('as_shomad_transactions', updated);
  };

  const handleEditTransaction = (t: FinancialTransaction) => {
    const updated = transactions.map((item) => (item.id === t.id ? t : item));
    setTransactions(updated);
    saveToStorage('as_shomad_transactions', updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((item) => item.id !== id);
    setTransactions(updated);
    saveToStorage('as_shomad_transactions', updated);
  };

  // Babul Khairat Handlers
  const handleAddFamily = (f: Omit<BabulKhairatFamily, 'id'>) => {
    const newFamily: BabulKhairatFamily = {
      ...f,
      id: `BK-${Date.now().toString().slice(-5)}`
    };
    const updated = [newFamily, ...families];
    setFamilies(updated);
    saveToStorage('as_shomad_families', updated);
  };

  const handleEditFamily = (f: BabulKhairatFamily) => {
    const updated = families.map((item) => (item.id === f.id ? f : item));
    setFamilies(updated);
    saveToStorage('as_shomad_families', updated);
  };

  const handleDeleteFamily = (id: string) => {
    const updated = families.filter((item) => item.id !== id);
    setFamilies(updated);
    saveToStorage('as_shomad_families', updated);

    // Hapus juga iuran terkait KK ini agar data tetap konsisten
    const updatedPayments = babulPayments.filter((p) => p.familyId !== id);
    setBabulPayments(updatedPayments);
    saveToStorage('as_shomad_babul_payments', updatedPayments);
  };

  const handleAddBabulPayment = (p: Omit<BabulKhairatPayment, 'id'>) => {
    const newPayment: BabulKhairatPayment = {
      ...p,
      id: `PAY-${Date.now().toString().slice(-5)}`
    };
    const updated = [newPayment, ...babulPayments];
    setBabulPayments(updated);
    saveToStorage('as_shomad_babul_payments', updated);
  };

  const handleEditBabulPayment = (p: BabulKhairatPayment) => {
    const updated = babulPayments.map((item) => (item.id === p.id ? p : item));
    setBabulPayments(updated);
    saveToStorage('as_shomad_babul_payments', updated);
  };

  const handleDeleteBabulPayment = (id: string) => {
    const updated = babulPayments.filter((item) => item.id !== id);
    setBabulPayments(updated);
    saveToStorage('as_shomad_babul_payments', updated);
  };

  const handleAddBabulClaim = (c: Omit<BabulKhairatClaim, 'id'>) => {
    const newClaim: BabulKhairatClaim = {
      ...c,
      id: `CLM-${Date.now().toString().slice(-5)}`
    };
    const updated = [newClaim, ...babulClaims];
    setBabulClaims(updated);
    saveToStorage('as_shomad_babul_claims', updated);
  };

  const handleEditBabulClaim = (c: BabulKhairatClaim) => {
    const updated = babulClaims.map((item) => (item.id === c.id ? c : item));
    setBabulClaims(updated);
    saveToStorage('as_shomad_babul_claims', updated);
  };

  const handleDeleteBabulClaim = (id: string) => {
    const updated = babulClaims.filter((item) => item.id !== id);
    setBabulClaims(updated);
    saveToStorage('as_shomad_babul_claims', updated);
  };

  // Qurban Handlers
  const handleAddShohibul = (s: Omit<ShohibulQurban, 'id'>) => {
    const newShohibul: ShohibulQurban = {
      ...s,
      id: `SH-${Date.now().toString().slice(-5)}`
    };
    const updated = [newShohibul, ...shohibulList];
    setShohibulList(updated);
    saveToStorage('as_shomad_shohibul', updated);
  };

  const handleEditShohibul = (s: ShohibulQurban) => {
    const updated = shohibulList.map((item) => (item.id === s.id ? s : item));
    setShohibulList(updated);
    saveToStorage('as_shomad_shohibul', updated);
  };

  const handleDeleteShohibul = (id: string) => {
    const updated = shohibulList.filter((item) => item.id !== id);
    setShohibulList(updated);
    saveToStorage('as_shomad_shohibul', updated);

    // Hapus juga mutasi cicilan milik shohibul ini agar tidak tertinggal data yatim
    const updatedInstallments = installments.filter((inst) => inst.shohibulId !== id);
    setInstallments(updatedInstallments);
    saveToStorage('as_shomad_installments', updatedInstallments);
  };

  const handleAddInstallment = (inst: Omit<QurbanInstallment, 'id'>) => {
    const newInst: QurbanInstallment = {
      ...inst,
      id: `INST-${Date.now().toString().slice(-5)}`
    };
    const updated = [newInst, ...installments];
    setInstallments(updated);
    saveToStorage('as_shomad_installments', updated);
  };

  const handleEditInstallment = (inst: QurbanInstallment) => {
    const updated = installments.map((item) => (item.id === inst.id ? inst : item));
    setInstallments(updated);
    saveToStorage('as_shomad_installments', updated);
  };

  const handleDeleteInstallment = (id: string) => {
    const updated = installments.filter((item) => item.id !== id);
    setInstallments(updated);
    saveToStorage('as_shomad_installments', updated);
  };

  const handleAddStock = (s: Omit<QurbanStock, 'id'>) => {
    const newStock: QurbanStock = {
      ...s,
      id: `STK-${Date.now().toString().slice(-5)}`
    };
    const updated = [...qurbanStocks, newStock];
    setQurbanStocks(updated);
    saveToStorage('as_shomad_qurban_stocks', updated);
  };

  const handleEditStock = (s: QurbanStock) => {
    const updated = qurbanStocks.map((item) => (item.id === s.id ? s : item));
    setQurbanStocks(updated);
    saveToStorage('as_shomad_qurban_stocks', updated);
  };

  const handleDeleteStock = (id: string) => {
    const updated = qurbanStocks.filter((item) => item.id !== id);
    setQurbanStocks(updated);
    saveToStorage('as_shomad_qurban_stocks', updated);
  };

  // Infaq Handlers
  const handleAddInfaqRecord = (r: Omit<InfaqRecord, 'id'>) => {
    const newRec: InfaqRecord = {
      ...r,
      id: `INF-${Date.now().toString().slice(-5)}`
    };
    const updated = [newRec, ...infaqRecords];
    setInfaqRecords(updated);
    saveToStorage('as_shomad_infaq_records', updated);
  };

  const handleEditInfaqRecord = (r: InfaqRecord) => {
    const updated = infaqRecords.map((item) => (item.id === r.id ? r : item));
    setInfaqRecords(updated);
    saveToStorage('as_shomad_infaq_records', updated);
  };

  const handleDeleteInfaqRecord = (id: string) => {
    const updated = infaqRecords.filter((item) => item.id !== id);
    setInfaqRecords(updated);
    saveToStorage('as_shomad_infaq_records', updated);
  };

  // Informasi Handlers
  const handleAddNews = (n: Omit<MosqueNews, 'id'>) => {
    const newNews: MosqueNews = {
      ...n,
      id: `NWS-${Date.now().toString().slice(-5)}`
    };
    const updated = [newNews, ...newsList];
    setNewsList(updated);
    saveToStorage('as_shomad_news', updated);
  };

  const handleEditNews = (n: MosqueNews) => {
    const updated = newsList.map((item) => (item.id === n.id ? n : item));
    setNewsList(updated);
    saveToStorage('as_shomad_news', updated);
  };

  const handleDeleteNews = (id: string) => {
    const updated = newsList.filter((item) => item.id !== id);
    setNewsList(updated);
    saveToStorage('as_shomad_news', updated);
  };

  const handleAddEvent = (e: Omit<MosqueEvent, 'id'>) => {
    const newEv: MosqueEvent = {
      ...e,
      id: `EV-${Date.now().toString().slice(-5)}`
    };
    const updated = [newEv, ...events];
    setEvents(updated);
    saveToStorage('as_shomad_events', updated);
  };

  const handleEditEvent = (e: MosqueEvent) => {
    const updated = events.map((item) => (item.id === e.id ? e : item));
    setEvents(updated);
    saveToStorage('as_shomad_events', updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((item) => item.id !== id);
    setEvents(updated);
    saveToStorage('as_shomad_events', updated);
  };

  const handleAddGallery = (g: Omit<GalleryItem, 'id'>) => {
    const newG: GalleryItem = {
      ...g,
      id: `GAL-${Date.now().toString().slice(-5)}`
    };
    const updated = [newG, ...gallery];
    setGallery(updated);
    saveToStorage('as_shomad_gallery', updated);
  };

  const handleEditGallery = (g: GalleryItem) => {
    const updated = gallery.map((item) => (item.id === g.id ? g : item));
    setGallery(updated);
    saveToStorage('as_shomad_gallery', updated);
  };

  const handleDeleteGallery = (id: string) => {
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    saveToStorage('as_shomad_gallery', updated);
  };

  const handleAddJumatSchedule = (s: Omit<FridayPrayerSchedule, 'id'>) => {
    const newSchedule: FridayPrayerSchedule = {
      ...s,
      id: `JMT-${Date.now().toString().slice(-5)}`
    };
    const updated = [newSchedule, ...jumatSchedules];
    setJumatSchedules(updated);
    saveToStorage('as_shomad_jumat_schedules', updated);
  };

  const handleEditJumatSchedule = (s: FridayPrayerSchedule) => {
    const updated = jumatSchedules.map((item) => (item.id === s.id ? s : item));
    setJumatSchedules(updated);
    saveToStorage('as_shomad_jumat_schedules', updated);
  };

  const handleDeleteJumatSchedule = (id: string) => {
    const updated = jumatSchedules.filter((item) => item.id !== id);
    setJumatSchedules(updated);
    saveToStorage('as_shomad_jumat_schedules', updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER UTAMA APLIKASI & NAVIGASI 5 MENU */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        onOpenGoogleSheets={() => handleOpenGoogleSheets()}
        onLogout={handleLogout}
      />

      {/* NOTIFIKASI LOGOUT / STATUS PERSISTENSI */}
      {logoutNotice && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md border border-emerald-600 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>{logoutNotice}</span>
            </div>
            <button
              onClick={() => setLogoutNotice(null)}
              className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA SESUAI 5 MENU */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'laporan_keuangan' && (
          <LaporanKeuanganView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenGoogleSheets={() => handleOpenGoogleSheets('Laporan_Kas')}
          />
        )}

        {activeTab === 'babul_khairat' && (
          <BabulKhairatView
            families={families}
            onAddFamily={handleAddFamily}
            onEditFamily={handleEditFamily}
            onDeleteFamily={handleDeleteFamily}
            payments={babulPayments}
            onAddPayment={handleAddBabulPayment}
            onEditPayment={handleEditBabulPayment}
            onDeletePayment={handleDeleteBabulPayment}
            claims={babulClaims}
            onAddClaim={handleAddBabulClaim}
            onEditClaim={handleEditBabulClaim}
            onDeleteClaim={handleDeleteBabulClaim}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'qurban' && (
          <QurbanView
            shohibulList={shohibulList}
            onAddShohibul={handleAddShohibul}
            onEditShohibul={handleEditShohibul}
            onDeleteShohibul={handleDeleteShohibul}
            installments={installments}
            onAddInstallment={handleAddInstallment}
            onEditInstallment={handleEditInstallment}
            onDeleteInstallment={handleDeleteInstallment}
            stocks={qurbanStocks}
            onAddStock={handleAddStock}
            onEditStock={handleEditStock}
            onDeleteStock={handleDeleteStock}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'infaq_sadakah' && (
          <InfaqSadakahView
            records={infaqRecords}
            onAddRecord={handleAddInfaqRecord}
            onEditRecord={handleEditInfaqRecord}
            onDeleteRecord={handleDeleteInfaqRecord}
            currentUserRole={currentUser.role}
          />
        )}

        {activeTab === 'informasi_kegiatan' && (
          <InformasiKegiatanView
            newsList={newsList}
            onAddNews={handleAddNews}
            onEditNews={handleEditNews}
            onDeleteNews={handleDeleteNews}
            events={events}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            gallery={gallery}
            onAddGallery={handleAddGallery}
            onEditGallery={handleEditGallery}
            onDeleteGallery={handleDeleteGallery}
            jumatSchedules={jumatSchedules}
            onAddJumatSchedule={handleAddJumatSchedule}
            onEditJumatSchedule={handleEditJumatSchedule}
            onDeleteJumatSchedule={handleDeleteJumatSchedule}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-full border border-emerald-200 p-0.5 bg-emerald-50 shrink-0 flex items-center justify-center">
              <MosqueLogo className="w-full h-full" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                MASJID AS SHOMAD • Griya Praja Karimun
              </p>
              <p className="text-[11px] text-slate-400">
                © 2026 Masjid As Shomad Griya Praja Karimun
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH & DEPLOYMENT MODALS */}
      <AuthModals
        isLoginOpen={isLoginModalOpen}
        onCloseLogin={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLogin}
        accounts={users}
        isChangePasswordOpen={isChangePasswordModalOpen}
        onCloseChangePassword={() => setIsChangePasswordModalOpen(false)}
        onChangePasswordSuccess={(username, newPass) => handleChangePassword(newPass)}
        currentUser={currentUser}
        isGasGuideOpen={isDeploymentGuideOpen}
        onCloseGasGuide={() => setIsDeploymentGuideOpen(false)}
      />

      {/* GOOGLE SHEETS MODAL */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        data={{
          transactions,
          shohibulList,
          installments,
          qurbanStocks,
          infaqRecords,
          families,
          claims: babulClaims
        }}
        preselectedModule={sheetsPreselectedModule}
      />
    </div>
  );
}
