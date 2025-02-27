import { Page, Locator } from '@playwright/test';

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
  disagreeLicense: Locator;
  installation_Type_Tab: Locator;
  continueToUnpaxButton: Locator;
  installationPageTitle: Locator;
  retrieveExampleZoweYaml: Locator;
  continueCompInstallation: Locator;
  skipUnpaxButton: Locator;
  SkipUnpax: Locator;
  click_InitializationStage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.installationPageTitle = page.locator("//div[text()='Installation']")
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
    this.disagreeLicense = page.locator("//button[text()='Disagree']")
    this.uploadPaxButton = page.locator("//button[text()='Upload PAX']")
    this.runtimeDir = page.locator("//label[contains(text(),'Runtime Directory')]//following-sibling::div/input")
    this.validateLocation = page.locator("//button[text()= 'Validate location']")
    this.validateLocationGreenCheck = page.locator("//button[text()='Validate location']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.licenseAgreementGreenCheck = page.locator("//button[text()='License Agreement']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.retrieveExampleZoweYaml = page.locator("//button[contains(text(),'Retrieve example-zowe.yaml')]")
    this.continueCompInstallation = page.locator("//button[contains(text(),'Continue to Components Installation')]")
    this.skipUnpaxButton = page.locator("//button[text()='Skip ']")
    this.continueToUnpaxButton = page.locator("//button[contains(text(),'Continue to Unpax')]")
    this.SkipUnpax = page.locator('//button[contains(text(),"Skip")]')
    this.retrieveExampleZoweYaml = page.locator('//button[contains(text(),"Retrieve example-zowe.yaml")]')
    this.click_InitializationStage = page.locator('//span[text()="Initialization"]')
    this.installation_Type_Tab = page.locator('//span[text()="Installation Type"]')
  }

  async clickInstallationTypeTab() {
    await this.installation_Type_Tab.click({ timeout: 9000 })
  }

  async getInstallationTypePageTitle() {
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async selectDownloadZowePax() {
    await this.downloadPax.click({ timeout: 5000 })
  }

  async isDownloadZowePaxSelected() {
    await this.page.waitForTimeout(1000)
    return await this.downloadPax.isChecked()
  }

  async selectUploadZowePax() {
    await this.uploadPax.click({ timeout: 5000 });
  }

  async isUploadZowePaxSelected() {
    await this.page.waitForTimeout(1000)
    return await this.uploadPax.isChecked()
  }

  async selectSmpe() {
    await this.smpe.click({ timeout: 5000 });
  }

  async continueToUnpax() {
    await this.continueToUnpaxButton.click({ timeout: 2000 })
  }

  async retrieveExampleYaml() {
    await this.retrieveExampleZoweYaml.click({ timeout: 5000 });
  }

  async continueComponentInstallation() {
    const timeout = 5000;
    const interval = 500;
    while (true) {
      if (await this.continueCompInstallation.isEnabled()) {
        await this.continueCompInstallation.click();
        return;
      }
      await this.page.waitForTimeout(interval);
    }
    await this.continueCompInstallation.click({ timeout: timeout });
  }

  private async waitForInstallationPageVisible(): Promise<void> {
    const timeout = 1000000;
    const interval = 500;
    const endTime = Date.now() + timeout;
    while (Date.now() < endTime) {
      if (await this.installationPageTitle.isVisible()) {
        return;
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error('Timed out waiting for the Installation Page to become visible.');
  }

  async isSmpeSelected() {
    await this.page.waitForTimeout(1000)
    return await this.smpe.isChecked()
  }

  async clickZoweLink() {
    await this.zoweLink.click();
  }

  async clickLicenseAgreement() {
    await this.licenseAgreement.click({ timeout: 5000 });
  }

  async clickSaveAndClose() {
    await this.saveAndClose.click({ timeout: 5000 });
  }

  async clickPreviousStep() {
    await this.previousStep.click();
  }

  async clickContinueToInstallation() {
    await this.continueToComponentInstallation.click();
  }

  async isContinueToComponentInstallationDisabled() {
    return await this.continueToComponentInstallation.isDisabled()
  }

  async isContinueToComponentInstallationEnabled() {
    return await this.continueToComponentInstallation.isEnabled()
  }

  async clickAgreeLicense() {
    await this.agreeLicense.click({ timeout: 5000 });
  }

  async clickDisagreeLicense() {
    await this.page.waitForTimeout(1000)
    await this.disagreeLicense.click({ timeout: 5000 });
  }

  async isLicenseAgreementGreenCheckVisible() {
    await this.page.waitForTimeout(5000);
    return await this.licenseAgreementGreenCheck.isVisible({ timeout: 5000 });
  }

  async clickUploadPaxButton() {
    await this.uploadPaxButton.click({ timeout: 5000 });
  }

  async skipUnpax() {
    await this.skipUnpaxButton.click({ timeout: 5000 });
    await this.waitForInstallationPageVisible();

  }

  async enterRuntimeDir(runtimeDir: any) {
    await this.runtimeDir.clear({ timeout: 5000 })
    await this.runtimeDir.fill(runtimeDir);
  }

  async clickValidateLocation() {
    await this.validateLocation.click({ timeout: 5000 });
  }

  async isValidateLocationGreenCheckVisible() {
    return await this.validateLocationGreenCheck.isVisible();
  }

  async downloadZowePaxAndNavigateToInstallationPage() {
    await this.selectDownloadZowePax()
    await this.clickLicenseAgreement()
    await this.clickAgreeLicense()
  }

  async uploadZowePaxAndNavigateToInstallationPage(uploadPaxPath: any) {
    this.selectUploadZowePax()
    await this.uploadPaxButton.setInputFiles(uploadPaxPath)
  }

  async smpeZowePaxAndNavigateToInstallationPage(runtimeDir: any) {
    this.selectSmpe()
    this.enterRuntimeDir(runtimeDir)
    this.clickValidateLocation()
  }
  async clickOnContinueToUnpax() {
    this.continueToUnpaxButton.click({ timeout: 2000 })
  }

  async isContinueToUnpaxEnabled() {
    return await this.continueToUnpaxButton.isEnabled()
  }

  async clickSkipUnpaxButton() {
    this.SkipUnpax.click({ timeout: 2000 })
  }

  async clickRetrieveExZoweYaml() {
    this.retrieveExampleZoweYaml.click({ timeout: 15000 })
  }

  async MoveToInitializationStage() {
    this.click_InitializationStage.click({ timeout: 15000 })
  }
}
export default InstallationTypePage;
