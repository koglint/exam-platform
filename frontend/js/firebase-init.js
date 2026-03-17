import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Public Firebase config is safe for the browser. Privileged work stays in the backend.
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFfX_VlpX7K1b6ALKjI7sELUvA5O2Gsb4",
  authDomain: "education-e838d.firebaseapp.com",
  projectId: "education-e838d",
  storageBucket: "education-e838d.firebasestorage.app",
  messagingSenderId: "86818330422",
  appId: "1:86818330422:web:bf9a7985e1b6e117218597"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
