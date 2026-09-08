/**
 * ============================================================
 * ASKI Kotabaru — Appwrite Cloud Setup Script v3 (Robust & Safe)
 * ============================================================
 * Menyiapkan Database, 6 Collections, Attributes, Indexes, dan Storage Bucket
 * di Appwrite Cloud dengan penanganan error dan delay yang aman.
 * ============================================================
 */
import 'dotenv/config';
import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '6a9d84f600351db611e2';
const BUCKET_ID = process.env.VITE_APPWRITE_BUCKET_EVIDENCE || '6a9d856a002444edfc4c';

const COL = {
  skpds: process.env.VITE_APPWRITE_COLLECTION_SKPDS || 'skpds',
  users: process.env.VITE_APPWRITE_COLLECTION_USERS || 'users',
  permissions: process.env.VITE_APPWRITE_COLLECTION_PERMISSIONS || 'permissions',
  questions: process.env.VITE_APPWRITE_COLLECTION_QUESTIONS || 'questions',
  categories: process.env.VITE_APPWRITE_COLLECTION_CATEGORIES || 'categories',
  sessions: process.env.VITE_APPWRITE_COLLECTION_SESSIONS || 'sessions',
};

if (!PROJECT_ID) {
  console.error('❌ VITE_APPWRITE_PROJECT_ID kosong di .env');
  process.exit(1);
}
if (!API_KEY) {
  console.error('❌ APPWRITE_API_KEY kosong di .env');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Full access permissions for both authenticated and guest client access
const collectionPermissions = [
  Permission.read(Role.any()),
  Permission.create(Role.any()),
  Permission.update(Role.any()),
  Permission.delete(Role.any()),
];

async function safeExec<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const result = await fn();
    console.log(`  ✅ ${label}`);
    return result;
  } catch (err: any) {
    if (err?.code === 409) {
      console.log(`  ⏭️  ${label} (sudah ada / skip)`);
      return null;
    }
    console.log(`  ⚠️  ${label}: [${err?.code || 'ERR'}] ${err?.message || err}`);
    return null;
  }
}

