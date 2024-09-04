// Firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Firebase 실시간 데이터베이스 사용

// Firebase 설정
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

// Firebase 초기화
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp); // 실시간 데이터베이스 초기화

// 내보내기
export { firebaseApp, database }; // 필요한 모듈을 내보냄
