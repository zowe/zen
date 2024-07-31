import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class TitlePage {
  page: Page;
  zoweInstallButton: Locator;
  zoweDryrunButton: Locator;
  resumeProgressButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.zoweInstallButton = page.locator('#card-install')
    this.zoweDryrunButton = page.locator("div[id='card-dry run']")
    this.resumeProgressButton = page.locator("//button[text()='Resume Progress']")
  }

  commonPage = new CommonPage();

  async navigateToConnectionTab() {
    await this.commonPage.waitForElement(this.zoweInstallButton)
    await this.zoweInstallButton.click({ timeout: 9000 })
  }

  async clickOnResumeProgress() {
    await this.commonPage.waitForElement(this.resumeProgressButton)
    await this.resumeProgressButton.click({ timeout: 3000 })
  }
}

export default TitlePage;