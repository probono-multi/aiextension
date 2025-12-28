import { RankedLocator } from "./locator-model";

export function rankLocators(raw: any): RankedLocator[] {
  const ranked: RankedLocator[] = [];

  if (raw.role) {
    ranked.push({
      strategy: "role",
      value: raw.role,
      stabilityScore: 95,
      reason: "Accessible role",
      playwrightKind: "getByRole"
    });
  }

  if (raw.label) {
    ranked.push({
      strategy: "label",
      value: raw.label,
      stabilityScore: 90,
      reason: "Associated label",
      playwrightKind: "getByLabel"
    });
  }

  if (raw.text) {
    ranked.push({
      strategy: "text",
      value: raw.text,
      stabilityScore: 70,
      reason: "Visible text",
      playwrightKind: "getByText"
    });
  }

  if (raw.css) {
    ranked.push({
      strategy: "css",
      value: raw.css,
      stabilityScore: 60,
      reason: "CSS selector",
      playwrightKind: "locator"
    });
  }

  if (raw.xpath) {
    ranked.push({
      strategy: "xpath",
      value: raw.xpath,
      stabilityScore: 40,
      reason: "XPath fallback",
      playwrightKind: "locator"
    });
  }

  // Highest score first
  return ranked.sort((a, b) => b.stabilityScore - a.stabilityScore);
}
