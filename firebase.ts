// FIX: Use Firebase v9 'compat' imports to provide the v8 API, matching the v12 SDK.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


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
// FIX: Use the v8 initialization method.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// Export Firebase services
// FIX: Export v8-style namespaced services.
export const auth = firebase.auth();
export const githubProvider = new firebase.auth.GithubAuthProvider();
export const db = firebase.firestore();
export const storage = firebase.storage();