import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

test.describe('Launch google search engine', () => {
  test('lanch google search engine', async ({ page }, testInfo) => {
    await page.goto('https://www.google.com');
    await expect(page).toHaveTitle(/Google/);   
    const p1 = testInfo.outputPath('google-homepage.png');
    await page.screenshot({ path: p1 });
    const p2 = testInfo.outputPath('screenshot.png');
    await page.screenshot({ path: p2, fullPage: true });
    
    expect(page.url()).toContain('https://www.google.com/');
    });
});
