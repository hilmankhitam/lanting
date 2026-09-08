/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_COLLECTION_SKPDS: string;
  readonly VITE_APPWRITE_COLLECTION_USERS: string;
  readonly VITE_APPWRITE_COLLECTION_PERMISSIONS: string;
  readonly VITE_APPWRITE_COLLECTION_QUESTIONS: string;
  readonly VITE_APPWRITE_COLLECTION_CATEGORIES: string;
  readonly VITE_APPWRITE_COLLECTION_SESSIONS: string;
  readonly VITE_APPWRITE_BUCKET_EVIDENCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
