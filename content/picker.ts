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

function getPageKey(): string {
  return new URL(window.location.href).pathname || "/";
}

interface PageObject {
  pageName: string;
  pageUrl: string;
  elements: any[];
}

type AutomationRepo = Record<string, PageObject>;


function saveToRepository(descriptor: any) {
  const pageKey = getPageKey();

  chrome.storage.local.get(["automation_repo"], (result) => {
  console.log("📦 Automation Repo", result.automation_repo);
});


  chrome.storage.local.get(["automation_repo"], (result) => {
    const repo = (result.automation_repo ?? {}) as AutomationRepo;


    if (!repo[pageKey]) {
      repo[pageKey] = {
        pageName: pageKey.replace(/\W+/g, "") || "home",
        pageUrl: pageKey,
        elements: []
      };
    }

    repo[pageKey].elements.push(descriptor);

    chrome.storage.local.set({ automation_repo: repo }, () => {
      console.log("✅ Element stored in Object Repository", repo);
    });
  });
}


document.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    e.stopPropagation();

    const el = e.target as HTMLElement;
    if (!el) return;

    const rawLocators = extractLocators(el);
    const rankedLocators = rankLocators(rawLocators, el);

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

      
      locators: rawLocators,
      rankedLocators: rankedLocators,

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

function rankLocators(raw: {
  css?: string;
  xpath?: string;
  role?: string;
  text?: string;
}, el: HTMLElement): any[] {

  const ranked: any[] = [];

  const penalize = (value: string, base: number) => {
    let score = base;

    if (/\d/.test(value)) score -= 10;
    if (value.split(">").length > 3) score -= 10;
    if (value.length > 30) score -= 5;

    return Math.max(score, 0);
  };

  if (el.getAttribute("data-testid")) {
    ranked.push({
      strategy: "dataTestId",
      value: `[data-testid="${el.getAttribute("data-testid")}"]`,
      stabilityScore: 95,
      reason: "Explicit test id"
    });
  }

  if (raw.role) {
    ranked.push({
      strategy: "role",
      value: raw.role,
      stabilityScore: penalize(raw.role, 90),
      reason: "ARIA role based selector"
    });
  }

  if (raw.css) {
    ranked.push({
      strategy: "css",
      value: raw.css,
      stabilityScore: penalize(raw.css, 75),
      reason: "CSS selector"
    });
  }

  if (raw.xpath) {
    ranked.push({
      strategy: "xpath",
      value: raw.xpath,
      stabilityScore: penalize(raw.xpath, 40),
      reason: "XPath selector"
    });
  }

  if (raw.text) {
    ranked.push({
      strategy: "text",
      value: raw.text,
      stabilityScore: penalize(raw.text, 30),
      reason: "Visible text selector"
    });
  }

  return ranked.sort((a, b) => b.stabilityScore - a.stabilityScore);
}