async function waitForAttributes(collectionId: string, maxWaitMs = 15000) {
  const start = Date.now();
  process.stdout.write('     Menunggu attributes ready...');
  while (Date.now() - start < maxWaitMs) {
    try {
      const coll = await databases.getCollection(DATABASE_ID, collectionId);
      const allAvailable = coll.attributes.every((attr: any) => attr.status === 'available');
      if (allAvailable && coll.attributes.length > 0) {
        console.log(' ready!');
        return;
      }
    } catch {
      // ignore
    }
    process.stdout.write('.');
    await delay(1500);
  }
  console.log(' timeout, lanjut.');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ASKI Kotabaru — Appwrite Cloud Setup v3        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint:    ${ENDPOINT}`);
  console.log(`  Project ID:  ${PROJECT_ID}`);
  console.log(`  Database ID: ${DATABASE_ID}`);
  console.log(`  Bucket ID:   ${BUCKET_ID}`);

  // 1. Database
  console.log('\n📦 1. Database:');
  try {
    const db = await databases.get(DATABASE_ID);
    console.log(`  ✅ Database ditemukan: "${db.name}" (${db.$id})`);
  } catch {
    await safeExec('Create Database', () =>
      databases.create(DATABASE_ID, 'ASKI Kotabaru', true)
    );
  }
  await delay(1500);

  // 2. Collection: SKPDs
  console.log('\n🏢 2. Collection: skpds');
  await safeExec('Create collection skpds', () =>
    databases.createCollection(DATABASE_ID, COL.skpds, 'SKPD & Kecamatan', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr kode', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'kode', 30, true));
  await safeExec('attr nama', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'nama', 200, true));
  await safeExec('attr kategori', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'kategori', 30, true));
  await safeExec('attr tipe', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'tipe', 30, false));
  await safeExec('attr ibukota', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'ibukota', 100, false));
  await safeExec('attr kontak', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'kontak', 50, false));
  await safeExec('attr kontakOperator', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'kontakOperator', 50, false));
  await safeExec('attr alamat', () => databases.createStringAttribute(DATABASE_ID, COL.skpds, 'alamat', 255, false));
  await waitForAttributes(COL.skpds);
  await safeExec('idx kode', () => databases.createIndex(DATABASE_ID, COL.skpds, 'kode_idx', 'key', ['kode'], ['ASC']));

  // 3. Collection: Users
  console.log('\n👤 3. Collection: users');
  await safeExec('Create collection users', () =>
    databases.createCollection(DATABASE_ID, COL.users, 'Akun Pengguna', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr username', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'username', 50, true));
  await safeExec('attr namaLengkap', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'namaLengkap', 100, true));
  await safeExec('attr nip', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'nip', 50, false));
  await safeExec('attr role', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'role', 20, true));
  await safeExec('attr unitKerjaId', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'unitKerjaId', 50, true));
  await safeExec('attr email', () => databases.createStringAttribute(DATABASE_ID, COL.users, 'email', 100, false));
  await safeExec('attr isActive', () => databases.createBooleanAttribute(DATABASE_ID, COL.users, 'isActive', false, true));
  await waitForAttributes(COL.users);
  await safeExec('idx username', () => databases.createIndex(DATABASE_ID, COL.users, 'username_idx', 'key', ['username'], ['ASC']));
  await safeExec('idx role', () => databases.createIndex(DATABASE_ID, COL.users, 'role_idx', 'key', ['role'], ['ASC']));

  // 4. Collection: Permissions
  console.log('\n🔐 4. Collection: permissions');
  await safeExec('Create collection permissions', () =>
    databases.createCollection(DATABASE_ID, COL.permissions, 'Matriks Izin', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr matrixJson', () => databases.createStringAttribute(DATABASE_ID, COL.permissions, 'matrixJson', 10000, true));
  await waitForAttributes(COL.permissions);

  // 5. Collection: Categories
  console.log('\n📂 5. Collection: categories');
  await safeExec('Create collection categories', () =>
    databases.createCollection(DATABASE_ID, COL.categories, 'Kategori Audit', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr kode', () => databases.createStringAttribute(DATABASE_ID, COL.categories, 'kode', 10, true));
  await safeExec('attr nama', () => databases.createStringAttribute(DATABASE_ID, COL.categories, 'nama', 150, true));
  await safeExec('attr targetUnit', () => databases.createStringAttribute(DATABASE_ID, COL.categories, 'targetUnit', 10, true));
  await safeExec('attr bobotPersentase', () => databases.createFloatAttribute(DATABASE_ID, COL.categories, 'bobotPersentase', true));
  await safeExec('attr urutan', () => databases.createIntegerAttribute(DATABASE_ID, COL.categories, 'urutan', true));
  await waitForAttributes(COL.categories);
  await safeExec('idx urutan', () => databases.createIndex(DATABASE_ID, COL.categories, 'urutan_idx', 'key', ['urutan'], ['ASC']));

  // 6. Collection: Questions (compact dataJson schema)
  console.log('\n❓ 6. Collection: questions');
  await safeExec('Create collection questions', () =>
    databases.createCollection(DATABASE_ID, COL.questions, 'Butir Soal SKKAAD', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr nomor', () => databases.createStringAttribute(DATABASE_ID, COL.questions, 'nomor', 20, true));
  await safeExec('attr kategoriId', () => databases.createStringAttribute(DATABASE_ID, COL.questions, 'kategoriId', 30, true));
  await safeExec('attr targetUnit', () => databases.createStringAttribute(DATABASE_ID, COL.questions, 'targetUnit', 10, true));
  await safeExec('attr dataJson', () => databases.createStringAttribute(DATABASE_ID, COL.questions, 'dataJson', 20000, true));
  await waitForAttributes(COL.questions);
  await safeExec('idx nomor', () => databases.createIndex(DATABASE_ID, COL.questions, 'nomor_idx', 'key', ['nomor'], ['ASC']));

  // 7. Collection: Sessions (Audit Responses)
  console.log('\n📝 7. Collection: sessions');
  await safeExec('Create collection sessions', () =>
    databases.createCollection(DATABASE_ID, COL.sessions, 'Sesi Audit Kecamatan', collectionPermissions, true)
  );
  await delay(1000);
  await safeExec('attr kecamatanId', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'kecamatanId', 50, true));
  await safeExec('attr tahunAudit', () => databases.createIntegerAttribute(DATABASE_ID, COL.sessions, 'tahunAudit', true));
  await safeExec('attr targetUnit', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'targetUnit', 10, true));
  await safeExec('attr status', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'status', 20, true));
  await safeExec('attr namaAuditor', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'namaAuditor', 100, false));
  await safeExec('attr namaOperator', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'namaOperator', 100, false));
  await safeExec('attr answersJson', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'answersJson', 500000, false));
  await safeExec('attr totalSkor', () => databases.createFloatAttribute(DATABASE_ID, COL.sessions, 'totalSkor', false));
  await safeExec('attr skorMaksimal', () => databases.createFloatAttribute(DATABASE_ID, COL.sessions, 'skorMaksimal', false));
  await safeExec('attr nilaiAkhir', () => databases.createFloatAttribute(DATABASE_ID, COL.sessions, 'nilaiAkhir', false));
  await safeExec('attr predikat', () => databases.createStringAttribute(DATABASE_ID, COL.sessions, 'predikat', 10, false));
  await safeExec('attr persentaseProgress', () => databases.createFloatAttribute(DATABASE_ID, COL.sessions, 'persentaseProgress', false));
  await waitForAttributes(COL.sessions);
  await safeExec('idx kec', () => databases.createIndex(DATABASE_ID, COL.sessions, 'kec_idx', 'key', ['kecamatanId'], ['ASC']));

  // 8. Storage Bucket
  console.log('\n🪣 8. Storage Bucket:');
  try {
    const b = await storage.getBucket(BUCKET_ID);
    console.log(`  ✅ Bucket ditemukan: "${b.name}" (${b.$id})`);
  } catch {
    await safeExec('Create Bucket', () =>
      storage.createBucket(
        BUCKET_ID,
        'Bukti Dukung Arsip',
        collectionPermissions,
        false,
        true,
        30000000,
        [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
      )
    );
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  🎉 SETUP DATABASE & COLLECTIONS BERHASIL!      ║');
  console.log('║  Langkah selanjutnya: npm run seed:appwrite      ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

main().catch((err) => {
  console.error('\n💥 Setup gagal:', err);
  process.exit(1);
});
