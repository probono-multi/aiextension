import { Page } from '@playwright/test';

export class InboxPage {
  constructor(public page: Page) {}

  async waitForInbox() {
    // Try a couple of common selectors; this is a starting point for the POM
    await this.page.waitForSelector('div[role="main"]', { timeout: 20_000 });
  }

  async findEmailBySubject(subject: string) {
    // Gmail uses dynamic classes; this selector is a best-effort that often works
    await this.page.waitForTimeout(1500);
    return this.page.$(`tr:has-text("${subject}")`);
  }

  async openEmailBySubject(subject: string) {
    const email = await this.findEmailBySubject(subject);
    if (!email) return false;
    await email.click();
    await this.page.waitForSelector(`h2:has-text("${subject}")`, { timeout: 10_000 }).catch(()=>{});
    return true;
  }

  async getSubjects() {
    const nodes = await this.page.$$eval('tr.zA .y6 span span', els => els.map(e => e.textContent?.trim() ?? ''));
    return nodes;
  }
}
