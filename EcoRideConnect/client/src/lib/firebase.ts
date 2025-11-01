import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let analytics: Analytics | undefined;

if (!SIMPLE_AUTH) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  } as const;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  // Initialize Analytics only in supported environments (browsers, not SSR)
  // and when a Measurement ID is provided
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    // guard to avoid runtime error on platforms where analytics is not supported
    isAnalyticsSupported().then((ok) => {
      if (ok && app) analytics = getAnalytics(app);
    }).catch(() => void 0);
  }
}

export { app, auth, googleProvider, analytics };
