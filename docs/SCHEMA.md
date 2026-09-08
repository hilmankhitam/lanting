# Skema Data Model ASKI (Audit Sistem Kearsipan Internal)

```typescript
// 1. Data Wilayah & Kecamatan
export interface Kecamatan {
  id: string;
  kode: string;
  nama: string; // misal: "Pulau Laut Sigam"
  tipe: 'Daratan' | 'Kepulauan';
  ibukota: string;
  kontakOperator?: string;
}

// 2. Opsi Pilihan Jawaban
export interface OptionChoice {
  id: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  huruf: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  teks: string; // 'Terdapat daftar arsip aktif berdasarkan SKKAAD...'
  level: number; // 0 s.d. 5
  skor: number; // 0, 25, 50, 75, 100
  isNegativeTrigger?: boolean; // penanda jika opsi ini menonaktifkan soal turunan
}

// 3. Aturan Ketergantungan Alur (Conditional Logic)
export interface LogicRule {
  targetQuestionId: string; // ID soal yang akan terkena efek
  condition: 'EQUALS_OPTION' | 'NOT_EQUALS_OPTION' | 'SCORE_LESS_THAN';
  value: string | number; // misal: opsi 'a' atau nilai 0
  action: 'DISABLE' | 'HIDE' | 'ENABLE';
  reasonMessage: string; // "Dinonaktifkan karena unit belum memiliki daftar arsip aktif"
}

// 4. Butir Soal / Instrumen Audit
export interface AuditQuestion {
  id: string; // misal: "UP-B1"
  nomor: string; // misal: "1" atau "B.1"
  kategoriId: string; // misal: "BAGIAN_KONVENSIONAL"
  targetUnit: 'UP' | 'UK' | 'BOTH';
  pernyataan: string;
  definisiOperasional: string;
  dasarHukum: string; // misal: "SKKAAD yang berlaku di masing-masing instansi"
  bobotMaksimal: number; // misal: 100 atau 200
  options: OptionChoice[];
  logicRules?: LogicRule[]; // aturan penonaktifan soal lain berdasarkan jawaban soal ini
  disabledByRules?: {
    sourceQuestionId: string;
    triggerOptionId: string;
  }[];
}

// 5. Kategori Instrumen
export interface AuditCategory {
  id: string;
  kode: string; // 'A', 'B', 'C'
  nama: string; // 'Bagian Konvensional', 'Pengelolaan Arsip Digital'
  targetUnit: 'UP' | 'UK' | 'BOTH';
  bobotPersentase: number; // Bobot aspek dalam total 100%
  urutan: number;
}

// 6. Bukti Dukung (Evidence)
export interface EvidenceFile {
  id: string;
  namaFile: string;
  tipe: 'PDF' | 'IMAGE' | 'LINK' | 'DOC';
  url: string;
  sizeBytes?: number;
  uploadedAt: string;
  keterangan?: string;
}

// 7. Pengisian Jawaban per Soal
export interface QuestionAnswer {
  questionId: string;
  selectedOptionId: string | null;
  score: number;
  level: number;
  isDisabled: boolean;
  disabledReason?: string;
  keteranganPengawas?: string;
  catatanObjekPengawasan?: string;
  evidenceList: EvidenceFile[];
}

// 8. Sesi Audit Kecamatan
export interface AuditSession {
  id: string;
  kecamatanId: string;
  tahunAudit: number;
  targetUnit: 'UP' | 'UK';
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'FINAL';
  namaAuditor?: string;
  namaOperator?: string;
  answers: Record<string, QuestionAnswer>;
  totalSkor: number;
  predikat: string; // 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'
  persentaseProgress: number;
  updatedAt: string;
}
```
