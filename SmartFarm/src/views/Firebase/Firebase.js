import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Firebase 실시간 데이터베이스 사용

// 환경 변수에서 Firebase 설정 불러오기
const weatherfirebaseConfig = {
  apiKey: "AIzaSyCxvF5eMySB-6Uhn9F5jWGpLoQ3O36z5zo",
  authDomain: "weather-6a3c7.firebaseapp.com",
  databaseURL: "https://weather-6a3c7-default-rtdb.firebaseio.com",
  projectId: "weather-6a3c7",
  storageBucket: "weather-6a3c7.appspot.com",
  messagingSenderId: "380557469558",
  appId: "1:380557469558:web:e7d09b83616116e4177c57",
  measurementId: "G-ZSQ1N44C1H"
};

const signUpFirebaseConfig = {
  apiKey: "AIzaSyCRaXqzlP9eedJa6Wc-INXJ_sYc3wVQbcs",
  authDomain: "sign-up-da063.firebaseapp.com",
  databaseURL: "https://sign-up-da063-default-rtdb.firebaseio.com",
  projectId: "sign-up-da063",
  storageBucket: "sign-up-da063.appspot.com",
  messagingSenderId: "297374469841",
  appId: "1:297374469841:web:443f8fe6089e096ff3fff0",
  measurementId: "G-01FS6F8DL8"
};

// Firebase 초기화
const firebaseApp = initializeApp(weatherfirebaseConfig);
const database = getDatabase(firebaseApp); // 실시간 데이터베이스 초기화

const signUpApp = initializeApp(signUpFirebaseConfig, "signUpApp"); // 고유 이름 지정
const signUpdatabase = getDatabase(signUpApp);

// 내보내기
export { firebaseApp, database, signUpApp, signUpdatabase };