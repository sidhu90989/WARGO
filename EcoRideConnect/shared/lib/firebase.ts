// Central Firebase configuration for all apps
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAyoxCh_tJzFHwMNSX1Zs6Ez1EmYMxxUPg",
  authDomain: "trusty-diorama-475905-c3.firebaseapp.com",
  projectId: "trusty-diorama-475905-c3",
  storageBucket: "trusty-diorama-475905-c3.firebasestorage.app",
  messagingSenderId: "805719737795",
  appId: "1:805719737795:web:fdf6eb93864fcde7b8a976",
  measurementId: "G-2BZXC1LWPM"
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
