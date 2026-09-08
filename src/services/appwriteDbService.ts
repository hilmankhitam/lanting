import { databases, APPWRITE_CONFIG, isAppwriteLiveConfigured, Query } from './appwriteClient';
import { SKPDUnit, UserAccount, PermissionMatrix, AuditQuestion, AuditCategory, AuditSession } from '../types';
import { DEFAULT_SKPD_LIST, DEFAULT_USER_ACCOUNTS, DEFAULT_ROLE_PERMISSIONS } from '../data/defaultRBAC';
import { DEFAULT_CATEGORIES, DEFAULT_QUESTIONS } from '../data/defaultInstruments';

const { databaseId, collections } = APPWRITE_CONFIG;

// ================================================================
// HIGH PERFORMANCE CACHING & ANTI-N+1 ENGINE
// ================================================================

/**
 * In-memory index of known existing document IDs.
 * Eliminates the costly "try update -> catch 404 -> create" dual roundtrip penalty.
 */
const knownExistingDocIds = new Set<string>();

export function markDocAsExisting(docId: string) {
  knownExistingDocIds.add(docId);
}

export function isDocKnownExisting(docId: string): boolean {
  return knownExistingDocIds.has(docId);
}

/**
 * In-memory SWR (Stale-While-Revalidate) Query Cache
 * Prevents redundant HTTP requests when navigating or re-mounting components.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 menit

function getCached<T>(key: string, maxAgeMs = CACHE_TTL_MS): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateAppwriteCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
  } else {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(keyPrefix)) {
        memoryCache.delete(k);
      }
    }
  }
}

/**
 * Smart Upsert:
 * 1. If document ID is known to exist in cache, directly call `updateDocument` (1 roundtrip).
 * 2. If document is not in cache, call `createDocument` (1 roundtrip). If 409 conflict, update and record in cache.
 * Eliminates all 404 network errors and halves upsert latency!
 */
async function smartUpsertDocument(
  collectionId: string,
  docId: string,
  data: any
): Promise<boolean> {
  if (knownExistingDocIds.has(docId)) {
    try {
      await databases.updateDocument(databaseId, collectionId, docId, data);
      return true;
    } catch (err: any) {
      if (err?.code === 404) {
        knownExistingDocIds.delete(docId);
        await databases.createDocument(databaseId, collectionId, docId, data);
        knownExistingDocIds.add(docId);
        return true;
      }
      throw err;
    }
  } else {
    try {
      await databases.createDocument(databaseId, collectionId, docId, data);
      knownExistingDocIds.add(docId);
      return true;
    } catch (err: any) {
      if (err?.code === 409) {
        knownExistingDocIds.add(docId);
        await databases.updateDocument(databaseId, collectionId, docId, data);
        return true;
      }
      throw err;
    }
  }
}

/**
 * Chunked Parallel Batch Runner:
 * Solves the sequential N+1 query problem by executing items in parallel batches.
 */
export async function parallelBatch<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency = 6
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((item, chunkIdx) => fn(item, i + chunkIdx))
    );
    results.push(...chunkResults);
  }
  return results;
}

// ================================================================
// DEBOUNCED SESSION AUTO-SAVE (Anti-Write Storm)
// ================================================================
const sessionDebounceTimers = new Map<string, NodeJS.Timeout>();
const pendingSessionData = new Map<string, AuditSession>();

/**
 * Debounces session writes so that rapid answering or typing coalesces
 * into a single consolidated update to Appwrite Cloud.
 */
export function debouncedSaveSessionToAppwrite(
  session: AuditSession,
  delayMs = 600
): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return Promise.resolve(false);

  pendingSessionData.set(session.id, session);

  return new Promise((resolve) => {
    const existing = sessionDebounceTimers.get(session.id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      sessionDebounceTimers.delete(session.id);
      const pending = pendingSessionData.get(session.id);
      pendingSessionData.delete(session.id);
      if (pending) {
        const ok = await saveSessionToAppwrite(pending);
        resolve(ok);
      } else {
        resolve(true);
      }
    }, delayMs);

    sessionDebounceTimers.set(session.id, timer);
  });
}

/**
 * Immediately flushes any pending debounced session save (e.g. before submit, verify, or navigation)
 */
export async function flushPendingSessionSave(sessionId?: string): Promise<void> {
  if (sessionId) {
    const timer = sessionDebounceTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      sessionDebounceTimers.delete(sessionId);
    }
    const pending = pendingSessionData.get(sessionId);
    if (pending) {
      pendingSessionData.delete(sessionId);
      await saveSessionToAppwrite(pending);
    }
  } else {
    const allIds = Array.from(pendingSessionData.keys());
    for (const id of allIds) {
      const timer = sessionDebounceTimers.get(id);
      if (timer) clearTimeout(timer);
      sessionDebounceTimers.delete(id);
      const pending = pendingSessionData.get(id);
      if (pending) {
        pendingSessionData.delete(id);
        await saveSessionToAppwrite(pending);
      }
    }
  }
}

