console.log("🧩 popup.ts loaded");

/* ============================================================
   🔹 DOM Elements
============================================================ */

const captureToggle = document.getElementById("captureToggle") as HTMLInputElement;
const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
const clearBtn = document.getElementById("clearBtn") as HTMLButtonElement;
const languageSelect = document.getElementById("language") as HTMLSelectElement;

/* ============================================================
   🔹 Load Initial Capture Mode State
============================================================ */

chrome.storage.local.get(["captureMode"], (res) => {
  captureToggle.checked = Boolean(res.captureMode);
});

/* ============================================================
   🔹 Capture Mode Toggle
============================================================ */

captureToggle.addEventListener("change", () => {
  const enabled = captureToggle.checked;

  chrome.storage.local.set({ captureMode: enabled }, () => {
    console.log("🎥 Capture mode:", enabled ? "ON" : "OFF");
  });
});

/* ============================================================
   🔹 Export Page Objects
============================================================ */

exportBtn.addEventListener("click", () => {
  const language = languageSelect.value; // 'ts' or 'py'
  const fallback = (document.getElementById("fallback") as HTMLSelectElement).value || "chain";

  chrome.runtime.sendMessage({
    type: "EXPORT_REPO",
    payload: {
      language,
      fallback
    }
  });

  console.log("📤 Export requested:", language, fallback);
});

/* ============================================================
   🔹 Clear Repository
============================================================ */

clearBtn.addEventListener("click", () => {
  const confirmed = confirm("Clear all captured elements?");
  if (!confirmed) return;

  chrome.storage.local.set({ automation_repo: {} }, () => {
    console.log("🧹 Repository cleared");
  });
});
