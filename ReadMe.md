# Automation Designer – Playwright Platform Extension

Automation Designer is a Chrome extension that captures UI interactions and generates
self-healing Playwright Page Objects using a centralized Object Repository and
deterministic locator intelligence.

Unlike record-and-play tools, this project treats automation as a design artifact,
not a recorded script.

---

## Core Capabilities

### 1. DOM Intelligence & Locator Ranking
- Extracts multiple locator strategies (CSS, XPath, role, text)
- Ranks locators based on stability and semantic relevance
- Preserves fallback chains for runtime resilience

### 2. Centralized Object Repository
- Stores captured elements keyed by page context
- Decouples element identity from test code
- Enables deterministic regeneration

### 3. Self-Healing Code Generation
- Generates Playwright Page Objects with chained fallback locators
- Prevents test breakage during UI refactors
- No runtime AI or flakiness

### 4. Intent-Based Method Semantics
- Derives human-readable method names from DOM semantics
- Produces clean, maintainable Page Object APIs

### 5. Multi-Language Export
- Renders the same automation design into:
  - Playwright TypeScript
  - Playwright Python
- Treats automation as language-agnostic IR
### Export Strategies
You can choose the fallback strategy in the popup before exporting:
- **Or-chain (fast)**: builds a single chained locator (using `.or()` / `.or_()`) and calls the action on the combined locator. Fast and succinct.
- **Sequential**: tries each locator in priority order with a short visibility wait (300ms) and performs the first that succeeds. More robust when or-chains are not reliable.
- **Try/catch**: similar to sequential but you can configure custom handling later.

Generated methods accept an optional `strategy` argument to force a specific locator (e.g., `clickLogin('testid')` or `fillEmail('value','label')`). This enables locator-specific invocations for diagnosis and resilient automation.

### 6. Design-Time Diff Reporting
- Compares regenerated repositories
- Highlights locator changes, additions, and removals
- Makes UI change impact explicit before tests fail

---

## Why This Is Different

| Recorder Tools | Automation Designer |
|---------------|--------------------|
| Record events | Design automation |
| Single locator | Ranked fallback chains |
| Language-bound | Language-agnostic |
| Silent overwrites | Explicit diff reports |

---

## Tech Stack
- TypeScript
- Chrome Extensions (Manifest V3)
- Playwright
- ES Modules

---

## Philosophy

> UI changes are design events, not runtime failures.

Automation Designer shifts test maintenance from reactive debugging
to proactive regeneration.