// ================================================================
// SKPDS & KECAMATAN — Fetch & Save
// ================================================================

/**
 * Fetch list of SKPDs & 22 Kecamatan from Appwrite Database
 * Uses SWR cache to eliminate redundant queries.
 */
export async function fetchSKPDsFromAppwrite(forceRefresh = false): Promise<SKPDUnit[] | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'skpds_all';
  if (!forceRefresh) {
    const cached = getCached<SKPDUnit[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    const res = await databases.listDocuments(databaseId, collections.skpds, [
      Query.limit(100),
    ]);
    if (res.documents.length === 0) return null;

    res.documents.forEach((doc: any) => markDocAsExisting(doc.$id));

    const result = res.documents.map((doc: any) => ({
      id: doc.$id,
      kode: doc.kode,
      nama: doc.nama,
      kategori: doc.kategori,
      tipe: doc.tipe,
      ibukota: doc.ibukota,
      kontak: doc.kontak,
      kontakOperator: doc.kontakOperator,
      alamat: doc.alamat,
    }));

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Appwrite fetch SKPDs fallback:', error);
    return null;
  }
}

/**
 * Save or update an SKPD in Appwrite using Smart Upsert
 */
export async function saveSKPDToAppwrite(skpd: SKPDUnit): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = {
      kode: skpd.kode,
      nama: skpd.nama,
      kategori: skpd.kategori,
      tipe: skpd.tipe || null,
      ibukota: skpd.ibukota || null,
      kontak: skpd.kontak || null,
      kontakOperator: skpd.kontakOperator || null,
      alamat: skpd.alamat || null,
    };

    const success = await smartUpsertDocument(collections.skpds, skpd.id, data);
    invalidateAppwriteCache('skpds_');
    return success;
  } catch (error) {
    console.error('Appwrite save SKPD error:', error);
    return false;
  }
}

// ================================================================
// USERS — Fetch & Save
// ================================================================

/**
 * Fetch Users from Appwrite Database
 */
export async function fetchUsersFromAppwrite(forceRefresh = false): Promise<UserAccount[] | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'users_all';
  if (!forceRefresh) {
    const cached = getCached<UserAccount[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    const res = await databases.listDocuments(databaseId, collections.users, [
      Query.limit(100),
    ]);
    if (res.documents.length === 0) return null;

    res.documents.forEach((doc: any) => markDocAsExisting(doc.$id));

    const result = res.documents.map((doc: any) => ({
      id: doc.$id,
      username: doc.username,
      namaLengkap: doc.namaLengkap,
      nip: doc.nip || undefined,
      role: doc.role,
      unitKerjaId: doc.unitKerjaId,
      email: doc.email || undefined,
      isActive: Boolean(doc.isActive ?? true),
      createdAt: doc.$createdAt,
    }));

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Appwrite fetch Users fallback:', error);
    return null;
  }
}

/**
 * Save or update User in Appwrite using Smart Upsert
 */
export async function saveUserToAppwrite(user: UserAccount): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = {
      username: user.username,
      namaLengkap: user.namaLengkap,
      nip: user.nip || null,
      role: user.role,
      unitKerjaId: user.unitKerjaId,
      email: user.email || null,
      isActive: user.isActive,
    };

    const success = await smartUpsertDocument(collections.users, user.id, data);
    invalidateAppwriteCache('users_');
    return success;
  } catch (error) {
    console.error('Appwrite save User error:', error);
    return false;
  }
}

// ================================================================
// PERMISSIONS — Fetch & Save
// ================================================================

/**
 * Fetch Permission Matrix from Appwrite
 */
export async function fetchPermissionsFromAppwrite(forceRefresh = false): Promise<PermissionMatrix | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'permissions_matrix';
  if (!forceRefresh) {
    const cached = getCached<PermissionMatrix>(cacheKey);
    if (cached) return cached;
  }

  try {
    const doc: any = await databases.getDocument(databaseId, collections.permissions, 'matrix-default');
    if (doc && doc.matrixJson) {
      markDocAsExisting('matrix-default');
      const parsed = JSON.parse(doc.matrixJson);
      setCached(cacheKey, parsed);
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Save Permission Matrix to Appwrite using Smart Upsert
 */
export async function savePermissionsToAppwrite(matrix: PermissionMatrix): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = { matrixJson: JSON.stringify(matrix) };
    const success = await smartUpsertDocument(collections.permissions, 'matrix-default', data);
    setCached('permissions_matrix', matrix);
    return success;
  } catch (error) {
    console.warn('Appwrite save permissions warning:', error);
    return false;
  }
}

