import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBBxWrIl5Yk-igJuLepGeqBbjIqBAtXgKI",
  authDomain: "fir-test-6c917.firebaseapp.com",
  projectId: "fir-test-6c917",
  storageBucket: "fir-test-6c917.appspot.com",
  messagingSenderId: "900048256368",
  appId: "1:900048256368:web:8d62e79733663e373ea3b5",
  measurementId: "G-NVDHNQ871Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);