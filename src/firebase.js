import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-vSM72SIpHzKmccLedSnESKlgkOCvidA",
  authDomain: "app12-37904.firebaseapp.com",
  projectId: "app12-37904",
  storageBucket: "app12-37904.firebasestorage.app",
  messagingSenderId: "32174843751",
  appId: "1:32174843751:web:44942d086ada19cca6b1c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
