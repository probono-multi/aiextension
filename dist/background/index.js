import { saveElement } from "./store.js";
import { generatePlaywrightTS } from "../codegen/playwright-ts.js";
import { generatePlaywrightPY } from "../codegen/playwright-py.js";
console.log("🚀 Background service worker started");
chrome.runtime.onMessage.addListener((message) => {
    if (!message?.type)
        return;
    switch (message.type) {
        case "STORE_ELEMENT":
            saveElement(message.payload);
            break;
        case "EXPORT_REPO":
            exportRepo(message.payload.language, message.payload.fallback);
            break;
        default:
            console.warn("⚠️ Unknown message type", message.type);
    }
});
/* ============================================================
   🔹 Export Repository (MV3 SAFE)
============================================================ */
function exportRepo(language, fallback = "chain") {
    chrome.storage.local.get(["automation_repo"], (res) => {
        const repo = res.automation_repo || {};
        Object.values(repo).forEach((page) => {
            const code = language === "py"
                ? generatePlaywrightPY(page, fallback)
                : generatePlaywrightTS(page, fallback);
            const dataUrl = "data:text/plain;charset=utf-8," +
                encodeURIComponent(code);
            chrome.downloads.download({
                url: dataUrl,
                filename: `${page.pageName}.${language}`,
                saveAs: true
            });
        });
    });
}
