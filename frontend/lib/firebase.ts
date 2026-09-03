import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDLN1qS36ajsf5I4me3hRWdsiF3si2aFKI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "airesume-41967.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "airesume-41967",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "airesume-41967.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "113049327814",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:113049327814:web:6975e0f8773d88c65c5fc7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-91FXXK3NC9"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (e) {
      console.warn("Firebase client init skipped or mocked:", e);
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
}

export { 
  app, 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier, 
  signInWithPhoneNumber 
};
export type { ConfirmationResult };
