import { Page } from '@playwright/test';

export class LoginPage {
  constructor(public page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    // Fill email
    await this.page.fill('input[type="email"]', email);
    await this.page.click('button:has-text("Next")');

    // Wait a bit for transition (Gmail uses dynamic flow)
    await this.page.waitForTimeout(1000);

    // Fill password
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Next")');

    // Wait for inbox to load (best-effort)
    await this.page.waitForLoadState('networkidle');
  }
}
