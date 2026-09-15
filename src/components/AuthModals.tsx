import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, KeyRound, Check, Copy, X, ShieldAlert, FileCode2 } from 'lucide-react';
import { MosqueLogo } from './MosqueLogo';
import { UserAccount } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE_GS, GOOGLE_APPS_SCRIPT_HTML } from '../data/googleAppsScriptCode';

interface AuthModalsProps {
  isLoginOpen: boolean;
  onCloseLogin: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  accounts: UserAccount[];
  isChangePasswordOpen: boolean;
  onCloseChangePassword: () => void;
  onChangePasswordSuccess: (username: string, newPass: string) => void;
  currentUser: UserAccount | null;
  isGasGuideOpen: boolean;
  onCloseGasGuide: () => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isLoginOpen,
  onCloseLogin,
  onLoginSuccess,
  accounts,
  isChangePasswordOpen,
  onCloseChangePassword,
  onChangePasswordSuccess,
  currentUser,
  isGasGuideOpen,
  onCloseGasGuide
}) => {
  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccessMsg, setChangePasswordSuccessMsg] = useState('');

  // GAS Guide States
  const [activeGasTab, setActiveGasTab] = useState<'panduan' | 'code_gs' | 'html'>('panduan');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const account = accounts.find(
      (acc) => acc.username.toLowerCase() === loginUsername.trim().toLowerCase()
    );

    if (!account) {
      setLoginError('Username tidak ditemukan di sistem.');
      return;
    }

    if (account.passwordHash !== loginPassword) {
      setLoginError('Password yang Anda masukkan salah.');
      return;
    }

    onLoginSuccess(account);
    setLoginUsername('');
    setLoginPassword('');
    onCloseLogin();
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccessMsg('');

    if (!currentUser) return;

    if (oldPassword !== currentUser.passwordHash) {
      setChangePasswordError('Password lama tidak sesuai.');
      return;
    }

    if (newPassword.length < 5) {
      setChangePasswordError('Password baru minimal 5 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    onChangePasswordSuccess(currentUser.username, newPassword);
    setChangePasswordSuccessMsg('Password berhasil diperbarui! Gunakan password ini untuk login selanjutnya.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      onCloseChangePassword();
      setChangePasswordSuccessMsg('');
    }, 2000);
  };

  return (
    <>
      {/* 1. MODAL LOGIN WITH SHOW PASSWORD */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow flex-shrink-0 flex items-center justify-center">
                  <MosqueLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Login Pengurus Masjid</h3>
                  <p className="text-xs text-emerald-200">Masuk untuk mengelola transaksi keuangan</p>
                </div>
              </div>
              <button
                onClick={onCloseLogin}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username pengurus"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">Fitur Show/Hide</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                    title={showLoginPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onCloseLogin}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Masuk Sistem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL CHANGE PASSWORD */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Ganti Password Akun</h3>
              </div>
              <button
                onClick={onCloseChangePassword}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Akun yang sedang aktif: <strong className="text-slate-900">{currentUser?.name}</strong> ({currentUser?.roleLabel})
              </p>

              {changePasswordError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs">
                  {changePasswordError}
                </div>
              )}

              {changePasswordSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  {changePasswordSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password Baru
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showNewPassword ? 'Sembunyikan' : 'Perlihatkan'}
                  </button>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Password Baru
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onCloseChangePassword}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL GOOGLE APPS SCRIPT (CODE.GS & SPREADSHEET DEPLOYMENT GUIDE) */}
      {isGasGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <FileCode2 className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">Panduan Deployment Google Sheets & Apps Script</h3>
                  <p className="text-xs text-emerald-200">
                    Gunakan kode ini untuk menghubungkan langsung sistem ke Google Sheets Anda secara gratis
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseGasGuide}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100 px-6 pt-3 flex space-x-2 border-b border-slate-200 shrink-0">
              <button
                onClick={() => setActiveGasTab('panduan')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${
                  activeGasTab === 'panduan'
                    ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Langkah-Langkah Deployment
              </button>
              <button
                onClick={() => setActiveGasTab('code_gs')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 ${
                  activeGasTab === 'code_gs'
                    ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Kode Code.gs
              </button>
              <button
                onClick={() => setActiveGasTab('html')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 ${
                  activeGasTab === 'html'
                    ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Kode Index.html
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
              {activeGasTab === 'panduan' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h4 className="font-bold text-emerald-900 text-sm mb-1">
                      Panduan Lengkap Implementasi Web App Berbasis Google Apps Script:
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Aplikasi ini dapat di-host langsung melalui Google Apps Script yang terhubung ke Google Sheets sebagai database online 100% gratis, realtime, dan aman untuk pengurus Masjid As Shomad.
                    </p>
                  </div>

                  <ol className="space-y-4 text-xs sm:text-sm list-decimal list-inside font-medium text-slate-700">
                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Buat Google Spreadsheet Baru:</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">sheets.new</a> di browser Anda, lalu beri judul spreadsheet: <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">DATABASE KEUANGAN MASJID AS SHOMAD</code>.
                      </p>
                    </li>

                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Buka Script Editor (Apps Script):</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Di menu atas spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>. Jendela editor Google Apps Script akan terbuka.
                      </p>
                    </li>

                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Salin Kode Code.gs:</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Buka tab <strong>"2. Kode Code.gs"</strong> di atas, klik tombol <strong>Salin Kode</strong>, lalu tempelkan ke dalam file <code className="bg-slate-200 px-1 py-0.5 rounded">Code.gs</code> di editor Google Apps Script. Hapus kode bawaan jika ada.
                      </p>
                    </li>

                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Buat File HTML (Index.html):</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Di editor Apps Script, klik tombol <span className="font-mono font-bold">+</span> di samping tulisan Files &gt; pilih <strong>HTML</strong> &gt; beri nama file tepat: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">Index</code> (tanpa .html).
                        Buka tab <strong>"3. Kode Index.html"</strong> di atas, salin kodenya dan tempel ke file Index.html.
                      </p>
                    </li>

                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Jalankan Setup Tabel Awal:</strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Pilih fungsi <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">initialSetup</code> pada dropdown fungsi di editor Apps Script, lalu klik <strong>Run</strong> (Jalankan). Berikan izin (Review Permissions &gt; Allow). Spreadsheet Anda akan otomatis dibuatkan semua sheet dan kolom yang dibutuhkan.
                      </p>
                    </li>

                    <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Deploy sebagai Web App:</strong>
                      <div className="text-xs text-slate-600 mt-1 space-y-1">
                        <p>1. Klik tombol biru <strong>Deploy (Terapkan)</strong> di kanan atas &gt; <strong>New deployment (Penerapan baru)</strong>.</p>
                        <p>2. Pilih tipe: <strong>Web app</strong>.</p>
                        <p>3. Execute as (Jalankan sebagai): <strong>Me (email Anda)</strong>.</p>
                        <p>4. Who has access (Siapa yang memiliki akses): <strong>Anyone (Siapa saja)</strong> agar jama'ah dan pengurus dapat mengaksesnya tanpa harus login akun Google.</p>
                        <p>5. Klik <strong>Deploy</strong> lalu salin Web App URL yang dihasilkan untuk digunakan.</p>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {activeGasTab === 'code_gs' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">File: Code.gs (Google Apps Script)</span>
                    <button
                      onClick={() => handleCopy(GOOGLE_APPS_SCRIPT_CODE_GS, 'code_gs')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {copiedType === 'code_gs' ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedType === 'code_gs' ? 'Tersalin!' : 'Salin Seluruh Kode Code.gs'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-700">
                    {GOOGLE_APPS_SCRIPT_CODE_GS}
                  </pre>
                </div>
              )}

              {activeGasTab === 'html' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">File: Index.html (Google Apps Script Template)</span>
                    <button
                      onClick={() => handleCopy(GOOGLE_APPS_SCRIPT_HTML, 'html')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {copiedType === 'html' ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedType === 'html' ? 'Tersalin!' : 'Salin Seluruh Kode Index.html'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-700">
                    {GOOGLE_APPS_SCRIPT_HTML}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={onCloseGasGuide}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
