import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class InstallationTypePage {
  page: Page;
  pageTitle: Locator;
  downloadPax: Locator;
  uploadPax: Locator;
  smpe: Locator;
  zoweLink: Locator;
  licenseAgreement: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  continueToUnpax: Locator;
  agreeLicense: Locator;
  uploadPaxButton: Locator;
  licenseAgreementGreenCheck: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.downloadPax = page.locator("//span[text()='Download Zowe convenience build PAX from internet']/preceding-sibling::span/input")
    this.uploadPax = page.locator("//span[text()='Upload Zowe PAX for offline install']/preceding-sibling::span/input")
    this.smpe = page.locator("//span[text()='SMP/E']/preceding-sibling::span/input")
    this.licenseAgreement = page.locator("//button[text()='License Agreement']")
    this.saveAndClose = page.locator("//button[contains(text(),'Save & close')]")
    this.previousStep = page.locator("//button[contains(text(),'Previous step')]")
    this.continueToUnpax = page.locator("//button[text()='Continue to Unpax']")
    this.zoweLink = page.locator("//a[@href='zowe.org']")
    this.agreeLicense = page.locator("//button[text()='Agree']")
    this.uploadPaxButton = page.locator("//button[text()='Upload PAX']")
    this.licenseAgreementGreenCheck = page.locator("//button[text()='License Agreement']//following-sibling::*[@data-testid='CheckCircleIcon']")
  }

  commonPage = new CommonPage();

  async getPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async selectDownloadZowePax() {
    await this.commonPage.waitForElement(this.downloadPax)
    await this.downloadPax.click({ timeout: 5000 })
  }

  async selectUploadZowePax() {
    await this.commonPage.waitForElement(this.uploadPax)
    await this.uploadPax.click({ timeout: 5000 });
  }

  async selectSmpe() {
    await this.commonPage.waitForElement(this.smpe)
    await this.smpe.click({ timeout: 5000 });
  }

  async clickZoweLink() {
    await this.commonPage.waitForElement(this.zoweLink)
    await this.zoweLink.click();
  }

  async clickLicenseAgreement() {
    await this.commonPage.waitForElement(this.licenseAgreement)
    await this.licenseAgreement.click({ timeout: 5000 });
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

  async clickContinueToUnpax() {
    await this.commonPage.waitForElement(this.continueToUnpax)
    await this.continueToUnpax.click();
    await this.page.waitForTimeout(5000);
  }

  async isContinueToUnpaxDisabled() {
    await this.commonPage.waitForElement(this.continueToUnpax)
    return await this.continueToUnpax.isDisabled()
  }

  async isContinueToUnpaxEnabled() {
    await this.commonPage.waitForElement(this.continueToUnpax)
    return await this.continueToUnpax.isEnabled()
  }

  async clickAgreeLicense() {
    await this.commonPage.waitForElement(this.agreeLicense)
    await this.agreeLicense.click({ timeout: 5000 });
  }

  async isLicenseAgreementGreenCheckVisible() {
    await this.commonPage.waitForElement(this.licenseAgreementGreenCheck)
    return await this.licenseAgreementGreenCheck.isVisible();
  }

  async uploadZowePaxAndNavigateToInstallationPage(uploadPaxPath: any) {
    this.selectUploadZowePax()
    await this.commonPage.waitForElement(this.uploadPaxButton)
    await this.uploadPaxButton.setInputFiles(uploadPaxPath)
    await this.page.waitForTimeout(2000)
  }

}
export default InstallationTypePage;
