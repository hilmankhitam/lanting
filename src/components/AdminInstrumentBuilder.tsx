import React, { useState } from 'react';
import { AuditCategory, AuditQuestion, LogicRule, OptionChoice } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  GitBranch,
  Save,
  Layers,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AdminInstrumentBuilderProps {
  questions: AuditQuestion[];
  categories: AuditCategory[];
  onSaveQuestions: (questions: AuditQuestion[]) => void;
  onSaveCategories: (categories: AuditCategory[]) => void;
}

export const AdminInstrumentBuilder: React.FC<AdminInstrumentBuilderProps> = ({
  questions,
  categories,
  onSaveQuestions,
  onSaveCategories,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<'UP' | 'UK'>('UP');
  const [editingQuestion, setEditingQuestion] = useState<AuditQuestion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State for editing / creating question
  const [formNomor, setFormNomor] = useState('');
  const [formKategoriId, setFormKategoriId] = useState('');
  const [formTargetUnit, setFormTargetUnit] = useState<'UP' | 'UK' | 'BOTH'>('UP');
  const [formPernyataan, setFormPernyataan] = useState('');
  const [formDefinisi, setFormDefinisi] = useState('');
  const [formDasarHukum, setFormDasarHukum] = useState('');
  const [formBobot, setFormBobot] = useState(100);
  const [formOptions, setFormOptions] = useState<OptionChoice[]>([
    { id: 'a', huruf: 'a', teks: '', level: 0, skor: 0, isNegativeTrigger: true },
    { id: 'b', huruf: 'b', teks: '', level: 1, skor: 25 },
    { id: 'c', huruf: 'c', teks: '', level: 2, skor: 50 },
    { id: 'd', huruf: 'd', teks: '', level: 3, skor: 75 },
    { id: 'e', huruf: 'e', teks: '', level: 4, skor: 100 },
  ]);
  const [formLogicRules, setFormLogicRules] = useState<LogicRule[]>([]);

  // New logic rule drawer state
  const [newRuleTriggerOpt, setNewRuleTriggerOpt] = useState('a');
  const [newRuleTargetQuestions, setNewRuleTargetQuestions] = useState<string[]>([]);
  const [newRuleReason, setNewRuleReason] = useState('');

  const unitCategories = categories.filter(
    (c) => c.targetUnit === selectedUnit || c.targetUnit === 'BOTH'
  );
  const filteredQuestions = questions.filter(
    (q) => q.targetUnit === selectedUnit || q.targetUnit === 'BOTH'
  );

  const startEditQuestion = (q: AuditQuestion) => {
    setEditingQuestion(q);
    setIsCreatingNew(false);
    setFormNomor(q.nomor);
    setFormKategoriId(q.kategoriId);
    setFormTargetUnit(q.targetUnit);
    setFormPernyataan(q.pernyataan);
    setFormDefinisi(q.definisiOperasional);
    setFormDasarHukum(q.dasarHukum);
    setFormBobot(q.bobotMaksimal);
    setFormOptions(JSON.parse(JSON.stringify(q.options)));
    setFormLogicRules(JSON.parse(JSON.stringify(q.logicRules || [])));
  };

  const startCreateNew = () => {
    setIsCreatingNew(true);
    setEditingQuestion(null);
    setFormNomor('');
    setFormKategoriId(unitCategories[0]?.id || '');
    setFormTargetUnit(selectedUnit);
    setFormPernyataan('');
    setFormDefinisi('');
    setFormDasarHukum('');
    setFormBobot(100);
    setFormOptions([
      { id: 'a', huruf: 'a', teks: '', level: 0, skor: 0, isNegativeTrigger: true },
      { id: 'b', huruf: 'b', teks: '', level: 1, skor: 25 },
      { id: 'c', huruf: 'c', teks: '', level: 2, skor: 50 },
      { id: 'd', huruf: 'd', teks: '', level: 3, skor: 75 },
      { id: 'e', huruf: 'e', teks: '', level: 4, skor: 100 },
    ]);
    setFormLogicRules([]);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formPernyataan) return;

    const questionToSave: AuditQuestion = {
      id: editingQuestion?.id || `Q-${formTargetUnit}-${Date.now()}`,
      nomor: formNomor,
      kategoriId: formKategoriId || unitCategories[0]?.id,
      targetUnit: formTargetUnit,
      pernyataan: formPernyataan,
      definisiOperasional: formDefinisi,
      dasarHukum: formDasarHukum,
      bobotMaksimal: Number(formBobot),
      options: formOptions,
      logicRules: formLogicRules,
    };

    let updatedList: AuditQuestion[];
    if (editingQuestion) {
      updatedList = questions.map((q) => (q.id === editingQuestion.id ? questionToSave : q));
    } else {
      updatedList = [...questions, questionToSave];
    }

    onSaveQuestions(updatedList);
    setEditingQuestion(null);
    setIsCreatingNew(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) {
      const updated = questions.filter((q) => q.id !== id);
      onSaveQuestions(updated);
      if (editingQuestion?.id === id) {
        setEditingQuestion(null);
        setIsCreatingNew(false);
      }
    }
  };

  const [ruleFeedback, setRuleFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddLogicRule = () => {
    if (newRuleTargetQuestions.length === 0) {
      setRuleFeedback({
        type: 'error',
        message: '⚠️ Silakan centang setidaknya satu butir soal target yang akan dinonaktifkan.',
      });
      setTimeout(() => setRuleFeedback(null), 4000);
      return;
    }

    const newRule: LogicRule = {
      id: `RULE-${Date.now()}`,
      sourceQuestionId: editingQuestion?.id || 'NEW_Q',
      triggerOptionIds: [newRuleTriggerOpt],
      targetQuestionIds: newRuleTargetQuestions,
      action: 'DISABLE',
      reasonMessage:
        newRuleReason.trim() ||
        `Dinonaktifkan otomatis karena pilihan opsi (${newRuleTriggerOpt.toUpperCase()}) pada butir ${formNomor || 'ini'}.`,
    };

    setFormLogicRules((prev) => [...prev, newRule]);
    setNewRuleTargetQuestions([]);
    setNewRuleReason('');
    setRuleFeedback({
      type: 'success',
      message: `✅ Aturan logic berhasil ditambahkan: Jika Opsi (${newRuleTriggerOpt.toUpperCase()}) dipilih ➔ Nonaktifkan ${newRule.targetQuestionIds.length} butir soal.`,
    });
    setTimeout(() => setRuleFeedback(null), 4000);
  };

  const handleRemoveLogicRule = (ruleId: string) => {
    setFormLogicRules((prev) => prev.filter((r) => r.id !== ruleId));
    setRuleFeedback({
      type: 'success',
      message: '✅ Aturan logic telah dihapus.',
    });
    setTimeout(() => setRuleFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="gov-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Instrumen & Alur Logika Soal ASKI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola butir pernyataan audit, pilihan bertingkat, skor, definisi operasional, dan aturan penonaktifan alur (*conditional branching*).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedUnit('UP')}
              className={`px-3 py-1 rounded-md transition ${
                selectedUnit === 'UP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Unit Pengolah (UP)
            </button>
            <button
              type="button"
              onClick={() => setSelectedUnit('UK')}
              className={`px-3 py-1 rounded-md transition ${
                selectedUnit === 'UK' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Unit Kearsipan (UK)
            </button>
          </div>

          <button
            type="button"
            onClick={startCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Butir Soal</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Builder (Left/Top) & Question List (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Modal/Section */}
        {(isCreatingNew || editingQuestion) && (
          <div className="lg:col-span-7 gov-card p-5 rounded-xl border border-purple-300 dark:border-purple-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                <span>{isCreatingNew ? 'Tambah Butir Soal Baru' : `Edit Butir Soal: ${formNomor}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingQuestion(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Row 1: Nomor, Kategori, Unit, Bobot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nomor / Kode Soal</label>
                  <input
                    type="text"
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    placeholder="misal: B.1"
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kategori / Aspek</label>
                  <select
                    value={formKategoriId}
                    onChange={(e) => setFormKategoriId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    {unitCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kode}. {c.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unit Sasaran</label>
                  <select
                    value={formTargetUnit}
                    onChange={(e) => setFormTargetUnit(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="UP">Unit Pengolah (UP)</option>
                    <option value="UK">Unit Kearsipan (UK)</option>
                    <option value="BOTH">Keduanya (UP & UK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Bobot Maks</label>
                  <input
                    type="number"
                    value={formBobot}
                    onChange={(e) => setFormBobot(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
              </div>

              {/* Pernyataan Induk */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pernyataan Induk Soal</label>
                <textarea
                  rows={2}
                  value={formPernyataan}
                  onChange={(e) => setFormPernyataan(e.target.value)}
                  placeholder="Contoh: Unit pengolah melayankan arsip aktif konvensional berdasarkan SKKAAD."
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Definisi Operasional & Panduan Bukti Dukung */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Definisi Operasional & Panduan Bukti Dukung</span>
                </label>
                <textarea
                  rows={3}
                  value={formDefinisi}
                  onChange={(e) => setFormDefinisi(e.target.value)}
                  placeholder="Tuliskan petunjuk jenis bukti dukung yang harus disampaikan (misal: Daftar Arsip Aktif, Foto Out Sheet, Buku Layanan, dll.)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Dasar Hukum */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dasar Hukum (SKKAAD / Peraturan)</span>
                </label>
                <input
                  type="text"
                  value={formDasarHukum}
                  onChange={(e) => setFormDasarHukum(e.target.value)}
                  placeholder="misal: SKKAAD yang berlaku di masing-masing instansi / Perbup Kotabaru"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Pilihan Opsi Bertingkat (a s.d. e) */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-purple-300 font-bold mb-2">
                  Konfigurasi Opsi Pilihan, Level & Skor
                </label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs mt-1 border border-slate-700">
                        {opt.huruf.toUpperCase()}
                      </span>
                      <div className="flex-1 space-y-1">
                        <textarea
                          rows={1}
                          value={opt.teks}
                          onChange={(e) => {
                            const updated = [...formOptions];
                            updated[idx].teks = e.target.value;
                            setFormOptions(updated);
                          }}
                          placeholder={`Deskripsi kriteria pilihan ${opt.huruf}...`}
                          className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <label className="flex items-center gap-1">
                            <span>Level:</span>
                            <input
                              type="number"
                              value={opt.level}
                              onChange={(e) => {
                                const updated = [...formOptions];
                                updated[idx].level = Number(e.target.value);
                                setFormOptions(updated);
                              }}
                              className="w-12 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200"
                            />
                          </label>
                          <label className="flex items-center gap-1">
                            <span>Skor:</span>
                            <input
                              type="number"
                              value={opt.skor}
                              onChange={(e) => {
                                const updated = [...formOptions];
                                updated[idx].skor = Number(e.target.value);
                                setFormOptions(updated);
                              }}
                              className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200 font-bold text-emerald-400"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION CONDITIONAL LOGIC / ALUR PENONAKTIFAN SOAL */}
              <div className="pt-3 border-t border-purple-500/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-purple-300">
                    Alur Ketergantungan Soal (*Conditional Branching Logic*)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mb-3">
                  Atur soal lain mana saja yang otomatis dinonaktifkan (*disabled*) jika pengguna memilih opsi tertentu pada soal ini.
                </p>

                {/* Existing Rules */}
                {formLogicRules.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formLogicRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-2.5 bg-purple-950/40 border border-purple-500/40 rounded-lg flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-purple-200 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 bg-purple-800 text-white rounded text-[10px]">
                              JIKA OPSI: {rule.triggerOptionIds.map((o) => o.toUpperCase()).join(', ')}
                            </span>
                            <span>➔ Nonaktifkan Soal:</span>
                            <span className="text-amber-300 font-bold">
                              {rule.targetQuestionIds
                                .map((tId) => questions.find((q) => q.id === tId)?.nomor || tId)
                                .join(', ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Alasan: {rule.reasonMessage}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLogicRule(rule.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 shrink-0"
                          title="Hapus Aturan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Rule Controls */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Buat Aturan Percabangan / Nonaktifkan Soal
                    </span>
                  </div>

                  {/* 1. Pilih Opsi Pemicu */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1.5">
                      1. Jika Jawaban yang Dipilih adalah:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {formOptions.map((o) => {
                        const isSelected = newRuleTriggerOpt === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setNewRuleTriggerOpt(o.id)}
                            className={`p-2 rounded-lg border text-left text-xs transition ${
                              isSelected
                                ? 'bg-purple-900/60 border-purple-400 text-white font-bold ring-1 ring-purple-400'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-300">Opsi {o.huruf.toUpperCase()}</span>
                              <span className="text-[10px] px-1 bg-slate-800 rounded">{o.skor} pt</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={o.teks}>
                              {o.teks || `Pilihan ${o.huruf.toUpperCase()}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Pilih Soal Target yang Akan Dinonaktifkan (Checkboxes) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] text-slate-300 font-semibold">
                        2. Maka Nonaktifkan (*Disable*) Soal Berikut ({newRuleTargetQuestions.length} dipilih):
                      </label>
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const availableIds = filteredQuestions
                              .filter((q) => q.id !== editingQuestion?.id)
                              .map((q) => q.id);
                            setNewRuleTargetQuestions(availableIds);
                          }}
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          Pilih Semua
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => setNewRuleTargetQuestions([])}
                          className="text-slate-400 hover:text-slate-300 underline"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="max-h-44 overflow-y-auto p-2 bg-slate-900/90 rounded-lg border border-slate-700 space-y-1.5">
                      {filteredQuestions
                        .filter((q) => q.id !== editingQuestion?.id)
                        .map((q) => {
                          const isChecked = newRuleTargetQuestions.includes(q.id);
                          return (
                            <label
                              key={q.id}
                              className={`flex items-start gap-2.5 p-2 rounded-md border cursor-pointer select-none transition text-xs ${
                                isChecked
                                  ? 'bg-purple-950/60 border-purple-500/80 text-white'
                                  : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRuleTargetQuestions([...newRuleTargetQuestions, q.id]);
                                  } else {
                                    setNewRuleTargetQuestions(
                                      newRuleTargetQuestions.filter((id) => id !== q.id)
                                    );
                                  }
                                }}
                                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-purple-300">{q.nomor}</span>
                                  <span className="truncate">{q.pernyataan}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  {/* 3. Alasan Penonaktifan */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      3. Alasan / Keterangan Penonaktifan (Ditampilkan ke User):
                    </label>
                    <input
                      type="text"
                      value={newRuleReason}
                      onChange={(e) => setNewRuleReason(e.target.value)}
                      placeholder={`Contoh: Dinonaktifkan karena unit belum memiliki daftar arsip aktif pada butir ${formNomor || 'ini'}.`}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Tombol Terapkan Aturan */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      * Aturan akan masuk ke daftar di atas, lalu klik <strong>Simpan Perubahan Soal</strong>.
                    </span>
                    <button
                      type="button"
                      onClick={handleAddLogicRule}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/50 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Terapkan Aturan Logic</span>
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {ruleFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-medium border animate-fadeIn ${
                        ruleFeedback.type === 'success'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/80 border-rose-500 text-rose-300'
                      }`}
                    >
                      {ruleFeedback.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingQuestion(null);
                  }}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Soal</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Question List View (Right / Full width when not editing) */}
        <div className={`${isCreatingNew || editingQuestion ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Daftar Soal Instrumen {selectedUnit} ({filteredQuestions.length} Butir)
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredQuestions.map((q) => {
              const cat = categories.find((c) => c.id === q.kategoriId);
              const hasRules = q.logicRules && q.logicRules.length > 0;

              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-xl border transition shadow-sm ${
                    editingQuestion?.id === q.id
                      ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-400 dark:border-purple-500'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
                        {q.nomor}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {cat?.nama}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditQuestion(q)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Edit Butir Soal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        title="Hapus Butir Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-2 leading-relaxed">
                    {q.pernyataan}
                  </h4>

                  {/* Logic indicator badges */}
                  {hasRules && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30 font-medium">
                      <GitBranch className="w-3 h-3" />
                      <span>{q.logicRules?.length} Aturan Alur Branching</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
