import { resolveAction } from "./action-resolver.js";
/* ============================================================
   Render Playwright Python Locator
============================================================ */
function renderLocator(locator) {
    switch (locator.playwrightKind) {
        case "getByRole":
            return `self.page.get_by_role("${locator.value}")`;
        case "getByLabel":
            return `self.page.get_by_label("${locator.value}")`;
        case "getByPlaceholder":
            return `self.page.get_by_placeholder("${locator.value}")`;
        case "getByText":
            return `self.page.get_by_text("${locator.value}")`;
        case "getByTitle":
            return `self.page.get_by_title("${locator.value}")`;
        case "getByTestId":
            return `self.page.get_by_test_id("${locator.value}")`;
        case "getByAltText":
            return `self.page.get_by_alt_text("${locator.value}")`;
        case "xpath":
            return `self.page.locator(` + "'xpath=${locator.value}'" + `)`;
        default:
            return `self.page.locator("${locator.value}")`;
    }
}
/* ============================================================
   Generate Playwright Python Page Object
============================================================ */
export function generatePlaywrightPY(page, fallback = "chain") {
    const lines = [];
    const className = page.pageName.charAt(0).toUpperCase() + page.pageName.slice(1) + "Page";
    lines.push(`from playwright.sync_api import Page\n`);
    lines.push(`class ${className}:`);
    lines.push(`    def __init__(self, page: Page):`);
    lines.push(`        self.page = page\n`);
    for (const el of page.elements) {
        if (!el.rankedLocators || el.rankedLocators.length === 0)
            continue;
        const action = resolveAction(el);
        const methodName = generateMethodName(el, action);
        lines.push(`    def ${methodName}(self, value=None, strategy=None):`);
        const chain = buildPythonLocatorChain(el.rankedLocators);
        const array = buildPythonLocatorArray(el.rankedLocators);
        const map = buildPythonLocatorMap(el.rankedLocators);
        // locator map for caller-specified strategy
        lines.push(`        locator_map = ${map}`);
        lines.push(`        if strategy and strategy in locator_map:`);
        lines.push(`            loc = locator_map[strategy]`);
        switch (action) {
            case "fill":
                lines.push(`            loc.first.fill(value or "")`);
                lines.push(`            return`);
                break;
            case "select":
                lines.push(`            loc.first.select_option(value or "")`);
                lines.push(`            return`);
                break;
            case "check":
                lines.push(`            loc.first.check()`);
                lines.push(`            return`);
                break;
            case "upload":
                lines.push(`            loc.first.set_input_files(value or "")`);
                lines.push(`            return`);
                break;
            default:
                lines.push(`            loc.first.click()`);
                lines.push(`            return`);
        }
        if (fallback === "chain") {
            switch (action) {
                case "fill":
                    lines.push(`        ${chain}.first.fill(value or "")`);
                    break;
                case "select":
                    lines.push(`        ${chain}.first.select_option(value or "")`);
                    break;
                case "check":
                    lines.push(`        ${chain}.first.check()`);
                    break;
                case "upload":
                    lines.push(`        ${chain}.first.set_input_files(value or "")`);
                    break;
                default:
                    lines.push(`        ${chain}.first.click()`);
            }
        }
        else {
            lines.push(`        locators = ${array}`);
            lines.push(`        for loc in locators:`);
            lines.push(`            try:`);
            lines.push(`                loc.first.wait_for(state="visible", timeout=300)`);
            switch (action) {
                case "fill":
                    lines.push(`                loc.first.fill(value or "")`);
                    break;
                case "select":
                    lines.push(`                loc.first.select_option(value or "")`);
                    break;
                case "check":
                    lines.push(`                loc.first.check()`);
                    break;
                case "upload":
                    lines.push(`                loc.first.set_input_files(value or "")`);
                    break;
                default:
                    lines.push(`                loc.first.click()`);
            }
            lines.push(`                return`);
            lines.push(`            except Exception:`);
            lines.push(`                pass`);
            lines.push(``);
        }
        lines.push("");
    }
    return lines.join("\n");
}
/* ============================================================
   Method Name Generator
============================================================ */
function generateMethodName(el, action) {
    const base = el.attributes?.placeholder ||
        el.attributes?.ariaLabel ||
        el.attributes?.name ||
        el.attributes?.id ||
        el.tagName;
    const cleaned = base
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
    return `${action}_${cleaned}`;
}
// interface RankedLocator {
//   value: string;
// }
// interface ElementDescriptor {
//   tagName?: string;
//   innerText?: string;
//   rankedLocators: RankedLocator[];
// }
// interface PageObject {
//   pageName: string;
//   elements: ElementDescriptor[];
// }
function renderPlaywrightPythonLocator(locator) {
    switch (locator.playwrightKind) {
        case "getByRole":
            return `self.page.get_by_role("${locator.value}")`;
        case "getByLabel":
            return `self.page.get_by_label("${locator.value}")`;
        case "getByPlaceholder":
            return `self.page.get_by_placeholder("${locator.value}")`;
        case "getByText":
            return `self.page.get_by_text("${locator.value}")`;
        case "getByTitle":
            return `self.page.get_by_title("${locator.value}")`;
        case "getByTestId":
            return `self.page.get_by_test_id("${locator.value}")`;
        case "getByAltText":
            return `self.page.get_by_alt_text("${locator.value}")`;
        case "xpath":
            return `self.page.locator(` + "'xpath=${locator.value}'" + `)`;
        default:
            return `self.page.locator("${locator.value}")`;
    }
}
function buildPythonLocatorChain(locators) {
    if (!locators.length)
        return "";
    let chain = renderPlaywrightPythonLocator(locators[0]);
    for (let i = 1; i < locators.length; i++) {
        chain += `.or_(${renderPlaywrightPythonLocator(locators[i])})`;
    }
    return chain;
}
function buildPythonLocatorArray(locators) {
    if (!locators.length)
        return "[]";
    const items = locators.map((l) => renderPlaywrightPythonLocator(l));
    return `[${items.join(", ")}]`;
}
function buildPythonLocatorMap(locators) {
    if (!locators.length)
        return "{}";
    const entries = locators.map(l => {
        const key = l.strategy || l.playwrightKind || l.value;
        return `"${key}": ${renderPlaywrightPythonLocator(l)}`;
    });
    return `{${entries.join(", ")}}`;
}
// function deriveIntentPython(el: any): string {
//   const tag = el.tagName?.toLowerCase() || "";
//   const text =
//     el.innerText
//       ?.replace(/[^a-zA-Z0-9 ]/g, "")
//       .split(" ")
//       .slice(0, 2)
//       .map((w : string) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join("") || "Action";
//   if (tag === "button") return `click_${text.toLowerCase()}`;
//   if (tag === "input") return `enter_${text.toLowerCase()}`;
//   if (tag.startsWith("h")) return `open_${text.toLowerCase()}`;
//   return `perform_${text.toLowerCase()}`;
// }
// export function generatePlaywrightPython(page: PageObject): string {
//   const className =
//     page.pageName.charAt(0).toUpperCase() + page.pageName.slice(1) + "Page";
//   let code = `
// from playwright.sync_api import Page
// class ${className}:
//     def __init__(self, page: Page):
//         self.page = page
// `;
//   page.elements.forEach(el => {
//     if (!el.rankedLocators?.length) return;
//     const methodName = deriveIntentPython(el);
//     // const locatorChain = buildLocatorChainPython(el.rankedLocators);
//     const locatorChain = buildPythonLocatorChain(el.rankedLocators);
//     code += `
//     def ${methodName}(self):
//         locator = ${locatorChain}
//         locator.first.click()
// `;
//   });
//   return code.trim();
// }
