/**
 * ============================================================
 * ASKI Kotabaru — Appwrite Cloud Seed Script
 * ============================================================
 * Script ini meng-upload data default ke Appwrite Cloud:
 * - 51 Entitas (22 Kecamatan + 29 SKPD/OPD Kotabaru)
 * - 6 Akun Pengguna Default
 * - Matriks Izin (Role Permissions Matrix)
 * - Kategori & Butir Soal SKKAAD
 * ============================================================
 */
import 'dotenv/config';
import { Client, Databases } from 'appwrite';
import { DEFAULT_SKPD_LIST, DEFAULT_USER_ACCOUNTS, DEFAULT_ROLE_PERMISSIONS } from '../src/data/defaultRBAC';
import { DEFAULT_CATEGORIES, DEFAULT_QUESTIONS } from '../src/data/defaultInstruments';

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '';
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '6a9d84f600351db611e2';

const COL = {
  skpds: process.env.VITE_APPWRITE_COLLECTION_SKPDS || 'skpds',
  users: process.env.VITE_APPWRITE_COLLECTION_USERS || 'users',
  permissions: process.env.VITE_APPWRITE_COLLECTION_PERMISSIONS || 'permissions',
  questions: process.env.VITE_APPWRITE_COLLECTION_QUESTIONS || 'questions',
  categories: process.env.VITE_APPWRITE_COLLECTION_CATEGORIES || 'categories',
  sessions: process.env.VITE_APPWRITE_COLLECTION_SESSIONS || 'sessions',
};

if (!PROJECT_ID) {
  console.error('❌ Pastikan VITE_APPWRITE_PROJECT_ID terisi di .env');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

async function safeCreateDoc(collectionId: string, docId: string, data: any, label: string) {
  try {
    await databases.createDocument(DATABASE_ID, collectionId, docId, data);
    console.log(`  ✅ ${label}`);
  } catch (err: any) {
    if (err?.code === 409) {
      try {
        await databases.updateDocument(DATABASE_ID, collectionId, docId, data);
        console.log(`  🔄 ${label} (diperbarui)`);
      } catch {
        console.log(`  ⏭️  ${label} (sudah ada, skip)`);
      }
    } else {
      console.error(`  ❌ ${label}:`, err?.message || err);
    }
  }
}

async function seedSKPDs() {
  console.log(`\n📋 Seeding SKPDs & Kecamatan (${DEFAULT_SKPD_LIST.length} entitas: 22 Kecamatan + 29 SKPD/OPD)...`);

  for (const skpd of DEFAULT_SKPD_LIST) {
    await safeCreateDoc(
      COL.skpds,
      skpd.id,
      {
        kode: skpd.kode,
        nama: skpd.nama,
        kategori: skpd.kategori,
        tipe: skpd.tipe || null,
        ibukota: skpd.ibukota || null,
        kontak: skpd.kontak || null,
        kontakOperator: skpd.kontakOperator || null,
        alamat: skpd.alamat || null,
      },
      `[${skpd.kategori}] ${skpd.nama} (${skpd.id})`
    );
  }
}

async function seedUsers() {
  console.log('\n👤 Seeding Users (6 akun default)...');

  for (const user of DEFAULT_USER_ACCOUNTS) {
    await safeCreateDoc(
      COL.users,
      user.id,
      {
        username: user.username,
        namaLengkap: user.namaLengkap,
        nip: user.nip || null,
        role: user.role,
        unitKerjaId: user.unitKerjaId,
        email: user.email || null,
        isActive: user.isActive,
      },
      `${user.namaLengkap} (${user.role})`
    );
  }
}

async function seedPermissions() {
  console.log('\n🔐 Seeding Permission Matrix...');
  await safeCreateDoc(
    COL.permissions,
    'matrix-default',
    {
      matrixJson: JSON.stringify(DEFAULT_ROLE_PERMISSIONS),
    },
    'Permission Matrix Default'
  );
}

async function seedCategories() {
  console.log('\n📂 Seeding Categories...');

  for (const cat of DEFAULT_CATEGORIES) {
    await safeCreateDoc(
      COL.categories,
      cat.id,
      {
        kode: cat.kode,
        nama: cat.nama,
        targetUnit: cat.targetUnit,
        bobotPersentase: cat.bobotPersentase,
        urutan: cat.urutan,
      },
      `${cat.kode} - ${cat.nama}`
    );
  }
}

async function seedQuestions() {
  console.log('\n❓ Seeding Questions (Butir Soal SKKAAD)...');

  for (const q of DEFAULT_QUESTIONS) {
    await safeCreateDoc(
      COL.questions,
      q.id,
      {
        nomor: q.nomor,
        kategoriId: q.kategoriId,
        targetUnit: q.targetUnit,
        dataJson: JSON.stringify({
          pernyataan: q.pernyataan,
          definisiOperasional: q.definisiOperasional,
          dasarHukum: q.dasarHukum,
          bobotMaksimal: q.bobotMaksimal,
          options: q.options,
          logicRules: q.logicRules || null,
        }),
      },
      `${q.nomor} - ${q.pernyataan.substring(0, 50)}...`
    );
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ASKI Kotabaru — Appwrite Cloud Seed Script     ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint:    ${ENDPOINT}`);
  console.log(`  Project ID:  ${PROJECT_ID}`);
  console.log(`  Database ID: ${DATABASE_ID}`);

  try {
    await seedSKPDs();
    await seedUsers();
    await seedPermissions();
    await seedCategories();
    await seedQuestions();

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  ✅ SEED SELESAI!                                ║');
    console.log('║  51 Entitas (22 Kec + 29 SKPD) & instrumen siap!║');
    console.log('╚══════════════════════════════════════════════════╝');
  } catch (err) {
    console.error('\n💥 Seed gagal:', err);
    process.exit(1);
  }
}

main();
