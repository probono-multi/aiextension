import { RankedLocator } from "./locator-model.js";
import { resolveAction } from "./action-resolver.js";

/* ============================================================
   Render Playwright Locator
============================================================ */

function renderLocator(locator: RankedLocator): string {
  switch (locator.playwrightKind) {
    case "getByRole":
      return `this.page.getByRole("${locator.value}")`;

    case "getByLabel":
      return `this.page.getByLabel("${locator.value}")`;

    case "getByPlaceholder":
      return `this.page.getByPlaceholder("${locator.value}")`;

    case "getByText":
      return `this.page.getByText("${locator.value}")`;

    case "getByTitle":
      return `this.page.getByTitle("${locator.value}")`;

    case "getByTestId":
      return `this.page.getByTestId("${locator.value}")`;

    case "getByAltText":
      return `this.page.getByAltText("${locator.value}")`;

    case "xpath":
      return `this.page.locator(` + "`xpath=${locator.value}`" + `)`;

    default:
      return `this.page.locator("${locator.value}")`;
  }
}

/* ============================================================
   Generate Playwright TS Page Object
============================================================ */

function buildTSLocatorChain(locators: RankedLocator[]): string {
  if (!locators.length) return "";

  let chain = renderPlaywrightTSLocator(locators[0]);

  for (let i = 1; i < locators.length; i++) {
    chain += `.or(${renderPlaywrightTSLocator(locators[i])})`;
  }

  return chain;
}

function buildTSLocatorArray(locators: RankedLocator[]): string {
  if (!locators.length) return "[]";

  const items = locators.map((l) => renderPlaywrightTSLocator(l));
  return `[${items.join(", ")}]`;
}


