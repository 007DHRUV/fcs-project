// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApp0Uz_y9mSS2QAOftsXVpn3alM4napVo",
  authDomain: "real-estate-aggregator-f3d1d.firebaseapp.com",
  projectId: "real-estate-aggregator-f3d1d",
  storageBucket: "real-estate-aggregator-f3d1d.appspot.com",
  messagingSenderId: "819529380947",
  appId: "1:819529380947:web:21448d0de7fd5e86ce42a6",
  measurementId: "G-D54G0J2FQ8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);