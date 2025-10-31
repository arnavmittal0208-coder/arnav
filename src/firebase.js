// src/firebase.js
// Initialize Firebase app, analytics (browser), and export Firestore DB
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config (provided)
const firebaseConfig = {
  apiKey: "AIzaSyCixNHJMH-uAWygrLs1dco09VfVv_Gl6ns",
  authDomain: "skillswapper-backend.firebaseapp.com",
  projectId: "skillswapper-backend",
  storageBucket: "skillswapper-backend.firebasestorage.app",
  messagingSenderId: "283660487517",
  appId: "1:283660487517:web:86ffa4f3c5fa3d3300b6b4",
  measurementId: "G-G7CVDN9WE0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize analytics (works in browser environments)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // analytics may fail if running in non-browser environment
  // we'll silently ignore it for Node-based tooling
  // console.log('Analytics not initialized:', e?.message);
}

// Export Firestore database and Storage for use in the app
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
