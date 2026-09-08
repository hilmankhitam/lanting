/**
 * ============================================================
 * ASKI Kotabaru — Seed Appwrite Authentication Accounts
 * ============================================================
 * Mendaftarkan akun resmi default ke layanan Appwrite Auth
 * lengkap dengan email, password, nama, dan preferences (Role & SKPD).
 * ============================================================
 */
import 'dotenv/config';
import { Client, Users, ID, Query } from 'node-appwrite';
import { DEFAULT_USER_ACCOUNTS } from '../src/data/defaultRBAC';

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';

if (!PROJECT_ID || !API_KEY) {
  console.error('❌ Pastikan VITE_APPWRITE_PROJECT_ID dan APPWRITE_API_KEY terisi di .env');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const usersService = new Users(client);

// Default password untuk akun sistem
const DEFAULT_PASSWORD = 'kotabaru2025';

async function seedAuthUsers() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ASKI Kotabaru — Seed Appwrite Auth Accounts    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint:   ${ENDPOINT}`);
  console.log(`  Project ID: ${PROJECT_ID}`);
  console.log(`  Password Default: ${DEFAULT_PASSWORD}\n`);

  // Ambil daftar user yang sudah ada di Appwrite Auth
  const existingUsers = await usersService.list();
  console.log(`📊 Total user terdaftar di Appwrite Auth saat ini: ${existingUsers.total}\n`);

  for (const acc of DEFAULT_USER_ACCOUNTS) {
    if (!acc.email) continue;

    const found = existingUsers.users.find(
      (u) => u.email.toLowerCase() === acc.email!.toLowerCase()
    );

    if (found) {
      console.log(`  ⏭️  ${acc.namaLengkap} (${acc.email}) sudah ada di Auth. Memperbarui prefs...`);
      await usersService.updatePrefs(found.$id, {
        role: acc.role,
        unitKerjaId: acc.unitKerjaId,
        nip: acc.nip || '',
        username: acc.username,
      });
      continue;
    }

    try {
      // Buat akun baru di Appwrite Auth
      const newUser = await usersService.create(
        ID.unique(),
        acc.email,
        undefined, // phone
        DEFAULT_PASSWORD,
        acc.namaLengkap
      );

      // Simpan Role dan Unit Kerja di Preferences pengguna
      await usersService.updatePrefs(newUser.$id, {
        role: acc.role,
        unitKerjaId: acc.unitKerjaId,
        nip: acc.nip || '',
        username: acc.username,
      });

      // Verifikasi email langsung agar siap digunakan
      await usersService.updateEmailVerification(newUser.$id, true);

      console.log(`  ✅ Dibuat: ${acc.namaLengkap} [${acc.role}]`);
      console.log(`     Email: ${acc.email} | Sandi: ${DEFAULT_PASSWORD}`);
    } catch (err: any) {
      console.error(`  ❌ Gagal membuat ${acc.email}:`, err?.message || err);
    }
  }

  const updatedUsers = await usersService.list();
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  🎉 SEED AUTH SELESAI! (${updatedUsers.total} akun aktif di Auth)      ║`);
  console.log('╚══════════════════════════════════════════════════╝');
}

seedAuthUsers().catch((err) => {
  console.error('💥 Error:', err);
  process.exit(1);
});