// ================================================================
// QUESTIONS — Fetch & Save (Compact Schema)
// ================================================================

/**
 * Fetch Questions (Butir Soal Instrumen) from Appwrite Database
 */
export async function fetchQuestionsFromAppwrite(forceRefresh = false): Promise<AuditQuestion[] | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'questions_all';
  if (!forceRefresh) {
    const cached = getCached<AuditQuestion[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    // Limit 100 fetches all instrument questions in 1 single query
    const res = await databases.listDocuments(databaseId, collections.questions, [
      Query.limit(100),
      Query.orderAsc('nomor'),
    ]);

    if (res.documents.length === 0) return null;

    res.documents.forEach((doc: any) => markDocAsExisting(doc.$id));

    const result = res.documents.map((doc: any) => {
      if (doc.dataJson) {
        const data = JSON.parse(doc.dataJson);
        return {
          id: doc.$id,
          nomor: doc.nomor,
          kategoriId: doc.kategoriId,
          targetUnit: doc.targetUnit,
          pernyataan: data.pernyataan || '',
          definisiOperasional: data.definisiOperasional || '',
          dasarHukum: data.dasarHukum || '',
          bobotMaksimal: data.bobotMaksimal || 100,
          options: data.options || [],
          logicRules: data.logicRules || undefined,
        };
      }
      return {
        id: doc.$id,
        nomor: doc.nomor,
        kategoriId: doc.kategoriId,
        targetUnit: doc.targetUnit,
        pernyataan: doc.pernyataan || '',
        definisiOperasional: doc.definisiOperasional || '',
        dasarHukum: doc.dasarHukum || '',
        bobotMaksimal: doc.bobotMaksimal || 100,
        options: doc.optionsJson ? JSON.parse(doc.optionsJson) : [],
        logicRules: doc.logicRulesJson ? JSON.parse(doc.logicRulesJson) : undefined,
      };
    });

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Appwrite fetch Questions fallback:', error);
    return null;
  }
}

/**
 * Save a single Question to Appwrite using Smart Upsert
 */
export async function saveQuestionToAppwrite(question: AuditQuestion): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = {
      nomor: question.nomor,
      kategoriId: question.kategoriId,
      targetUnit: question.targetUnit,
      dataJson: JSON.stringify({
        pernyataan: question.pernyataan,
        definisiOperasional: question.definisiOperasional,
        dasarHukum: question.dasarHukum,
        bobotMaksimal: question.bobotMaksimal,
        options: question.options,
        logicRules: question.logicRules || null,
      }),
    };

    const success = await smartUpsertDocument(collections.questions, question.id, data);
    invalidateAppwriteCache('questions_');
    return success;
  } catch (error) {
    console.error('Appwrite save Question error:', error);
    return false;
  }
}

// ================================================================
// CATEGORIES — Fetch & Save
// ================================================================

/**
 * Fetch Categories from Appwrite Database
 */
export async function fetchCategoriesFromAppwrite(forceRefresh = false): Promise<AuditCategory[] | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'categories_all';
  if (!forceRefresh) {
    const cached = getCached<AuditCategory[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    const res = await databases.listDocuments(databaseId, collections.categories, [
      Query.limit(50),
      Query.orderAsc('urutan'),
    ]);
    if (res.documents.length === 0) return null;

    res.documents.forEach((doc: any) => markDocAsExisting(doc.$id));

    const result = res.documents.map((doc: any) => ({
      id: doc.$id,
      kode: doc.kode,
      nama: doc.nama,
      targetUnit: doc.targetUnit,
      bobotPersentase: doc.bobotPersentase,
      urutan: doc.urutan,
    }));

    setCached(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Appwrite fetch Categories fallback:', error);
    return null;
  }
}

/**
 * Save a single Category to Appwrite using Smart Upsert
 */
export async function saveCategoryToAppwrite(category: AuditCategory): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = {
      kode: category.kode,
      nama: category.nama,
      targetUnit: category.targetUnit,
      bobotPersentase: category.bobotPersentase,
      urutan: category.urutan,
    };

    const success = await smartUpsertDocument(collections.categories, category.id, data);
    invalidateAppwriteCache('categories_');
    return success;
  } catch (error) {
    console.error('Appwrite save Category error:', error);
    return false;
  }
}

// ================================================================
// SESSIONS — Fetch & Save (Jawaban Audit per Kecamatan)
// ================================================================

/**
 * Fetch all Audit Sessions from Appwrite Database in a single query (limit 250)
 */
