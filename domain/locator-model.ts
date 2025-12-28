  
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
| "locator";

export interface RankedLocator {
strategy: LocatorStrategy;
value: string;

// Ranking intelligence
stabilityScore: number;
reason: string;

// Rendering hint (NEW)
playwrightKind: PlaywrightLocatorKind;
}
