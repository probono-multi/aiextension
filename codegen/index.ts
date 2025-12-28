import { generatePlaywrightTS } from "./playwright-ts.js";
import { generatePlaywrightPY } from "./playwright-py.js";

export function generateCode(page: any, language: "ts" | "python") {
  return language === "python"
    ? generatePlaywrightPY(page)
    : generatePlaywrightTS(page);
}
