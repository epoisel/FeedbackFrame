// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnpK6w0HQEe2hwuj4DmGZVgW-XEY5Dgb4",
  authDomain: "feedback-frame.firebaseapp.com",
  databaseURL: "https://feedback-frame-default-rtdb.firebaseio.com",
  projectId: "feedback-frame",
  storageBucket: "feedback-frame.appspot.com",
  messagingSenderId: "671959290777",
  appId: "1:671959290777:web:66f86335b457e466113908",
  measurementId: "G-Q2TBW61KXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { storage, firestore, auth };