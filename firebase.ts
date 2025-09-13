
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACmRna04cmJI91vLnvZBXDWHEce6x2OKo",
  authDomain: "cheyodtom.firebaseapp.com",
  projectId: "cheyodtom",
  storageBucket: "cheyodtom.appspot.com",
  messagingSenderId: "56068229685",
  appId: "1:56068229685:web:9880efc69bf6e9bb9ebf7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const githubProvider = new GithubAuthProvider();