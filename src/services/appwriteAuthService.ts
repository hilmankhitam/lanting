import { account, ID, isAppwriteLiveConfigured } from './appwriteClient';
import { UserAccount, UserRole } from '../types';
import { DEFAULT_USER_ACCOUNTS } from '../data/defaultRBAC';

export interface AuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
}

/**
 * Maps an Appwrite user and prefs to ASKI UserAccount
 */
function mapAppwriteToUserAccount(appwriteUser: any): UserAccount {
  const prefs = appwriteUser.prefs || {};
  const role: UserRole = prefs.role || 'OPERATOR';
  const unitKerjaId = prefs.unitKerjaId || 'kec-21'; // Default Pulau Laut Sigam

  return {
    id: appwriteUser.$id,
    username: appwriteUser.email ? appwriteUser.email.split('@')[0] : appwriteUser.name,
    namaLengkap: appwriteUser.name || 'Pengguna ASKI',
    nip: prefs.nip || undefined,
    role,
    unitKerjaId,
    email: appwriteUser.email,
    isActive: Boolean(appwriteUser.status ?? true),
    createdAt: appwriteUser.$createdAt || new Date().toISOString(),
  };
}

/**
 * Login with Email & Password via Appwrite
 */
export async function loginWithAppwrite(email: string, password: string): Promise<AuthResult> {
  if (!isAppwriteLiveConfigured()) {
    // Demo Mode fallback: match by email or username
    const found = DEFAULT_USER_ACCOUNTS.find(
      (u) =>
        u.email?.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      return { success: true, user: found };
    }

    // Allow mock login if password is at least 4 chars
    if (password.length >= 4) {
      const mockUser: UserAccount = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        namaLengkap: email.split('@')[0].toUpperCase(),
        role: email.includes('admin') ? 'SUPERADMIN' : email.includes('audit') ? 'AUDITOR' : 'OPERATOR',
        unitKerjaId: 'kec-21',
        email,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      return { success: true, user: mockUser };
    }

    return { success: false, error: 'Kredensial demo tidak valid. Gunakan tombol Akses Cepat Demo di bawah.' };
  }

  try {
    // Delete existing session if any to avoid session conflict
    try {
      await account.deleteSession('current');
    } catch {
      // Ignored if no current session
    }

    await account.createEmailPasswordSession(email, password);
    const appwriteUser = await account.get();
    const user = mapAppwriteToUserAccount(appwriteUser);

    return { success: true, user };
  } catch (error: any) {
    console.error('Appwrite login failed:', error);
    return {
      success: false,
      error: error?.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.',
    };
  }
}

/**
 * Register a new Operator or Auditor in Appwrite
 */
export async function registerWithAppwrite(
  email: string,
  password: string,
  namaLengkap: string,
  role: UserRole,
  unitKerjaId: string,
  nip?: string
): Promise<AuthResult> {
  if (!isAppwriteLiveConfigured()) {
    // Demo mode: create local user account
    const newUser: UserAccount = {
      id: `user-local-${Date.now()}`,
      username: email.split('@')[0],
      namaLengkap,
      nip: nip?.trim() || undefined,
      role,
      unitKerjaId,
      email,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return { success: true, user: newUser };
  }

  try {
    const userId = ID.unique();
    await account.create(userId, email, password, namaLengkap);

    // Create session to authenticate right away
    await account.createEmailPasswordSession(email, password);

    // Store custom ASKI metadata in User Preferences
    await account.updatePrefs({
      role,
      unitKerjaId,
      nip: nip || '',
    });

    const appwriteUser = await account.get();
    const user = mapAppwriteToUserAccount(appwriteUser);

    return { success: true, user };
  } catch (error: any) {
    console.error('Appwrite registration error:', error);
    return {
      success: false,
      error: error?.message || 'Gagal mendaftar akun baru di Appwrite.',
    };
  }
}

/**
 * Get the currently logged-in user from Appwrite
 */
export async function getActiveAppwriteSession(): Promise<UserAccount | null> {
  if (!isAppwriteLiveConfigured()) {
    return null;
  }

  try {
    const appwriteUser = await account.get();
    return mapAppwriteToUserAccount(appwriteUser);
  } catch {
    return null;
  }
}

/**
 * Log out current session
 */
export async function logoutAppwriteSession(): Promise<boolean> {
  if (!isAppwriteLiveConfigured()) {
    return true;
  }

  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.warn('Appwrite logout error:', error);
    return false;
  }
}
