// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // NEW: Import getFirestore
// import { getStorage } from "firebase/storage";   // If you need Storage

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLStItTguRu-daxGsG-E9dvZU-PnnEn48",
    authDomain: "the-outside-3952b.firebaseapp.com",
    projectId: "the-outside-3952b",
    storageBucket: "the-outside-3952b.firebasestorage.app",
    messagingSenderId: "358078363617",
    appId: "1:358078363617:web:13d5d805c1f0182b8f04a0",
    measurementId: "G-CJ1WYBQ7T1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app); // NEW: Export db for Firestore operations

// You can also export the app instance if needed
export default app;