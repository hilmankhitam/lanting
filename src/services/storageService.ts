import { AuditCategory, AuditQuestion, AuditSession, SKPDUnit, UserAccount, PermissionMatrix } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_QUESTIONS } from '../data/defaultInstruments';
import { DEFAULT_SKPD_LIST, DEFAULT_USER_ACCOUNTS, DEFAULT_ROLE_PERMISSIONS } from '../data/defaultRBAC';
import { evaluateAuditLogic } from './logicEngine';

const STORAGE_KEYS = {
  QUESTIONS: 'aski_questions_v1',
  CATEGORIES: 'aski_categories_v1',
  SESSIONS: 'aski_sessions_v1',
  SKPDS: 'aski_skpds_v1',
  USERS: 'aski_users_v1',
  PERMISSIONS: 'aski_permissions_v1',
  ACTIVE_USER: 'aski_active_user_v1',
};

// 1. SKPD & Kecamatan Management
export function getStoredSKPDs(): SKPDUnit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SKPDS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading SKPDs from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.SKPDS, JSON.stringify(DEFAULT_SKPD_LIST));
  return DEFAULT_SKPD_LIST;
}

export function saveStoredSKPDs(skpds: SKPDUnit[]) {
  localStorage.setItem(STORAGE_KEYS.SKPDS, JSON.stringify(skpds));
}

// 2. User Accounts Management
export function getStoredUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading users from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USER_ACCOUNTS));
  return DEFAULT_USER_ACCOUNTS;
}

export function saveStoredUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// 3. Role Permissions Management
export function getStoredPermissions(): PermissionMatrix {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading permissions from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
  return DEFAULT_ROLE_PERMISSIONS;
}

export function saveStoredPermissions(permissions: PermissionMatrix) {
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
}

// 4. Active User Session Management
export function getStoredActiveUserId(): string {
  const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
  return id || 'user-superadmin';
}

export function saveStoredActiveUserId(id: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, id);
}

// 5. Questions Management
export function getStoredQuestions(): AuditQuestion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading questions from storage', e);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
  return DEFAULT_QUESTIONS;
}

export function saveStoredQuestions(questions: AuditQuestion[]) {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}

// 6. Categories Management
export function getStoredCategories(): AuditCategory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading categories from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: AuditCategory[]) {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

// 7. Sessions Management (SKPD & 22 Kecamatan, UP & UK)
export function getStoredSessions(): Record<string, AuditSession> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading sessions from storage', e);
  }

  // Initialize blank sessions for all SKPDs and kecamatans (both UP and UK)
  const initialSessions: Record<string, AuditSession> = {};
  const questions = DEFAULT_QUESTIONS;
  const categories = DEFAULT_CATEGORIES;
  const skpds = getStoredSKPDs();

  for (const skpd of skpds) {
    // UP Session
    const upId = `${skpd.id}_2025_UP`;
    const upEval = evaluateAuditLogic(questions, categories, {}, 'UP');
    initialSessions[upId] = {
      id: upId,
      kecamatanId: skpd.id,
      tahunAudit: 2025,
      targetUnit: 'UP',
      status: 'DRAFT',
      answers: upEval.evaluatedAnswers,
      totalSkor: 0,
      skorMaksimal: upEval.maxScore,
      nilaiAkhir: 0,
      predikat: 'D',
      persentaseProgress: 0,
      updatedAt: new Date().toISOString(),
    };

    // UK Session
    const ukId = `${skpd.id}_2025_UK`;
    const ukEval = evaluateAuditLogic(questions, categories, {}, 'UK');
    initialSessions[ukId] = {
      id: ukId,
      kecamatanId: skpd.id,
      tahunAudit: 2025,
      targetUnit: 'UK',
      status: 'DRAFT',
      answers: ukEval.evaluatedAnswers,
      totalSkor: 0,
      skorMaksimal: ukEval.maxScore,
      nilaiAkhir: 0,
      predikat: 'D',
      persentaseProgress: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  // Set sample seed data for Pulau Laut Sigam & Pulau Laut Utara for quick demonstration
  const sigamUp = initialSessions['kec-21_2025_UP'];
  if (sigamUp) {
    sigamUp.answers['Q-UP-A1'] = {
      questionId: 'Q-UP-A1',
      selectedOptionId: 'c',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [
        {
          id: 'ev-1',
          namaFile: 'Sampel_Register_Surat_Keluar_Sigam.pdf',
          tipe: 'PDF',
          url: 'https://kotabarukab.go.id/dokumen/register-sigam.pdf',
          sizeBytes: 1048576,
          uploadedAt: new Date().toISOString(),
          keterangan: 'Buku register penomoran surat keluar 2024.',
        },
      ],
    };
    sigamUp.answers['Q-UP-B1'] = {
      questionId: 'Q-UP-B1',
      selectedOptionId: 'e',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [
        {
          id: 'ev-2',
          namaFile: 'Daftar_Arsip_Aktif_dan_Sarana_Layanan_Sigam.pdf',
          tipe: 'PDF',
          url: 'https://kotabarukab.go.id/dokumen/daftar-arsip-aktif-sigam.pdf',
          sizeBytes: 2450000,
          uploadedAt: new Date().toISOString(),
          keterangan: 'Daftar arsip aktif berdasarkan SKKAAD + Buku layanan peminjaman arsip.',
        },
      ],
    };
    sigamUp.answers['Q-UP-B2'] = {
      questionId: 'Q-UP-B2',
      selectedOptionId: 'c',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [],
    };
    sigamUp.answers['Q-UP-B3'] = {
      questionId: 'Q-UP-B3',
      selectedOptionId: 'c',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [],
    };
    sigamUp.answers['Q-UP-C1'] = {
      questionId: 'Q-UP-C1',
      selectedOptionId: 'c',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [],
    };
    sigamUp.answers['Q-UP-D1'] = {
      questionId: 'Q-UP-D1',
      selectedOptionId: 'c',
      score: 100,
      level: 4,
      isDisabled: false,
      evidenceList: [],
    };

    const res = evaluateAuditLogic(questions, categories, sigamUp.answers, 'UP');
    sigamUp.answers = res.evaluatedAnswers;
    sigamUp.totalSkor = res.totalScore;
    sigamUp.nilaiAkhir = res.percentageScore;
    sigamUp.predikat = res.predikat;
    sigamUp.persentaseProgress = res.progressPercentage;
    sigamUp.status = 'SUBMITTED';
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
  return initialSessions;
}

export function saveStoredSession(session: AuditSession) {
  const sessions = getStoredSessions();
  sessions[session.id] = session;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function saveStoredSessions(sessions: Record<string, AuditSession>) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

// Reset all data to factory defaults
export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.SKPDS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  window.location.reload();
}
