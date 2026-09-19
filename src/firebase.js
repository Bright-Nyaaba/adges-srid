// Firebase app initialization.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import appletConfig from '../firebase-applet-config.json';

const apiKey = appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = appletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID;
const authDomain = appletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : undefined);
const storageBucket = appletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = appletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = appletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID;
const measurementId = appletConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined;
const databaseId = appletConfig.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID;

export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('your_') &&
  !apiKey.includes('YOUR_')
);

const activeConfig = isFirebaseConfigured
  ? {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId
    }
  : {
      apiKey: 'AIzaSyPreviewDummyKey0000000000000000',
      authDomain: 'adges-preview.firebaseapp.com',
      projectId: 'adges-preview',
      storageBucket: 'adges-preview.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000'
    };

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(activeConfig);
export const db = (databaseId && databaseId !== '(default)') ? getFirestore(app, databaseId) : getFirestore(app);
export const storage = storageBucket
  ? getStorage(app, `gs://${storageBucket.replace(/^gs:\/\//, '')}`)
  : getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const cloudInfo = {
  projectId,
  databaseId: databaseId || '(default)',
  storageBucket: storageBucket || 'default',
  isConfigured: isFirebaseConfigured
};

async function testConnection() {
  if (!isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();
