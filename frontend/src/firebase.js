// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDP_Tg0ZlM76eKFOMWL65qDywwgqKsgl2w",
  authDomain: "ai-shopping-agent-ea40e.firebaseapp.com",
  projectId: "ai-shopping-agent-ea40e",
  storageBucket: "ai-shopping-agent-ea40e.firebasestorage.app",
  messagingSenderId: "758731777655",
  appId: "1:758731777655:web:24d67d8500674102530872"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;