import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

function requireStudent() {
  if (!currentUser || currentUser.role !== "student") {
    window.location.href = "./login.html";
    throw new Error("Student session required.");
  }
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = text;
  }
}

function setNotice(selector, text, variant = "") {
  const el = document.querySelector(selector);
  if (!el) {
    return;
  }

  el.textContent = text;
  el.className = `notice ${variant}`.trim();
}

async function findActiveSessionByCode(examCode) {
  const sessionsQuery = query(
    collection(db, "examSessions"),
    where("examCode", "==", examCode.toUpperCase()),
    where("active", "==", true),
    limit(1)
  );

  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs[0] || null;
}

async function createOrResumeAttempt(sessionId, examId) {
  const attemptId = `${sessionId}_${currentUser.email}`;
  const attemptRef = doc(db, "attempts", attemptId);
  const attemptSnapshot = await getDoc(attemptRef);

  if (!attemptSnapshot.exists()) {
    await setDoc(attemptRef, {
      attemptId,
      sessionId,
      examId,
      studentEmail: currentUser.email,
      studentName: currentUser.profile.name,
      status: "in_progress",
      currentQuestionOrder: 1,
      locked: false,
      submittedAt: null,
      lastActivityAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  } else {
    await setDoc(attemptRef, { lastActivityAt: serverTimestamp() }, { merge: true });
  }

  sessionStorage.setItem("currentAttemptId", attemptId);
  sessionStorage.setItem("currentSessionId", sessionId);
  sessionStorage.setItem("currentExamId", examId);
  return attemptId;
}

async function handleEnterCodePage() {
  requireStudent();
  const form = document.querySelector("#enter-code-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const examCode = String(formData.get("examCode") || "").trim();
    setNotice("#enter-code-status", "Checking exam code...");

    try {
      const sessionDoc = await findActiveSessionByCode(examCode);
      if (!sessionDoc) {
        throw new Error("No active exam session found for that code.");
      }

      const session = sessionDoc.data();
      await createOrResumeAttempt(sessionDoc.id, session.examId);
      window.location.href = "./instructions.html";
    } catch (error) {
      setNotice("#enter-code-status", error.message, "error");
    }
  });
}

async function loadExamOverview() {
  requireStudent();
  const examId = sessionStorage.getItem("currentExamId");
  const attemptId = sessionStorage.getItem("currentAttemptId");
  if (!examId || !attemptId) {
    window.location.href = "./enter-code.html";
    return;
  }

  const examDoc = await getDoc(doc(db, "exams", examId));
  if (!examDoc.exists()) {
    setText("#exam-summary", "Exam details are not available yet.");
    return;
  }

  const exam = examDoc.data();
  setText("#exam-title", exam.name || "Exam overview");
  setText("#exam-summary", exam.description || "Review the instructions before you continue.");

  const meta = document.querySelector("#exam-meta");
  if (meta) {
    meta.innerHTML = `
      <div><strong>Questions</strong><br>${exam.questionCount || 0}</div>
      <div><strong>Attempt</strong><br>${attemptId}</div>
      <div><strong>Status</strong><br>In progress</div>
    `;
  }
}

function setupInstructionsPage() {
  requireStudent();
  const link = document.querySelector("#start-exam-link");
  if (link) {
    link.href = "./question.html?order=1";
  }
}

const page = document.body.dataset.page;

if (page === "enter-code") {
  handleEnterCodePage();
}

if (page === "instructions") {
  setupInstructionsPage();
}

if (page === "exam") {
  loadExamOverview();
}
