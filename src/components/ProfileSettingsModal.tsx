import React, { useState } from 'react';
import { UserAccount, SKPDUnit } from '../types';
import {
  User,
  Mail,
  Shield,
  Building2,
  Lock,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { account, isAppwriteLiveConfigured } from '../services/appwriteClient';

interface ProfileSettingsModalProps {
  currentUser: UserAccount;
  skpds: SKPDUnit[];
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedUser: UserAccount) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  currentUser,
  skpds,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [namaLengkap, setNamaLengkap] = useState(currentUser.namaLengkap);
  const [email, setEmail] = useState(currentUser.email || '');
  const [nip, setNip] = useState(currentUser.nip || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentSKPD = skpds.find((s) => s.id === currentUser.unitKerjaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!namaLengkap.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama lengkap tidak boleh kosong.' });
      return;
    }

    setIsSaving(true);
    try {
      // If connected to live Appwrite, update user name & password if provided
      if (isAppwriteLiveConfigured()) {
        try {
          await account.updateName(namaLengkap.trim());
          if (newPassword && newPassword.length >= 6) {
            // update password in Appwrite
            await account.updatePassword(newPassword);
          }
          await account.updatePrefs({
            role: currentUser.role,
            unitKerjaId: currentUser.unitKerjaId,
            nip: nip.trim(),
          });
        } catch (err: any) {
          console.warn('Appwrite profile sync warning:', err);
        }
      }

      const updatedUser: UserAccount = {
        ...currentUser,
        namaLengkap: namaLengkap.trim(),
        email: email.trim() || undefined,
        nip: nip.trim() || undefined,
      };

      onSaveProfile(updatedUser);
      setStatusMessage({ type: 'success', text: 'Profil akun berhasil diperbarui!' });

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menyimpan perubahan profil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return {
          label: 'Super Administrator',
          badge: 'bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-600 text-purple-800 dark:text-purple-300',
        };
      case 'AUDITOR':
        return {
          label: 'Tim Audit Kearsipan (LKD Dispersip)',
          badge: 'bg-cyan-100 dark:bg-cyan-950/70 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-300',
        };
      default:
        return {
          label: 'Operator SKPD / Kecamatan',
          badge: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300',
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pengaturan Profil Akun Pengguna
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kelola informasi nama, email resmi kedinasan, NIP, dan kata sandi akun Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Role & SKPD Summary Chip */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Peran Hak Akses (Role)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleInfo.badge}`}>
              {roleInfo.label}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
            <span className="text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Unit Penugasan:</span>
            </span>
            <span className="font-semibold text-[11px]">
              {currentSKPD ? currentSKPD.nama : 'Seluruh Wilayah (All Units)'}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap & Gelar *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Kedinasan
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kotabarukab.go.id"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP (Nomor Induk Pegawai)
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19800101 200501 1 001"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Ganti Kata Sandi (Opsional)
              </label>
              <span className="text-[10px] text-slate-500">Kosongkan jika tidak ingin mengubah</span>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata sandi baru (minimal 6 karakter)"
                className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-lg font-semibold shadow transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
