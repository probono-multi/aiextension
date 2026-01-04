
let isCaptureEnabled = false;
let hoveredEl = null;
chrome.storage.local.get(["captureMode"], r => isCaptureEnabled = !!r.captureMode);
chrome.storage.onChanged.addListener(c => {
    if (c.captureMode)
        isCaptureEnabled = !!c.captureMode.newValue;
});
document.addEventListener("mouseover", e => {
    const el = e.target;
    if (!el)
        return;
    hoveredEl?.style.removeProperty("outline");
    hoveredEl = el;
    hoveredEl.style.outline = "2px solid #ff0066";
});
document.addEventListener("click", e => {
    if (!isCaptureEnabled || !hoveredEl)
        return;
    e.preventDefault();
    e.stopPropagation();
    const rawLocators = extractLocators(hoveredEl);
    const rankedLocators = rankLocators(rawLocators);
    chrome.runtime.sendMessage({
        type: "STORE_ELEMENT",
        payload: {
            elementId: crypto.randomUUID(),
            pageUrl: location.href,
            tagName: hoveredEl.tagName.toLowerCase(),
            innerText: hoveredEl.innerText?.trim(),
            locators: rawLocators,
            rankedLocators,
            capturedAt: new Date().toISOString()
        }
    });
}, true);
function extractLocators(el) {
    return {
        role: el.getAttribute("role") || undefined,
        label: el.getAttribute("aria-label") ||
            el.getAttribute("aria-labelledby") ||
            undefined,
        placeholder: el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
            ? el.placeholder || undefined
            : undefined,
        title: el.getAttribute("title") || undefined,
        text: el.innerText?.trim() || undefined,
        testid: el.getAttribute("data-testid") ||
            el.getAttribute("data-test") ||
            undefined,
        css: el.id ? `#${el.id}` : el.tagName.toLowerCase()
    };
}
function rankLocators(raw) {
    const ranked = [];
    if (raw.placeholder) {
        ranked.push({
            strategy: "placeholder",
            value: raw.placeholder,
            playwrightKind: "getByPlaceholder",
            stabilityScore: 95
        });
    }
    if (raw.label) {
        ranked.push({
            strategy: "label",
            value: raw.label,
            playwrightKind: "getByLabel",
            stabilityScore: 90
        });
    }
    if (raw.role) {
        ranked.push({
            strategy: "role",
            value: raw.role,
            playwrightKind: "getByRole",
            stabilityScore: 85
        });
    }
    if (raw.text) {
        ranked.push({
            strategy: "text",
            value: raw.text,
            playwrightKind: "getByText",
            stabilityScore: 70
        });
    }
    if (raw.css) {
        ranked.push({
            strategy: "css",
            value: raw.css,
            playwrightKind: "locator",
            stabilityScore: 50
        });
    }
    return ranked.sort((a, b) => b.stabilityScore - a.stabilityScore);
}
