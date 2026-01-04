import { saveElement } from "./store.js";
import { generateTS } from "../codegen/playwright-ts.js";
import { generatePY } from "../codegen/playwright-py.js";
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "STORE_ELEMENT") {
        saveElement(msg.payload);
    }
    if (msg.type === "EXPORT_REPO") {
        chrome.storage.local.get(["automation_repo"], res => {
            const repo = (res.automation_repo ?? {});
            const output = msg.payload.language === "py"
                ? generatePY(repo)
                : generateTS(repo);
            chrome.downloads.download({
                url: "data:text/plain;charset=utf-8," + encodeURIComponent(output),
                filename: `page_objects.${msg.payload.language}`,
                saveAs: true
            });
        });
    }
});
