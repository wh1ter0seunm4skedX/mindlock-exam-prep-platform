import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlLlHnXZlVQJRQxZUdYnkdLcDjnpRvJCc",
  authDomain: "mindlock-dev.firebaseapp.com",
  projectId: "mindlock-dev",
  storageBucket: "mindlock-dev.appspot.com",
  messagingSenderId: "1045631582301",
  appId: "1:1045631582301:web:7e9b3abb09d5b5a5e7c0c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
