import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { postJson } from "./api.js";

const adminIdentity = "prototype-admin";

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

function generateStudentCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function provisionSessionStudents(sessionId, classId) {
  const studentsQuery = query(collection(db, "students"), where("class", "==", classId));
  const snapshot = await getDocs(studentsQuery);
  const batch = writeBatch(db);
  const generatedRows = [];

  snapshot.forEach((studentDoc) => {
    const student = studentDoc.data();
    const studentCode = generateStudentCode();
    batch.set(doc(db, "examSessions", sessionId, "sessionStudents", studentDoc.id), {
      studentEmail: student.email,
      studentName: student.name,
      classId,
      studentCode,
      confirmedIdentity: false,
      status: "not_started",
      lastSeenAt: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    generatedRows.push({
      studentName: student.name,
      studentEmail: student.email,
      studentCode
    });
  });

  await batch.commit();
  renderSessionCodes(generatedRows);
  return generatedRows;
}

function renderSessionCodes(rows) {
  const shell = document.querySelector("#session-student-codes");
  if (!shell) {
    return;
  }

  if (!rows.length) {
    shell.innerHTML = "<p>No student codes generated yet.</p>";
    return;
  }

  shell.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Email</th>
          <th>Student Code</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${row.studentName}</td>
            <td>${row.studentEmail}</td>
            <td>${row.studentCode}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
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
        createdBy: adminIdentity,
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
      const examSnapshot = await getDoc(doc(db, "exams", examId));
      const examName = examSnapshot.exists() ? examSnapshot.data().name : examId;
      const baseSessionPayload = {
        examId,
        classId,
        examCode: generateExamCode(),
        examName,
        resultsReleased: false,
        updatedAt: serverTimestamp()
      };

      let patch = {};
      let statusMessage = "";

      if (action === "activate") {
        patch = {
          ...baseSessionPayload,
          active: true,
          examAccessEnabled: false,
          activationHistory: [{
            timestamp: new Date().toISOString(),
            teacherEmail: adminIdentity,
            action: "activated"
          }]
        };
      } else if (action === "deactivate") {
        patch = {
          ...baseSessionPayload,
          active: false,
          examAccessEnabled: false,
          activationHistory: [{
            timestamp: new Date().toISOString(),
            teacherEmail: adminIdentity,
            action: "deactivated"
          }]
        };
      } else if (action === "open-window") {
        patch = {
          examAccessEnabled: true,
          updatedAt: serverTimestamp()
        };
      } else if (action === "close-window") {
        patch = {
          examAccessEnabled: false,
          updatedAt: serverTimestamp()
        };
      }

      await setDoc(doc(db, "examSessions", sessionId), patch, { merge: true });

      if (action === "activate") {
        const generatedRows = await provisionSessionStudents(sessionId, classId);
        statusMessage = `Session ${sessionId} activated and ${generatedRows.length} student codes generated.`;
      } else if (action === "deactivate") {
        statusMessage = `Session ${sessionId} deactivated.`;
      } else if (action === "open-window") {
        statusMessage = `Exam start window opened for ${sessionId}.`;
      } else if (action === "close-window") {
        statusMessage = `Exam start window closed for ${sessionId}.`;
      }
      setStatus(statusMessage, "success");
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

      await postJson("/generateExamReports", { sessionId });
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
        reopenedBy: adminIdentity
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
  bindRosterForm();
  bindExamForm();
  bindSessionForm();
  bindAttemptControls();
  bindMonitoringTable();
  setStatus("Prototype admin ready.");
}

bootstrap();
