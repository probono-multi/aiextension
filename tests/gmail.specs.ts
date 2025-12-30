import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InboxPage } from '../src/pages/InboxPage';
import * as dotenv from 'dotenv';

dotenv.config();

const EMAIL = process.env.GMAIL_USER;
const PASS = process.env.GMAIL_PASS;
const SUBJECT = process.env.GMAIL_SUBJECT ?? 'Test Subject';

test.describe('Gmail login and check email', () => {
  test('login and find email by subject', async ({ page }) => {
    if (!EMAIL || !PASS) test.skip(true, 'Set GMAIL_USER and GMAIL_PASS in .env to run');

    const login = new LoginPage(page);
    const inbox = new InboxPage(page);

    await login.goto();
    await login.login(EMAIL as string, PASS as string);

    await inbox.waitForInbox();

    const found = await inbox.findEmailBySubject(SUBJECT);
    expect(found, `email with subject "${SUBJECT}" should exist`).not.toBeNull();
  });
});
