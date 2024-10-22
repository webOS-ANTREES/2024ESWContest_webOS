import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Firebase 실시간 데이터베이스 사용

// 환경 변수에서 Firebase 설정 불러오기
const weatherfirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_WEATHER,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_WEATHER,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL_WEATHER,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_WEATHER,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_WEATHER,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_WEATHER,
  appId: process.env.REACT_APP_FIREBASE_APP_ID_WEATHER,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_WEATHER
};

const signUpFirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_SIGNUP,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_SIGNUP,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL_SIGNUP,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_SIGNUP,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_SIGNUP,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_SIGNUP,
  appId: process.env.REACT_APP_FIREBASE_APP_ID_SIGNUP,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_SIGNUP
};

// Firebase 초기화
const firebaseApp = initializeApp(weatherfirebaseConfig);
const database = getDatabase(firebaseApp); // 실시간 데이터베이스 초기화

const signUpApp = initializeApp(signUpFirebaseConfig, "signUpApp"); // 고유 이름 지정
const signUpdatabase = getDatabase(signUpApp);

// 내보내기
export { firebaseApp, database, signUpApp, signUpdatabase };