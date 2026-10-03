import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  waitForPendingWrites,
  enableNetwork,
  disableNetwork,
  Firestore
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Firestore with multi-tab persistent IndexedDB local cache for offline resilience
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
  console.info('[Firebase Firestore] Persistent multi-tab offline cache configured successfully.');
} catch (error) {
  console.warn('[Firebase Firestore] Persistent local cache initialization fallback (instance may already exist):', error);
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export { waitForPendingWrites, enableNetwork, disableNetwork };

// Initialize Firebase Cloud Storage for images, videos, PDFs, PPTs, animations, etc.
let firebaseStorage: FirebaseStorage;
try {
  firebaseStorage = getStorage(app);
  console.info('[Firebase Storage] Cloud Storage initialized successfully for bucket:', firebaseConfig.storageBucket);
} catch (error) {
  console.warn('[Firebase Storage] Cloud Storage initialization fallback:', error);
  firebaseStorage = getStorage(app);
}

export const storage = firebaseStorage;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('[Firestore Non-Fatal Error]:', JSON.stringify(errInfo));
  return errInfo;
}

export default app;
