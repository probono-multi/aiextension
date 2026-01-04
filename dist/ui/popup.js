"use strict";
const exportBtn = document.getElementById("exportBtn");
const languageSelect = document.getElementById("language");
const captureToggle = document.getElementById("captureToggle");
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
