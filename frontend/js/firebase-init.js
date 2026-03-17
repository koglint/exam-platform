import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Public Firebase config is safe for the browser. Privileged work stays in the backend.
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCm5r49uPJFZgAD7IrY5dirN8oiPQN0VPE",
  authDomain: "exam-platform-d8f77.firebaseapp.com",
  projectId: "exam-platform-d8f77",
  storageBucket: "exam-platform-d8f77.firebasestorage.app",
  messagingSenderId: "420780761952",
  appId: "1:420780761952:web:10aa0908709e8ca5a2f405",
  measurementId: "G-J1CR7212XZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
