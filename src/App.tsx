import React, { useState, useEffect } from 'react';
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
  BankStatementItem,
  UserAccount
} from './types';
import { 
  INITIAL_DATA, 
  INITIAL_USERS 
} from './data/initialData';

import { Header } from './components/Header';
import { MosqueLogo } from './components/MosqueLogo';
import { AuthModals } from './components/AuthModals';
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

  // 1. Data Keuangan Masjid
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('as_shomad_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.transactions;
  });

  const [reconciliations, setReconciliations] = useState<BankStatementItem[]>(() => {
    const saved = localStorage.getItem('as_shomad_reconciliations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.reconciliations;
  });

  // 2. Data Babul Khairat
  const [families, setFamilies] = useState<BabulKhairatFamily[]>(() => {
    const saved = localStorage.getItem('as_shomad_families');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatFamilies;
  });

  const [babulPayments, setBabulPayments] = useState<BabulKhairatPayment[]>(() => {
    const saved = localStorage.getItem('as_shomad_babul_payments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatPayments;
  });

  const [babulClaims, setBabulClaims] = useState<BabulKhairatClaim[]>(() => {
    const saved = localStorage.getItem('as_shomad_babul_claims');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.babulKhairatClaims;
  });

  // 3. Data Qurban
  const [shohibulList, setShohibulList] = useState<ShohibulQurban[]>(() => {
    const saved = localStorage.getItem('as_shomad_shohibul');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.shohibulQurban;
  });

  const [installments, setInstallments] = useState<QurbanInstallment[]>(() => {
    const saved = localStorage.getItem('as_shomad_installments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DATA.qurbanInstallments;
  });

  const [qurbanStocks] = useState<QurbanStock[]>(() => {
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
    localStorage.setItem('as_shomad_reconciliations', JSON.stringify(reconciliations));
  }, [reconciliations]);

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
  };

  const handleLogout = () => {
    const guestUser: UserAccount = {
      username: 'tamu',
      name: 'Jama’ah / Tamu',
      role: 'public',
      passwordHash: '',
      roleLabel: 'Masyarakat / Jama’ah (Akses Publik Transparan)'
    };
    setCurrentUser(guestUser);
  };

  const handleChangePassword = (newPassword: string) => {
    const updatedUsers = users.map((u) => 
      u.username === currentUser.username ? { ...u, passwordHash: newPassword } : u
    );
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, passwordHash: newPassword });
  };

  // Keuangan Handlers
  const handleAddTransaction = (t: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...t,
      id: `TX-${Date.now().toString().slice(-6)}`
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleEditTransaction = (t: FinancialTransaction) => {
    setTransactions(transactions.map((item) => (item.id === t.id ? t : item)));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((item) => item.id !== id));
  };

  const handleToggleReconciliation = (id: string) => {
    setReconciliations(
      reconciliations.map((item) =>
        item.id === id ? { ...item, statusMatch: !item.statusMatch } : item
      )
    );
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

  const handleDeleteInstallment = (id: string) => {
    setInstallments(installments.filter((item) => item.id !== id));
  };

  // Infaq Handlers
  const handleAddInfaqRecord = (r: Omit<InfaqRecord, 'id'>) => {
    const newRec: InfaqRecord = {
      ...r,
      id: `INF-${Date.now().toString().slice(-5)}`
    };
    setInfaqRecords([newRec, ...infaqRecords]);
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
        onLogout={handleLogout}
      />

      {/* KONTEN UTAMA SESUAI 5 MENU */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'laporan_keuangan' && (
          <LaporanKeuanganView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            bankStatements={reconciliations}
            onToggleReconciled={handleToggleReconciliation}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
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
            onDeleteInstallment={handleDeleteInstallment}
            stocks={qurbanStocks}
            currentUserRole={currentUser.role}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'infaq_sadakah' && (
          <InfaqSadakahView
            records={infaqRecords}
            onAddRecord={handleAddInfaqRecord}
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
    </div>
  );
}
