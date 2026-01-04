import { generateTS } from "./playwright-ts.js";
import { generatePY } from "./playwright-py.js";

export function generateCode(page: any, language: "ts" | "python") {
  return language === "python"
    ? generatePY(page)
    : generateTS(page);
}
