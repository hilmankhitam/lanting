import React, { useMemo, useEffect, useRef } from 'react';
import { AuditQuestion, AuditCategory, QuestionAnswer, EvidenceFile } from '../types';
import { EvaluatedAnswersResult } from '../services/logicEngine';
import { QuestionCard } from './QuestionCard';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  EyeOff,
  Layers,
  Clock,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface AuditFormPageProps {
  activeCategories: AuditCategory[];
  activeQuestions: AuditQuestion[];
  evalResult: EvaluatedAnswersResult;
  activeCategoryId: string;
  onChangeCategoryId: (categoryId: string) => void;

  // From App.tsx handlers
  onSelectOption: (questionId: string, optionId: string) => void;
  onUpdateEvidence: (questionId: string, evidenceList: EvidenceFile[]) => void;
  onUpdateAuditorNote: (questionId: string, note: string) => void;
  isAuditorView: boolean;
  canAnswer: boolean;
  canUploadEvidence: boolean;

  // Context display
  unitName: string;
  skpdName: string;
  lastSavedTime: string;
}

export const AuditFormPage: React.FC<AuditFormPageProps> = ({
  activeCategories,
  activeQuestions,
  evalResult,
  activeCategoryId,
  onChangeCategoryId,
  onSelectOption,
  onUpdateEvidence,
  onUpdateAuditorNote,
  isAuditorView,
  canAnswer,
  canUploadEvidence,
  unitName,
  skpdName,
  lastSavedTime,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Current category index for prev/next navigation
  const currentCategoryIndex = useMemo(() => {
    return activeCategories.findIndex((c) => c.id === activeCategoryId);
  }, [activeCategories, activeCategoryId]);

  const currentCategory = activeCategories[currentCategoryIndex] || activeCategories[0];

  // Questions for the active category
  const categoryQuestions = useMemo(() => {
    if (!currentCategory) return [];
    return activeQuestions.filter((q) => q.kategoriId === currentCategory.id);
  }, [activeQuestions, currentCategory]);

  // Stats for current category
  const categoryStats = useMemo(() => {
    let answered = 0;
    let disabled = 0;
    let needsEvidence = 0;

    categoryQuestions.forEach((q) => {
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
      total: categoryQuestions.length,
      answered,
      disabled,
      unanswered: categoryQuestions.length - answered - disabled,
      needsEvidence,
      isComplete: categoryQuestions.length - disabled === answered,
    };
  }, [categoryQuestions, evalResult.evaluatedAnswers]);

  // Navigation handlers
  const hasPrev = currentCategoryIndex > 0;
  const hasNext = currentCategoryIndex < activeCategories.length - 1;

  const goToPrev = () => {
    if (hasPrev) {
      onChangeCategoryId(activeCategories[currentCategoryIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onChangeCategoryId(activeCategories[currentCategoryIndex + 1].id);
    }
  };

  // Scroll to top when category changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategoryId]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only if not in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentCategoryIndex, activeCategories]);

  // Overall progress across all categories (must be called before any early return)
  const overallProgress = useMemo(() => {
    let totalActive = 0;
    let totalAnswered = 0;

    activeQuestions.forEach((q) => {
      const ans = evalResult.evaluatedAnswers[q.id];
      if (!ans?.isDisabled) {
        totalActive++;
        if (ans?.selectedOptionId) totalAnswered++;
      }
    });

    return totalActive > 0 ? Math.round((totalAnswered / totalActive) * 100) : 0;
  }, [activeQuestions, evalResult.evaluatedAnswers]);

  if (!currentCategory) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 text-sm">
        Tidak ada kategori soal untuk unit ini.
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 transition-all duration-200">
        {/* Page Header: Category Title + Stats */}
        <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {/* Top row: Breadcrumb + Context */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                  LEMBAR KERJA INSTRUMEN ASKI
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  • {unitName}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentCategory.kode}. {currentCategory.nama}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {skpdName} — Bobot Evaluasi: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{currentCategory.bobotPersentase}%</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{lastSavedTime}</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Progres Keseluruhan Pengisian Instrumen</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{overallProgress}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Category Pagination Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {activeCategories.map((cat, idx) => {
              const isActive = cat.id === activeCategoryId;
              const catQs = activeQuestions.filter((q) => q.kategoriId === cat.id);
              const catAnswered = catQs.filter((q) => {
                const a = evalResult.evaluatedAnswers[q.id];
                return a && !a.isDisabled && a.selectedOptionId;
              }).length;
              const catActiveCount = catQs.filter((q) => !evalResult.evaluatedAnswers[q.id]?.isDisabled).length;
              const isCatComplete = catActiveCount > 0 && catAnswered === catActiveCount;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition shrink-0 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-sm'
                      : isCatComplete
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/40'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isCatComplete && !isActive ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                  )}
                  <span>{cat.kode}. {cat.nama.split('(')[0].trim().substring(0, 20)}{cat.nama.length > 20 ? '…' : ''}</span>
                </button>
              );
            })}
          </div>

          {/* Current Category Stats */}
          <div className="flex items-center gap-4 text-[11px] border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {categoryStats.answered} Terjawab
            </span>
            {categoryStats.unanswered > 0 && (
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <Circle className="w-3.5 h-3.5" />
                {categoryStats.unanswered} Belum Diisi
              </span>
            )}
            {categoryStats.needsEvidence > 0 && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {categoryStats.needsEvidence} Perlu Bukti
              </span>
            )}
            {categoryStats.disabled > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                <EyeOff className="w-3.5 h-3.5" />
                {categoryStats.disabled} Dinonaktifkan
              </span>
            )}
            <span className="ml-auto font-mono font-bold text-slate-600 dark:text-slate-400">
              {categoryStats.total} Butir Soal
            </span>
          </div>
        </div>

        {/* Question Cards for this Category */}
        <div className="space-y-4">
          {categoryQuestions.map((q) => {
            const ans = evalResult.evaluatedAnswers[q.id] || {
              questionId: q.id,
              selectedOptionId: null,
              score: 0,
              level: 0,
              isDisabled: false,
              evidenceList: [],
            };

            return (
              <QuestionCard
                key={q.id}
                question={q}
                answer={ans}
                onSelectOption={(optId) => onSelectOption(q.id, optId)}
                onUpdateEvidence={(evList) => onUpdateEvidence(q.id, evList)}
                onUpdateAuditorNote={(note) => onUpdateAuditorNote(q.id, note)}
                isAuditorView={isAuditorView}
                canAnswer={canAnswer}
                canUploadEvidence={canUploadEvidence}
              />
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 pb-8 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={goToPrev}
            disabled={!hasPrev}
            aria-label={hasPrev ? `Halaman Sebelumnya: ${activeCategories[currentCategoryIndex - 1].kode}` : 'Halaman Sebelumnya (dinonaktifkan)'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition border ${
              hasPrev
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:shadow'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sebelumnya</div>
              <div className="text-xs font-bold truncate max-w-[120px]">
                {hasPrev ? `${activeCategories[currentCategoryIndex - 1].kode}. ${activeCategories[currentCategoryIndex - 1].nama}` : '—'}
              </div>
            </div>
          </button>

          {/* Page indicator */}
          <div className="flex items-center gap-1.5" role="navigation" aria-label="Navigasi Halaman Matriks">
            {activeCategories.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChangeCategoryId(cat.id)}
                aria-label={`Beralih ke Matriks ${cat.kode}: ${cat.nama}`}
                aria-current={idx === currentCategoryIndex ? 'page' : undefined}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  idx === currentCategoryIndex
                    ? 'bg-emerald-600 scale-110'
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
                title={`${cat.kode}. ${cat.nama}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={!hasNext}
            aria-label={hasNext ? `Halaman Selanjutnya: ${activeCategories[currentCategoryIndex + 1].kode}` : 'Halaman Terakhir'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition border ${
              hasNext
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 dark:border-emerald-500 shadow-sm hover:shadow'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            <div className="text-right">
              <div className="text-[10px] text-emerald-100/80 font-medium">{hasNext ? 'Selanjutnya' : 'Selesai'}</div>
              <div className="text-xs font-bold truncate max-w-[120px]">
                {hasNext ? `${activeCategories[currentCategoryIndex + 1].kode}. ${activeCategories[currentCategoryIndex + 1].nama}` : '—'}
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pb-4">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">Alt</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">→</kbd>
          {' untuk navigasi antar aspek'}
        </div>
      </div>
    </div>
  );
};
