// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Replace with your Firebase config credentials
const firebaseConfig = {
  apiKey: "AIzaSyA3EmCxGkk6trnlv9M5O3kMembDdwFZ8qQ",
  authDomain: "mindsync-11947.firebaseapp.com",
  projectId: "mindsync-11947",
  storageBucket: "mindsync-11947.firebasestorage.app",
  messagingSenderId: "815392141815",
  appId: "1:815392141815:web:212e9bb66148815dca3ef2",
  measurementId: "G-SFPYKKV2SN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);