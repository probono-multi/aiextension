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
  // Optional logical name for the element (used for exports)
  name?: string;

  // Optional explicit rank (higher => higher priority). If missing, exporter will fall back to stabilityScore.
  rank?: number;

  strategy?: LocatorStrategy;
  value: string;

  // Intelligence
  stabilityScore: number;
  reason?: string;

  // Rendering hint
  playwrightKind: PlaywrightLocatorKind;
}