export function generatePlaywrightTS(page: any, fallback: string = "chain"): string {
  const lines: string[] = [];

  const className =
    page.pageName.charAt(0).toUpperCase() + page.pageName.slice(1) + "Page";

  lines.push(`import { Page } from "@playwright/test";\n`);
  lines.push(`export class ${className} {`);
  lines.push(`  constructor(private page: Page) {}\n`);

  for (const el of page.elements) {
    if (!el.rankedLocators || el.rankedLocators.length === 0) continue;

    const action = resolveAction(el);

    const methodName = generateMethodName(el, action);
    lines.push(`  async ${methodName}(value?: string, strategy?: string) {`);

    // locator map for caller-specified strategy
    const locatorMap = buildTSLocatorMap(el.rankedLocators);
    lines.push(`    const locatorMap: Record<string, any> = ${locatorMap};`);
    lines.push(`    if (strategy && locatorMap[strategy]) {`);
    switch (action) {
      case "fill":
        lines.push(`      await locatorMap[strategy].first().fill(value ?? "");`);
        lines.push(`      return;`);
        break;

      case "select":
        lines.push(`      await locatorMap[strategy].first().selectOption(value ?? "");`);
        lines.push(`      return;`);
        break;

      case "check":
        lines.push(`      await locatorMap[strategy].first().check();`);
        lines.push(`      return;`);
        break;

      case "upload":
        lines.push(`      await locatorMap[strategy].first().setInputFiles(value ?? "");`);
        lines.push(`      return;`);
        break;

      default:
        lines.push(`      await locatorMap[strategy].first().click();`);
        lines.push(`      return;`);
    }

    lines.push(`    }`);
    // --- build the candidate locators array / chain
    const chain = buildTSLocatorChain(el.rankedLocators);
    const array = buildTSLocatorArray(el.rankedLocators);

    if (fallback === "chain") {
      // single chained locator: use .first() for actions that target an element
      switch (action) {
        case "fill":
          lines.push(`    await ${chain}.first().fill(value ?? "");`);
          break;

        case "select":
          lines.push(`    await ${chain}.first().selectOption(value ?? "");`);
          break;

        case "check":
          lines.push(`    await ${chain}.first().check();`);
          break;

        case "upload":
          lines.push(`    await ${chain}.first().setInputFiles(value ?? "");`);
          break;

        default:
          lines.push(`    await ${chain}.first().click();`);
      }
    } else {
      // sequential / trycatch style: try each locator with a short wait
      lines.push(`    const locators = ${array};`);
      lines.push(`    for (const loc of locators) {`);
      lines.push(`      try {`);
      lines.push(`        await loc.first().waitFor({ state: "visible", timeout: 300 });`);

      switch (action) {
        case "fill":
          lines.push(`        await loc.first().fill(value ?? "");`);
          break;

        case "select":
          lines.push(`        await loc.first().selectOption(value ?? "");`);
          break;

        case "check":
          lines.push(`        await loc.first().check();`);
          break;

        case "upload":
          lines.push(`        await loc.first().setInputFiles(value ?? "");`);
          break;

        default:
          lines.push(`        await loc.first().click();`);
      }

      lines.push(`        return;`);
      lines.push(`      } catch (e) { /* try next */ }`);
      lines.push(`    }`);
    }

    lines.push(`  }\n`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

/* ============================================================
   Method Name Generator
============================================================ */

function generateMethodName(el: any, action: string): string {
  const base =
    el.attributes?.placeholder ||
    el.attributes?.ariaLabel ||
    el.attributes?.name ||
    el.attributes?.id ||
    el.tagName;

  const cleaned = base
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((w: string, i: number) =>
      i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join("");

  return `${action}${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}



// interface RankedLocator {
//   strategy: string;
//   value: string;
//   stabilityScore: number;
// }

// interface ElementDescriptor {
//   innerText?: string;
//   rankedLocators: RankedLocator[];
// }

// interface PageObject {
//   pageName: string;
//   elements: ElementDescriptor[];
// }

// // function buildLocatorChain(locators: RankedLocator[]): string {
// //   if (!locators.length) return "";

// //   let chain = `this.page.locator(\`${locators[0].value}\`)`;

// //   for (let i = 1; i < locators.length; i++) {
// //     chain += `.or(this.page.locator(\`${locators[i].value}\`))`;
// //   }

// //   return chain;
// // }
// function buildTSLocatorChain(locators: RankedLocator[]): string {
//   if (!locators.length) return "";

//   let chain = renderPlaywrightTSLocator(locators[0]);

//   for (let i = 1; i < locators.length; i++) {
//     chain += `.or(${renderPlaywrightTSLocator(locators[i])})`;
//   }

//   return chain;
// }


function renderPlaywrightTSLocator(locator: any): string {
  switch (locator.playwrightKind) {
    case "getByRole":
      return `this.page.getByRole("${locator.value}")`;

    case "getByLabel":
      return `this.page.getByLabel("${locator.value}")`;

    case "getByPlaceholder":
      return `this.page.getByPlaceholder("${locator.value}")`;

    case "getByText":
      return `this.page.getByText("${locator.value}")`;

    case "getByTitle":
      return `this.page.getByTitle("${locator.value}")`;

    case "getByTestId":
      return `this.page.getByTestId("${locator.value}")`;

    case "getByAltText":
      return `this.page.getByAltText("${locator.value}")`;

    case "xpath":
      return `this.page.locator(` + "`xpath=${locator.value}`" + `)`;

    default:
      return `this.page.locator("${locator.value}")`;
  }
}

function buildTSLocatorMap(locators: RankedLocator[]): string {
  if (!locators.length) return "{}";

  const entries = locators.map(l => {
    const key = l.strategy || l.playwrightKind || l.value;
    return `"${key}": ${renderPlaywrightTSLocator(l)}`;
  });

  return `{${entries.join(", ")}}`;
}


// function normalizeText(text?: string): string {
//   if (!text) return "";

//   return text
//     .replace(/[^a-zA-Z0-9 ]/g, "")
//     .split(" ")
//     .filter(w => w.length > 2)
//     .slice(0, 3)
//     .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join("");
// }

// function deriveIntent(el: any): string {
//   const tag = el.tagName?.toLowerCase?.() || "";
//   const text = normalizeText(el.innerText);

//   if (tag === "button") return `click${text || "Button"}`;
//   if (tag === "a") return `navigateTo${text || "Link"}`;
//   if (tag === "input") return `enter${text || "Value"}`;
//   if (tag.startsWith("h")) return `open${text || "Section"}`;
//   if (tag === "select") return `select${text || "Option"}`;

//   return `perform${text || "Action"}`;
// }

// export function generatePlaywrightPOM(page: PageObject): string {
//   const className =
//     page.pageName.charAt(0).toUpperCase() + page.pageName.slice(1) + "Page";

//   let code = `
// import { Page } from '@playwright/test';

// export class ${className} {
//   constructor(private page: Page) {}
// `;

//   page.elements.forEach((el, index) => {
//     if (!el.rankedLocators || el.rankedLocators.length === 0) return;

//     // const locatorChain = buildLocatorChain(el.rankedLocators);
//     // const locatorChain = ${buildTSLocatorChain(el.rankedLocators)};
//     const locatorChain = buildTSLocatorChain(el.rankedLocators);

// const methodName = deriveIntent(el);
//     code += `
//   async ${methodName}() {
//     const locator = ${locatorChain};
//     await locator.first().click();
//   }
// `;
//   });

//   code += `}\n`;
//   return code;
// }
