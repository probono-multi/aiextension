import assert from "assert";
import type { RankedLocator } from "../codegen/locator-model";

(async function run() {
  const mod = await import("../codegen/locator-exporter.ts");
  const generateLocatorsFileContent = mod.generateLocatorsFileContent as typeof mod.generateLocatorsFileContent;

const locators: RankedLocator[] = [
  { name: "Primary", strategy: "css", value: "#primary", rank: 1, stabilityScore: 0.9, playwrightKind: "locator" },
  { name: "Secondary", strategy: "css", value: "#secondary", rank: 2, stabilityScore: 0.6, playwrightKind: "locator" },
  { strategy: "xpath", value: "//div[1]", stabilityScore: 0.1, playwrightKind: "xpath" },
];

(function testTSDictionary() {
  const out = generateLocatorsFileContent("MyPage", locators, { language: "ts", format: "dictionary", includeComments: true });
  assert(out.indexOf("secondary") < out.indexOf("primary"), "Higher rank should come first in TS output");
  assert(!/function|=>|click|def\s|\breturn\b/i.test(out), "Output must not contain actions or functions");
  console.log("TS dictionary OK");
})();

(function testTSClass() {
  const out = generateLocatorsFileContent("MyPage", locators, { language: "ts", format: "class", includeComments: true });
  assert(out.indexOf("secondary") < out.indexOf("primary"), "Higher rank should come first in TS class output");
  console.log("TS class OK");
})();

(function testPYDict() {
  const out = generateLocatorsFileContent("MyPage", locators, { language: "py", format: "dictionary", includeComments: true });
  assert(out.indexOf('"secondary"') < out.indexOf('"primary"'), "Higher rank should come first in PY dict output");
  console.log("PY dict OK");
})();

console.log("All objects-only tests passed");
})();