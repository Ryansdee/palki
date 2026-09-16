import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

// Accès Firestore cohérent avec getAuthClient() : certains modules importent
// getDbClient() plutôt que la constante db. Les deux renvoient la même instance.
export function getDbClient(): Firestore {
  return db;
}

// Auth initialisé paresseusement : getAuth() lève une erreur si la clé API
// est absente, ce qui casserait le build tant que l'environnement n'est pas
// renseigné. On ne l'initialise donc que côté client, à l'usage.
let _auth: Auth | undefined;
export function getAuthClient(): Auth {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export default app;