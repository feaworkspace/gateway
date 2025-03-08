// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GithubAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDllCgG960beHuFKACcO6XVEQzIZWmGYUg",
  authDomain: "workspace-82243.firebaseapp.com",
  projectId: "workspace-82243",
  storageBucket: "workspace-82243.firebasestorage.app",
  messagingSenderId: "479856605676",
  appId: "1:479856605676:web:1531c3d7ecab17eaa9e8c9",
  measurementId: "G-MCWPKL1VQG"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

export function useFirebaseApp() {
  return firebaseApp;
}