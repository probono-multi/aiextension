interface RankedLocator {
  strategy: string;
  value: string;
  stabilityScore: number;
}

interface ElementDescriptor {
  innerText?: string;
  rankedLocators: RankedLocator[];
}

interface PageObject {
  pageName: string;
  elements: ElementDescriptor[];
}

export function generatePlaywrightPOM(page: PageObject): string {
  const className =
    page.pageName.charAt(0).toUpperCase() + page.pageName.slice(1) + "Page";

  let code = `
import { Page } from '@playwright/test';

export class ${className} {
  constructor(private page: Page) {}
`;

  page.elements.forEach((el, index) => {
    const locator = el.rankedLocators[0]?.value;
    if (!locator) return;

    const methodName = `action${index + 1}`;

    code += `
  async ${methodName}() {
    await this.page.locator(\`${locator}\`).click();
  }
`;
  });

  code += `}\n`;

  return code;
}
