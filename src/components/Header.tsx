import React from 'react';
import { UserRole, MainTab } from '../types';
import { MosqueLogo } from './MosqueLogo';
import { 
  LogIn, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Coins, 
  HeartHandshake, 
  CalendarDays 
} from 'lucide-react';

interface HeaderProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  currentUser: { username: string; name: string; role: UserRole; roleLabel: string } | null;
  onOpenLogin: () => void;
  onOpenChangePassword: () => void;
  onOpenGasGuide?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  onOpenChangePassword,
  onOpenGasGuide,
  onLogout
}) => {
  const navItems: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'laporan_keuangan', label: 'LAPORAN KEUANGAN', icon: BookOpen },
    { id: 'babul_khairat', label: 'BABUL KHAIRAT', icon: Users },
    { id: 'qurban', label: 'QURBAN', icon: Coins },
    { id: 'infaq_sadakah', label: 'INFAQ & SADAKAH', icon: HeartHandshake },
    { id: 'informasi_kegiatan', label: 'INFORMASI DAN KEGIATAN', icon: CalendarDays },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-emerald-800">
      {/* Top Bar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Sisi Kiri Atas: Nama Aplikasi & Logo Resmi */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md ring-2 ring-emerald-400/40 flex-shrink-0 flex items-center justify-center">
            <MosqueLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-white drop-shadow-sm uppercase">
                MASJID AS SHOMAD
              </h1>
            </div>
            <p className="text-xs text-emerald-200 font-medium">
              Sistem Informasi Transparan, Akuntabel dan Terpercaya
            </p>
          </div>
        </div>

        {/* Sisi Kanan Atas: User Role, Login, Logout, Change Password */}
        <div className="flex items-center flex-wrap gap-2 justify-start md:justify-end">
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-700/60">
              <div className="px-2 py-0.5 text-left hidden sm:block">
                <div className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-300 truncate max-w-[140px]">
                  {currentUser.roleLabel}
                </div>
              </div>

              {/* Menu Change Password */}
              <button
                onClick={onOpenChangePassword}
                title="Ganti Password Akun"
                className="flex items-center space-x-1 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Change Password</span>
              </button>

              {/* Menu Logout */}
              <button
                onClick={onLogout}
                title="Logout dari Sistem"
                className="flex items-center space-x-1 bg-rose-700 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-950/50 border border-emerald-700/50 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg hidden sm:inline-block">
                Mode Jama'ah / Publik
              </span>
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Pengurus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigasi Lima Menu Utama Diletakkan Dibawah Header */}
      <nav className="bg-emerald-950/90 border-t border-emerald-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider transition whitespace-nowrap border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-400/50 shadow-sm'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-850 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
