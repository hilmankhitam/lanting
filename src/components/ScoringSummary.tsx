import React, { useState } from 'react';
import { EvaluatedAnswersResult } from '../services/logicEngine';
import { PREDIKAT_LIST } from '../data/defaultInstruments';
import { Award, FileSpreadsheet, FileDown, Send, Save, CheckCircle2, ShieldCheck, AlertCircle, FileCheck, Landmark } from 'lucide-react';

import { UserRole } from '../types';

interface ScoringSummaryProps {
  evalResult: EvaluatedAnswersResult;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'FINAL';
  onSaveDraft: () => void;
  onSubmitAudit: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  unitName: string;
  kecamatanName: string;
  userRole?: UserRole;
  canExport?: boolean;
}

export const ScoringSummary: React.FC<ScoringSummaryProps> = ({
  evalResult,
  status,
  onSaveDraft,
  onSubmitAudit,
  onExportPDF,
  onExportExcel,
  unitName,
  kecamatanName,
  userRole = 'OPERATOR',
  canExport = true,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const predikatInfo = PREDIKAT_LIST[evalResult.predikat] || PREDIKAT_LIST['D'];

  const handleConfirmSubmit = () => {
    onSubmitAudit();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="gov-card rounded-xl p-5 border border-slate-200 dark:border-slate-800 sticky top-24 shadow-xl space-y-4">
        {/* Header with status */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluasi Hasil Pengawasan
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
              {unitName}
            </h2>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Kecamatan {kecamatanName}</div>
          </div>
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border tabular-nums ${
              status === 'FINAL' || status === 'VERIFIED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50'
                : status === 'SUBMITTED'
                ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/50'
                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/50'
            }`}
          >
            {status === 'DRAFT' ? 'DRAF AUDIT' : status === 'SUBMITTED' ? 'TERKIRIM' : 'TERVERIFIKASI'}
          </span>
        </div>

        {/* Nilai Akhir & Predikat Box */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Nilai Akhir ASKI
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline gap-1">
              <span>{evalResult.percentageScore}</span>
              <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              Skor Terkumpul: <strong className="text-slate-800 dark:text-slate-200">{evalResult.totalScore}</strong> / {evalResult.maxScore}
            </div>
          </div>

          {/* Official Predikat Box */}
          <div className={`px-4 py-3 rounded-lg border text-center shrink-0 ${predikatInfo.bgWarna}`}>
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Predikat ANRI
            </div>
            <div className={`text-2xl font-black font-mono leading-none my-1 ${predikatInfo.warna}`}>
              {predikatInfo.kode}
            </div>
            <div className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
              {predikatInfo.label}
            </div>
          </div>
        </div>

        {/* Progress Bar Pengisian */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs tabular-nums">
            <span className="text-slate-600 dark:text-slate-400">Progres Kelengkapan Butir:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {evalResult.answeredCount} / {evalResult.activeCount} Butir ({evalResult.progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${evalResult.progressPercentage}%` }}
            />
          </div>
          {evalResult.disabledCount > 0 && (
            <div className="text-[11px] text-slate-500 italic">
              * {evalResult.disabledCount} butir dilewati oleh logika prasyarat SKKAAD.
            </div>
          )}
        </div>

        {/* Rincian Aspek Pengawasan */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Capaian per Aspek Kearsipan
          </div>
          {Object.values(evalResult.categoryScores).map((item) => (
            <div key={item.category.id} className="text-xs space-y-1">
              <div className="flex justify-between tabular-nums">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={item.category.nama}>
                  {item.category.kode}. {item.category.nama}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                  {Math.round(item.percentage)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded overflow-hidden border border-slate-300 dark:border-slate-800/60">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-700 transition"
            >
              <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Simpan Draf</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-md text-xs font-semibold shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{userRole === 'OPERATOR' ? 'Kirim ke Tim Audit' : 'Verifikasi & Sahkan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onExportPDF}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-300 rounded-md text-xs font-medium border border-rose-200 dark:border-rose-900/60 transition"
              title="Unduh Laporan Hasil Pengawasan Kearsipan (LHKK)"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>Ekspor LHKK (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-900/60 transition"
              title="Unduh Lembar Kerja Audit Kearsipan Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Kerja (XLSX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Confirmation & Verification Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="gov-card max-w-md w-full rounded-xl border border-slate-300 dark:border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfirmasi Pengiriman Audit Kearsipan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kabupaten Kotabaru • Standar ANRI
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Objek Audit:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">Kec. {kecamatanName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit Audit:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">{unitName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nilai Akhir:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{evalResult.percentageScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Predikat ANRI:</span>
                  <span className={`font-black ${predikatInfo.warna}`}>{predikatInfo.kode} ({predikatInfo.label})</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30 dark:text-amber-300 rounded text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Setelah pengiriman, status audit akan tercatat pada sistem rekapitulasi 22 Kecamatan dan siap diverifikasi oleh Tim Auditor Dispersip.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition shadow"
              >
                Kirim Laporan Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

