import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHenaqNaC2jjdhKP5GRhSZpt08pS0n4ro",
  authDomain: "care-sphere-1041d.firebaseapp.com",
  projectId: "care-sphere-1041d",
  storageBucket: "care-sphere-1041d.firebasestorage.app",
  messagingSenderId: "866715741098",
  appId: "1:866715741098:web:a452a2651fac54866159d3",
  measurementId: "G-TP434TZSQM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
