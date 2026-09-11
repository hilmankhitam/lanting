import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AuditQuestion, AuditCategory, SKPDUnit, UserAccount, PermissionMatrix } from '../types';
import { EvaluatedAnswersResult } from '../services/logicEngine';
import { ActiveTab } from './Navbar';
import {
  Building2,
  Layers,
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
  EyeOff,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  FileSpreadsheet,
  FileBarChart,
  Cloud,
  CloudOff,
  ShieldAlert,
  BookOpen,
  Settings,
  Sliders,
  Users,
  MapPin,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
} from 'lucide-react';
import { isAppwriteLiveConfigured } from '../services/appwriteClient';
import { PREDIKAT_LIST } from '../data/defaultInstruments';
import { ObjekAuditPicker } from './ObjekAuditPicker';

interface AuditSidebarProps {
  // Tab navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  permissions: PermissionMatrix;

  // Context selectors
  selectedKecamatanId: string;
  setSelectedKecamatanId: (id: string) => void;
  selectedUnit: 'UP' | 'UK';
  setSelectedUnit: (unit: 'UP' | 'UK') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  currentUser: UserAccount;
  skpds: SKPDUnit[];

  // Audit data
  activeCategories: AuditCategory[];
  activeQuestions: AuditQuestion[];
  evalResult: EvaluatedAnswersResult;
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;

  // Session status
  sessionStatus: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'FINAL';

  // Actions
  onSaveDraft: () => void;
  onSubmitAudit: () => void;
  onExportExcel: () => void;
  canExport: boolean;
  userRole: string;
}

