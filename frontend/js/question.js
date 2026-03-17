import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import {
  applySavedAccessibilityPreferences,
  renderGlossaryTerms,
  setupContrastToggle,
  setupFontSizeControls,
  setupTextToSpeech
} from "./accessibility.js";
import { postJson } from "./api.js";

const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
const examId = sessionStorage.getItem("currentExamId");
const attemptId = sessionStorage.getItem("currentAttemptId");
let questions = [];
let attempt = null;
let showAlternateWording = false;

function requireStudentAttempt() {
  if (!currentUser || currentUser.role !== "student" || !examId || !attemptId) {
    window.location.href = "./login.html";
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
    imageEl.classList.add("hidden");
  }
}

async function saveResponse(questionId, selectedOption) {
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

  setActivity("Answer saved", "success");
}

async function submitAttempt() {
  const confirmed = window.confirm("Submit your exam? You will not be able to change answers unless a teacher reopens the attempt.");
  if (!confirmed) {
    return;
  }

  await updateDoc(doc(db, "attempts", attemptId), {
    locked: true,
    status: "submitted",
    submittedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  });

  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : null;
  await postJson("/markAttempt", { attemptId }, idToken);
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
    renderCurrentQuestion(getQuestionOrderFromUrl() - 1, responses);
  });

  document.querySelector("#next-question").addEventListener("click", () => {
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
