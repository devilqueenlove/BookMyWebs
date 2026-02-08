// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDG-K4qCzPKde3BG__x0sqy0Xs6UfYWg4w",
    authDomain: "bookmark-manager-285ab.firebaseapp.com",
    projectId: "bookmark-manager-285ab",
    storageBucket: "bookmark-manager-285ab.firebasestorage.app",
    messagingSenderId: "147737220534",
    appId: "1:147737220534:web:bf00a1521121bcccf85d17",
    measurementId: "G-JC78TEW192"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
