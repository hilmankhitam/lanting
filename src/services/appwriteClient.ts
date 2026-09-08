import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { AppwriteConfig, AppwriteConnectionStatus } from '../types';

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}
  return fallback;
};

// Read configuration from Vite environment variables with graceful defaults
export const APPWRITE_CONFIG: AppwriteConfig = {
  endpoint: getEnv('VITE_APPWRITE_ENDPOINT', 'https://sgp.cloud.appwrite.io/v1'),
  projectId: getEnv('VITE_APPWRITE_PROJECT_ID', '6a9d7cc50032744d4440'),
  databaseId: getEnv('VITE_APPWRITE_DATABASE_ID', '6a9d84f600351db611e2'),
  collections: {
    skpds: getEnv('VITE_APPWRITE_COLLECTION_SKPDS', 'skpds'),
    users: getEnv('VITE_APPWRITE_COLLECTION_USERS', 'users'),
    permissions: getEnv('VITE_APPWRITE_COLLECTION_PERMISSIONS', 'permissions'),
    questions: getEnv('VITE_APPWRITE_COLLECTION_QUESTIONS', 'questions'),
    categories: getEnv('VITE_APPWRITE_COLLECTION_CATEGORIES', 'categories'),
    sessions: getEnv('VITE_APPWRITE_COLLECTION_SESSIONS', 'sessions'),
  },
  bucketEvidence: getEnv('VITE_APPWRITE_BUCKET_EVIDENCE', '6a9d856a002444edfc4c'),
};

// Initialize Appwrite Client
export const client = new Client();

if (APPWRITE_CONFIG.endpoint && APPWRITE_CONFIG.projectId) {
  client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  // Send ping to Appwrite API to satisfy onboarding ping verification
  client.ping().catch((e) => console.log('Appwrite initial ping status:', e));
}

// Appwrite Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Re-export ID and Query for convenience
export { ID, Query };

/**
 * Check if the current Appwrite setup is genuinely configured with a non-demo project
 */
export function isAppwriteLiveConfigured(): boolean {
  return (
    Boolean(APPWRITE_CONFIG.projectId) &&
    APPWRITE_CONFIG.projectId !== 'aski-kotabaru-demo' &&
    APPWRITE_CONFIG.projectId.length > 5
  );
}

/**
 * Ping Appwrite endpoint & project to check live connectivity status
 */
export async function checkAppwriteConnection(): Promise<{
  status: AppwriteConnectionStatus;
  message: string;
}> {
  if (!isAppwriteLiveConfigured()) {
    return {
      status: 'demo-mode',
      message: 'Mode Demo / Local Storage (Isi VITE_APPWRITE_PROJECT_ID di .env untuk live sync)',
    };
  }

  try {
    // Send official ping to Appwrite API
    await client.ping();
    return {
      status: 'connected',
      message: `Terhubung & Ping Berhasil ke Appwrite (${APPWRITE_CONFIG.projectId})`,
    };
  } catch (error: any) {
    // 401 or 200 means endpoint & project exist and responded
    if (error?.code === 401 || error?.code === 200) {
      return {
        status: 'connected',
        message: `Terhubung ke Appwrite (${APPWRITE_CONFIG.projectId})`,
      };
    }

    console.warn('Appwrite connection check warning:', error);
    return {
      status: 'error',
      message: error?.message || 'Gagal tersambung ke server Appwrite.',
    };
  }
}

