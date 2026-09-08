import React, { useState } from 'react';
import { AuditQuestion, QuestionAnswer, EvidenceFile } from '../types';
import { EvidenceUploader } from './EvidenceUploader';
import { CheckCircle2, AlertTriangle, BookOpen, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, MessageSquare, FileCheck2, GitBranch } from 'lucide-react';

interface QuestionCardProps {
  question: AuditQuestion;
  answer: QuestionAnswer;
  onSelectOption: (optionId: string) => void;
  onUpdateEvidence: (evidence: EvidenceFile[]) => void;
  onUpdateAuditorNote?: (note: string) => void;
  isAuditorView?: boolean;
  canAnswer?: boolean;
  canUploadEvidence?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onSelectOption,
  onUpdateEvidence,
  onUpdateAuditorNote,
  isAuditorView = false,
  canAnswer = true,
  canUploadEvidence = true,
}) => {
  const [activeTab, setActiveTab] = useState<'kriteria' | 'panduan' | 'catatan'>('kriteria');

  const isDisabled = answer.isDisabled;
  const selectedOpt = question.options.find((o) => o.id === answer.selectedOptionId);
  const evidenceCount = answer.evidenceList?.length || 0;
  const isHighLevel = (answer.level || 0) >= 3;
  const needsEvidenceNotice = Boolean(answer.selectedOptionId) && isHighLevel && evidenceCount === 0;

  return (
    <div
      id={`q-${question.id}`}
      className={`gov-card rounded-xl transition-all duration-150 border scroll-mt-28 ${
        isDisabled
          ? 'border-slate-300 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/60 opacity-60'
          : answer.selectedOptionId
          ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-[#0d1527]'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Question Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/70">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Official Question Code Badge */}
            <div className="flex flex-col items-center">
              <span
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold tracking-wider shrink-0 border ${
                  isDisabled
                    ? 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
                    : answer.selectedOptionId
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/50'
                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {question.nomor}
              </span>
              <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                {question.targetUnit}
              </span>
            </div>

            {/* Question Statement & Sub-badges */}
            <div className="space-y-1.5">
              <h3
                className={`text-sm sm:text-base font-semibold leading-snug ${
                  isDisabled ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {question.pernyataan}
              </h3>

              {/* Conditional Branching Alert Banner */}
              {isDisabled ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{answer.disabledReason || 'Butir ini dinonaktifkan secara otomatis oleh logika prasyarat sebelumnya.'}</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {question.dasarHukum && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{question.dasarHukum}</span>
                    </span>
                  )}

                  {needsEvidenceNotice && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/40 rounded text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Level {answer.level} memerlukan lampiran berkas bukti dukung</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Points & Level Box */}
          <div className="flex flex-col items-end shrink-0 pl-2">
            <div
              className={`px-3 py-1.5 rounded-md border flex items-baseline gap-1 tabular-nums ${
                isDisabled
                  ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  : answer.selectedOptionId
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
              }`}
            >
              <span className="text-xs text-slate-500 dark:text-slate-400">Skor:</span>
              <span className="text-sm font-black font-mono">
                {isDisabled ? '0' : answer.score}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                / {question.bobotMaksimal}
              </span>
            </div>

            {!isDisabled && answer.selectedOptionId && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400/90 font-bold mt-1">
                Tingkat Kematangan: Level {answer.level}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structured Action & Navigation Tabs inside Card */}
      <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('kriteria')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeTab === 'kriteria'
                ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-semibold border border-slate-300 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Pilihan Kriteria (a - e)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
              activeTab === 'panduan'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 font-semibold dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Definisi Operasional</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catatan')}
            className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
              activeTab === 'catatan'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-slate-800 dark:text-cyan-300 font-semibold dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Catatan Auditor {answer.catatanAuditor ? '✓' : ''}</span>
          </button>
        </div>

        {/* Evidence Status Pill */}
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
            evidenceCount > 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300'
              : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
          }`}
        >
          {evidenceCount} Berkas Bukti
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* TAB 1: KRITERIA OPSI SKOR BERTINGKAT */}
        {activeTab === 'kriteria' && (
          <div className="space-y-2">
            {!canAnswer && (
              <div className="p-2.5 mb-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Mode Pratinjau / Pemeriksaan: Pengisian opsi kriteria dikunci (hanya dapat dikerjakan oleh akun Operator SKPD/Kecamatan).</span>
              </div>
            )}

            {question.options.map((opt) => {
              const isSelected = answer.selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!isDisabled && canAnswer) onSelectOption(opt.id);
                  }}
                  className={`flex items-start gap-3.5 p-3 rounded-lg border transition select-none ${
                    isDisabled || !canAnswer ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isDisabled
                      ? 'bg-slate-100/50 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-800/40 dark:text-slate-600'
                      : isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 text-slate-900 ring-1 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-slate-100'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {/* Radio Indicator */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400'
                          : 'border-slate-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {opt.huruf.toUpperCase()}
                    </div>
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    <span>{opt.teks}</span>
                    {question.logicRules?.some((r) => r.triggerOptionIds.includes(opt.id)) && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400/90 font-medium">
                        <GitBranch className="w-3 h-3" />
                        <span>* Opsi ini memicu penonaktifan butir berikutnya sesuai alur logika</span>
                      </div>
                    )}
                  </div>

                  {/* Level & Points Pill */}
                  <div className="shrink-0 flex items-center gap-1.5 self-center tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-500/40'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      Level {opt.level}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {opt.skor} Poin
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: DEFINISI OPERASIONAL & PEDOMAN PENGISIAN */}
        {activeTab === 'panduan' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-3">
            <div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Definisi Operasional & Standar Pengawasan ANRI:</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300 pl-5">
                {question.definisiOperasional}
              </p>
            </div>

            {question.dasarHukum && (
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300">Rujukan Dasar Hukum: </span>
                  <span className="text-slate-600 dark:text-slate-400">{question.dasarHukum}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATATAN PENGAWAS / AUDITOR LAPANGAN */}
        {activeTab === 'catatan' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Catatan Pemeriksaan Fisik & Rekomendasi Auditor:</span>
            </div>
            <textarea
              rows={3}
              value={answer.catatanAuditor || ''}
              onChange={(e) => onUpdateAuditorNote && onUpdateAuditorNote(e.target.value)}
              placeholder="Tuliskan catatan hasil pemeriksaan lapangan, ketidaksesuaian dokumen, atau rekomendasi perbaikan kearsipan..."
              disabled={isDisabled || !isAuditorView}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 text-xs leading-relaxed"
            />
            {!isAuditorView && (
              <p className="text-[11px] text-slate-500 italic">
                * Catatan ini hanya dapat diedit dalam Mode Tim Auditor Dispersip.
              </p>
            )}
          </div>
        )}

        {/* Evidence Uploader Section */}
        <EvidenceUploader
          evidenceList={answer.evidenceList || []}
          onUpdateEvidence={onUpdateEvidence}
          disabled={isDisabled || !canUploadEvidence}
          questionNumber={question.nomor}
        />
      </div>
    </div>
  );
};

