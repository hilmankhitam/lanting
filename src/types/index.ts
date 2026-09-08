export type UserRole = 'SUPERADMIN' | 'AUDITOR' | 'OPERATOR';

export type SKPDCategory = 'KECAMATAN' | 'DINAS' | 'BADAN' | 'SETDA' | 'SETWAN' | 'INSPEKTORAT' | 'RUMAH_SAKIT' | 'LAINNYA';

export interface Kecamatan {
  id: string;
  kode: string;
  nama: string;
  tipe: 'Daratan' | 'Kepulauan';
  ibukota: string;
  kontakOperator?: string;
  kategori?: SKPDCategory;
  kontak?: string;
  alamat?: string;
}

export interface SKPDUnit {
  id: string;
  kode: string;
  nama: string;
  kategori: SKPDCategory;
  tipe?: 'Daratan' | 'Kepulauan';
  ibukota?: string;
  kontak?: string;
  kontakOperator?: string;
  alamat?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  namaLengkap: string;
  nip?: string;
  role: UserRole;
  unitKerjaId: string; // SKPD ID or 'ALL'
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RolePermissions {
  canManageSKPD: boolean;
  canManageUsers: boolean;
  canConfigurePermissions: boolean;
  canManageInstruments: boolean;
  canEvaluateAudits: boolean;
  canFillAuditForm: boolean;
  canUploadEvidence: boolean;
  canViewAllRekap: boolean;
  canExportReports: boolean;
}

export type PermissionMatrix = Record<UserRole, RolePermissions>;

export interface OptionChoice {
  id: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  huruf: string;
  teks: string;
  level: number; // 0..5
  skor: number; // 0..100
  isNegativeTrigger?: boolean;
}

export interface LogicRule {
  id: string;
  sourceQuestionId: string; // Question that triggers this rule
  triggerOptionIds: string[]; // Options that trigger the rule (e.g. ['a'])
  targetQuestionIds: string[]; // Questions that will be disabled/skipped
  action: 'DISABLE' | 'HIDE';
  reasonMessage: string;
}

export interface AuditQuestion {
  id: string;
  nomor: string;
  kategoriId: string;
  targetUnit: 'UP' | 'UK' | 'BOTH';
  pernyataan: string;
  definisiOperasional: string;
  dasarHukum: string;
  bobotMaksimal: number;
  options: OptionChoice[];
  logicRules?: LogicRule[];
}

export interface AuditCategory {
  id: string;
  kode: string;
  nama: string;
  targetUnit: 'UP' | 'UK' | 'BOTH';
  bobotPersentase: number;
  urutan: number;
}

export interface EvidenceFile {
  id: string;
  namaFile: string;
  tipe: 'PDF' | 'IMAGE' | 'LINK' | 'DOC';
  url: string;
  appwriteFileId?: string;
  appwriteBucketId?: string;
  sizeBytes?: number;
  uploadedAt: string;
  keterangan?: string;
}

export interface QuestionAnswer {
  questionId: string;
  selectedOptionId: string | null;
  score: number;
  level: number;
  isDisabled: boolean;
  disabledReason?: string;
  catatanAuditor?: string;
  catatanObjekPengawasan?: string;
  evidenceList: EvidenceFile[];
}

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
  skorMaksimal: number;
  nilaiAkhir: number; // 0..100
  predikat: PredikatKearsipan;
  persentaseProgress: number;
  updatedAt: string;
}

export type PredikatKearsipan = 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D';

export interface PredikatInfo {
  kode: PredikatKearsipan;
  label: string;
  range: string;
  warna: string;
  bgWarna: string;
}

export type AppwriteConnectionStatus = 'connected' | 'demo-mode' | 'connecting' | 'error';

export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  collections: {
    skpds: string;
    users: string;
    permissions: string;
    questions: string;
    categories: string;
    sessions: string;
  };
  bucketEvidence: string;
}

