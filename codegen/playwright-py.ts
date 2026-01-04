import { AutomationRepo } from "../domain/repo-model";

export function generatePY(repo: AutomationRepo): string {
  let out = "# AUTO-GENERATED PAGE OBJECTS\n\n";

  Object.values(repo).forEach(page => {
    out += `${page.pageName.toUpperCase()} = {\n`;

    page.elements.forEach(el => {
      const key = `${el.tagName}_${el.elementId.slice(0,5)}`;
      out += `  "${key}": [\n`;
      el.rankedLocators.forEach(l => {
        out += `    page.${l.playwrightKind}("${l.value}"),\n`;
      });
      out += `  ],\n`;
    });

    out += `}\n\n`;
  });

  return out;
}
