// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);