<<<<<<< HEAD
# Gmail Playwright POM Example ✅

This repository is a minimal Playwright + TypeScript POM scaffold to demonstrate logging into Gmail and checking for an email by subject.

⚠️ Important: Gmail actively blocks automated logins. Use a dedicated **test account** and consider using app-specific passwords or a saved authenticated session (storageState). This example is intended for learning and private test accounts only.

## Quickstart

1. Copy `.env.example` to `.env` and fill in `GMAIL_USER` and `GMAIL_PASS`.
2. Install deps:

   npm install
   npm run install:playwright

3. Run tests:

   npm test

Notes:
- The test will skip unless `GMAIL_USER` and `GMAIL_PASS` are set.
- If Gmail blocks login, perform a manual login in headed mode, capture `storageState`, and re-use it in Playwright to avoid re-authenticating.

## Files
- `src/pages/LoginPage.ts` — page object for Gmail login flow
- `src/pages/InboxPage.ts` — page object for basic inbox interactions
- `tests/gmail.spec.ts` — example test using env vars

If you'd like, I can add a helper that stores authenticated `storageState` after a successful login so subsequent runs don't re-enter credentials. 🔧