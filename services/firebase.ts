
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
const app = initializeApp(firebaseConfig);

// Export services for use in the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
