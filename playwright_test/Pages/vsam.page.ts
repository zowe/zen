import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class VsamPage {
  page: Page;
  pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
  }

  commonPage = new CommonPage();

  async getVsamPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }
}
export default VsamPage;