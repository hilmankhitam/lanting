import React, { useState } from 'react';
import { SKPDUnit, UserAccount, PermissionMatrix, UserRole, SKPDCategory } from '../types';
import { PERMISSION_DEFINITIONS } from '../data/defaultRBAC';
import {
  Building2,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Sliders,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  UserX,
  BadgeCheck,
  MapPin,
  Phone,
  Cloud,
  Database,
  RefreshCw,
  ExternalLink,
  Server,
  HardDrive,
} from 'lucide-react';
import { APPWRITE_CONFIG, isAppwriteLiveConfigured, checkAppwriteConnection } from '../services/appwriteClient';
import { seedDefaultDataToAppwrite } from '../services/appwriteDbService';

interface SuperAdminPanelProps {
  skpds: SKPDUnit[];
  users: UserAccount[];
  permissions: PermissionMatrix;
  onSaveSKPDs: (skpds: SKPDUnit[]) => void;
  onSaveUsers: (users: UserAccount[]) => void;
  onSavePermissions: (permissions: PermissionMatrix) => void;
  onResetPermissionsDefault: () => void;
  showToast: (msg: string) => void;
}

type AdminSubTab = 'skpd' | 'users' | 'permissions' | 'appwrite';

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  skpds,
  users,
  permissions,
  onSaveSKPDs,
  onSaveUsers,
  onSavePermissions,
  onResetPermissionsDefault,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('permissions');
  const [appwriteCheckLoading, setAppwriteCheckLoading] = useState(false);
  const [appwriteCheckResult, setAppwriteCheckResult] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);


  // Search & Filter state
  const [skpdSearch, setSkpdSearch] = useState('');
  const [skpdCategoryFilter, setSkpdCategoryFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Modal State for SKPD
  const [isSKPDModalOpen, setIsSKPDModalOpen] = useState(false);
  const [editingSKPD, setEditingSKPD] = useState<SKPDUnit | null>(null);
  const [formSKPDKode, setFormSKPDKode] = useState('');
  const [formSKPDNama, setFormSKPDNama] = useState('');
  const [formSKPDKategori, setFormSKPDKategori] = useState<SKPDCategory>('DINAS');
  const [formSKPDTipe, setFormSKPDTipe] = useState<'Daratan' | 'Kepulauan'>('Daratan');
  const [formSKPDKontak, setFormSKPDKontak] = useState('');
  const [formSKPDAlamat, setFormSKPDAlamat] = useState('');

  // Modal State for User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formNamaLengkap, setFormNamaLengkap] = useState('');
  const [formNIP, setFormNIP] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('OPERATOR');
  const [formUnitKerjaId, setFormUnitKerjaId] = useState<string>('kec-21');
  const [formEmail, setFormEmail] = useState('');

  // ----------------------------------------------------
  // SKPD Actions
  // ----------------------------------------------------
  const openCreateSKPD = () => {
    setEditingSKPD(null);
    setFormSKPDKode('');
    setFormSKPDNama('');
    setFormSKPDKategori('DINAS');
    setFormSKPDTipe('Daratan');
    setFormSKPDKontak('');
    setFormSKPDAlamat('');
    setIsSKPDModalOpen(true);
  };

  const openEditSKPD = (item: SKPDUnit) => {
    setEditingSKPD(item);
    setFormSKPDKode(item.kode);
    setFormSKPDNama(item.nama);
    setFormSKPDKategori(item.kategori);
    setFormSKPDTipe(item.tipe || 'Daratan');
    setFormSKPDKontak(item.kontak || '');
    setFormSKPDAlamat(item.alamat || '');
    setIsSKPDModalOpen(true);
  };

  const handleSaveSKPD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSKPDNama.trim()) return;

    if (editingSKPD) {
      const updated = skpds.map((s) =>
        s.id === editingSKPD.id
          ? {
              ...s,
              kode: formSKPDKode.trim(),
              nama: formSKPDNama.trim(),
              kategori: formSKPDKategori,
              tipe: formSKPDKategori === 'KECAMATAN' ? formSKPDTipe : undefined,
              kontak: formSKPDKontak.trim(),
              kontakOperator: formSKPDKontak.trim(),
              alamat: formSKPDAlamat.trim(),
            }
          : s
      );
      onSaveSKPDs(updated);
      showToast(`SKPD/Kecamatan "${formSKPDNama}" berhasil diperbarui.`);
    } else {
      const newId = `skpd-${Date.now()}`;
      const newSKPD: SKPDUnit = {
        id: newId,
        kode: formSKPDKode.trim() || `SKPD-${Date.now().toString().slice(-4)}`,
        nama: formSKPDNama.trim(),
        kategori: formSKPDKategori,
        tipe: formSKPDKategori === 'KECAMATAN' ? formSKPDTipe : undefined,
        kontak: formSKPDKontak.trim(),
        kontakOperator: formSKPDKontak.trim(),
        alamat: formSKPDAlamat.trim(),
      };
      onSaveSKPDs([...skpds, newSKPD]);
      showToast(`SKPD/Kecamatan "${formSKPDNama}" berhasil ditambahkan.`);
    }
    setIsSKPDModalOpen(false);
  };

  const handleDeleteSKPD = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus SKPD/Kecamatan "${nama}"?`)) {
      onSaveSKPDs(skpds.filter((s) => s.id !== id));
      showToast(`SKPD "${nama}" berhasil dihapus.`);
    }
  };

  // ----------------------------------------------------
  // User Accounts Actions
  // ----------------------------------------------------
  const openCreateUser = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormNamaLengkap('');
    setFormNIP('');
    setFormRole('OPERATOR');
    setFormUnitKerjaId(skpds[0]?.id || 'kec-21');
    setFormEmail('');
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormNamaLengkap(u.namaLengkap);
    setFormNIP(u.nip || '');
    setFormRole(u.role);
    setFormUnitKerjaId(u.unitKerjaId);
    setFormEmail(u.email || '');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formNamaLengkap.trim()) return;

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: formUsername.trim(),
              namaLengkap: formNamaLengkap.trim(),
              nip: formNIP.trim(),
              role: formRole,
              unitKerjaId: formRole === 'OPERATOR' ? formUnitKerjaId : 'ALL',
              email: formEmail.trim(),
            }
          : u
      );
      onSaveUsers(updated);
      showToast(`Akun "${formNamaLengkap}" berhasil diperbarui.`);
    } else {
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        username: formUsername.trim().toLowerCase(),
        namaLengkap: formNamaLengkap.trim(),
        nip: formNIP.trim(),
        role: formRole,
        unitKerjaId: formRole === 'OPERATOR' ? formUnitKerjaId : 'ALL',
        email: formEmail.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      onSaveUsers([...users, newUser]);
      showToast(`Akun baru "${formNamaLengkap}" berhasil dibuat.`);
    }
    setIsUserModalOpen(false);
  };

  const handleToggleUserStatus = (id: string, currentStatus: boolean, nama: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u));
    onSaveUsers(updated);
    showToast(`Status akun "${nama}" diubah ke ${!currentStatus ? 'Aktif' : 'Non-aktif'}.`);
  };

  const handleDeleteUser = (id: string, nama: string) => {
    if (confirm(`Hapus akun pengguna "${nama}"?`)) {
      onSaveUsers(users.filter((u) => u.id !== id));
      showToast(`Akun "${nama}" telah dihapus.`);
    }
  };

  // ----------------------------------------------------
  // Permission Matrix Toggle Action
  // ----------------------------------------------------
  const handleTogglePermission = (role: UserRole, permissionKey: keyof PermissionMatrix['SUPERADMIN']) => {
    const currentVal = permissions[role][permissionKey];
    const updatedMatrix: PermissionMatrix = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [permissionKey]: !currentVal,
      },
    };

    onSavePermissions(updatedMatrix);
    showToast(`Izin "${permissionKey}" untuk role ${role} diubah menjadi ${!currentVal ? 'DIIZINKAN' : 'DILARANG'}.`);
  };

  // Filtered lists
  const filteredSKPDs = skpds.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(skpdSearch.toLowerCase()) ||
      s.kode.toLowerCase().includes(skpdSearch.toLowerCase());
    const matchesCategory = skpdCategoryFilter === 'ALL' || s.kategori === skpdCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.namaLengkap.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.nip && u.nip.includes(userSearch));
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pusat Kendali Super Administrator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola master entitas SKPD/Kecamatan, akun Tim Audit & Operator, serta atur izin akses role menggunakan sakelar toggle.
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('permissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeSubTab === 'permissions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Matriks Izin Role (Toggle)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeSubTab === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akun Pengguna ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('skpd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeSubTab === 'skpd'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Master SKPD & Kecamatan ({skpds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('appwrite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeSubTab === 'appwrite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Integrasi Appwrite Backend</span>
          </button>
        </div>
      </div>


      {/* ============================================================ */}
      {/* TAB 1: MATRIKS IZIN ROLE DENGAN SAKELAR TOGGLE */}
      {/* ============================================================ */}
      {activeSubTab === 'permissions' && (
        <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pengaturan Matriks Hak Akses Peran Pengguna (*Role Permissions Matrix*)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gunakan tombol sakelar toggle untuk langsung mengizinkan (ON) atau membatasi (OFF) kapabilitas setiap role di seluruh aplikasi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan seluruh matriks hak akses ke standar awal sistem?')) {
                  onResetPermissionsDefault();
                  showToast('Hak akses role berhasil di-reset ke pengaturan standar.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pengaturan Standar</span>
            </button>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/2">Nama Fitur & Deskripsi Hak Akses</th>
                  <th className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-600/50 text-purple-700 dark:text-purple-300">
                      Super Admin
                    </span>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-600/50 text-cyan-700 dark:text-cyan-300">
                      Tim Audit (Dispersip)
                    </span>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-300">
                      Operator SKPD / Kec
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {PERMISSION_DEFINITIONS.map((def) => {
                  const superVal = permissions.SUPERADMIN[def.key];
                  const auditorVal = permissions.AUDITOR[def.key];
                  const operatorVal = permissions.OPERATOR[def.key];

                  return (
                    <tr key={def.key} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{def.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{def.deskripsi}</div>
                      </td>

                      {/* Super Admin Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission('SUPERADMIN', def.key)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            superVal ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={`Klik untuk ${superVal ? 'menonaktifkan' : 'mengaktifkan'} pada Super Admin`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              superVal ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-mono mt-0.5 text-slate-500">
                          {superVal ? 'Aktif' : 'Terkunci'}
                        </div>
                      </td>

                      {/* Tim Audit Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission('AUDITOR', def.key)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            auditorVal ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={`Klik untuk ${auditorVal ? 'menonaktifkan' : 'mengaktifkan'} pada Tim Audit`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              auditorVal ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-mono mt-0.5 text-slate-500">
                          {auditorVal ? 'Aktif' : 'Terkunci'}
                        </div>
                      </td>

                      {/* Operator Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission('OPERATOR', def.key)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            operatorVal ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={`Klik untuk ${operatorVal ? 'menonaktifkan' : 'mengaktifkan'} pada Operator`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              operatorVal ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-mono mt-0.5 text-slate-500">
                          {operatorVal ? 'Aktif' : 'Terkunci'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MANAJEMEN AKUN PENGGUNA (TIM AUDIT & OPERATOR) */}
      {/* ============================================================ */}
      {activeSubTab === 'users' && (
        <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Daftar Akun Pengguna Tim Audit & Operator Kecamatan/SKPD</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola akun otentikasi, peranan sistem, serta unit penugasan SKPD/Kecamatan.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateUser}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Pengguna</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama pengguna, NIP, atau username..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Peran (Role)</option>
              <option value="SUPERADMIN">Super Administrator</option>
              <option value="AUDITOR">Tim Audit Dispersip</option>
              <option value="OPERATOR">Operator SKPD / Kecamatan</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Lengkap / NIP</th>
                  <th className="py-2.5 px-3">Username & Email</th>
                  <th className="py-2.5 px-3">Peran (Role)</th>
                  <th className="py-2.5 px-3">Unit Penugasan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const assignedSKPD = skpds.find((s) => s.id === u.unitKerjaId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{u.namaLengkap}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {u.nip ? `NIP: ${u.nip}` : 'Non-PNS / Staf Ahli'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">@{u.username}</div>
                        <div className="text-[11px] text-slate-500">{u.email || '-'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-600 text-purple-800 dark:text-purple-300'
                              : u.role === 'AUDITOR'
                              ? 'bg-cyan-100 dark:bg-cyan-950/70 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {u.unitKerjaId === 'ALL' ? (
                          <span className="text-slate-500 italic">Seluruh SKPD & 22 Kecamatan</span>
                        ) : (
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {assignedSKPD?.nama || u.unitKerjaId}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id, u.isActive, u.namaLengkap)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                            u.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          {u.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditUser(u)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Akun"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== 'user-superadmin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.namaLengkap)}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MANAJEMEN MASTER SKPD & 22 KECAMATAN */}
      {/* ============================================================ */}
      {activeSubTab === 'skpd' && (
        <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Master Data SKPD / OPD & 22 Kecamatan Kabupaten Kotabaru</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Super Administrator dapat menambah entitas dinas, badan, atau kecamatan baru sebagai objek audit kearsipan.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateSKPD}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah SKPD / Kecamatan Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={skpdSearch}
                onChange={(e) => setSkpdSearch(e.target.value)}
                placeholder="Cari nama instansi atau kode SKPD/Kecamatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={skpdCategoryFilter}
              onChange={(e) => setSkpdCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="KECAMATAN">Kecamatan (22)</option>
              <option value="DINAS">Dinas Teknis</option>
              <option value="BADAN">Badan Daerah</option>
              <option value="SETDA">Sekretariat Daerah</option>
            </select>
          </div>

          {/* SKPD Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSKPDs.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                        {item.kode}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.kategori}
                      </span>
                      {item.tipe && (
                        <span className="text-[10px] font-medium text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 px-1.5 py-0.5 rounded">
                          {item.tipe}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug">
                      {item.nama}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditSKPD(item)}
                      className="p-1 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit SKPD"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSKPD(item.id, item.nama)}
                      className="p-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Hapus SKPD"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {item.alamat && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.alamat}</span>
                    </div>
                  )}
                  {item.kontak && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.kontak}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: INTEGRASI BACKEND APPWRITE (AUTH, DB, STORAGE) */}
      {/* ============================================================ */}
      {activeSubTab === 'appwrite' && (
        <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pusat Kendali Integrasi Backend Appwrite</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi backend Appwrite untuk Autentikasi Pengguna, Database Master SKPD & Soal, serta Object Storage Bukti Dukung Fisik Kearsipan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setAppwriteCheckLoading(true);
                  const res = await checkAppwriteConnection();
                  setAppwriteCheckResult(res.message);
                  setAppwriteCheckLoading(false);
                  showToast(res.message);
                }}
                disabled={appwriteCheckLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${appwriteCheckLoading ? 'animate-spin' : ''}`} />
                <span>Uji Koneksi Server</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Mulai proses inisialisasi / seed seluruh data master (22 Kecamatan Kotabaru, Akun Standar, dan Matriks Izin) ke database Appwrite?')) {
                    setIsSeeding(true);
                    const res = await seedDefaultDataToAppwrite();
                    setIsSeeding(false);
                    showToast(res.message);
                  }
                }}
                disabled={isSeeding}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Menginisialisasi...' : 'Seed Data Master ke Appwrite'}</span>
              </button>
            </div>
          </div>

          {/* Connection Result Banner */}
          {appwriteCheckResult && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{appwriteCheckResult}</span>
            </div>
          )}

          {/* Config Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Server className="w-3.5 h-3.5 text-cyan-600" />
                <span>Appwrite Endpoint</span>
              </div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate" title={APPWRITE_CONFIG.endpoint}>
                {APPWRITE_CONFIG.endpoint}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Cloud className="w-3.5 h-3.5 text-purple-600" />
                <span>Project ID</span>
              </div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                {APPWRITE_CONFIG.projectId}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database ID</span>
              </div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                {APPWRITE_CONFIG.databaseId}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>Storage Bucket</span>
              </div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                {APPWRITE_CONFIG.bucketEvidence}
              </div>
            </div>
          </div>

          {/* Guide Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Langkah Menghubungkan ke Appwrite Cloud / Self-Hosted:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>Buka file <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">.env</code> di direktori proyek.</li>
              <li>Masukkan Project ID Anda pada <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">VITE_APPWRITE_PROJECT_ID</code>.</li>
              <li>Pastikan Database dengan ID <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">{APPWRITE_CONFIG.databaseId}</code> dan Storage Bucket <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">{APPWRITE_CONFIG.bucketEvidence}</code> telah dibuat di konsol Appwrite.</li>
              <li>Klik tombol <strong>"Seed Data Master ke Appwrite"</strong> di atas untuk mempopulasi otomatis 22 Kecamatan Kotabaru dan instrumen standar ke database Anda.</li>
            </ol>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* MODAL 1: FORM TAMBAH / EDIT SKPD */}
      {/* ============================================================ */}
      {isSKPDModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{editingSKPD ? 'Edit Entitas SKPD / Kecamatan' : 'Tambah SKPD / Kecamatan Baru'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsSKPDModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSKPD} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Instansi / Unit Kerja *</label>
                <input
                  type="text"
                  required
                  value={formSKPDNama}
                  onChange={(e) => setFormSKPDNama(e.target.value)}
                  placeholder="Contoh: Dinas Lingkungan Hidup / Kecamatan Pulau Laut Sigam"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Instansi</label>
                  <input
                    type="text"
                    value={formSKPDKode}
                    onChange={(e) => setFormSKPDKode(e.target.value)}
                    placeholder="misal: 63.02.21 atau 2.17.01"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Entitas</label>
                  <select
                    value={formSKPDKategori}
                    onChange={(e) => setFormSKPDKategori(e.target.value as SKPDCategory)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="KECAMATAN">Kecamatan</option>
                    <option value="DINAS">Dinas Daerah</option>
                    <option value="BADAN">Badan Daerah</option>
                    <option value="SETDA">Sekretariat Daerah</option>
                    <option value="SETWAN">Sekretariat DPRD (Setwan)</option>
                    <option value="INSPEKTORAT">Inspektorat Daerah</option>
                    <option value="RUMAH_SAKIT">Rumah Sakit (RSUD)</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>

              {formSKPDKategori === 'KECAMATAN' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Wilayah Geografis</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tipeWilayah"
                        checked={formSKPDTipe === 'Daratan'}
                        onChange={() => setFormSKPDTipe('Daratan')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Daratan (Pulau Laut / Daratan Kalimantan)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tipeWilayah"
                        checked={formSKPDTipe === 'Kepulauan'}
                        onChange={() => setFormSKPDTipe('Kepulauan')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Kepulauan Terluar (Pulau Sembilan, Sebuku, dll)</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kontak / Telepon</label>
                  <input
                    type="text"
                    value={formSKPDKontak}
                    onChange={(e) => setFormSKPDKontak(e.target.value)}
                    placeholder="misal: 0812-xxxx-xxxx"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor</label>
                  <input
                    type="text"
                    value={formSKPDAlamat}
                    onChange={(e) => setFormSKPDAlamat(e.target.value)}
                    placeholder="misal: Jl. Hasan Basri, Kotabaru"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSKPDModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition"
                >
                  Simpan SKPD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: FORM TAMBAH / EDIT USER ACCOUNT */}
      {/* ============================================================ */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formNamaLengkap}
                  onChange={(e) => setFormNamaLengkap(e.target.value)}
                  placeholder="Contoh: Budi Hartono, S.STP"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="misal: op_sigam"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={formNIP}
                    onChange={(e) => setFormNIP(e.target.value)}
                    placeholder="19890522 201101 1 002"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Peran (Role) *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="OPERATOR">Operator SKPD / Kecamatan</option>
                    <option value="AUDITOR">Tim Audit Dispersip</option>
                    <option value="SUPERADMIN">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Pemberitahuan</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="op@kotabarukab.go.id"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {formRole === 'OPERATOR' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Penugasan (SKPD / Kecamatan) *</label>
                  <select
                    value={formUnitKerjaId}
                    onChange={(e) => setFormUnitKerjaId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {skpds.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.kategori}: {s.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
