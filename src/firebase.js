// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Replace with your Firebase config credentials
const firebaseConfig = {
  apiKey: "AIzaSyAbcxiltgXPDR_mNgt26dBuVxzC5z4T2Wc",
  authDomain: "mindsync2-37bc8.firebaseapp.com",
  projectId: "mindsync2-37bc8",
  storageBucket: "mindsync2-37bc8.firebasestorage.app",
  messagingSenderId: "811886499271",
  appId: "1:811886499271:web:cd0af8d0721503142eb5e2",
  measurementId: "G-XVH1BXWJ4W"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);

// For development - uncomment to use emulators
// if (window.location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }
