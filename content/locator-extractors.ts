import { getXPath } from "./dom-utils.js";


export function extractLocators(el: HTMLElement) {
  return {
    role: el.getAttribute("role") || undefined,
    label:
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      undefined,
    placeholder: (el as HTMLInputElement).placeholder || undefined,
    title: el.getAttribute("title") || undefined,
    text: el.innerText?.trim() || undefined,
    testid:
      el.getAttribute("data-testid") ||
      el.getAttribute("data-test") ||
      undefined,
    css: el.id ? `#${el.id}` : el.tagName.toLowerCase(),
    xpath: getXPath(el)
  };
}

function getUniqueCss(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;

  const path: string[] = [];
  let element: HTMLElement | null = el;

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
