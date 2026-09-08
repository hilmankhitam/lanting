import React, { useState } from 'react';
import { EvidenceFile } from '../types';
import { UploadCloud, Link as LinkIcon, FileText, Image as ImageIcon, Trash2, ExternalLink, Plus, Loader2, Cloud } from 'lucide-react';
import { uploadEvidenceToAppwrite, deleteEvidenceFromAppwrite } from '../services/appwriteStorageService';

interface EvidenceUploaderProps {
  evidenceList: EvidenceFile[];
  onUpdateEvidence: (newList: EvidenceFile[]) => void;
  disabled?: boolean;
  questionNumber: string;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidenceList,
  onUpdateEvidence,
  disabled = false,
  questionNumber,
}) => {
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const newEvidence = await uploadEvidenceToAppwrite(file, questionNumber);
      onUpdateEvidence([...evidenceList, newEvidence]);
    } catch (err) {
      console.error('Failed to upload evidence:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newEvidence: EvidenceFile = {
      id: `ev-link-${Date.now()}`,
      namaFile: linkTitle.trim() || formattedUrl,
      tipe: 'LINK',
      url: formattedUrl,
      uploadedAt: new Date().toISOString(),
      keterangan: 'Tautan Bukti Dukung (Cloud Drive/Form)',
    };

    onUpdateEvidence([...evidenceList, newEvidence]);
    setLinkUrl('');
    setLinkTitle('');
    setShowAddLink(false);
  };

  const handleRemove = async (item: EvidenceFile) => {
    if (item.appwriteFileId) {
      await deleteEvidenceFromAppwrite(item.appwriteFileId, item.appwriteBucketId);
    }
    onUpdateEvidence(evidenceList.filter((e) => e.id !== item.id));
  };


  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Lampiran Berkas Bukti Dukung / Fisik Arsip
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            ({evidenceList.length} Berkas)
          </span>
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-emerald-300 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 px-2.5 py-1.5 rounded-md transition font-semibold shadow-sm ${
              isUploading ? 'opacity-60 pointer-events-none' : ''
            }`}>
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Mengunggah ke Storage...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Unggah Dokumen (PDF/Foto)</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                disabled={disabled || isUploading}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowAddLink(!showAddLink)}
              className="inline-flex items-center gap-1.5 text-xs bg-cyan-50 hover:bg-cyan-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-cyan-300 dark:border-slate-700 text-cyan-800 dark:text-cyan-300 px-2.5 py-1.5 rounded-md transition font-semibold shadow-sm"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Tautkan Cloud Drive</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Modal/Bar for URL Link */}
      {showAddLink && !disabled && (
        <form onSubmit={handleAddLink} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-cyan-300 dark:border-cyan-500/40 mb-3 space-y-2.5 animate-fade-in shadow-sm">
          <div className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">
            Tautkan Berkas Bukti Eksternal (Google Drive / Srikandi / Cloud Folder):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Keterangan / Nama Berkas (Contoh: SK Tim Kearsipan 2024)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddLink(false)}
              className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white rounded text-xs font-semibold shadow-sm"
            >
              Simpan Tautan
            </button>
          </div>
        </form>
      )}

      {/* Evidence Items List */}
      {evidenceList.length === 0 ? (
        <div className="text-xs text-slate-600 dark:text-slate-400 italic py-2.5 px-3.5 bg-slate-100/90 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
          Belum ada berkas bukti dukung yang dilampirkan. Lampirkan berkas otentik (SKKAAD, Daftar Arsip Aktif, Foto Sarpras, atau BA Pemindahan) sesuai panduan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  {ev.tipe === 'IMAGE' ? (
                    <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : ev.tipe === 'LINK' ? (
                    <LinkIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-800 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400 font-medium truncate block flex items-center gap-1"
                    title={ev.namaFile}
                  >
                    <span className="truncate">{ev.namaFile}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                    <span>{ev.tipe}</span>
                    {ev.sizeBytes && <span>• {formatFileSize(ev.sizeBytes)}</span>}
                    {ev.appwriteFileId ? (
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="Tersimpan di Appwrite Storage Bucket">
                        • <Cloud className="w-2.5 h-2.5" /> Appwrite
                      </span>
                    ) : (
                      <span>• {new Date(ev.uploadedAt).toLocaleDateString('id-ID')}</span>
                    )}
                  </div>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(ev)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded transition shrink-0"
                  title="Hapus Bukti Dukung"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
