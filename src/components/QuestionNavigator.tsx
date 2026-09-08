import React, { useState } from 'react';
import { AuditQuestion, QuestionAnswer } from '../types';
import { CheckCircle2, AlertCircle, EyeOff, Circle, Filter } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: AuditQuestion[];
  evaluatedAnswers: Record<string, QuestionAnswer>;
  activeQuestionId?: string;
  onNavigateToQuestion: (questionId: string) => void;
}

export type NavigatorFilter = 'ALL' | 'UNANSWERED' | 'NEEDS_EVIDENCE' | 'DISABLED';

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  evaluatedAnswers,
  activeQuestionId,
  onNavigateToQuestion,
}) => {
  const [filter, setFilter] = useState<NavigatorFilter>('ALL');

  // Compute status for each question
  const questionStatuses = questions.map((q) => {
    const ans = evaluatedAnswers[q.id];
    const isDisabled = ans?.isDisabled || false;
    const isAnswered = Boolean(ans?.selectedOptionId);
    const hasEvidence = (ans?.evidenceList?.length || 0) > 0;
    const needsEvidence = isAnswered && !hasEvidence && (ans?.level || 0) >= 2;

    return {
      question: q,
      isDisabled,
      isAnswered,
      hasEvidence,
      needsEvidence,
    };
  });

  const counts = {
    all: questions.length,
    unanswered: questionStatuses.filter((s) => !s.isDisabled && !s.isAnswered).length,
    needsEvidence: questionStatuses.filter((s) => !s.isDisabled && s.needsEvidence).length,
    disabled: questionStatuses.filter((s) => s.isDisabled).length,
  };

  const filteredQuestions = questionStatuses.filter((s) => {
    if (filter === 'UNANSWERED') return !s.isDisabled && !s.isAnswered;
    if (filter === 'NEEDS_EVIDENCE') return !s.isDisabled && s.needsEvidence;
    if (filter === 'DISABLED') return s.isDisabled;
    return true;
  });

  return (
    <div className="gov-card rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 mb-5">
      {/* Header and Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Matriks Navigasi Butir Soal
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
            {counts.all - counts.unanswered - counts.disabled} / {counts.all - counts.disabled} Diisi
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'ALL'
                ? 'bg-slate-800 text-white dark:bg-slate-700 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNANSWERED')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'UNANSWERED'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/60 dark:text-rose-300 dark:border-rose-600/40 font-semibold'
                : 'text-rose-600 dark:text-rose-400/80 hover:text-rose-800 dark:hover:text-rose-300'
            }`}
          >
            Belum Diisi ({counts.unanswered})
          </button>
          <button
            type="button"
            onClick={() => setFilter('NEEDS_EVIDENCE')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'NEEDS_EVIDENCE'
                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-300 dark:border-amber-600/40 font-semibold'
                : 'text-amber-600 dark:text-amber-400/80 hover:text-amber-800 dark:hover:text-amber-300'
            }`}
          >
            Perlu Bukti ({counts.needsEvidence})
          </button>
          {counts.disabled > 0 && (
            <button
              type="button"
              onClick={() => setFilter('DISABLED')}
              className={`px-2 py-0.5 rounded transition ${
                filter === 'DISABLED'
                  ? 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Dilewati ({counts.disabled})
            </button>
          )}
        </div>
      </div>

      {/* Grid of Question Number Buttons */}
      <div className="flex flex-wrap gap-1.5 pt-3">
        {filteredQuestions.map(({ question, isDisabled, isAnswered, needsEvidence }) => {
          let badgeStyle = '';
          let icon = null;

          if (isDisabled) {
            badgeStyle = 'bg-slate-100/70 border-slate-200 text-slate-400 dark:bg-slate-900/70 dark:border-slate-800 dark:text-slate-600 line-through';
            icon = <EyeOff className="w-2.5 h-2.5 ml-1 opacity-50" />;
          } else if (needsEvidence) {
            badgeStyle = 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/50 dark:text-amber-300 hover:border-amber-400';
            icon = <AlertCircle className="w-2.5 h-2.5 ml-1 text-amber-600 dark:text-amber-400" />;
          } else if (isAnswered) {
            badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-300 hover:border-emerald-400';
            icon = <CheckCircle2 className="w-2.5 h-2.5 ml-1 text-emerald-600 dark:text-emerald-400" />;
          } else {
            badgeStyle = 'bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200';
            icon = <Circle className="w-2 h-2 ml-1 text-slate-400 dark:text-slate-600" />;
          }

          const isActive = activeQuestionId === question.id;

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onNavigateToQuestion(question.id)}
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-bold border transition ${badgeStyle} ${
                isActive ? 'ring-2 ring-emerald-500' : ''
              }`}
              title={`${question.nomor}: ${question.pernyataan.substring(0, 60)}...`}
            >
              <span>{question.nomor}</span>
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
