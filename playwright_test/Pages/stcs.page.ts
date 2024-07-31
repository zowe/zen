import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class StcsPage {
  page: Page;
  pageTitle: Locator
  skip_stcs_button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skip_stcs_button = page.locator('//button[contains(text(),"Skip")]')
  }

  commonPage = new CommonPage();

  async click_skipStcs() {
    await this.commonPage.waitForElement(this.skip_stcs_button)
    await this.skip_stcs_button.click({ timeout: 2000 });
  }

}
export default StcsPage;