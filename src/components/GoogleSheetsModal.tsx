import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Upload, 
  Database, 
  Sparkles, 
  Layers,
  LogOut,
  FolderOpen,
  Eye,
  Calendar,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../services/googleAuthService';
import { 
  MosqueAllData, 
  createNewMosqueSpreadsheet, 
  syncToExistingSpreadsheet, 
  listDriveSpreadsheets, 
  getSpreadsheetDetails, 
  readSheetData,
  DriveSpreadsheetItem,
  SpreadsheetDetails,
  extractSpreadsheetId
} from '../services/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MosqueAllData;
  preselectedModule?: string;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  data,
  preselectedModule
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'sync_existing' | 'preview'>('create');

  // New Spreadsheet State
  const [newTitle, setNewTitle] = useState('Manajemen Keuangan Masjid As Shomad 1446 H');
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({
    'Laporan_Kas': true,
    'Shohibul_Qurban': true,
    'Cicilan_Qurban': true,
    'Stok_Hewan_Qurban': true,
    'Infaq_Sedekah': true,
    'Babul_Khairat': true
  });

  // Existing Spreadsheet State
  const [existingInput, setExistingInput] = useState('');
  const [driveSpreadsheets, setDriveSpreadsheets] = useState<DriveSpreadsheetItem[]>([]);
  const [isLoadingDriveList, setIsLoadingDriveList] = useState(false);
  const [inspectedDetails, setInspectedDetails] = useState<SpreadsheetDetails | null>(null);

  // Active Connection Info
  const [currentSpreadsheet, setCurrentSpreadsheet] = useState<{ id: string; url: string; title: string } | null>(() => {
    const saved = localStorage.getItem('as_shomad_active_spreadsheet');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('as_shomad_last_sheets_sync') || null;
  });

  // Operations State
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Destructive Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    affectedSheets: string[];
    onConfirm: () => void;
  } | null>(null);

  // Sheet Preview State
  const [previewSheetName, setPreviewSheetName] = useState<string>('Laporan_Kas');
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Listen to Firebase Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasToken(!!token);
      },
      () => {
        setGoogleUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Set preselected module if specified
  useEffect(() => {
    if (preselectedModule) {
      if (preselectedModule === 'qurban') {
        setSelectedModules({
          'Laporan_Kas': false,
          'Shohibul_Qurban': true,
          'Cicilan_Qurban': true,
          'Stok_Hewan_Qurban': true,
          'Infaq_Sedekah': false,
          'Babul_Khairat': false
        });
      } else if (preselectedModule === 'kas') {
        setSelectedModules({
          'Laporan_Kas': true,
          'Shohibul_Qurban': false,
          'Cicilan_Qurban': false,
          'Stok_Hewan_Qurban': false,
          'Infaq_Sedekah': false,
          'Babul_Khairat': false
        });
      } else if (preselectedModule === 'infaq') {
        setSelectedModules({
          'Laporan_Kas': false,
          'Shohibul_Qurban': false,
          'Cicilan_Qurban': false,
          'Stok_Hewan_Qurban': false,
          'Infaq_Sedekah': true,
          'Babul_Khairat': false
        });
      }
    }
  }, [preselectedModule]);

  // Load drive spreadsheets when user is signed in and on sync tab
  useEffect(() => {
    if (hasToken && isOpen && activeTab === 'sync_existing') {
      loadDriveList();
    }
  }, [hasToken, isOpen, activeTab]);

  const loadDriveList = async () => {
    try {
      setIsLoadingDriveList(true);
      const list = await listDriveSpreadsheets();
      setDriveSpreadsheets(list);
    } catch (e: any) {
      console.warn('Gagal memuat daftar drive:', e.message);
    } finally {
      setIsLoadingDriveList(false);
    }
  };

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setHasToken(true);
        setSuccessMessage('Berhasil terhubung dengan Google Sheets & Google Drive.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
      // Jika result null (popup ditutup oleh user), tidak perlu menampilkan error merah
    } catch (e: any) {
      const msg = e?.message || '';
      const code = e?.code || '';
      if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user') || code === 'auth/cancelled-popup-request') {
        // Abaikan penutupan manual oleh user
        return;
      }
      setErrorMessage(msg || 'Gagal masuk dengan Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setHasToken(false);
      setSuccessMessage('Koneksi Google telah dinonaktifkan.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  // Create New Spreadsheet
  const handleCreateNewSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasToken) {
      handleGoogleSignIn();
      return;
    }

    const tabsToCreate = Object.keys(selectedModules).filter((k) => selectedModules[k]);
    if (tabsToCreate.length === 0) {
      setErrorMessage('Pilih minimal 1 lembar data untuk diekspor.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await createNewMosqueSpreadsheet(newTitle, data, tabsToCreate);
      const newActive = {
        id: result.spreadsheetId,
        url: result.spreadsheetUrl,
        title: result.title
      };
      setCurrentSpreadsheet(newActive);
      localStorage.setItem('as_shomad_active_spreadsheet', JSON.stringify(newActive));
      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      localStorage.setItem('as_shomad_last_sheets_sync', now);

      setSuccessMessage(`Berhasil membuat Google Spreadsheet baru: "${result.title}" dengan ${tabsToCreate.length} lembar kerja!`);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal membuat spreadsheet baru.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync to Existing Spreadsheet with REQUIRED explicit user confirmation dialog
  const promptSyncToExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInput.trim()) {
      setErrorMessage('Masukkan Spreadsheet ID atau URL Google Sheets terlebih dahulu.');
      return;
    }

    const tabsToSync = Object.keys(selectedModules).filter((k) => selectedModules[k]);
    if (tabsToSync.length === 0) {
      setErrorMessage('Pilih minimal 1 lembar data untuk disinkronkan.');
      return;
    }

    const targetId = extractSpreadsheetId(existingInput);

    // Open mandatory confirmation dialog before executing mutation
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Pembaruan Data Google Sheets',
      description: `Apakah Anda yakin ingin memperbarui data pada spreadsheet target (${targetId})? Isi lembar kerja terpilih akan disinkronkan dengan data terkini aplikasi Masjid As Shomad.`,
      affectedSheets: tabsToSync,
      onConfirm: () => executeSyncToExisting(targetId, tabsToSync)
    });
  };

  const executeSyncToExisting = async (targetId: string, tabsToSync: string[]) => {
    setConfirmDialog(null);
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await syncToExistingSpreadsheet(targetId, data, tabsToSync);
      const newActive = {
        id: targetId,
        url: result.spreadsheetUrl,
        title: inspectedDetails?.title || `Spreadsheet ${targetId.slice(0, 8)}...`
      };
      setCurrentSpreadsheet(newActive);
      localStorage.setItem('as_shomad_active_spreadsheet', JSON.stringify(newActive));
      const now = new Date().toLocaleString('id-ID');
      setLastSyncTime(now);
      localStorage.setItem('as_shomad_last_sheets_sync', now);

      setSuccessMessage(`Berhasil menyinkronkan data ke Google Sheets (${tabsToSync.length} lembar diperbarui)!`);
    } catch (e: any) {
      setErrorMessage(e.message || 'Gagal menyinkronkan data ke spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Inspect existing spreadsheet details
  const handleInspectSpreadsheet = async (idOrUrl: string) => {
    if (!idOrUrl.trim()) return;
    setErrorMessage(null);
    try {
      const details = await getSpreadsheetDetails(idOrUrl);
      setInspectedDetails(details);
      setExistingInput(details.id);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  // Preview sheet live data
  const handleLoadPreview = async () => {
    if (!currentSpreadsheet) return;
    setIsLoadingPreview(true);
    setErrorMessage(null);
    try {
      const result = await readSheetData(currentSpreadsheet.id, previewSheetName);
      setPreviewData(result);
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'preview' && currentSpreadsheet) {
      handleLoadPreview();
    }
  }, [activeTab, previewSheetName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>Integrasi Google Sheets</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Ekspor, kelola buku kas, tabungan qurban, dan infaq secara langsung ke Google Sheets.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar Akun Google & Spreadsheet Aktif */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          {/* Status Akun */}
          <div className="flex items-center space-x-2.5">
            {hasToken && googleUser ? (
              <div className="flex items-center space-x-2">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="" className="w-7 h-7 rounded-full border border-emerald-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{googleUser.displayName || 'Akun Google'}</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      <Check className="w-3 h-3 text-emerald-700" /> Terhubung
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{googleUser.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  title="Putuskan sambungan Google"
                  className="ml-2 text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600 font-medium">Belum terhubung ke Google:</span>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isSigningIn ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
                  </button>
                </div>
                {typeof window !== 'undefined' && window.self !== window.top && (
                  <span className="text-[10px] text-slate-500 italic">
                    (Jika popup langsung tertutup, buka aplikasi di tab baru)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Info Spreadsheet Aktif */}
          {currentSpreadsheet && (
            <div className="flex items-center space-x-2 text-right">
              <a
                href={currentSpreadsheet.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{currentSpreadsheet.title}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Spreadsheet Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sync_existing')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'sync_existing'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sinkron ke Spreadsheet Ada</span>
          </button>

          {currentSpreadsheet && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Tinjau Data Sheets</span>
            </button>
          )}
        </div>

        {/* Feedback Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* TAB 1: BUAT SPREADSHEET BARU */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateNewSpreadsheet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama / Judul Dokumen Spreadsheet
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Manajemen Keuangan Masjid As Shomad 1446 H"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-hidden font-medium text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  File spreadsheet ini akan otomatis tersimpan di Google Drive akun Anda.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Pilih Lembar Data (Sheets) yang Akan Dibuat:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Laporan_Kas', label: 'Buku Kas Keuangan', count: data.transactions.length, desc: 'Pemasukan, pengeluaran & saldo kas' },
                    { id: 'Shohibul_Qurban', label: 'Peserta Shohibul Qurban', count: data.shohibulList.length, desc: 'Data peserta, paket sapi/kambing, status' },
                    { id: 'Cicilan_Qurban', label: 'Tabungan / Cicilan Qurban', count: data.installments.length, desc: 'Rekam setoran dan bukti kuitansi' },
                    { id: 'Stok_Hewan_Qurban', label: 'Stok & Harga Hewan Qurban', count: data.qurbanStocks.length, desc: 'Kuota slot hewan dan harga pasar' },
                    { id: 'Infaq_Sedekah', label: 'Infaq, Sedekah & Donasi', count: data.infaqRecords.length, desc: 'Kotak Jumat, renovasi, yatim dhuafa' },
                    { id: 'Babul_Khairat', label: 'Babul Khairat (Sosial Kematian)', count: (data.families || []).length, desc: 'Data anggota keluarga & iuran' }
                  ].map((mod) => (
                    <label 
                      key={mod.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                        selectedModules[mod.id] 
                          ? 'border-emerald-600 bg-emerald-50/60' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedModules[mod.id]}
                        onChange={(e) => setSelectedModules({ ...selectedModules, [mod.id]: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{mod.label}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {mod.count} data
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{mod.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Data diformat rapi dengan baris judul terkunci (frozen header) di Google Sheets.
                </span>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Membuat Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Buat & Ekspor ke Google Sheets</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SINKRONISASI KE SPREADSHEET YANG SUDAH ADA */}
          {activeTab === 'sync_existing' && (
            <form onSubmit={promptSyncToExisting} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Spreadsheet ID atau URL Dokumen Google Sheets
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={existingInput}
                    onChange={(e) => setExistingInput(e.target.value)}
                    placeholder="Tempel URL (https://docs.google.com/spreadsheets/d/...) atau Spreadsheet ID"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-hidden font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectSpreadsheet(existingInput)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-300 transition cursor-pointer"
                  >
                    Periksa
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Aplikasi akan memperbarui lembar kerja terpilih sesuai data terbaru.
                </p>
              </div>

              {/* Daftar Spreadsheet Terdeteksi dari Drive Akun Pengguna */}
              {hasToken && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Pilih dari Google Drive Anda:</span>
                    </span>
                    <button
                      type="button"
                      onClick={loadDriveList}
                      disabled={isLoadingDriveList}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDriveList ? 'animate-spin' : ''}`} />
                      <span>Segarkan Daftar</span>
                    </button>
                  </div>

                  {isLoadingDriveList ? (
                    <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      Memuat daftar spreadsheet dari Google Drive...
                    </div>
                  ) : driveSpreadsheets.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                      {driveSpreadsheets.map((ss) => (
                        <div
                          key={ss.id}
                          onClick={() => {
                            setExistingInput(ss.id);
                            handleInspectSpreadsheet(ss.id);
                          }}
                          className={`p-2 rounded-lg text-left transition cursor-pointer flex justify-between items-center ${
                            existingInput === ss.id 
                              ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-white hover:bg-emerald-50 border border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-semibold">{ss.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{ss.id.slice(0, 16)}...</div>
                          </div>
                          {existingInput === ss.id && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 text-center text-[11px] text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Belum ada spreadsheet terdeteksi. Buat spreadsheet baru pada tab pertama.
                    </div>
                  )}
                </div>
              )}

              {/* Inspected info */}
              {inspectedDetails && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-emerald-950">
                    <span>{inspectedDetails.title}</span>
                    <a 
                      href={inspectedDetails.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Lembar yang ada: {inspectedDetails.sheets.map((s) => s.title).join(', ') || '-'}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Lembar yang Ingin Disinkronkan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Laporan_Kas', label: 'Laporan_Kas' },
                    { id: 'Shohibul_Qurban', label: 'Shohibul_Qurban' },
                    { id: 'Cicilan_Qurban', label: 'Cicilan_Qurban' },
                    { id: 'Stok_Hewan_Qurban', label: 'Stok_Hewan_Qurban' },
                    { id: 'Infaq_Sedekah', label: 'Infaq_Sedekah' },
                    { id: 'Babul_Khairat', label: 'Babul_Khairat' }
                  ].map((mod) => (
                    <label 
                      key={mod.id}
                      className={`p-2 rounded-lg border text-center font-medium cursor-pointer transition ${
                        selectedModules[mod.id]
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedModules[mod.id]}
                        onChange={(e) => setSelectedModules({ ...selectedModules, [mod.id]: e.target.checked })}
                        className="sr-only"
                      />
                      <span>{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Mulai Sinkronisasi Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TINJAU DATA SHEETS */}
          {activeTab === 'preview' && currentSpreadsheet && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800">Pratinjau Lembar Kerja dari Google Sheets</h4>
                  <p className="text-[11px] text-slate-500">Membaca langsung baris data yang tersimpan di spreadsheet aktif.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={previewSheetName}
                    onChange={(e) => setPreviewSheetName(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Laporan_Kas">Laporan_Kas</option>
                    <option value="Shohibul_Qurban">Shohibul_Qurban</option>
                    <option value="Cicilan_Qurban">Cicilan_Qurban</option>
                    <option value="Stok_Hewan_Qurban">Stok_Hewan_Qurban</option>
                    <option value="Infaq_Sedekah">Infaq_Sedekah</option>
                    <option value="Babul_Khairat">Babul_Khairat</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleLoadPreview}
                    disabled={isLoadingPreview}
                    className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    title="Muat Ulang Data"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {isLoadingPreview ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl">
                  Mengambil baris dari Google Sheets API...
                </div>
              ) : previewData && previewData.headers.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-60">
                  <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                    <thead className="bg-emerald-800 text-white sticky top-0">
                      <tr>
                        {previewData.headers.map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left font-bold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {previewData.rows.slice(0, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-700">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada data pada lembar "{previewSheetName}" atau lembar belum dibuat.
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500">
                  Terakhir disinkronkan: {lastSyncTime || 'Belum pernah'}
                </span>
                <a
                  href={currentSpreadsheet.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <span>Buka di Google Sheets Lengkap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Format Data: Otomatis disinkronkan langsung via Google Sheets API v4</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE / OVERWRITE OPERATIONS */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">{confirmDialog.title}</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-xs">
              <span className="font-bold text-amber-900 block">Lembar kerja yang akan diperbarui:</span>
              <ul className="list-disc list-inside text-amber-800 space-y-0.5 text-[11px]">
                {confirmDialog.affectedSheets.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Ya, Lanjutkan Sinkronisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
