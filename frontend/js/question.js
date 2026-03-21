import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";
import {
  applySavedAccessibilityPreferences,
  renderGlossaryTerms,
  setupContrastToggle,
  setupFontSizeControls,
  setupTextToSpeech
} from "./accessibility.js";
import { postJson } from "./api.js";

const currentStudent = JSON.parse(sessionStorage.getItem("currentStudent") || "null");
const examId = sessionStorage.getItem("currentExamId");
const attemptId = sessionStorage.getItem("currentAttemptId");
const sessionId = sessionStorage.getItem("currentSessionId");
let questions = [];
let attempt = null;
let showAlternateWording = false;
let sessionClosed = false;

function requireStudentAttempt() {
  if (!currentStudent || !examId || !attemptId || !sessionId) {
    window.location.href = "./enter-code.html";
    throw new Error("A valid student attempt is required.");
  }
}

function setActivity(message, variant = "") {
  const el = document.querySelector("#activity-status");
  if (!el) {
    return;
  }

  el.textContent = message;
  el.className = `notice small ${variant}`.trim();
}

function getQuestionOrderFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("order") || "1");
}

function setQuestionOrderInUrl(order) {
  const url = new URL(window.location.href);
  url.searchParams.set("order", String(order));
  window.history.replaceState({}, "", url);
}

async function loadAttempt() {
  const attemptRef = doc(db, "attempts", attemptId);
  const snapshot = await getDoc(attemptRef);
  if (!snapshot.exists()) {
    throw new Error("Attempt not found.");
  }

  attempt = snapshot.data();
  if (attempt.locked) {
    window.location.href = "./submitted.html";
  }
  if (!attempt.examStartedAt) {
    window.location.href = "./instructions.html";
  }
}

async function loadQuestions() {
  const questionsQuery = query(
    collection(db, "exams", examId, "questions"),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(questionsQuery);
  questions = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data()
  }));

  sessionStorage.setItem("cachedQuestions", JSON.stringify(questions));
}

async function loadResponses() {
  const responsesSnapshot = await getDocs(collection(db, "attempts", attemptId, "responses"));
  const responseMap = new Map();
  responsesSnapshot.forEach((docSnapshot) => {
    responseMap.set(docSnapshot.id, docSnapshot.data());
  });
  return responseMap;
}

function renderQuestionGrid(responses) {
  const grid = document.querySelector("#question-grid");
  if (!grid) {
    return;
  }

  const activeOrder = getQuestionOrderFromUrl();
  grid.innerHTML = "";

  questions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(question.order);
    button.className = [
      question.order === activeOrder ? "current" : "",
      responses.has(question.id) ? "answered" : ""
    ].join(" ").trim();
    button.addEventListener("click", () => renderCurrentQuestion(question.order, responses));
    grid.appendChild(button);
  });
}

function renderOptions(question, selectedOption) {
  const form = document.querySelector("#question-form");
  form.innerHTML = "";

  question.options.forEach((option, index) => {
    const optionId = `option-${index}`;
    const label = document.createElement("label");
    label.className = "option-card";
    label.htmlFor = optionId;
    label.innerHTML = `
      <input id="${optionId}" type="radio" name="selectedOption" value="${index}" ${String(index) === String(selectedOption) ? "checked" : ""}>
      <span>${option}</span>
    `;
    form.appendChild(label);
  });
}

function renderQuestion(question, response) {
  document.querySelector("#question-counter").textContent = `Question ${question.order} of ${questions.length}`;
  document.querySelector("#question-text").innerHTML = showAlternateWording && question.alternateWording?.length
    ? question.alternateWording.join("<br>")
    : question.stemHtml;

  renderGlossaryTerms(question.glossaryTerms || []);
  renderOptions(question, response?.selectedOption);

  const imageEl = document.querySelector("#question-image");
  if (question.imageUrl) {
    imageEl.src = question.imageUrl;
    imageEl.alt = question.imageAlt || "Question image";
    imageEl.loading = "lazy";
    imageEl.classList.remove("hidden");
  } else {
    imageEl.removeAttribute("src");
    imageEl.classList.add("hidden");
  }
}

