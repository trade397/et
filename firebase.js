// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALlnTmy38g15E0JPlD3QOgHRQjzr5nkPg",
  authDomain: "etoro-1ab64.firebaseapp.com",
  projectId: "etoro-1ab64",
  storageBucket: "etoro-1ab64.firebasestorage.app",
  messagingSenderId: "998526416208",
  appId: "1:998526416208:web:eb93c3b8f6f95ce3d96855",
  measurementId: "G-CCDGRTBSBM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
