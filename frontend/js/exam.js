import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";

const currentStudent = JSON.parse(sessionStorage.getItem("currentStudent") || "null");

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

function storeStudentContext(payload) {
  sessionStorage.setItem("pendingSession", JSON.stringify(payload));
}

function getPendingSession() {
  return JSON.parse(sessionStorage.getItem("pendingSession") || "null");
}

function setCurrentAttemptContext(payload) {
  sessionStorage.setItem("currentStudent", JSON.stringify(payload.student));
  sessionStorage.setItem("currentAttemptId", payload.attemptId);
  sessionStorage.setItem("currentSessionId", payload.sessionId);
  sessionStorage.setItem("currentExamId", payload.examId);
}

async function findSessionByCode(examCode) {
  const sessionsQuery = query(
    collection(db, "examSessions"),
    where("examCode", "==", examCode.toUpperCase()),
    limit(1)
  );

  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs[0] || null;
}

async function findSessionStudent(sessionId, studentCode) {
  const sessionStudentsQuery = query(
    collection(db, "examSessions", sessionId, "sessionStudents"),
    where("studentCode", "==", studentCode.toUpperCase()),
    limit(1)
  );

  const snapshot = await getDocs(sessionStudentsQuery);
  return snapshot.docs[0] || null;
}

async function createOrResumeAttempt(sessionData, studentRecord) {
  const sessionId = sessionData.sessionId;
  const examId = sessionData.examId;
  const attemptId = `${sessionId}_${studentRecord.studentEmail}`;
  const attemptRef = doc(db, "attempts", attemptId);
  const attemptSnapshot = await getDoc(attemptRef);

  if (!attemptSnapshot.exists()) {
    await setDoc(attemptRef, {
      attemptId,
      sessionId,
      examId,
      studentEmail: studentRecord.studentEmail,
      studentName: studentRecord.studentName,
      classId: sessionData.classId,
      status: "waiting",
      currentQuestionOrder: 1,
      locked: false,
      confirmedIdentityAt: serverTimestamp(),
      waitingRoomEnteredAt: serverTimestamp(),
      examStartedAt: null,
      submittedAt: null,
      lastActivityAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  } else {
    await setDoc(attemptRef, {
      status: attemptSnapshot.data().locked ? "submitted" : "waiting",
      confirmedIdentityAt: serverTimestamp(),
      waitingRoomEnteredAt: serverTimestamp(),
      lastActivityAt: serverTimestamp()
    }, { merge: true });
  }

  await setDoc(doc(db, "examSessions", sessionId, "sessionStudents", studentRecord.id), {
    confirmedIdentity: true,
    confirmedIdentityAt: serverTimestamp(),
    status: "waiting",
    attemptId,
    lastSeenAt: serverTimestamp()
  }, { merge: true });

  setCurrentAttemptContext({
    attemptId,
    sessionId,
    examId,
    student: {
      studentEmail: studentRecord.studentEmail,
      studentName: studentRecord.studentName,
      classId: sessionData.classId,
      studentCode: studentRecord.studentCode,
      sessionStudentId: studentRecord.id
    }
  });

  sessionStorage.removeItem("pendingSession");
  return attemptId;
}

async function handleEnterCodePage() {
  const form = document.querySelector("#enter-code-form");
  const confirmationCard = document.querySelector("#identity-confirmation");
  const summary = document.querySelector("#identity-summary");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const examCode = String(formData.get("examCode") || "").trim();
    const studentCode = String(formData.get("studentCode") || "").trim();
    setNotice("#enter-code-status", "Checking exam code...");

    try {
      const sessionDoc = await findSessionByCode(examCode);
      if (!sessionDoc) {
        throw new Error("No exam session was found for that code.");
      }

      const session = sessionDoc.data();
      if (!session.active) {
        throw new Error("This exam session is not currently open for entry.");
      }

      const studentDoc = await findSessionStudent(sessionDoc.id, studentCode);
      if (!studentDoc) {
        throw new Error("That student code does not match this session.");
      }

      const student = { id: studentDoc.id, ...studentDoc.data() };
      storeStudentContext({
        sessionId: sessionDoc.id,
        examId: session.examId,
        classId: session.classId,
        examCode: session.examCode,
        examName: session.examName || "Exam",
        student
      });

      summary.innerHTML = `
        <div><strong>Student</strong><br>${student.studentName}</div>
        <div><strong>Class</strong><br>${student.classId || session.classId}</div>
        <div><strong>Exam</strong><br>${session.examName || session.examId}</div>
      `;
      confirmationCard.classList.remove("hidden");
      setNotice("#enter-code-status", "Show your teacher, then confirm your identity.", "success");
    } catch (error) {
      setNotice("#enter-code-status", error.message, "error");
    }
  });

  document.querySelector("#confirm-identity")?.addEventListener("click", async () => {
    const pending = getPendingSession();
    if (!pending) {
      setNotice("#enter-code-status", "Re-enter your codes first.", "error");
      return;
    }

    try {
      await createOrResumeAttempt(pending, pending.student);
      window.location.href = "./instructions.html";
    } catch (error) {
      setNotice("#enter-code-status", error.message, "error");
    }
  });

  document.querySelector("#restart-entry")?.addEventListener("click", () => {
    sessionStorage.removeItem("pendingSession");
    confirmationCard.classList.add("hidden");
    setNotice("#enter-code-status", "");
    form.reset();
  });
}