function setExamInteractionDisabled(isDisabled) {
  document.querySelectorAll("#question-form input").forEach((input) => {
    input.disabled = isDisabled;
  });
  document.querySelector("#prev-question").disabled = isDisabled || getQuestionOrderFromUrl() === 1;
  document.querySelector("#next-question").disabled = isDisabled || getQuestionOrderFromUrl() === questions.length;
  document.querySelector("#submit-attempt").disabled = isDisabled;
  document.querySelector("#alternate-wording-toggle").disabled = isDisabled;
}

function monitorSessionAccess() {
  onSnapshot(doc(db, "examSessions", sessionId), (snapshot) => {
    const session = snapshot.data();
    sessionClosed = !session?.active;
    setExamInteractionDisabled(sessionClosed);

    if (sessionClosed) {
      setActivity("This exam has been closed by the teacher.", "error");
    }
  });
}

async function saveResponse(questionId, selectedOption) {
  if (sessionClosed) {
    setActivity("This exam has been closed by the teacher.", "error");
    return;
  }

  const responseRef = doc(db, "attempts", attemptId, "responses", questionId);
  await setDoc(responseRef, {
    questionId,
    selectedOption: Number(selectedOption),
    savedAt: serverTimestamp()
  }, { merge: true });

  await updateDoc(doc(db, "attempts", attemptId), {
    currentQuestionOrder: getQuestionOrderFromUrl(),
    lastActivityAt: serverTimestamp(),
    status: "in_progress"
  });

  await setDoc(doc(db, "examSessions", sessionId, "sessionStudents", currentStudent.sessionStudentId), {
    status: "in_progress",
    lastSeenAt: serverTimestamp()
  }, { merge: true });

  setActivity("Answer saved", "success");
}

async function submitAttempt() {
  if (sessionClosed) {
    setActivity("This exam has been closed by the teacher.", "error");
    return;
  }

  const confirmed = window.confirm("Submit your exam? Your answers will be saved, and you can still re-enter while the teacher keeps the exam session open.");
  if (!confirmed) {
    return;
  }

  await updateDoc(doc(db, "attempts", attemptId), {
    status: "submitted",
    submittedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  });

  await setDoc(doc(db, "examSessions", sessionId, "sessionStudents", currentStudent.sessionStudentId), {
    status: "submitted",
    lastSeenAt: serverTimestamp()
  }, { merge: true });

  await postJson("/markAttempt", { attemptId });
  window.location.href = "./submitted.html";
}

async function renderCurrentQuestion(order, responses) {
  const question = questions.find((item) => item.order === order);
  if (!question) {
    return;
  }

  setQuestionOrderInUrl(order);
  renderQuestion(question, responses.get(question.id));
  renderQuestionGrid(responses);

  document.querySelector("#prev-question").disabled = order === 1;
  document.querySelector("#next-question").disabled = order === questions.length;
}

async function bindEvents(responses) {
  document.querySelector("#question-form").addEventListener("change", async (event) => {
    if (sessionClosed) {
      return;
    }

    if (event.target.name !== "selectedOption") {
      return;
    }

    const order = getQuestionOrderFromUrl();
    const question = questions.find((item) => item.order === order);
    responses.set(question.id, { selectedOption: event.target.value });
    await saveResponse(question.id, event.target.value);
    renderQuestionGrid(responses);
  });

  document.querySelector("#prev-question").addEventListener("click", () => {
    if (sessionClosed) {
      return;
    }
    renderCurrentQuestion(getQuestionOrderFromUrl() - 1, responses);
  });

  document.querySelector("#next-question").addEventListener("click", () => {
    if (sessionClosed) {
      return;
    }
    renderCurrentQuestion(getQuestionOrderFromUrl() + 1, responses);
  });

  document.querySelector("#submit-attempt").addEventListener("click", submitAttempt);
  document.querySelector("#alternate-wording-toggle").addEventListener("click", () => {
    showAlternateWording = !showAlternateWording;
    renderCurrentQuestion(getQuestionOrderFromUrl(), responses);
  });
}

async function bootstrap() {
  requireStudentAttempt();
  applySavedAccessibilityPreferences();
  setupFontSizeControls();
  setupContrastToggle();
  setupTextToSpeech(() => document.querySelector("#question-text")?.textContent || "");

  try {
    await loadAttempt();
    monitorSessionAccess();
    await loadQuestions();
    const responses = await loadResponses();
    await bindEvents(responses);
    await renderCurrentQuestion(getQuestionOrderFromUrl(), responses);
    setActivity("Ready");
  } catch (error) {
    setActivity(error.message, "error");
  }
}

bootstrap();
