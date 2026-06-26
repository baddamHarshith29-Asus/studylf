import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if we have actual Firebase credentials or are in mock mode
export const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "your_firebase_api_key" &&
  import.meta.env.VITE_FIREBASE_API_KEY.trim() !== ""
);

let authInstance: ReturnType<typeof getAuth> | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;
let analyticsInstance: Analytics | null = null;

try {
  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
  
  if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    isSupported().then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    });
  }
} catch (error) {
  console.error("Failed to initialize Firebase app: ", error);
}

export const auth = authInstance;
export const googleProvider = googleProviderInstance;
export const analytics = analyticsInstance;

