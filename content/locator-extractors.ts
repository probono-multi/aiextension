import { getXPath } from "./dom-utils";

export function extractLocators(el: HTMLElement) {
  const role = el.getAttribute("role");
  const ariaLabel = el.getAttribute("aria-label");

  return {
    css: getUniqueCss(el),
    xpath: getXPath(el),
    role: role ? `${role}[name="${ariaLabel || el.innerText}"]` : undefined,
    text: el.innerText?.trim() || undefined
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