export const AuditSidebar: React.FC<AuditSidebarProps> = ({
  activeTab,
  setActiveTab,
  permissions,
  selectedKecamatanId,
  setSelectedKecamatanId,
  selectedUnit,
  setSelectedUnit,
  selectedYear,
  setSelectedYear,
  currentUser,
  skpds,
  activeCategories,
  activeQuestions,
  evalResult,
  activeCategoryId,
  onSelectCategory,
  sessionStatus,
  onSaveDraft,
  onSubmitAudit,
  onExportExcel,
  canExport,
  userRole,
}) => {
  const currentSKPD = useMemo(() => {
    return skpds.find((s) => s.id === selectedKecamatanId) || skpds[0];
  }, [skpds, selectedKecamatanId]);

  const isOperatorRestricted = currentUser.role === 'OPERATOR' && currentUser.unitKerjaId !== 'ALL';
  const predikatInfo = PREDIKAT_LIST[evalResult.predikat] || PREDIKAT_LIST['D'];

  // Permission-based tab visibility
  const rolePerms = permissions[currentUser.role] || permissions.OPERATOR;
  const canSeeRekap = rolePerms.canViewAllRekap;
  const canSeeBuilder = rolePerms.canManageInstruments;
  const canSeeSuperAdmin =
    rolePerms.canManageSKPD || rolePerms.canManageUsers || rolePerms.canConfigurePermissions;

  const isAuditFormActive = activeTab === 'audit-form';
  const isLive = isAppwriteLiveConfigured();

  // Sidebar Width & Collapsed States (Persisted in localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('aski_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : 288;
    return isNaN(parsed) ? 288 : Math.max(210, Math.min(parsed, 480));
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('aski_sidebar_collapsed') === 'true';
  });

  const [isResizing, setIsResizing] = useState(false);

  // Resize drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Clamped width: 210px to 480px
      const newWidth = Math.max(210, Math.min(e.clientX, 480));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('aski_sidebar_width', String(sidebarWidth));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('aski_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleResetWidth = () => {
    setSidebarWidth(288);
    localStorage.setItem('aski_sidebar_width', '288');
  };

  // Navigation Items
  const navItems = useMemo(() => {
    const items: Array<{
      id: ActiveTab;
      label: string;
      badge?: string;
      badgeColor?: string;
      icon: React.ComponentType<{ className?: string }>;
      visible: boolean;
      theme: 'emerald' | 'cyan' | 'purple' | 'amber';
    }> = [
      {
        id: 'audit-form',
        label: 'Formulir Audit',
        badge: isAuditFormActive ? `${evalResult.percentageScore}` : undefined,
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        icon: Layers,
        visible: true,
        theme: 'emerald',
      },
      {
        id: 'rekap-kecamatan',
        label: 'Rekapitulasi 22 Kec',
        badge: '22 KEC',
        badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
        icon: FileBarChart,
        visible: canSeeRekap,
        theme: 'cyan',
      },
      {
        id: 'admin-builder',
        label: 'Manajemen Instrumen',
        badge: 'LOGIC',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: Settings,
        visible: canSeeBuilder,
        theme: 'emerald',
      },
      {
        id: 'superadmin',
        label: 'Super Admin',
        badge: 'SUPER',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        icon: ShieldAlert,
        visible: canSeeSuperAdmin,
        theme: 'purple',
      },
      {
        id: 'panduan',
        label: 'Pedoman & SKKAAD',
        icon: BookOpen,
        visible: true,
        theme: 'emerald',
      },
    ];
    return items.filter((t) => t.visible);
  }, [canSeeRekap, canSeeBuilder, canSeeSuperAdmin, isAuditFormActive, evalResult.percentageScore]);

  // Compute per-category stats
  const categoryStats = useMemo(() => {
    return activeCategories.map((cat) => {
      const catQuestions = activeQuestions.filter((q) => q.kategoriId === cat.id);
      let answered = 0;
      let needsEvidence = 0;
      let disabled = 0;

      catQuestions.forEach((q) => {
        const ans = evalResult.evaluatedAnswers[q.id];
        if (ans?.isDisabled) {
          disabled++;
        } else if (ans?.selectedOptionId) {
          answered++;
          if ((ans.level || 0) >= 2 && (!ans.evidenceList || ans.evidenceList.length === 0)) {
            needsEvidence++;
          }
        }
      });

      const effectiveTotal = catQuestions.length - disabled;
      const progress = effectiveTotal > 0 ? Math.round((answered / effectiveTotal) * 100) : 0;

      return {
        category: cat,
        total: catQuestions.length,
        answered,
        needsEvidence,
        disabled,
        unanswered: catQuestions.length - answered - disabled,
        progress,
        isComplete: effectiveTotal > 0 && answered === effectiveTotal,
      };
    });
  }, [activeCategories, activeQuestions, evalResult.evaluatedAnswers]);

  // COLLAPSED MINI-RAIL VIEW
  if (isCollapsed) {
    return (
      <aside className="w-16 shrink-0 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 h-[calc(100vh-3rem)] sticky top-12 flex flex-col justify-between items-center py-3 select-none shadow-xs z-30 transition-all duration-150 relative">
        {/* Top: Expand button + Nav Icons */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            type="button"
            onClick={toggleCollapse}
            title="Perluas Sidebar (Memberi akses panel penuh)"
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
          >
            <PanelLeftOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-1.5 w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={`${item.label} ${item.badge ? `(${item.badge})` : ''}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group cursor-pointer ${
                    isActive
                      ? item.theme === 'purple'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : item.theme === 'cyan'
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isActive && (
                    <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-3.5 bg-emerald-500 rounded-l-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* If Formulir Audit active, show quick score circle */}
          {isAuditFormActive && (
            <div className="pt-2 flex flex-col items-center gap-2">
              <div
                title={`Nilai Evaluasi: ${evalResult.percentageScore}/100 (${evalResult.predikat})`}
                className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono cursor-default shadow-2xs ${predikatInfo.bgWarna}`}
              >
                <span className={`text-[10px] font-black leading-none ${predikatInfo.warna}`}>
                  {evalResult.predikat}
                </span>
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  {evalResult.percentageScore}
                </span>
              </div>

              <button
                type="button"
                onClick={onSaveDraft}
                title="Simpan Draf Formulir"
                className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Status */}
        <div className="flex flex-col items-center gap-2.5 w-full pb-1">
          <div
            title={isLive ? 'Appwrite Cloud Sync Aktif' : 'Mode Penyimpanan Lokal'}
            className="flex items-center justify-center"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>

          <div
            title={`Peran: ${currentUser.role}`}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black font-mono text-slate-700 dark:text-slate-300 uppercase"
          >
            {currentUser.role.slice(0, 2)}
          </div>
        </div>

        {/* Splitter handle for dragging even from collapsed state */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleResetWidth}
          title="Tarik untuk membuka sidebar (Klik 2x untuk reset 288px)"
          className="absolute top-0 right-0 bottom-0 w-2 -mr-1 cursor-col-resize z-40 flex items-center justify-center hover:bg-emerald-500/20 active:bg-emerald-600/30 transition-colors group"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="shrink-0 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 h-[calc(100vh-3rem)] sticky top-12 overflow-y-auto flex flex-col justify-between select-none shadow-xs relative"
    >
      {/* TIER 1: Primary System Navigation */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigasi Utama
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ASKI v2.4
            </span>
            <button
              type="button"
              onClick={toggleCollapse}
              title="Ciutkan Sidebar (Memberi ruang lebih leluasa untuk menjawab soal)"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Menu Navigasi Utama">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? item.theme === 'purple'
                      ? 'bg-purple-50 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 shadow-xs ring-1 ring-purple-500/20'
                      : item.theme === 'cyan'
                      ? 'bg-cyan-50 text-cyan-950 dark:bg-cyan-950/40 dark:text-cyan-200 shadow-xs ring-1 ring-cyan-500/20'
                      : 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? item.theme === 'purple'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : item.theme === 'cyan'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate tracking-tight">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.theme === 'purple'
                          ? 'bg-purple-600 dark:bg-purple-400'
                          : item.theme === 'cyan'
                          ? 'bg-cyan-600 dark:bg-cyan-400'
                          : 'bg-emerald-600 dark:bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TIER 2: Contextual Middle Workspace (Flows Naturally Downward) */}
      <div className="flex-1 px-3 py-2.5 space-y-3">
        {/* CASE A: FORMULIR PENGAWASAN ACTIVE */}
        {isAuditFormActive && (
          <>
            {/* Audit Context Filter Card */}
            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Objek Audit
                </span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  51 Entitas
                </span>
              </div>

              {/* Objek Audit Custom Interactive Picker */}
              <ObjekAuditPicker
                skpds={skpds}
                selectedKecamatanId={selectedKecamatanId}
                onSelectSKPD={setSelectedKecamatanId}
                disabled={isOperatorRestricted}
              />

              {/* UP / UK Segmented Control + Year */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* Unit Segment */}
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1 block">
                    Unit Audit
                  </label>
                  <div className="flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setSelectedUnit('UP')}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                        selectedUnit === 'UP'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      UP (60%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUnit('UK')}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                        selectedUnit === 'UK'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      UK (40%)
                    </button>
                  </div>
                </div>

                {/* Year Select */}
                <div>
                  <label htmlFor="audit-year-select" className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1 block">
                    Tahun Audit
                  </label>
                  <div className="relative">
                    <select
                      id="audit-year-select"
                      aria-label="Pilih Tahun Pengawasan"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full pl-2.5 pr-6 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none shadow-2xs"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Aspek Pengawasan Section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Aspek Pengawasan
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {categoryStats.filter((c) => c.isComplete).length}/{categoryStats.length} Selesai
                </span>
              </div>

              <div className="space-y-1.5">
                {categoryStats.map((stat) => {
                  const isActive = activeCategoryId === stat.category.id;

                  return (
                    <button
                      key={stat.category.id}
                      type="button"
                      onClick={() => onSelectCategory(stat.category.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 border group ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 border-emerald-500/80 dark:border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/20'
                          : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition-colors ${
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                            }`}
                          >
                            {stat.category.kode}
                          </span>
                          <span
                            className={`text-xs font-bold truncate ${
                              isActive
                                ? 'text-emerald-950 dark:text-emerald-300'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}
                          >
                            {stat.category.nama}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                          {stat.category.bobotPersentase}%
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            stat.isComplete ? 'bg-emerald-500' : 'bg-emerald-400 dark:bg-emerald-500'
                          }`}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>

                      {/* Detail Metrics Row */}
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{stat.answered}</span>
                        </span>
                        {stat.unanswered > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                            <Circle className="w-3 h-3" />
                            <span>{stat.unanswered}</span>
                          </span>
                        )}
                        {stat.needsEvidence > 0 && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{stat.needsEvidence}</span>
                          </span>
                        )}
                        {stat.disabled > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                            <EyeOff className="w-3 h-3" />
                            <span>{stat.disabled}</span>
                          </span>
                        )}
                        <span className="ml-auto text-[9px] text-slate-400 dark:text-slate-500 font-sans">
                          {stat.progress}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Score HUD & Actions Card */}
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-900/50 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Nilai Evaluasi Sementara
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums leading-none mt-1">
                    {evalResult.percentageScore}
                    <span className="text-xs font-normal text-slate-400"> /100</span>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-lg border text-center ${predikatInfo.bgWarna}`}>
                  <div className={`text-base font-black font-mono ${predikatInfo.warna} leading-none`}>
                    {evalResult.predikat}
                  </div>
                  <div className="text-[8px] text-slate-500 dark:text-slate-400 font-semibold uppercase mt-0.5">
                    {predikatInfo.label}
                  </div>
                </div>
              </div>

              {/* Micro Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  <span>{evalResult.answeredCount}/{evalResult.activeCount} Soal</span>
                  <span className="font-bold">{evalResult.progressPercentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${evalResult.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Draf</span>
                </button>

                <button
                  type="button"
                  onClick={onSubmitAudit}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{userRole === 'AUDITOR' || userRole === 'SUPERADMIN' ? 'Sahkan' : 'Kirim'}</span>
                </button>
              </div>

              {/* Export Excel Button */}
              <button
                type="button"
                onClick={onExportExcel}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition border border-slate-200/80 dark:border-slate-700/60 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ekspor LHKK Excel</span>
              </button>
            </div>
          </>
        )}

        {/* CASE B: REKAPITULASI KECAMATAN ACTIVE */}
        {activeTab === 'rekap-kecamatan' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/40 dark:to-slate-900/60 p-3.5 rounded-xl border border-cyan-200/70 dark:border-cyan-800/50 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-bold text-xs">
                <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Rangkuman Wilayah 22 Kecamatan</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Rekapitulasi nilai hasil evaluasi pengawasan kearsipan seluruh kecamatan di Kabupaten Kotabaru tahun {selectedYear}.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-cyan-100 dark:border-cyan-900/60">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Daratan</div>
                  <div className="text-base font-black font-mono text-cyan-700 dark:text-cyan-400">16 Kec</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-cyan-100 dark:border-cyan-900/60">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Kepulauan</div>
                  <div className="text-base font-black font-mono text-cyan-700 dark:text-cyan-400">6 Kec</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Formula Bobot Komposit
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Unit Pengolah (UP)</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">60%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Unit Kearsipan (UK)</span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">40%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: SUPER ADMIN ACTIVE */}
        {activeTab === 'superadmin' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-slate-900/60 p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-800/50 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Pusat Kendali Super Admin</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Akses penuh konfigurasi hak izin peran (RBAC), otentikasi akun, master instansi, dan sinkronisasi live cloud database.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Modul Konfigurasi
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Matriks Hak Akses (RBAC)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Manajemen Pengguna</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Master SKPD & Kecamatan</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Cloud className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Integrasi Cloud Appwrite</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE D: MANAJEMEN SOAL & LOGIC (BUILDER) */}
        {activeTab === 'admin-builder' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-slate-900/60 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Instrumen & Conditional Logic</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Kelola butir instrumen pengawasan, bobot kategori, dan aturan logika percabangan otomatis (conditional branching).
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Struktur Evaluasi
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Kategori</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeCategories.length} Aspek</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Butir Soal</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeQuestions.length} Soal</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Rentang Skala</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Level 0 - 5</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE E: PEDOMAN & SKKAAD */}
        {activeTab === 'panduan' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/40 dark:to-slate-900/60 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pedoman Teknis ASKI</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Mengacu pada Peraturan Kepala ANRI No. 6 Tahun 2019 tentang Pengawasan Kearsipan Internal.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Indeks Pedoman
              </div>
              <div className="space-y-1 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  1. Standar Predikat Nilai ANRI
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  2. Perbedaan UP (60%) & UK (40%)
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  3. Persyaratan Bukti Dukung (Evidence)
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  4. Verifikasi & Pengesahan Dispersip
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Universal Footer: Flows naturally at bottom of content without overlapping or cutting cards */}
      <div className="mt-auto shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0a0f1a]">

        {/* Universal Footer: Cloud Sync Status & Role */}
        <div className="px-3 py-2 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isLive ? (
              <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Cloud Sync
              </span>
            ) : (
              <span className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <CloudOff className="w-3 h-3" />
                Lokal
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                currentUser.role === 'SUPERADMIN'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : currentUser.role === 'AUDITOR'
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Draggable Splitter Handle */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleResetWidth}
        title="Tarik untuk mengatur lebar sidebar (Klik 2x untuk reset 288px)"
        className={`absolute top-0 right-0 bottom-0 w-2.5 -mr-1 cursor-col-resize z-40 flex items-center justify-center transition-colors group ${
          isResizing ? 'bg-emerald-500/25' : 'hover:bg-emerald-500/15'
        }`}
      >
        <div
          className={`w-0.5 rounded-full transition-all ${
            isResizing
              ? 'bg-emerald-600 dark:bg-emerald-400 h-16 w-1'
              : 'bg-slate-300/80 dark:bg-slate-700/80 group-hover:bg-emerald-500 group-hover:h-12'
          }`}
        />
      </div>
    </aside>
  );
};
