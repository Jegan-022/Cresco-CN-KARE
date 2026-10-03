import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  UploadMetadata 
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export type StorageAssetCategory = 'images' | 'videos' | 'documents' | 'animations';

export interface UploadResult {
  url: string;
  fullPath: string;
  name: string;
  category: StorageAssetCategory;
  contentType?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

/**
 * Standard storage folder hierarchy for Cresco CN:
 * - images/        -> avatars, badges, concept diagrams, UI thumbnails
 * - videos/        -> lecture clips, protocol demonstrations
 * - documents/     -> PDF slide decks, PPTs, syllabus, lab worksheets
 * - animations/    -> Lottie animations, network packet flow visualizers
 */
export const STORAGE_FOLDERS = {
  IMAGES: {
    AVATARS: 'images/avatars',
    BADGES: 'images/badges',
    DIAGRAMS: 'images/diagrams',
    COURSES: 'images/courses',
    THUMBNAILS: 'images/thumbnails'
  },
  VIDEOS: {
    LECTURES: 'videos/lectures',
    DEMOS: 'videos/demos',
    CONCEPTS: 'videos/concepts'
  },
  DOCUMENTS: {
    PDFS: 'documents/pdfs',
    PPTS: 'documents/ppts',
    SYLLABUS: 'documents/syllabus',
    WORKSHEETS: 'documents/worksheets'
  },
  ANIMATIONS: {
    LOTTIE: 'animations/lottie',
    PACKET_FLOWS: 'animations/packet-flows',
    TOPOLOGY: 'animations/topology'
  }
} as const;

/**
 * Upload a file directly to a specified storage path and return its public download URL
 */
export async function uploadFile(
  file: File | Blob,
  fullPath: string,
  metadata?: UploadMetadata
): Promise<string> {
  try {
    const storageRef = ref(storage, fullPath);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error(`[Firebase Storage] Upload failed for path "${fullPath}":`, error);
    throw error;
  }
}

/**
 * Upload a categorized media asset (image, video, PDF/PPT document, or animation)
 */
export async function uploadCategorizedAsset(
  file: File,
  category: StorageAssetCategory,
  subFolder: string,
  customFileName?: string
): Promise<UploadResult> {
  const sanitizedFileName = customFileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fullPath = `${category}/${subFolder}/${sanitizedFileName}`;

  const metadata: UploadMetadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      originalName: file.name,
      category,
      subFolder,
      uploadedAt: new Date().toISOString()
    }
  };

  const url = await uploadFile(file, fullPath, metadata);

  return {
    url,
    fullPath,
    name: sanitizedFileName,
    category,
    contentType: file.type,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Get the download URL for any existing file in Firebase Storage
 */
export async function getFileDownloadUrl(fullPath: string): Promise<string> {
  try {
    const storageRef = ref(storage, fullPath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`[Firebase Storage] Failed to get download URL for "${fullPath}":`, error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteStorageFile(fullPath: string): Promise<void> {
  try {
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
    console.info(`[Firebase Storage] Successfully deleted "${fullPath}"`);
  } catch (error) {
    console.error(`[Firebase Storage] Failed to delete file at "${fullPath}":`, error);
    throw error;
  }
}

/**
 * List all file download URLs in a given storage folder
 */
export async function listFolderFiles(folderPath: string): Promise<{ name: string; fullPath: string; url: string }[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    const items = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url
        };
      })
    );

    return items;
  } catch (error) {
    console.warn(`[Firebase Storage] Could not list folder "${folderPath}":`, error);
    return [];
  }
}
