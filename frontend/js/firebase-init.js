import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Public Firebase web config is safe to ship in the browser. Sensitive operations
// such as marking and report generation still happen in the backend.
const firebaseConfig = {
  apiKey: "AIzaSyDFfX_VlpX7K1b6ALKjI7sELUvA5O2Gsb4",
  authDomain: "education-e838d.firebaseapp.com",
  projectId: "education-e838d",
  messagingSenderId: "86818330422",
  appId: "1:86818330422:web:bf9a7985e1b6e117218597"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
