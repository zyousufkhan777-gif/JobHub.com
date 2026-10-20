import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSYRVamwSUs2ADPd0L4ttRFlZ6u94b-38",
  authDomain: "jobhub-c534f.firebaseapp.com",
  projectId: "jobhub-c534f",
  storageBucket: "jobhub-c534f.firebasestorage.app",
  messagingSenderId: "57261503069",
  appId: "1:57261503069:web:e2a3176275cdf1354e53b4",
  measurementId: "G-J83LKGL5MN",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
