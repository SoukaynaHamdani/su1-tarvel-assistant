import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration from user
const firebaseConfig = {
  apiKey: "AIzaSyArqAia6i5K28A3ybYFNZ8uDSmnhAnPpR8",
  authDomain: "su1-tourism-app.firebaseapp.com",
  projectId: "su1-tourism-app",
  storageBucket: "su1-tourism-app.firebasestorage.app",
  messagingSenderId: "161898868503",
  appId: "1:161898868503:web:1c66c1aff58f140e95d152"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export the Firebase app instance in case we need it elsewhere
export const firebaseApp = app;

// Helper function to get current user ID
export const getCurrentUserId = () => {
  return auth.currentUser?.uid;
};
