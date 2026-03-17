# Exam Platform Scaffold

This repository contains a full-stack scaffold for a school exam platform built with:

- Static frontend using plain HTML, CSS, and vanilla JavaScript
- Firebase Authentication and Firestore
- FastAPI backend for secure marking and report generation
- Firebase security rules and indexes

The focus is architecture and maintainability. This is intentionally a scaffold, not a completed production system.

## Why the architecture is split this way

- The frontend handles authentication, page flow, and student/admin UI only.
- Firestore stores operational data such as rosters, sessions, attempts, and responses.
- The backend owns privileged logic such as marking and PDF report generation.
- Correct answers are expected to be stored in Firestore question documents under a server-only field such as `correctOption`, but they must never be fetched by the frontend.

This separation keeps sensitive logic out of browser code and makes the system easier to scale and deploy.

## Project structure

```text
frontend/
  login.html
  enter-code.html
  instructions.html
  exam.html
  question.html
  submitted.html
  admin.html
  css/
  js/

backend/
  app.py
  requirements.txt
  routes/
  services/
  reports/
  marking/

firebase/
  firestore.rules
  firestore.indexes.json
```

## Local setup

### 1. Configure Firebase

1. Create a Firebase project.
2. Enable Google Authentication.
3. Restrict sign-in to your Google Workspace domain where appropriate.
4. Create Firestore.
5. Add your Firebase web app config in `frontend/js/firebase-init.js`.
6. Copy `.env.example` to `.env`.
7. Provide backend credentials through `GOOGLE_APPLICATION_CREDENTIALS` or ambient Firebase credentials.

### 2. Install backend dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### 3. Serve the frontend locally

Use any simple static server. For example:

```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500/login.html`.

## Firestore model summary

- `students/{email}`
- `teachers/{email}`
- `classes/{classId}`
- `exams/{examId}`
- `exams/{examId}/questions/{questionId}`
- `examSessions/{sessionId}`
- `attempts/{attemptId}`
- `attempts/{attemptId}/responses/{questionId}`

Suggested document ids:

- Roster documents use lowercase email addresses.
- Attempts use `{sessionId}_{studentEmail}` so resume logic is straightforward.

## Frontend responsibilities

- Authenticate with Firebase Google Sign-In
- Validate NSW Education email domain
- Resolve roster membership from Firestore
- Allow students to enter an exam code and resume attempts
- Autosave responses only when the selected answer changes
- Provide modular accessibility helpers
- Provide a teacher admin scaffold for uploads, session control, and live monitoring

## Backend responsibilities

- Verify Firebase ID tokens
- Load submitted attempts
- Mark responses against server-side correct answers
- Persist marks back to Firestore
- Generate placeholder PDF reports for students and teachers

## Notes for production hardening

- The current Firestore rules are prototype-only and intentionally permissive so the unauthenticated student-code flow can be tested quickly.
- Move frontend Firebase config to environment injection during deployment.
- Replace basic CSV parsing with a robust parser that handles quoted values.
- Tighten admin queries so teachers only monitor their own classes.
- Reintroduce proper authentication and least-privilege rules before uploading any real exams, rosters, or answer keys.
- Add backend background jobs for long-running report generation.
- Add tests for marking, auth, and rules behavior.
- Review Firestore rules carefully before live deployment.

## Render deployment notes

- Deploy `backend/` as a Python web service.
- In Render, set `PYTHON_VERSION=3.12.10` so the service does not default to an unsupported newer Python version.
- Set the start command to `uvicorn app:app --host 0.0.0.0 --port $PORT`.
- Add environment variables from `.env.example`.
- Provide Firebase service account credentials through Render environment files or secret storage.
- `FIREBASE_STORAGE_BUCKET` is optional and can be omitted if you are not using Firebase Storage.

## Static hosting notes

The frontend is plain static files and is compatible with GitHub Pages or Firebase Hosting. This scaffold includes a root [index.html](c:/Users/usfal/OneDrive%20-%20NSW%20Department%20of%20Education/Documents/My%20Coding%20Projects/exam-platform/index.html) that redirects GitHub Pages visitors to [frontend/login.html](c:/Users/usfal/OneDrive%20-%20NSW%20Department%20of%20Education/Documents/My%20Coding%20Projects/exam-platform/frontend/login.html).

For this repository:

- Production frontend host: `https://koglint.github.io/exam-platform/`
- Production backend host: `https://exam-platform-455r.onrender.com`

Also make sure Firebase Authentication allows `koglint.github.io` as an authorised domain.
