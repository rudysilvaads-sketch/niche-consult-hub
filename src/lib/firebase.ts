import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - these are publishable keys (safe to include in client code)
const firebaseConfig = {
  apiKey: "AIzaSyCbyZT6Dom3suS58Da2Yz4jZ_dmks0qdC0",
  authDomain: "consult-hub-5715b.firebaseapp.com",
  projectId: "consult-hub-5715b",
  storageBucket: "consult-hub-5715b.appspot.com",
  appId: "1:180611397136:web:96b191a349165bee2a7c95",
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

export { app, db, auth };
export default app;
