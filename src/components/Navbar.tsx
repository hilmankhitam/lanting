import React, { useState, useRef, useEffect } from 'react';
import { UserAccount } from '../types';
import {
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Landmark,
  UserCog,
} from 'lucide-react';

export type ActiveTab = 'audit-form' | 'rekap-kecamatan' | 'admin-builder' | 'superadmin' | 'panduan';

interface NavbarProps {
  currentUser: UserAccount;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout?: () => void;
  onOpenProfileSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  onOpenProfileSettings,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'US'
    );
  };

  const userRole = currentUser.role;

  return (
    <header className="gov-header sticky top-0 z-40">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-3">
          {/* Logo & Official Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 shadow-sm">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  ASKI <span className="text-emerald-600 dark:text-emerald-400">KOTABARU</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded hidden sm:inline-block">
                  ANRI PERKA NO. 6/2019
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Audit Sistem Kearsipan Internal • Dinas Perpustakaan dan Kearsipan Kab. Kotabaru
              </p>
            </div>
          </div>

          {/* Right: User Profile, Theme Toggle, Logout */}
          <div className="flex items-center gap-2">
            {/* User Profile Bar & Popover Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs transition group focus:outline-none"
                title="Buka Menu Profil & Pengaturan Akun"
              >
                {/* Initials Avatar */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm shrink-0 ${
                    userRole === 'SUPERADMIN'
                      ? 'bg-purple-600'
                      : userRole === 'AUDITOR'
                      ? 'bg-cyan-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {getInitials(currentUser.namaLengkap)}
                </div>

                <div className="text-left hidden sm:block max-w-[130px] lg:max-w-[170px] truncate">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-[11px] leading-tight">
                    {currentUser.namaLengkap}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {userRole === 'SUPERADMIN' ? 'Super Admin' : userRole === 'AUDITOR' ? 'Tim Audit' : 'Operator Kec'}
                  </div>
                </div>

                <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Popover Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2.5 text-xs animate-fadeIn space-y-2">
                  {/* User Details Header */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                          userRole === 'SUPERADMIN'
                            ? 'bg-purple-600'
                            : userRole === 'AUDITOR'
                            ? 'bg-cyan-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {getInitials(currentUser.namaLengkap)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                          {currentUser.namaLengkap}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email || `@${currentUser.username}`}
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">Peran:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          userRole === 'SUPERADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : userRole === 'AUDITOR'
                            ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>

                    {currentUser.nip && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">NIP:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser.nip}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenProfileSettings) onOpenProfileSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-left text-xs font-semibold"
                    >
                      <UserCog className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Pengaturan Profil Akun</span>
                    </button>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition text-left text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Keluar (Logout)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
              className="p-2 text-slate-700 dark:text-amber-400 hover:text-emerald-600 dark:hover:text-amber-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-md transition flex items-center justify-center"
              aria-label="Toggle Light and Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Logout / Keluar Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar ke Halaman Login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 rounded-md text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
