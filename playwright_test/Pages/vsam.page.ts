import { Page, Locator } from '@playwright/test';

class VsamPage {
  page: Page;
  pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
  }
  async getVsamPageTitle() {
    await this.page.waitForTimeout(500);
    return await this.pageTitle.textContent({ timeout: 2000 });
  }
}
export default VsamPage;