// codegen/locator-model.ts

export type LocatorStrategy =
  | "role"
  | "label"
  | "placeholder"
  | "text"
  | "title"
  | "css"
  | "xpath"
  | "testid";

export type PlaywrightLocatorKind =
  | "getByRole"
  | "getByLabel"
  | "getByPlaceholder"
  | "getByText"
  | "getByTitle"
  | "getByTestId"
  | "getByAltText"
  | "xpath"
  | "locator";

export interface RankedLocator {
  strategy?: LocatorStrategy;
  value: string;

  // Intelligence
  stabilityScore: number;
  reason?: string;

  // Rendering hint
  playwrightKind: PlaywrightLocatorKind;
}
