export interface RankedLocator {
  playwrightKind: string;
  value: string;
  score: number;
}

export interface CapturedElement {
  elementId: string;
  tagName: string;
  innerText?: string;
  locators: Record<string, string | undefined>;
  rankedLocators: RankedLocator[];
  capturedAt: string;
}

export interface PageObject {
  pageName: string;
  pageUrl: string;
  elements: CapturedElement[];
}

export interface AutomationRepo {
  [pageKey: string]: PageObject;
}
