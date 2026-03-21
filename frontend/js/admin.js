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
const demoQuestions = [
  {
    id: "q1",
    order: 1,
    stemHtml: "<p>Which planet is known as the Red Planet?</p>",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    alternateWording: ["Which planet is famous for looking red in the night sky?"],
    glossaryTerms: [{ term: "planet", definition: "A large object that travels around a star." }],
    topic: "Space",
    correctOption: 1
  },
  {
    id: "q2",
    order: 2,
    stemHtml: "<p>What is 9 x 6?</p>",
    options: ["42", "54", "56", "63"],
    alternateWording: ["Multiply 9 by 6."],
    glossaryTerms: [{ term: "multiply", definition: "To combine equal groups to find a total." }],
    topic: "Number",
    correctOption: 1
  },
  {
    id: "q3",
    order: 3,
    stemHtml: "<p>Which Australian city is the capital of New South Wales?</p>",
    options: ["Canberra", "Melbourne", "Sydney", "Newcastle"],
    alternateWording: ["Which city is the capital of the state of New South Wales?"],
    glossaryTerms: [{ term: "capital", definition: "The main city of a state or country." }],
    topic: "Geography",
    correctOption: 2
  },
  {
    id: "q4",
    order: 4,
    stemHtml: "<p>Which sentence uses a verb?</p>",
    options: ["Blue sky", "Running quickly", "Tall building", "Happy dog"],
    alternateWording: ["Choose the option that shows an action word."],
    glossaryTerms: [{ term: "verb", definition: "A word that shows an action or state." }],
    topic: "Grammar",
    correctOption: 1
  },
  {
    id: "q5",
    order: 5,
    stemHtml: "<p>When water is heated to 100 degrees Celsius at sea level, what change happens?</p>",
    options: ["It freezes", "It melts", "It boils", "It disappears"],
    alternateWording: ["What happens to water at 100°C?"],
    glossaryTerms: [{ term: "boils", definition: "Changes from a liquid into a gas because of heat." }],
    topic: "Science",
    correctOption: 2
  }
];

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

  document.querySelector("#seed-demo-exam")?.addEventListener("click", async () => {
    try {
      const examRef = await addDoc(collection(db, "exams"), {
        name: "Demo Year 7 Mixed Skills Quiz",
        description: "Five short multiple-choice questions for testing the platform workflow.",
        questionCount: demoQuestions.length,
        createdBy: adminIdentity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const batch = writeBatch(db);
      demoQuestions.forEach((question) => {
        batch.set(doc(db, "exams", examRef.id, "questions", question.id), {
          order: question.order,
          stemHtml: question.stemHtml,
          imageUrl: "",
          options: question.options,
          alternateWording: question.alternateWording,
          glossaryTerms: question.glossaryTerms,
          topic: question.topic
        });
        batch.set(doc(db, "exams", examRef.id, "answerKeys", question.id), {
          correctOption: question.correctOption
        });
      });
      await batch.commit();

      setStatus(`Demo exam created: ${examRef.id}`, "success");
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

  async function lockSessionAttempts(sessionId) {
    const attemptsQuery = query(collection(db, "attempts"), where("sessionId", "==", sessionId));
    const attemptsSnapshot = await getDocs(attemptsQuery);
    const attemptsBatch = writeBatch(db);

    attemptsSnapshot.forEach((attemptDoc) => {
      attemptsBatch.set(doc(db, "attempts", attemptDoc.id), {
        locked: true,
        status: "submitted",
        submittedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      }, { merge: true });
    });

    const studentsSnapshot = await getDocs(collection(db, "examSessions", sessionId, "sessionStudents"));
    studentsSnapshot.forEach((studentDoc) => {
      attemptsBatch.set(doc(db, "examSessions", sessionId, "sessionStudents", studentDoc.id), {
        status: "submitted",
        lastSeenAt: serverTimestamp()
      }, { merge: true });
    });

    await attemptsBatch.commit();
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
        await lockSessionAttempts(sessionId);
        statusMessage = `Session ${sessionId} deactivated and student access locked.`;
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
