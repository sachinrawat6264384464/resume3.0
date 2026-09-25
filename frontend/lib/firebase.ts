import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlN1qS36ajsf5I4me3hRWdsiF3si2aFKI",
  authDomain: "airesume-41967.firebaseapp.com",
  projectId: "airesume-41967",
  storageBucket: "airesume-41967.firebasestorage.app",
  messagingSenderId: "113049327814",
  appId: "1:113049327814:web:6975e0f8773d88c65c5fc7",
  measurementId: "G-91FJXK3NC9"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      console.warn("Firebase client init skipped or mocked:", e);
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export async function saveCandidateToFirestore(uid: string, candidateData: Record<string, any>) {
  if (!db) return;
  try {
    const candidateRef = doc(db, "candidates", uid);
    await setDoc(candidateRef, {
      ...candidateData,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore candidate save notice:", err);
  }
}

export { 
  app, 
  auth, 
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier, 
  signInWithPhoneNumber 
};
export type { ConfirmationResult };

