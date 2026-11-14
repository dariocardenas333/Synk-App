import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Configuración estándar de Firebase Web SDK para Synk.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyBx1d41mu2vxXVSqGsbbBIJ_cKKZIP3f3M',
  authDomain: 'synk-a3cb1.firebaseapp.com',
  projectId: 'synk-a3cb1',
  storageBucket: 'synk-a3cb1.firebasestorage.app',
  messagingSenderId: '538259942257',
  appId: '1:538259942257:web:70981a552aa09878bce4d0',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('PEGAR_TU_API_KEY') &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'tu-proyecto-id'
);

export const FIRESTORE_COLLECTIONS = {
  USERS_PRIVATE: 'users_private',
  GUEST_CLIENTS: 'guest_clients',
  COURIERS_PUBLIC: 'couriers_public',
  TARIFFS_SUBCOLLECTION: 'tariffs',
  MERCHANTS: 'merchants',
  USERS_ROOT: 'users',
  FAVORITES_SUBCOLLECTION: 'favorites',
  CONVERSATIONS: 'conversations',
  MESSAGES_SUBCOLLECTION: 'messages',
  CONTRACTS: 'contracts',
  RATINGS: 'ratings',
  JOB_OPPORTUNITIES: 'job_opportunities',
} as const;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
