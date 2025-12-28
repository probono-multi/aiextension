import { RankedLocator } from "./locator-model.js";

export function rankLocators(raw: any): RankedLocator[] {
  const ranked: RankedLocator[] = [];

  if (raw.label) {
    ranked.push({
      strategy: "label",
      value: raw.label,
      stabilityScore: 95,
      reason: "Accessible label",
      playwrightKind: "getByLabel"
    });
  }

  if (raw.placeholder) {
    ranked.push({
      strategy: "placeholder",
      value: raw.placeholder,
      stabilityScore: 90,
      reason: "Input placeholder",
      playwrightKind: "getByPlaceholder"
    });
  }

  if (raw.role && raw.text) {
    ranked.push({
      strategy: "role",
      value: `${raw.role}|${raw.text}`,
      stabilityScore: 88,
      reason: "Role + text",
      playwrightKind: "getByRole"
    });
  }

  if (raw.testid) {
    ranked.push({
      strategy: "testid",
      value: raw.testid,
      stabilityScore: 92,
      reason: "Data-testid",
      playwrightKind: "locator"
    });
  }

  if (raw.css?.startsWith("#")) {
    ranked.push({
      strategy: "css",
      value: raw.css,
      stabilityScore: 80,
      reason: "ID selector",
      playwrightKind: "locator"
    });
  }

  return ranked.sort((a, b) => b.stabilityScore - a.stabilityScore);
}
