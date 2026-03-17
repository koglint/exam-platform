import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

const statusEl = document.querySelector("#auth-status");
const signInButton = document.querySelector("#google-sign-in");
const allowedDomain = "education.nsw.gov.au";
const bootstrapTeacherEmails = new Set([
  "troy.koglin1@education.nsw.gov.au"
]);

function setStatus(message, variant = "") {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.className = `notice ${variant}`.trim();
}

async function resolveUserRole(email) {
  const normalizedEmail = email.toLowerCase();
  const teacherDoc = await getDoc(doc(db, "teachers", normalizedEmail));
  if (teacherDoc.exists()) {
    return { role: "teacher", profile: teacherDoc.data() };
  }

  if (bootstrapTeacherEmails.has(normalizedEmail)) {
    return {
      role: "teacher",
      profile: {
        email: normalizedEmail,
        name: "Bootstrap Teacher",
        role: "teacher",
        bootstrapAccess: true
      }
    };
  }

  const studentDoc = await getDoc(doc(db, "students", normalizedEmail));
  if (studentDoc.exists()) {
    return { role: "student", profile: studentDoc.data() };
  }

  return null;
}

async function handleLogin() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: allowedDomain });
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email?.toLowerCase() || "";

    if (!email.endsWith(`@${allowedDomain}`)) {
      await signOut(auth);
      throw new Error("Use your NSW Education Google account to sign in.");
    }

    const rosteredUser = await resolveUserRole(email);
    if (!rosteredUser) {
      await signOut(auth);
      throw new Error("Your account is not listed in the approved roster.");
    }

    sessionStorage.setItem("currentUser", JSON.stringify({
      email,
      role: rosteredUser.role,
      profile: rosteredUser.profile
    }));

    window.location.href = rosteredUser.role === "teacher" ? "./admin.html" : "./enter-code.html";
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function redirectIfAuthenticated(user) {
  if (!user) {
    setStatus("Sign in to continue.");
    return;
  }

  const storedUser = sessionStorage.getItem("currentUser");
  if (!storedUser) {
    setStatus("Refreshing your access details...");
    return;
  }

  const parsed = JSON.parse(storedUser);
  window.location.href = parsed.role === "teacher" ? "./admin.html" : "./enter-code.html";
}

if (signInButton) {
  signInButton.addEventListener("click", handleLogin);
}

onAuthStateChanged(auth, redirectIfAuthenticated);
