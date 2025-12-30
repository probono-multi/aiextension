import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 60_000,
  expect: { timeout: 5000 },
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    baseURL: 'https://mail.google.com',
    // only retain artifacts on failure by default to avoid disk bloat
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
    reporter: [
    ['list'],
    ['./reporter/influxReporter.ts']
  ]
});


