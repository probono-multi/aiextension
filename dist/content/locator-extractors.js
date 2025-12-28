import { getXPath } from "./dom-utils.js";
export function extractLocators(el) {
    return {
        role: el.getAttribute("role") || undefined,
        label: el.getAttribute("aria-label") ||
            el.getAttribute("aria-labelledby") ||
            undefined,
        placeholder: el.placeholder || undefined,
        title: el.getAttribute("title") || undefined,
        text: el.innerText?.trim() || undefined,
        testid: el.getAttribute("data-testid") ||
            el.getAttribute("data-test") ||
            undefined,
        css: el.id ? `#${el.id}` : el.tagName.toLowerCase(),
        xpath: getXPath(el)
    };
}
function getUniqueCss(el) {
    if (el.id)
        return `#${el.id}`;
    const path = [];
    let element = el;
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.tagName.toLowerCase();
        if (element.className) {
            const classes = element.className.split(" ").filter(Boolean);
            selector += "." + classes.join(".");
        }
        path.unshift(selector);
        element = element.parentElement;
    }
    return path.join(" > ");
}
