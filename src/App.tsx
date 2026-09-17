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

  // 1. Data Keuangan Masjid (Selalu dimuat dari localStorage, dipersist secara aman)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('as_shomad_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Gagal membaca data transaksi dari localStorage:', e);
      }
    }
    // Simpan data awal ke localStorage agar langsung tersedia di storage browser
    try {
      localStorage.setItem('as_shomad_transactions', JSON.stringify(INITIAL_DATA.transactions));
    } catch (e) {}
    return INITIAL_DATA.transactions;
  });

  // 2. Data Babul Khairat
  const [families, setFamilies] = useState<BabulKhairatFamily[]>(() => {
    const saved = localStorage.getItem('as_shomad_families');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatFamilies;
  });

  const [babulPayments, setBabulPayments] = useState<BabulKhairatPayment[]>(() => {
    const saved = localStorage.getItem('as_shomad_babul_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatPayments;
  });

  const [babulClaims, setBabulClaims] = useState<BabulKhairatClaim[]>(() => {
    const saved = localStorage.getItem('as_shomad_babul_claims');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatClaims;
  });

  // 3. Data Qurban
  const [shohibulList, setShohibulList] = useState<ShohibulQurban[]>(() => {
    const version = localStorage.getItem('as_shomad_qurban_v2');
    const saved = localStorage.getItem('as_shomad_shohibul');
    if (saved && version === 'true') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('as_shomad_qurban_v2', 'true');
    localStorage.setItem('as_shomad_shohibul', JSON.stringify(INITIAL_DATA.shohibulQurban));
    return INITIAL_DATA.shohibulQurban;
  });

  const [installments, setInstallments] = useState<QurbanInstallment[]>(() => {
    const version = localStorage.getItem('as_shomad_qurban_v2');
    const saved = localStorage.getItem('as_shomad_installments');
    if (saved && version === 'true') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('as_shomad_qurban_v2', 'true');
    localStorage.setItem('as_shomad_installments', JSON.stringify(INITIAL_DATA.qurbanInstallments));
    return INITIAL_DATA.qurbanInstallments;
  });

  const [qurbanStocks, setQurbanStocks] = useState<QurbanStock[]>(() => {
    const saved = localStorage.getItem('as_shomad_qurban_stocks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_DATA.qurbanStocks;
  });

  // 4. Data Infaq & Sadakah
  const [infaqRecords, setInfaqRecords] = useState<InfaqRecord[]>(() => {
    const saved = localStorage.getItem('as_shomad_infaq_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.infaqRecords;
  });

  // 5. Data Informasi & Kegiatan
  const [newsList, setNewsList] = useState<MosqueNews[]>(() => {
    const saved = localStorage.getItem('as_shomad_news');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.news;
  });

  const [events, setEvents] = useState<MosqueEvent[]>(() => {
    const saved = localStorage.getItem('as_shomad_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.events;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('as_shomad_gallery');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.gallery;
  });

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
    try {
      localStorage.setItem('as_shomad_transactions', JSON.stringify(updated));
    } catch (e) {
      console.error('Gagal menyimpan transaksi ke localStorage:', e);
    }
  };

  const handleEditTransaction = (t: FinancialTransaction) => {
    const updated = transactions.map((item) => (item.id === t.id ? t : item));
    setTransactions(updated);
    try {
      localStorage.setItem('as_shomad_transactions', JSON.stringify(updated));
    } catch (e) {
      console.error('Gagal memperbarui transaksi di localStorage:', e);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((item) => item.id !== id);
    setTransactions(updated);
    try {
      localStorage.setItem('as_shomad_transactions', JSON.stringify(updated));
    } catch (e) {
      console.error('Gagal menghapus transaksi di localStorage:', e);
    }
  };

  // Babul Khairat Handlers
  const handleAddFamily = (f: Omit<BabulKhairatFamily, 'id'>) => {
    const newFamily: BabulKhairatFamily = {
      ...f,
      id: `BK-${Date.now().toString().slice(-5)}`
    };
    setFamilies([newFamily, ...families]);
  };

  const handleEditFamily = (f: BabulKhairatFamily) => {
    setFamilies(families.map((item) => (item.id === f.id ? f : item)));
  };

  const handleDeleteFamily = (id: string) => {
    setFamilies(families.filter((item) => item.id !== id));
  };

  const handleAddBabulPayment = (p: Omit<BabulKhairatPayment, 'id'>) => {
    const newPayment: BabulKhairatPayment = {
      ...p,
      id: `PAY-${Date.now().toString().slice(-5)}`
    };
    setBabulPayments([newPayment, ...babulPayments]);
  };

  const handleEditBabulPayment = (p: BabulKhairatPayment) => {
    setBabulPayments(babulPayments.map((item) => (item.id === p.id ? p : item)));
  };

  const handleDeleteBabulPayment = (id: string) => {
    setBabulPayments(babulPayments.filter((item) => item.id !== id));
  };

  const handleAddBabulClaim = (c: Omit<BabulKhairatClaim, 'id'>) => {
    const newClaim: BabulKhairatClaim = {
      ...c,
      id: `CLM-${Date.now().toString().slice(-5)}`
    };
    setBabulClaims([newClaim, ...babulClaims]);
  };

  const handleEditBabulClaim = (c: BabulKhairatClaim) => {
    setBabulClaims(babulClaims.map((item) => (item.id === c.id ? c : item)));
  };

  const handleDeleteBabulClaim = (id: string) => {
    setBabulClaims(babulClaims.filter((item) => item.id !== id));
  };

  // Qurban Handlers
  const handleAddShohibul = (s: Omit<ShohibulQurban, 'id'>) => {
    const newShohibul: ShohibulQurban = {
      ...s,
      id: `SH-${Date.now().toString().slice(-5)}`
    };
    setShohibulList([newShohibul, ...shohibulList]);
  };

  const handleEditShohibul = (s: ShohibulQurban) => {
    setShohibulList(shohibulList.map((item) => (item.id === s.id ? s : item)));
  };

  const handleDeleteShohibul = (id: string) => {
    setShohibulList(shohibulList.filter((item) => item.id !== id));
  };

  const handleAddInstallment = (inst: Omit<QurbanInstallment, 'id'>) => {
    const newInst: QurbanInstallment = {
      ...inst,
      id: `INST-${Date.now().toString().slice(-5)}`
    };
    setInstallments([newInst, ...installments]);
  };

  const handleEditInstallment = (inst: QurbanInstallment) => {
    setInstallments(installments.map((item) => (item.id === inst.id ? inst : item)));
  };

  const handleDeleteInstallment = (id: string) => {
    setInstallments(installments.filter((item) => item.id !== id));
  };

  const handleAddStock = (s: Omit<QurbanStock, 'id'>) => {
    const newStock: QurbanStock = {
      ...s,
      id: `STK-${Date.now().toString().slice(-5)}`
    };
    setQurbanStocks([...qurbanStocks, newStock]);
  };

  const handleEditStock = (s: QurbanStock) => {
    setQurbanStocks(qurbanStocks.map((item) => (item.id === s.id ? s : item)));
  };

  const handleDeleteStock = (id: string) => {
    setQurbanStocks(qurbanStocks.filter((item) => item.id !== id));
  };

  // Infaq Handlers
  const handleAddInfaqRecord = (r: Omit<InfaqRecord, 'id'>) => {
    const newRec: InfaqRecord = {
      ...r,
      id: `INF-${Date.now().toString().slice(-5)}`
    };
    setInfaqRecords([newRec, ...infaqRecords]);
  };

  const handleEditInfaqRecord = (r: InfaqRecord) => {
    setInfaqRecords(infaqRecords.map((item) => (item.id === r.id ? r : item)));
  };

  const handleDeleteInfaqRecord = (id: string) => {
    setInfaqRecords(infaqRecords.filter((item) => item.id !== id));
  };

  // Informasi Handlers
  const handleAddNews = (n: Omit<MosqueNews, 'id'>) => {
    const newNews: MosqueNews = {
      ...n,
      id: `NWS-${Date.now().toString().slice(-5)}`
    };
    setNewsList([newNews, ...newsList]);
  };

  const handleEditNews = (n: MosqueNews) => {
    setNewsList(newsList.map((item) => (item.id === n.id ? n : item)));
  };

  const handleDeleteNews = (id: string) => {
    setNewsList(newsList.filter((item) => item.id !== id));
  };

  const handleAddEvent = (e: Omit<MosqueEvent, 'id'>) => {
    const newEv: MosqueEvent = {
      ...e,
      id: `EV-${Date.now().toString().slice(-5)}`
    };
    setEvents([newEv, ...events]);
  };

  const handleEditEvent = (e: MosqueEvent) => {
    setEvents(events.map((item) => (item.id === e.id ? e : item)));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((item) => item.id !== id));
  };

  const handleAddGallery = (g: Omit<GalleryItem, 'id'>) => {
    const newG: GalleryItem = {
      ...g,
      id: `GAL-${Date.now().toString().slice(-5)}`
    };
    setGallery([newG, ...gallery]);
  };

  const handleEditGallery = (g: GalleryItem) => {
    setGallery(gallery.map((item) => (item.id === g.id ? g : item)));
  };

  const handleDeleteGallery = (id: string) => {
    setGallery(gallery.filter((item) => item.id !== id));
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
