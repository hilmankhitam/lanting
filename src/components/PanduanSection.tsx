import React from 'react';
import { PREDIKAT_LIST } from '../data/defaultInstruments';
import { BookOpen, ShieldCheck, CheckCircle2, AlertCircle, FileText, Building2 } from 'lucide-react';

export const PanduanSection: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Pedoman Teknis Pengawasan Kearsipan Internal (ASKI)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standar Operasional Prosedur Pengawasan Kearsipan Pemerintah Kabupaten Kotabaru mengacu pada Peraturan Kepala ANRI No. 6 Tahun 2019.
            </p>
          </div>
        </div>
      </div>

      {/* Standar Predikat Nilai ANRI */}
      <div className="gov-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Tabel Standar Klasifikasi Predikat Pengawasan ANRI</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(PREDIKAT_LIST).map((p) => (
            <div
              key={p.kode}
              className={`p-3.5 rounded-lg border ${p.bgWarna} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black font-mono ${p.warna}`}>{p.kode}</span>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 tabular-nums">{p.range}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">{p.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Perbedaan UP & UK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>Unit Pengolah (UP) — Bobot 60%</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Unit Pengolah adalah unit kerja operasional (Seksi / Subbag) di lingkungan kantor kecamatan yang bertugas langsung menciptakan, menggunakan, dan memelihara arsip aktif.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Penciptaan naskah dinas & tata naskah dinas resmi.</li>
            <li>Pemberkasan dan penyusunan Daftar Arsip Aktif berdasarkan SKKAAD.</li>
            <li>Pelayanan arsip aktif konvensional & kartu kendali / out indicator.</li>
            <li>Pemindahan berkas inaktif ke Unit Kearsipan disertai Berita Acara (BA).</li>
          </ul>
        </div>

        <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>Unit Kearsipan (UK) — Bobot 40%</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Unit Kearsipan berada pada Sekretariat Kecamatan yang bertanggung jawab mengelola Record Center induk kecamatan, arsip inaktif dari seluruh Seksi/Subbag, dan penyusutan.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Pengelolaan Record Center, rak besi, boks arsip, dan pengatur suhu.</li>
            <li>Penyusunan Daftar Arsip Inaktif kecamatan terpadu.</li>
            <li>Fasilitasi usul pemusnahan arsip habis retensi kepada Dispersip.</li>
            <li>Pembinaan SDM Pengelola Arsip bersertifikat.</li>
          </ul>
        </div>
      </div>

      {/* Alur Conditional Logic */}
      <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Mekanisme Alur Soal Bercabang (*Conditional Branching Logic*)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Dalam pengawasan kearsipan modern, beberapa butir pertanyaan memiliki prasyarat mutlak yang saling mengikat:
        </p>
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800 space-y-1">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Studi Kasus Butir B.1 (Layanan Arsip Aktif SKKAAD):</span>
          <div>➔ Jika opsi yang dipilih adalah <strong>(a) Belum terdapat daftar arsip aktif</strong>,</div>
          <div>➔ Sistem secara otomatis <strong>menonaktifkan (skip) butir B.2 dan B.3</strong>, karena peminjaman arsip dan out indicator tidak mungkin dijalankan secara valid tanpa adanya daftar arsip aktif.</div>
        </div>
      </div>
    </div>
  );
};
