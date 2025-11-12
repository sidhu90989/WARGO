// Central Firebase configuration for all apps (modular SDK v9+)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAyoxCh_tJzFHwMNSX1Zs6Ez1EmYMxxUPg",
  authDomain: "trusty-diorama-475905-c3.firebaseapp.com",
  databaseURL: "https://trusty-diorama-475905-c3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trusty-diorama-475905-c3",
  storageBucket: "trusty-diorama-475905-c3.firebasestorage.app",
  messagingSenderId: "805719737795",
  appId: "1:805719737795:web:fdf6eb93864fcde7b8a976",
  measurementId: "G-2BZXC1LWPM"
};

let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('[Firebase] Initialization failed. Ensure Firebase APIs are enabled in Google Cloud Console.', error);
}

export { app, db, auth };
