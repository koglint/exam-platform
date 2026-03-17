import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { postJson } from "./api.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

function requireTeacher() {
  if (!currentUser || currentUser.role !== "teacher") {
    window.location.href = "./login.html";
    throw new Error("Teacher session required.");
  }
}

function setStatus(message, variant = "") {
  const el = document.querySelector("#admin-status");
  if (!el) {
    return;
  }

  el.textContent = message;
  el.className = `notice ${variant}`.trim();
}

function parseCsv(text) {
  const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((value) => value.trim());

  return rows.map((row) => {
    const values = row.split(",").map((value) => value.trim());
    return headers.reduce((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {});
  });
}

async function uploadRoster(file, collectionName) {
  const text = await file.text();
  const records = parseCsv(text);
  const batch = writeBatch(db);

  records.forEach((record) => {
    const email = record.email?.toLowerCase();
    if (!email) {
      return;
    }

    batch.set(doc(db, collectionName, email), {
      ...record,
      email,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
}

function generateExamCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function bindRosterForm() {
  const form = document.querySelector("#roster-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const studentsFile = document.querySelector("#students-file").files[0];
    const teachersFile = document.querySelector("#teachers-file").files[0];

    try {
      if (studentsFile) {
        await uploadRoster(studentsFile, "students");
      }
      if (teachersFile) {
        await uploadRoster(teachersFile, "teachers");
      }
      setStatus("Roster upload complete.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}

async function bindExamForm() {
  const form = document.querySelector("#exam-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const examRef = await addDoc(collection(db, "exams"), {
        name: formData.get("name"),
        description: formData.get("description"),
        questionCount: 0,
        createdBy: currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await setDoc(doc(db, "exams", examRef.id, "questions", "q1"), {
        order: 1,
        stemHtml: "<p>Replace this placeholder with the real question stem.</p>",
        imageUrl: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        alternateWording: ["Optional simplified wording goes here."],
        glossaryTerms: [{ term: "Example term", definition: "Example definition" }]
      });

      await setDoc(doc(db, "exams", examRef.id, "answerKeys", "q1"), {
        correctOption: 0
      });

      await setDoc(doc(db, "exams", examRef.id), { questionCount: 1 }, { merge: true });
      setStatus(`Exam draft created: ${examRef.id}`, "success");
      form.reset();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}

async function bindSessionForm() {
  const form = document.querySelector("#session-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const examId = String(formData.get("examId"));
    const classId = String(formData.get("classId"));
    const action = String(formData.get("action"));

    try {
      const sessionId = `${examId}_${classId}`;
      await setDoc(doc(db, "examSessions", sessionId), {
        examId,
        classId,
        examCode: generateExamCode(),
        active: action === "activate",
        resultsReleased: false,
        activationHistory: [{
          timestamp: new Date().toISOString(),
          teacherEmail: currentUser.email,
          action: action === "activate" ? "activated" : "deactivated"
        }],
        updatedAt: serverTimestamp()
      }, { merge: true });

      setStatus(`Session ${sessionId} ${action === "activate" ? "activated" : "deactivated"}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  document.querySelector("#release-results").addEventListener("click", async () => {
    const examId = document.querySelector("#session-exam-id").value.trim();
    const classId = document.querySelector("#session-class-id").value.trim();
    const sessionId = `${examId}_${classId}`;

    try {
      await setDoc(doc(db, "examSessions", sessionId), {
        resultsReleased: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : null;
      await postJson("/generateExamReports", { sessionId }, idToken);
      setStatus("Results released and report generation requested.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}

async function bindAttemptControls() {
  const button = document.querySelector("#reopen-attempt");
  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    const attemptId = document.querySelector("#attempt-id").value.trim();
    if (!attemptId) {
      setStatus("Enter an attempt ID to reopen.", "error");
      return;
    }

    try {
      await setDoc(doc(db, "attempts", attemptId), {
        locked: false,
        status: "in_progress",
        reopenedAt: serverTimestamp(),
        reopenedBy: currentUser.email
      }, { merge: true });
      setStatus(`Attempt ${attemptId} reopened.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}

function bindMonitoringTable() {
  const tableShell = document.querySelector("#monitoring-table");
  const attemptsQuery = query(collection(db, "attempts"), where("status", "!=", "archived"));

  onSnapshot(attemptsQuery, (snapshot) => {
    const rows = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return `
        <tr>
          <td>${data.studentName || data.studentEmail}</td>
          <td>${data.status || "not started"}</td>
          <td>${data.currentQuestionOrder || "-"}</td>
          <td>${data.lastActivityAt?.toDate ? data.lastActivityAt.toDate().toLocaleString() : "Pending"}</td>
        </tr>
      `;
    }).join("");

    tableShell.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Current Question</th>
            <th>Last Activity</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  });
}

function bootstrap() {
  requireTeacher();
  bindRosterForm();
  bindExamForm();
  bindSessionForm();
  bindAttemptControls();
  bindMonitoringTable();
  setStatus("Teacher admin ready.");
}

bootstrap();
