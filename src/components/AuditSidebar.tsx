import React, { useMemo } from 'react';
import { AuditQuestion, AuditCategory, QuestionAnswer, SKPDUnit, UserAccount } from '../types';
import { EvaluatedAnswersResult } from '../services/logicEngine';
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
  Save,
  Send,
  FileSpreadsheet,
  Cloud,
  ShieldAlert,
} from 'lucide-react';
import { isAppwriteLiveConfigured } from '../services/appwriteClient';
import { PREDIKAT_LIST } from '../data/defaultInstruments';

interface AuditSidebarProps {
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

      return {
        category: cat,
        total: catQuestions.length,
        answered,
        needsEvidence,
        disabled,
        unanswered: catQuestions.length - answered - disabled,
        isComplete: catQuestions.length - disabled === answered,
      };
    });
  }, [activeCategories, activeQuestions, evalResult.evaluatedAnswers]);

  return (
    <aside className="w-72 shrink-0 bg-white dark:bg-[#0c1220] border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto flex flex-col">
      {/* Section 1: Context Selectors */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80 space-y-3">
        {/* SKPD Selector */}
        <div>
          <label htmlFor="audit-skpd-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Objek Audit</span>
          </label>
          <select
            id="audit-skpd-select"
            aria-label="Pilih Objek Audit atau SKPD"
            value={selectedKecamatanId}
            onChange={(e) => setSelectedKecamatanId(e.target.value)}
            disabled={isOperatorRestricted}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed truncate"
          >
            {skpds.map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">
                {s.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Unit + Year Row */}
        <div className="flex items-center gap-2">
          {/* UP / UK Toggle */}
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Unit</span>
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800" role="group" aria-label="Pilih Unit Pengolah atau Kearsipan">
              <button
                type="button"
                onClick={() => setSelectedUnit('UP')}
                aria-pressed={selectedUnit === 'UP'}
                className={`flex-1 px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  selectedUnit === 'UP'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                UP
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit('UK')}
                aria-pressed={selectedUnit === 'UK'}
                className={`flex-1 px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  selectedUnit === 'UK'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                UK
              </button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="w-20">
            <label htmlFor="audit-year-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Tahun</span>
            </label>
            <select
              id="audit-year-select"
              aria-label="Pilih Tahun Pengawasan"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>

        {/* Appwrite Status Pill */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isAppwriteLiveConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <Cloud className="w-3 h-3" />
          <span>{isAppwriteLiveConfigured() ? 'Cloud Sync Aktif' : 'Mode Lokal'}</span>
        </div>
      </div>

      {/* Section 2: Category Navigation */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1.5 pb-1.5">
          Navigasi Aspek Pengawasan
        </div>

        {categoryStats.map((stat) => {
          const isActive = activeCategoryId === stat.category.id;
          const progressPct = stat.total > 0 ? Math.round(((stat.answered + stat.disabled) / stat.total) * 100) : 0;

          return (
            <button
              key={stat.category.id}
              type="button"
              onClick={() => onSelectCategory(stat.category.id)}
              className={`w-full text-left p-2.5 rounded-xl transition border group ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[11px] font-bold ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {stat.category.kode}
                  </span>
                  <span className={`text-[11px] font-bold truncate max-w-[140px] ${
                    isActive ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {stat.category.nama}
                  </span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400 rotate-90' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`} />
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    stat.isComplete ? 'bg-emerald-500' : 'bg-emerald-400 dark:bg-emerald-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {stat.answered}
                </span>
                {stat.unanswered > 0 && (
                  <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                    <Circle className="w-3 h-3" />
                    {stat.unanswered}
                  </span>
                )}
                {stat.needsEvidence > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                    {stat.needsEvidence}
                  </span>
                )}
                {stat.disabled > 0 && (
                  <span className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
                    <EyeOff className="w-3 h-3" />
                    {stat.disabled}
                  </span>
                )}
                <span className="ml-auto text-slate-500 dark:text-slate-400 font-mono font-bold">
                  {stat.category.bobotPersentase}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Section 3: Live Scoring Panel */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3.5 space-y-3 bg-slate-50/80 dark:bg-[#090e17]/80">
        {/* Score + Predikat */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nilai ASKI</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums leading-tight">
              {evalResult.percentageScore}
              <span className="text-xs font-normal text-slate-400"> /100</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-center ${predikatInfo.bgWarna}`}>
            <div className={`text-lg font-black font-mono ${predikatInfo.warna}`}>{evalResult.predikat}</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{predikatInfo.label}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>Progress Pengisian</span>
            <span className="font-mono font-bold">{evalResult.progressPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${evalResult.progressPercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            {evalResult.answeredCount} / {evalResult.activeCount} soal dijawab
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
            sessionStatus === 'VERIFIED' || sessionStatus === 'FINAL'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600/50'
              : sessionStatus === 'SUBMITTED'
              ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-600/50'
              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-600/50'
          }`}>
            {sessionStatus === 'DRAFT' ? 'DRAF' : sessionStatus === 'SUBMITTED' ? 'TERKIRIM' : 'TERVERIFIKASI'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onSaveDraft}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Draf ke Cloud</span>
          </button>

          <button
            type="button"
            onClick={onSubmitAudit}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{userRole === 'AUDITOR' || userRole === 'SUPERADMIN' ? 'Verifikasi & Sahkan' : 'Kirim ke Dispersip'}</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-lg text-xs font-bold transition shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh Rekap Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
