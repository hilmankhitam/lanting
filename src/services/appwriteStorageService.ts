import { storage, ID, APPWRITE_CONFIG, isAppwriteLiveConfigured } from './appwriteClient';
import { EvidenceFile } from '../types';

/**
 * Upload an evidence file to Appwrite Object Storage Bucket
 * Falls back seamlessly to browser Blob URL in offline/demo mode.
 */
export async function uploadEvidenceToAppwrite(
  file: File,
  questionNumber: string
): Promise<EvidenceFile> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type.includes('pdf');
  const fileType: 'IMAGE' | 'PDF' | 'DOC' = isImage ? 'IMAGE' : isPdf ? 'PDF' : 'DOC';

  if (!isAppwriteLiveConfigured()) {
    // Local / Offline demo fallback
    return {
      id: `ev-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      namaFile: file.name,
      tipe: fileType,
      url: URL.createObjectURL(file),
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      keterangan: `Bukti dukung fisik untuk butir ${questionNumber} (Penyimpanan Lokal)`,
    };
  }

  try {
    const fileId = ID.unique();
    const bucketId = APPWRITE_CONFIG.bucketEvidence;

    // Upload to Appwrite Storage Bucket
    const response = await storage.createFile(bucketId, fileId, file);

    // Get public / preview URL
    const viewUrl = storage.getFileView(bucketId, response.$id);

    return {
      id: `ev-appwrite-${response.$id}`,
      namaFile: file.name,
      tipe: fileType,
      url: viewUrl.toString(),
      appwriteFileId: response.$id,
      appwriteBucketId: bucketId,
      sizeBytes: file.size,
      uploadedAt: response.$createdAt || new Date().toISOString(),
      keterangan: `Bukti dukung fisik untuk butir ${questionNumber} (Tersimpan di Appwrite Storage)`,
    };
  } catch (error: any) {
    console.warn('Appwrite file upload failed, falling back to local object URL:', error);
    // Fallback to local blob url if bucket upload had permissions/network issue
    return {
      id: `ev-fallback-${Date.now()}`,
      namaFile: file.name,
      tipe: fileType,
      url: URL.createObjectURL(file),
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      keterangan: `Bukti dukung butir ${questionNumber} (Fallback Lokal)`,
    };
  }
}

/**
 * Delete an evidence file from Appwrite Storage
 */
export async function deleteEvidenceFromAppwrite(
  fileId?: string,
  bucketId?: string
): Promise<boolean> {
  if (!fileId || !isAppwriteLiveConfigured()) {
    return true;
  }

  try {
    const targetBucket = bucketId || APPWRITE_CONFIG.bucketEvidence;
    await storage.deleteFile(targetBucket, fileId);
    return true;
  } catch (error) {
    console.warn('Appwrite file deletion warning:', error);
    return false;
  }
}

/**
 * Get direct download link for an Appwrite storage file
 */
export function getAppwriteDownloadUrl(fileId: string, bucketId?: string): string {
  if (!isAppwriteLiveConfigured()) {
    return '#';
  }
  const targetBucket = bucketId || APPWRITE_CONFIG.bucketEvidence;
  return storage.getFileDownload(targetBucket, fileId).toString();
}
