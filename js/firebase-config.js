// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABGYSGrh7ghjuE3RqeO4EJKcd0P3tzUJg",
  authDomain: "bao24h-a72a6.firebaseapp.com",
  databaseURL: "https://bao24h-a72a6-default-rtdb.firebaseio.com",
  projectId: "bao24h-a72a6",
  storageBucket: "bao24h-a72a6.firebasestorage.app",
  messagingSenderId: "749274721600",
  appId: "1:749274721600:web:4f0bb62127d258e2411ea5",
  measurementId: "G-GB82V42LBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth }; 