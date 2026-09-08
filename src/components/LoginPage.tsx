import React, { useState } from 'react';
import { UserAccount, UserRole, SKPDUnit } from '../types';
import { loginWithAppwrite, registerWithAppwrite } from '../services/appwriteAuthService';
import { APPWRITE_CONFIG, isAppwriteLiveConfigured } from '../services/appwriteClient';
import { DEFAULT_USER_ACCOUNTS, DEFAULT_SKPD_LIST } from '../data/defaultRBAC';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  ArrowRight,
  FileCheck2,
  Layers,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  skpds?: SKPDUnit[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  skpds = DEFAULT_SKPD_LIST,
  theme,
  onToggleTheme,
}) => {
  const [activeMode, setActiveMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form State
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regNamaLengkap, setRegNamaLengkap] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('OPERATOR');
  const [regUnitKerjaId, setRegUnitKerjaId] = useState('kec-21'); // Pulau Laut Sigam
  const [regPassword, setRegPassword] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLive = isAppwriteLiveConfigured();

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrUsername.trim() || !password) {
      setErrorMessage('Harap isi email / username dan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithAppwrite(emailOrUsername.trim(), password);
      if (res.success && res.user) {
        setSuccessMessage(`Selamat datang kembali, ${res.user.namaLengkap}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 600);
      } else {
        setErrorMessage(res.error || 'Login gagal. Periksa kembali email dan kata sandi.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan pada sistem autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regNamaLengkap.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Harap lengkapi semua kolom yang wajib diisi.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithAppwrite(
        regEmail.trim(),
        regPassword,
        regNamaLengkap.trim(),
        regRole,
        regUnitKerjaId,
        regNip.trim()
      );

      if (res.success && res.user) {
        setSuccessMessage(`Pendaftaran berhasil! Mengalihkan ke dashboard ASKI...`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 800);
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mendaftarkan akun baru.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Account Switcher
  const handleQuickLogin = (accountType: 'SUPERADMIN' | 'AUDITOR' | 'OPERATOR') => {
    let target = DEFAULT_USER_ACCOUNTS[0]; // Superadmin
    if (accountType === 'AUDITOR') {
      target = DEFAULT_USER_ACCOUNTS[1];
    } else if (accountType === 'OPERATOR') {
      target = DEFAULT_USER_ACCOUNTS[3]; // Sigam
    }

    setSuccessMessage(`Login cepat sebagai ${target.namaLengkap} (${target.role})...`);
    setTimeout(() => {
      onLoginSuccess(target);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Brand & Theme Toggle */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-950/40 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-white">ASKI KOTABARU</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                ANRI NO. 6/2019
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dinas Perpustakaan dan Kearsipan Kabupaten Kotabaru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Appwrite Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              isLive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Cloud className="w-3.5 h-3.5" />
            <span>
              {isLive
                ? `Appwrite Cloud: ${APPWRITE_CONFIG.projectId}`
                : 'Appwrite: Mode Demo / Lokal'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-200" />}
          </button>
        </div>
      </header>

      {/* Main Login Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Left Hero Column: Institutional Info & Scope */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Audit Kearsipan Resmi</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Sistem Audit Kearsipan Internal 22 Kecamatan
              </h1>

              <p className="text-xs text-slate-400 leading-relaxed">
                Aplikasi pengawasan kearsipan terpadu untuk mengevaluasi penciptaan, penggunaan,
                pemeliharaan, dan penyusutan arsip pada Unit Pengolah (UP) dan Unit Kearsipan (UK)
                di seluruh wilayah Kabupaten Kotabaru.
              </p>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kalkulasi Skor Bertingkat Otomatis (Level 0 - 5)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Conditional Logic Engine & Branching Dinamis</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Penyimpanan Bukti Dukung di Appwrite Storage</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Rekapitulasi Nilai & Ekspor LHKK Resmi (PDF & Excel)</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Akses Cepat Pengujian (1-Klik)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Demo Mode</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('SUPERADMIN')}
                  className="flex items-center justify-between px-3 py-2 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-600/40 hover:border-purple-500 rounded-lg text-left transition group text-xs"
                >
                  <div>
                    <div className="font-bold text-purple-200 group-hover:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Super Administrator
                    </div>
                    <div className="text-[10px] text-purple-400">Drs. H. M. Zulkifli, M.AP</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('AUDITOR')}
                  className="flex items-center justify-between px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-600/40 hover:border-cyan-500 rounded-lg text-left transition group text-xs"
                >
                  <div>
                    <div className="font-bold text-cyan-200 group-hover:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Tim Audit (LKD Dispersip)
                    </div>
                    <div className="text-[10px] text-cyan-400">Hj. Noor Asiah, S.Sos</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('OPERATOR')}
                  className="flex items-center justify-between px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 hover:border-emerald-500 rounded-lg text-left transition group text-xs"
                >
                  <div>
                    <div className="font-bold text-emerald-200 group-hover:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Operator SKPD / Kecamatan
                    </div>
                    <div className="text-[10px] text-emerald-400">Budi Hartono (Kec. Pulau Laut Sigam)</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login / Register Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Mode Switch Tabs */}
            <div className="flex items-center border-b border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition ${
                  activeMode === 'LOGIN'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun ASKI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('REGISTER');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition ${
                  activeMode === 'REGISTER'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Operator Baru</span>
              </button>
            </div>

            {/* Alert Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-600/50 rounded-lg text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM 1: LOGIN */}
            {activeMode === 'LOGIN' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Resmi atau Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="admin.aski@kotabarukab.go.id atau superadmin"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
                    <span className="text-[11px] text-slate-500">Minimal 6 karakter</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ingat sesi login saya</span>
                  </label>
                  <span className="text-emerald-400/80 text-[11px] cursor-help" title="Hubungi Super Admin jika lupa sandi">
                    Lupa kata sandi?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Dashboard ASKI</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM 2: REGISTER OPERATOR */
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={regNamaLengkap}
                      onChange={(e) => setRegNamaLengkap(e.target.value)}
                      placeholder="Contoh: Budi Prasetyo, S.STP"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Kedinasan *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="operator@kotabarukab.go.id"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NIP (Nomor Induk Pegawai)
                    </label>
                    <input
                      type="text"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      placeholder="19890522 201101 1 002"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Instansi / Kecamatan Penugasan *
                    </label>
                    <select
                      value={regUnitKerjaId}
                      onChange={(e) => setRegUnitKerjaId(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {skpds.map((skpd) => (
                        <option key={skpd.id} value={skpd.id}>
                          {skpd.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Peran Pengguna *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="OPERATOR">Operator SKPD / Kecamatan</option>
                      <option value="AUDITOR">Tim Audit Kearsipan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi Akun Baru *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar & Masuk ke Sistem</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Notice */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                Hak Cipta &copy; 2025 Pemerintah Kabupaten Kotabaru. Dilindungi Perka ANRI No. 6 Tahun 2019.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info Strip */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-800/60 text-center text-xs text-slate-500 bg-slate-950/80 backdrop-blur-sm">
        Sistem Informasi Kearsipan Internal 22 Kecamatan Kotabaru didukung oleh Appwrite Cloud Backend & TanStack Suite.
      </footer>
    </div>
  );
};
