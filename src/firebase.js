import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || "hiremenow-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "hiremenow-demo",
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || "hiremenow-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FB_APP_ID || "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Auth error:', error);
      // For demo purposes, create a mock user
      return createMockUser();
    }
  }
  return auth.currentUser;
}

export function createMockUser() {
  const mockUser = {
    uid: 'demo-user-' + Date.now(),
    email: 'demo@hiremenow.com',
    displayName: 'Demo User',
    getIdToken: async () => 'demo-token-' + Date.now(),
  };
  
  // Store mock token
  localStorage.setItem('firebase_token', mockUser.getIdToken());
  return mockUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}