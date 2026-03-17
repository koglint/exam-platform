function resolveApiBaseUrl() {
  if (window.EXAM_PLATFORM_API_BASE_URL) {
    return window.EXAM_PLATFORM_API_BASE_URL;
  }

  const host = window.location.hostname;
  if (host === "koglint.github.io") {
    return "https://exam-platform-455r.onrender.com";
  }

  return "http://localhost:8000";
}

const API_BASE_URL = resolveApiBaseUrl();

export async function postJson(path, payload, idToken) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL };
