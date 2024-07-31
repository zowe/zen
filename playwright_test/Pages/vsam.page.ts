import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class VsamPage {
  page: Page;
  pageTitle: Locator
  skip_vsam_button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skip_vsam_button = page.locator('//button[contains(text(),"Skip")]')
  }

  commonPage = new CommonPage();

  async click_skipVsam() {
    await this.commonPage.waitForElement(this.skip_vsam_button)
    await this.skip_vsam_button.click({ timeout: 2000 });
  }

}
export default VsamPage;