import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class UnpaxPage {
  page: Page;
  beginDownload: Locator;
  zoweLink: Locator;
  beginUpload: Locator;
  retrieveZoweYaml: Locator;
  continueToComponentInstallation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.beginDownload = page.locator("//button[text()='Begin Download']")
    this.zoweLink = page.locator("//a[@href='https://www.zowe.org/download']")
    this.beginUpload = page.locator("//button[text()='Begin Upload']")
    this.retrieveZoweYaml = page.locator("//button[text()='Retrieve example-zowe.yaml']")
    this.continueToComponentInstallation = page.locator("//button[text()='Continue to Components Installation']")
  }

  commonPage = new CommonPage();

  async clickBeginDownload() {
    await this.commonPage.waitForElement(this.beginDownload)
    await this.beginDownload.click({ timeout: 5000 })
  }

  async clickZoweLink() {
    await this.commonPage.waitForElement(this.zoweLink)
    await this.zoweLink.click();
  }

  async clickBeginUpload() {
    await this.commonPage.waitForElement(this.beginUpload)
    await this.beginUpload.click({ timeout: 5000 })
  }

  async clickRetrieveZoweYaml() {
    await this.commonPage.waitForElement(this.retrieveZoweYaml)
    await this.retrieveZoweYaml.click({ timeout: 5000 })
  }

  async clickContinueToInstallation() {
    const timeout = 5000;
    const interval = 500;
    while (true) {
      if (await this.continueToComponentInstallation.isEnabled()) {
        await this.continueToComponentInstallation.click();
        return;
      }
      await this.page.waitForTimeout(interval);
      await this.continueToComponentInstallation.click({ timeout: timeout });
    }
  }

  async isContinueToComponentInstallationDisabled() {
    await this.commonPage.waitForElement(this.continueToComponentInstallation)
    return await this.continueToComponentInstallation.isDisabled()
  }

  async isContinueToComponentInstallationEnabled() {
    await this.commonPage.waitForElement(this.continueToComponentInstallation)
    return await this.continueToComponentInstallation.isEnabled()
  }
}
export default UnpaxPage;