console.log("🚀 Automation Designer content script loaded");

function getXPath(element: Element): string {
  if ((element as HTMLElement).id) {
    return `//*[@id="${(element as HTMLElement).id}"]`;
  }

  const parts: string[] = [];

  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = element.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === element.tagName) index++;
      sibling = sibling.previousElementSibling;
    }

    parts.unshift(`${element.tagName.toLowerCase()}[${index}]`);
    element = element.parentElement!;
  }

  return "/" + parts.join("/");
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.offsetParent !== null
  );
}

function extractLocators(el: HTMLElement) {
  const role = el.getAttribute("role");
  const ariaLabel = el.getAttribute("aria-label");

  return {
    css: el.id ? `#${el.id}` : el.tagName.toLowerCase(),
    xpath: getXPath(el),
    role: role ? `${role}[name="${ariaLabel || el.innerText}"]` : undefined,
    text: el.innerText?.trim() || undefined
  };
}

let hoveredEl: HTMLElement | null = null;
const HIGHLIGHT_STYLE = "2px solid #ff0066";

function highlight(el: HTMLElement) {
  el.style.outline = HIGHLIGHT_STYLE;
}

function unhighlight(el: HTMLElement) {
  el.style.outline = "";
}

document.addEventListener("mouseover", (e) => {
  if (hoveredEl) unhighlight(hoveredEl);
  hoveredEl = e.target as HTMLElement;
  if (hoveredEl) highlight(hoveredEl);
});

document.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    e.stopPropagation();

    const el = e.target as HTMLElement;
    if (!el) return;

    const descriptor = {
      elementId: crypto.randomUUID(),
      pageUrl: window.location.href,
      tagName: el.tagName.toLowerCase(),
      innerText: el.innerText?.trim(),

      attributes: {
        id: el.id || undefined,
        name: el.getAttribute("name") || undefined,
        class: el.className || undefined,
        role: el.getAttribute("role") || undefined,
        ariaLabel: el.getAttribute("aria-label") || undefined,
        dataTestId: el.getAttribute("data-testid") || undefined
      },

      locators: extractLocators(el),

      state: {
        visible: isVisible(el),
        enabled: !(el as HTMLInputElement).disabled,
        readonly: (el as HTMLInputElement).readOnly
      },

      capturedAt: new Date().toISOString()
    };

    console.clear();
    console.log("🔷 Captured Element Descriptor", descriptor);
  },
  true
);
