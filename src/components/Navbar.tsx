import React, { useState, useRef, useEffect } from 'react';
import { SKPDUnit, UserAccount, PermissionMatrix, UserRole } from '../types';
import {
  Archive,
  BookOpen,
  Calendar,
  ChevronDown,
  FileBarChart,
  Layers,
  MapPin,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sun,
  Moon,
  UserCheck,
  Building2,
  LogOut,
  Cloud,
  Landmark,
  User,
  UserCog,
  SlidersHorizontal,
} from 'lucide-react';
import { isAppwriteLiveConfigured, APPWRITE_CONFIG } from '../services/appwriteClient';

export type ActiveTab = 'audit-form' | 'rekap-kecamatan' | 'admin-builder' | 'superadmin' | 'panduan';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedKecamatanId: string;
  setSelectedKecamatanId: (id: string) => void;
  selectedUnit: 'UP' | 'UK';
  setSelectedUnit: (unit: 'UP' | 'UK') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  currentUser: UserAccount;
  skpds: SKPDUnit[];
  permissions: PermissionMatrix;
  onResetDefaults: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout?: () => void;
  onOpenProfileSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedKecamatanId,
  setSelectedKecamatanId,
  selectedUnit,
  setSelectedUnit,
  selectedYear,
  setSelectedYear,
  currentUser,
  skpds,
  permissions,
  onResetDefaults,
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

  const currentSKPD = skpds.find((k) => k.id === selectedKecamatanId) || skpds[0];
  const userRole = currentUser.role;
  const rolePerms = permissions[userRole] || permissions.OPERATOR;

  // Visibility flags based on dynamic permission toggles
  const canSeeRekap = rolePerms.canViewAllRekap;
  const canSeeBuilder = rolePerms.canManageInstruments;
  const canSeeSuperAdmin =
    rolePerms.canManageSKPD || rolePerms.canManageUsers || rolePerms.canConfigurePermissions;

  return (
    <header className="gov-header sticky top-0 z-40">
      {/* Top Banner: Official Identity & Context */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-3 border-b border-slate-200 dark:border-slate-800/80">
          {/* Logo & Official Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  ASKI <span className="text-emerald-600 dark:text-emerald-400">KOTABARU</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded">
                  ANRI PERKA NO. 6/2019
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Audit Sistem Kearsipan Internal • Dinas Perpustakaan dan Kearsipan Kab. Kotabaru
              </p>
            </div>
          </div>

          {/* Audit Selectors Bar: SKPD, Unit, Tahun, User Profile Switcher & Theme */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Audit Context Chip */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 rounded-lg text-xs shadow-xs"
              title="Objek Audit Aktif"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="font-bold text-slate-800 dark:text-slate-100 max-w-[120px] sm:max-w-[190px] truncate">
                  {currentSKPD?.nama}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                  {selectedUnit}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">
                  {selectedYear}
                </span>
              </div>
            </div>

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


            {/* Appwrite Connection Badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
                isAppwriteLiveConfigured()
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300'
              }`}
              title={
                isAppwriteLiveConfigured()
                  ? `Terhubung ke Appwrite (${APPWRITE_CONFIG.projectId})`
                  : 'Mode Demo / Penyimpanan Lokal Aktif (Lihat .env untuk menghubungkan ke Appwrite Cloud)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAppwriteLiveConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <Cloud className="w-3 h-3" />
              <span className="text-[10px]">
                {isAppwriteLiveConfigured() ? 'Appwrite Live' : 'Demo Local'}
              </span>
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


        {/* Tab Navigation Strip (Role-aware & Dynamic Permission checks) */}
        <div className="flex items-center space-x-1 pt-1 overflow-x-auto text-xs">
          {/* TAB 1: FORMULIR AUDIT */}
          <button
            type="button"
            onClick={() => setActiveTab('audit-form')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition border-b-2 shrink-0 ${
              activeTab === 'audit-form'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Formulir Pengawasan ({selectedUnit} - {currentSKPD?.nama})</span>
          </button>

          {/* TAB 2: REKAPITULASI (Only visible if canViewAllRekap) */}
          {canSeeRekap && (
            <button
              type="button"
              onClick={() => setActiveTab('rekap-kecamatan')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition border-b-2 shrink-0 ${
                activeTab === 'rekap-kecamatan'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileBarChart className="w-4 h-4" />
              <span>Rekapitulasi 22 Kecamatan & SKPD</span>
            </button>
          )}

          {/* TAB 3: PEMBUAT INSTRUMEN & LOGIC (Only visible if canManageInstruments) */}
          {canSeeBuilder && (
            <button
              type="button"
              onClick={() => setActiveTab('admin-builder')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition border-b-2 shrink-0 ${
                activeTab === 'admin-builder'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Manajemen Soal & Logic (Tim Audit)</span>
            </button>
          )}

          {/* TAB 4: SUPER ADMIN PANEL (Only visible if canManageSKPD or canManageUsers or canConfigurePermissions) */}
          {canSeeSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('superadmin')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition border-b-2 shrink-0 ${
                activeTab === 'superadmin'
                  ? 'border-purple-600 text-purple-700 bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:bg-purple-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Super Admin (SKPD, Akun & Toggle Izin)</span>
            </button>
          )}

          {/* TAB 5: PEDOMAN & SKKAAD (Always accessible) */}
          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold transition border-b-2 shrink-0 ${
              activeTab === 'panduan'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Pedoman Pengawasan & SKKAAD</span>
          </button>
        </div>
      </div>

    </header>
  );
};

