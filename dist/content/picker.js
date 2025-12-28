"use strict";
console.log("🚀 picker.ts loaded");
let isCaptureEnabled = false;
/* Capture mode sync */
chrome.storage.local.get(["captureMode"], res => {
    isCaptureEnabled = Boolean(res.captureMode);
});
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.captureMode) {
        isCaptureEnabled = Boolean(changes.captureMode.newValue);
    }
});
/* Hover highlight */
let hoveredEl = null;
const HIGHLIGHT = "2px solid #ff0066";
document.addEventListener("mouseover", e => {
    const el = e.target;
    if (!el)
        return;
    if (hoveredEl && hoveredEl !== el)
        hoveredEl.style.outline = "";
    hoveredEl = el;
    hoveredEl.style.outline = HIGHLIGHT;
});
/* Locator extraction */
function getLabelText(el) {
    // Prefer <label for="id">, then parent <label>
    if (el.id) {
        const labelEl = document.querySelector(`label[for="${el.id}"]`);
        if (labelEl)
            return labelEl.textContent?.trim() || undefined;
    }
    let parent = el.parentElement;
    while (parent) {
        if (parent.tagName.toLowerCase() === "label")
            return parent.textContent?.trim() || undefined;
        parent = parent.parentElement;
    }
    return undefined;
}
function getXPath(el) {
    if (el === document.documentElement)
        return "/";
    const parts = [];
    let node = el;
    while (node && node.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = node.previousElementSibling;
        while (sibling) {
            if (sibling.nodeName === node.nodeName)
                index++;
            sibling = sibling.previousElementSibling;
        }
        const part = `${node.nodeName.toLowerCase()}${index > 1 ? `[${index}]` : ""}`;
        parts.unshift(part);
        node = node.parentElement;
    }
    return `/${parts.join("/")}`;
}
function extractLocators(el) {
    const id = el.id || undefined;
    const name = el.getAttribute("name") || undefined;
    const placeholder = el.placeholder || undefined;
    const ariaLabel = el.getAttribute("aria-label") || undefined;
    const ariaLabelledBy = el.getAttribute("aria-labelledby") || undefined;
    const role = el.getAttribute("role") || undefined;
    const title = el.getAttribute("title") || undefined;
    const alt = el.getAttribute("alt") || undefined;
    const testid = el.getAttribute("data-testid") || el.getAttribute("data-test") || undefined;
    const text = el.innerText?.trim() || undefined;
    const css = id
        ? `#${id}`
        : (() => {
            const classes = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "";
            return `${el.tagName.toLowerCase()}${classes}`;
        })();
    const label = getLabelText(el) || ariaLabel || (ariaLabelledBy ? document.getElementById(ariaLabelledBy)?.textContent?.trim() : undefined);
    const xpath = getXPath(el);
    return { id, name, placeholder, ariaLabel, ariaLabelledBy, role, title, alt, testid, text, css, label, xpath };
}
function rankLocators(raw) {
    const ranked = [];
    // Highest confidence: explicit labels and test ids (mapped to getBy*)
    if (raw.label)
        ranked.push({ strategy: "label", playwrightKind: "getByLabel", value: raw.label, stabilityScore: 100, reason: "label text" });
    if (raw.testid)
        ranked.push({ strategy: "testid", playwrightKind: "getByTestId", value: raw.testid, stabilityScore: 98, reason: "data-testid" });
    if (raw.placeholder)
        ranked.push({ strategy: "placeholder", playwrightKind: "getByPlaceholder", value: raw.placeholder, stabilityScore: 97, reason: "placeholder" });
    // semantic selectors
    if (raw.role && raw.role !== "presentation")
        ranked.push({ strategy: "role", playwrightKind: "getByRole", value: raw.role, stabilityScore: 95, reason: "role" });
    if (raw.title)
        ranked.push({ strategy: "title", playwrightKind: "getByTitle", value: raw.title, stabilityScore: 90, reason: "title" });
    if (raw.alt)
        ranked.push({ strategy: "alt", playwrightKind: "getByAltText", value: raw.alt, stabilityScore: 90, reason: "alt text" });
    if (raw.text)
        ranked.push({ strategy: "text", playwrightKind: "getByText", value: raw.text, stabilityScore: 80, reason: "visible text" });
    // attribute and id-based locators (strong fallbacks)
    if (raw.id)
        ranked.push({ strategy: "id", playwrightKind: "locator", value: `#${raw.id}`, stabilityScore: 88, reason: "id" });
    if (raw.name)
        ranked.push({ strategy: "name", playwrightKind: "locator", value: `[name=\"${raw.name}\"]`, stabilityScore: 85, reason: "name" });
    if (raw.css)
        ranked.push({ strategy: "css", playwrightKind: "locator", value: raw.css, stabilityScore: 75, reason: "tag + classes" });
    // Combined attributes (useful for disambiguation)
    const attrs = [];
    if (raw.id)
        attrs.push(`#${raw.id}`);
    if (raw.testid)
        attrs.push(`[data-testid=\"${raw.testid}\"]`);
    if (raw.name)
        attrs.push(`[name=\"${raw.name}\"]`);
    if (attrs.length)
        ranked.push({ strategy: "combined", playwrightKind: "locator", value: attrs.join(""), stabilityScore: 82, reason: "combined attributes" });
    // XPath fallback (less preferred but comprehensive)
    if (raw.xpath)
        ranked.push({ strategy: "xpath", playwrightKind: "xpath", value: raw.xpath, stabilityScore: 50, reason: "xpath" });
    // Deduplicate and sort by stability
    const seen = new Set();
    const deduped = ranked.filter((r) => {
        const key = `${r.playwrightKind}|${r.value}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    return deduped.sort((a, b) => b.stabilityScore - a.stabilityScore);
}
/* Click capture */
document.addEventListener("click", e => {
    if (!isCaptureEnabled)
        return;
    e.preventDefault();
    e.stopPropagation();
    if (!hoveredEl)
        return;
    hoveredEl.style.outline = "";
    const raw = extractLocators(hoveredEl);
    const ranked = rankLocators(raw);
    const descriptor = {
        elementId: crypto.randomUUID(),
        pageUrl: location.href,
        tagName: hoveredEl.tagName.toLowerCase(),
        innerText: hoveredEl.innerText?.trim(),
        // Raw locators and derived attributes for storage and rendering
        locators: raw,
        attributes: {
            id: raw.id,
            name: raw.name,
            placeholder: raw.placeholder,
            ariaLabel: raw.ariaLabel,
            ariaLabelledBy: raw.ariaLabelledBy,
            role: raw.role,
            title: raw.title,
            alt: raw.alt,
            testid: raw.testid
        },
        // Ranked locator candidates
        rankedLocators: ranked,
        capturedAt: new Date().toISOString()
    };
    chrome.runtime.sendMessage({
        type: "STORE_ELEMENT",
        payload: descriptor
    });
    console.log("✅ Captured", descriptor);
}, true);
// console.log("🚀 picker.ts loaded");
// /* ============================================================
//    🔹 Capture Mode State
// ============================================================ */
// let isCaptureEnabled = false;
// chrome.storage.local.get(["captureMode"], (res) => {
//   isCaptureEnabled = Boolean(res.captureMode);
// });
// chrome.storage.onChanged.addListener((changes, area) => {
//   if (area === "local" && changes.captureMode) {
//     isCaptureEnabled = Boolean(changes.captureMode.newValue);
//     console.log("🎥 Capture mode:", isCaptureEnabled ? "ON" : "OFF");
//   }
// });
// /* ============================================================
//    🔹 Locator Extraction
// ============================================================ */
// function extractLocators(el: HTMLElement) {
//   return {
//     role: el.getAttribute("role") || undefined,
//     label:
//       el.getAttribute("aria-label") ||
//       el.getAttribute("aria-labelledby") ||
//       undefined,
//     placeholder: (el as HTMLInputElement).placeholder || undefined,
//     title: el.getAttribute("title") || undefined,
//     text: el.innerText?.trim() || undefined,
//     testid:
//       el.getAttribute("data-testid") ||
//       el.getAttribute("data-test") ||
//       undefined,
//     css: el.id ? `#${el.id}` : el.tagName.toLowerCase()
//   };
// }
// /* ============================================================
//    🔹 Locator Ranking
// ============================================================ */
// function rankLocators(raw: any) {
//   const ranked: any[] = [];
//   if (raw.label) {
//     ranked.push({
//       strategy: "label",
//       value: raw.label,
//       playwrightKind: "getByLabel",
//       stabilityScore: 95
//     });
//   }
//   if (raw.placeholder) {
//     ranked.push({
//       strategy: "placeholder",
//       value: raw.placeholder,
//       playwrightKind: "getByPlaceholder",
//       stabilityScore: 90
//     });
//   }
//   if (raw.role && raw.text) {
//     ranked.push({
//       strategy: "role",
//       value: raw.role,
//       playwrightKind: "getByRole",
//       stabilityScore: 85
//     });
//   }
//   if (raw.text) {
//     ranked.push({
//       strategy: "text",
//       value: raw.text,
//       playwrightKind: "getByText",
//       stabilityScore: 70
//     });
//   }
//   if (raw.css) {
//     ranked.push({
//       strategy: "css",
//       value: raw.css,
//       playwrightKind: "locator",
//       stabilityScore: 50
//     });
//   }
//   return ranked.sort((a, b) => b.stabilityScore - a.stabilityScore);
// }
// /* ============================================================
//    🔹 Hover Highlight
// ============================================================ */
// let hoveredEl: HTMLElement | null = null;
// const HIGHLIGHT_STYLE = "2px solid #ff0066";
// document.addEventListener("mouseover", (e) => {
//   const el = e.target as HTMLElement;
//   if (!el) return;
//   if (hoveredEl && hoveredEl !== el) {
//     hoveredEl.style.outline = "";
//   }
//   hoveredEl = el;
//   hoveredEl.style.outline = HIGHLIGHT_STYLE;
// });
// /* ============================================================
//    🔹 Click Capture
// ============================================================ */
// document.addEventListener(
//   "click",
//   (e) => {
//     if (!isCaptureEnabled) return;
//     e.preventDefault();
//     e.stopPropagation();
//     if (!hoveredEl) return;
//     const el = hoveredEl;
//     el.style.outline = "";
//     // Ignore junk clicks
//     if (
//       el === document.body ||
//       el === document.documentElement ||
//       el.innerText.length > 500
//     ) {
//       return;
//     }
//     const rawLocators = extractLocators(el);
//     const rankedLocators = rankLocators(rawLocators);
//     if (!rankedLocators.length) {
//       console.warn("⛔ No usable locators found");
//       return;
//     }
//     const descriptor = {
//       elementId: crypto.randomUUID(),
//       pageUrl: location.href,
//       tagName: el.tagName.toLowerCase(),
//       innerText: el.innerText?.trim(),
//       attributes: {
//         id: el.id || undefined,
//         name: el.getAttribute("name") || undefined,
//         placeholder: el.getAttribute("placeholder") || undefined,
//         role: el.getAttribute("role") || undefined
//       },
//       // 🔥 THIS ENABLES getBy*
//       locators: rawLocators,
//       rankedLocators: rankedLocators,
//       capturedAt: new Date().toISOString()
//     };
//     chrome.runtime.sendMessage({
//       type: "STORE_ELEMENT",
//       payload: descriptor
//     });
//     console.log("✅ Captured element", descriptor);
//   },
//   true
// );
