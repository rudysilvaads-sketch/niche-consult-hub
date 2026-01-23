import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Get Firebase config from environment variables or use defaults
// For Vite, env vars must be prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCbyZT6Dom3suS58Da2Yz4jZ_dmks0qdC0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "consult-hub-5715b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "consult-hub-5715b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "consult-hub-5715b.appspot.com",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:180611397136:web:96b191a349165bee2a7c95",
};

// Firebase is always configured with hardcoded values
export const isFirebaseConfigured = true;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

export { app, db, auth, firebaseConfig };
export default app;
