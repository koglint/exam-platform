const FONT_KEY = "examPlatformFontScale";
const CONTRAST_KEY = "examPlatformContrast";

export function applySavedAccessibilityPreferences() {
  const savedScale = Number(localStorage.getItem(FONT_KEY) || "1");
  const savedContrast = localStorage.getItem(CONTRAST_KEY) === "true";

  document.documentElement.style.setProperty("--font-scale", String(savedScale));
  document.body.classList.toggle("high-contrast", savedContrast);
}

export function setupFontSizeControls() {
  document.querySelectorAll("[data-font-size]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = Number(localStorage.getItem(FONT_KEY) || "1");
      const delta = button.dataset.fontSize === "increase" ? 0.1 : -0.1;
      const next = Math.min(1.5, Math.max(0.9, Number((current + delta).toFixed(2))));
      localStorage.setItem(FONT_KEY, String(next));
      document.documentElement.style.setProperty("--font-scale", String(next));
    });
  });
}

export function setupContrastToggle() {
  const button = document.querySelector("#contrast-toggle");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const enabled = !document.body.classList.contains("high-contrast");
    document.body.classList.toggle("high-contrast", enabled);
    localStorage.setItem(CONTRAST_KEY, String(enabled));
  });
}

export function setupTextToSpeech(getText) {
  const button = document.querySelector("#tts-button");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const text = getText();
    if (!text) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  });
}

export function renderGlossaryTerms(terms = []) {
  const glossaryEl = document.querySelector("#question-glossary");
  if (!glossaryEl) {
    return;
  }

  glossaryEl.innerHTML = "";
  terms.forEach((term) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "glossary-term";
    chip.textContent = term.term;
    chip.dataset.definition = term.definition;
    glossaryEl.appendChild(chip);
  });
}
