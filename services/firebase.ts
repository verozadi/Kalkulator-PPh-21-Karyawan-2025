
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

// VerozTax Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmZcvP2mQjwSWwqFyJt8geIRLMZ-Y2J5s",
  authDomain: "veroztax.firebaseapp.com",
  projectId: "veroztax",
  storageBucket: "veroztax.firebasestorage.app",
  messagingSenderId: "973394158690",
  appId: "1:973394158690:web:bbee56e4e54bcec00b1d3b",
  measurementId: "G-21XT9F2KSR"
};

// Initialize Firebase App
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export services for use in the app
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
export const analytics = firebase.analytics();
