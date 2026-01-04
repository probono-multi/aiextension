const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
const languageSelect = document.getElementById("language") as HTMLSelectElement;
const captureToggle = document.getElementById("captureToggle") as HTMLInputElement;

chrome.storage.local.get(["captureMode"], r => captureToggle.checked = !!r.captureMode);

captureToggle.addEventListener("change", () => {
  chrome.storage.local.set({ captureMode: captureToggle.checked });
});

exportBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "EXPORT_REPO",
    payload: {
      language: languageSelect.value === "python" ? "py" : "ts"
    }
  });
});
