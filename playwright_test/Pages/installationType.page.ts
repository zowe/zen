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
  continueToComponentInstallation: Locator;
  agreeLicense: Locator;
  uploadPaxButton: Locator;
  runtimeDir: Locator;
  validateLocation: Locator;
  validateLocationGreenCheck: Locator;
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
    this.continueToComponentInstallation = page.locator("//button[text()='Continue to Components Installation']")
    this.zoweLink = page.locator("//a[@href='zowe.org']")
    this.agreeLicense = page.locator("//button[text()='Agree']")
    this.uploadPaxButton = page.locator("//button[text()='Upload PAX']")
    this.runtimeDir = page.locator("//label[contains(text(),'Runtime Directory')]//following-sibling::div/input")
    this.validateLocation = page.locator("//button[text()= 'Validate location']")
    this.validateLocationGreenCheck = page.locator("//button[text()='Validate location']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.licenseAgreementGreenCheck = page.locator("//button[text()='License Agreement']//following-sibling::*[@data-testid='CheckCircleIcon']")
  }

  commonPage = new CommonPage();

  async getInstallationTypePageTitle() {
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

  async clickAgreeLicense() {
    await this.commonPage.waitForElement(this.agreeLicense)
    await this.agreeLicense.click({ timeout: 5000 });
  }

  async isLicenseAgreementGreenCheckVisible() {
    await this.commonPage.waitForElement(this.licenseAgreementGreenCheck)
    return await this.licenseAgreementGreenCheck.isVisible();
  }

  async clickUploadPaxButton() {
    await this.commonPage.waitForElement(this.uploadPaxButton)
    await this.uploadPaxButton.click({ timeout: 5000 });
  }

  async enterRuntimeDir(runtimeDir: any) {
    await this.commonPage.waitForElement(this.runtimeDir)
    await this.runtimeDir.clear({ timeout: 5000 })
    await this.runtimeDir.fill(runtimeDir);
  }

  async clickValidateLocation() {
    await this.commonPage.waitForElement(this.validateLocation)
    await this.validateLocation.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000)
  }

  async isValidateLocationGreenCheckVisible() {
    await this.commonPage.waitForElement(this.validateLocationGreenCheck)
    return await this.validateLocationGreenCheck.isVisible();
  }

  async downloadZowePaxAndNavigateToInstallationPage() {
    this.selectDownloadZowePax()
    this.clickLicenseAgreement()
    this.clickAgreeLicense()
  }

  async uploadZowePaxAndNavigateToInstallationPage(uploadPaxPath: any) {
    this.selectUploadZowePax()
    await this.commonPage.waitForElement(this.uploadPaxButton)
    await this.uploadPaxButton.setInputFiles(uploadPaxPath)
    await this.page.waitForTimeout(2000)
  }

  async smpeZowePaxAndNavigateToInstallationPage(runtimeDir: any) {
    this.selectSmpe()
    this.enterRuntimeDir(runtimeDir)
    this.clickValidateLocation()
  }
  
}
export default InstallationTypePage;
