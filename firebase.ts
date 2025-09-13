
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const githubProvider = new firebase.auth.GithubAuthProvider();