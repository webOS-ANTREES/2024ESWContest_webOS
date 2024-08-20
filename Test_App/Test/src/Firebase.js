// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxvF5eMySB-6Uhn9F5jWGpLoQ3O36z5zo",
  authDomain: "weather-6a3c7.firebaseapp.com",
  databaseURL: "https://weather-6a3c7-default-rtdb.firebaseio.com",
  projectId: "weather-6a3c7",
  storageBucket: "weather-6a3c7.appspot.com",
  messagingSenderId: "380557469558",
  appId: "1:380557469558:web:e7d09b83616116e4177c57",
  measurementId: "G-ZSQ1N44C1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);