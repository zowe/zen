import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class UnpaxPage {
  page: Page;
  pageTitle: Locator;
  beginDownload: Locator;
  zoweLink: Locator;
  beginUpload: Locator;
  retrieveZoweYaml: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  skipUnpax: Locator;
  continueToComponentInstallation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.beginDownload = page.locator("//button[text()='Begin Download']")
    this.zoweLink = page.locator("//a[@href='https://www.zowe.org/download']")
    this.beginUpload = page.locator("//button[text()='Begin Upload']")
    this.retrieveZoweYaml = page.locator("//button[text()='Retrieve example-zowe.yaml']")
    this.saveAndClose = page.locator("//button[text()='Save & close']")
    this.previousStep = page.locator("//button[text()='Previous step']")
    this.skipUnpax = page.locator("//button[contains(text(),'Skip')]")
    this.continueToComponentInstallation = page.locator("//button[text()='Continue to Components Installation']")
  }

  commonPage = new CommonPage();

  async getUnpaxPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

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
    await this.page.waitForTimeout(10000);
  }

  async clickSaveAndClose() {
    await this.commonPage.waitForElement(this.saveAndClose)
    await this.saveAndClose.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000)
  }

  async clickPreviousStep() {
    await this.commonPage.waitForElement(this.previousStep)
    await this.previousStep.click();
    await this.page.waitForTimeout(2000)
  }

  async clickSkipUnpax() {
    await this.commonPage.waitForElement(this.skipUnpax)
    await this.skipUnpax.click();
  }

  async clickContinueToInstallation() {
    await this.commonPage.waitForElement(this.continueToComponentInstallation)
    await this.continueToComponentInstallation.click();
    await this.page.waitForTimeout(5000);
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