async function loadExamOverview() {
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

async function setupInstructionsPage() {
  const attemptId = sessionStorage.getItem("currentAttemptId");
  const sessionId = sessionStorage.getItem("currentSessionId");
  const examId = sessionStorage.getItem("currentExamId");
  if (!attemptId || !sessionId || !examId || !currentStudent) {
    window.location.href = "./enter-code.html";
    return;
  }

  const [attemptDoc, examDoc] = await Promise.all([
    getDoc(doc(db, "attempts", attemptId)),
    getDoc(doc(db, "exams", examId))
  ]);
  if (!attemptDoc.exists()) {
    window.location.href = "./enter-code.html";
    return;
  }

  const attempt = attemptDoc.data();
  setText("#waiting-room-summary", `${currentStudent.studentName}, wait for the teacher's verbal instruction before starting.`);
  const meta = document.querySelector("#waiting-room-meta");
  if (meta) {
    meta.innerHTML = `
      <div><strong>Student</strong><br>${currentStudent.studentName}</div>
      <div><strong>Class</strong><br>${currentStudent.classId || attempt.classId || "-"}</div>
      <div><strong>Exam</strong><br>${examDoc.exists() ? examDoc.data().name : examId}</div>
      <div><strong>Status</strong><br>${attempt.status || "waiting"}</div>
    `;
  }

  const statusEl = document.querySelector("#waiting-room-status");
  const startButton = document.querySelector("#start-exam-link");
  onSnapshot(doc(db, "examSessions", sessionId), (sessionSnapshot) => {
    const session = sessionSnapshot.data();
    if (!session?.active) {
      startButton.disabled = true;
      setNotice("#waiting-room-status", "This session is closed for entry.", "error");
      return;
    }

    if (session.examAccessEnabled) {
      startButton.disabled = false;
      setNotice("#waiting-room-status", "The exam start window is open. Begin when told to do so.", "success");
    } else {
      startButton.disabled = true;
      setNotice("#waiting-room-status", "Waiting for the admin to open the exam start window.");
    }
  });

  startButton.addEventListener("click", async () => {
    await updateDoc(doc(db, "attempts", attemptId), {
      examStartedAt: serverTimestamp(),
      status: "in_progress",
      lastActivityAt: serverTimestamp()
    });
    await setDoc(doc(db, "examSessions", sessionId, "sessionStudents", currentStudent.sessionStudentId), {
      status: "in_progress",
      lastSeenAt: serverTimestamp()
    }, { merge: true });
    window.location.href = "./question.html?order=1";
  });
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