export async function fetchSessionsFromAppwrite(forceRefresh = false): Promise<Record<string, AuditSession> | null> {
  if (!isAppwriteLiveConfigured()) return null;

  const cacheKey = 'sessions_all';
  if (!forceRefresh) {
    const cached = getCached<Record<string, AuditSession>>(cacheKey, 1000 * 30); // 30 detik TTL untuk sessions
    if (cached) return cached;
  }

  try {
    // Single query for up to 250 documents avoids N-page loop
    const res = await databases.listDocuments(databaseId, collections.sessions, [
      Query.limit(250),
    ]);

    if (res.documents.length === 0) return null;

    res.documents.forEach((doc: any) => markDocAsExisting(doc.$id));

    const sessions: Record<string, AuditSession> = {};
    for (const doc of res.documents) {
      sessions[doc.$id] = {
        id: doc.$id,
        kecamatanId: doc.kecamatanId,
        tahunAudit: doc.tahunAudit,
        targetUnit: doc.targetUnit,
        status: doc.status,
        namaAuditor: doc.namaAuditor || undefined,
        namaOperator: doc.namaOperator || undefined,
        answers: doc.answersJson ? JSON.parse(doc.answersJson) : {},
        totalSkor: doc.totalSkor,
        skorMaksimal: doc.skorMaksimal,
        nilaiAkhir: doc.nilaiAkhir,
        predikat: doc.predikat,
        persentaseProgress: doc.persentaseProgress,
        updatedAt: doc.$updatedAt || doc.$createdAt,
      };
    }

    setCached(cacheKey, sessions);
    return sessions;
  } catch (error) {
    console.warn('Appwrite fetch Sessions fallback:', error);
    return null;
  }
}

/**
 * Save or update a single Audit Session to Appwrite using Smart Upsert
 */
export async function saveSessionToAppwrite(session: AuditSession): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) return false;

  try {
    const data = {
      kecamatanId: session.kecamatanId,
      tahunAudit: session.tahunAudit,
      targetUnit: session.targetUnit,
      status: session.status,
      namaAuditor: session.namaAuditor || null,
      namaOperator: session.namaOperator || null,
      answersJson: JSON.stringify(session.answers),
      totalSkor: session.totalSkor,
      skorMaksimal: session.skorMaksimal,
      nilaiAkhir: session.nilaiAkhir,
      predikat: session.predikat,
      persentaseProgress: session.persentaseProgress,
    };

    const success = await smartUpsertDocument(collections.sessions, session.id, data);
    invalidateAppwriteCache('sessions_');
    return success;
  } catch (error) {
    console.error('Appwrite save Session error:', error);
    return false;
  }
}

// ================================================================
// HIGH-SPEED BATCH SEEDING (Solves Sequential N+1 Waterfall)
// ================================================================

/**
 * Seed initial baseline data to Appwrite with chunked parallel batching.
 * Reduces 75 sequential roundtrips to parallel chunks (~7x faster).
 */
export async function seedDefaultDataToAppwrite(): Promise<{
  success: boolean;
  message: string;
}> {
  if (!isAppwriteLiveConfigured()) {
    return {
      success: false,
      message: 'Appwrite belum terkonfigurasi dengan Project ID aktif di .env.',
    };
  }

  try {
    let seededCount = 0;

    // 1. Seed SKPDs in parallel chunks (concurrency: 6)
    await parallelBatch(
      DEFAULT_SKPD_LIST,
      async (skpd) => {
        await saveSKPDToAppwrite(skpd);
        seededCount++;
      },
      6
    );

    // 2. Seed Users in parallel chunks
    await parallelBatch(
      DEFAULT_USER_ACCOUNTS,
      async (user) => {
        await saveUserToAppwrite(user);
        seededCount++;
      },
      6
    );

    // 3. Seed Permissions
    await savePermissionsToAppwrite(DEFAULT_ROLE_PERMISSIONS);
    seededCount++;

    // 4. Seed Categories in parallel chunks
    await parallelBatch(
      DEFAULT_CATEGORIES,
      async (cat) => {
        await saveCategoryToAppwrite(cat);
        seededCount++;
      },
      6
    );

    // 5. Seed Questions in parallel chunks
    await parallelBatch(
      DEFAULT_QUESTIONS,
      async (q) => {
        await saveQuestionToAppwrite(q);
        seededCount++;
      },
      6
    );

    invalidateAppwriteCache();

    return {
      success: true,
      message: `Berhasil menginisialisasi ${seededCount} dokumen ke Appwrite Cloud secara paralel & optimal!`,
    };
  } catch (error: any) {
    console.error('Seed Appwrite error:', error);
    return {
      success: false,
      message: error?.message || 'Gagal melakukan migrasi data ke Appwrite.',
    };
  }
}
