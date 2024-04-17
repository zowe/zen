import { Page,Locator } from '@playwright/test';

class InstallationTypePage{
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
    this.downloadPax = page.locator("//span[text()='Download Zowe convenience build PAX from internet']/preceding-sibling::span")
    this.uploadPax = page.locator("//span[text()='Upload Zowe PAX for offline install']/preceding-sibling::span")
    this.smpe = page.locator("//span[text()='SMP/E']/preceding-sibling::span")
    this.licenseAgreement = page.locator("//button[text()='License Agreement']")
	  this.saveAndClose = page.locator("//button[contains(text(),'Save & close')]")
    this.previousStep = page.locator("//button[contains(text(),'Previous step')]")
    this.continueToComponentInstallation = page.locator("//button[text()='Continue to Components Installation']")
    this.zoweLink = page.locator("//a[@href='zowe.org']")
    this.agreeLicense = page.locator("//button[text()='Agree']")
    this.uploadPaxButton = page.locator("//button[text()='Agree']")
    this.runtimeDir = page.locator("//label[contains(text(),'Runtime Directory')]//following-sibling::div/input")
    this.validateLocation = page.locator("//button[text()= 'Validate location']")
    this.validateLocationGreenCheck = page.locator("//button[text()='Validate location']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.licenseAgreementGreenCheck = page.locator("//button[text()='License Agreement']//following-sibling::*[@data-testid='CheckCircleIcon']")
  }

  async getInstallationTypePageTitle(){
    await this.page.waitForTimeout(1000)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async selectDownloadZowePax(){
    await this.page.waitForTimeout(1000)
    await this.downloadPax.click();
  }

  async selectUploadZowePax(){
    await this.page.waitForTimeout(1000)
    await this.uploadPax.click();
  }

  async selectSmpe(){
    await this.page.waitForTimeout(1000)
    await this.smpe.click();
  }

  async clickZoweLink(){
    await this.page.waitForTimeout(1000)
    await this.zoweLink.click();
  }

  async clickLicenseAgreement(){
    await this.page.waitForTimeout(1000)
    await this.licenseAgreement.click();
  }

  async clickSaveAndClose(){
    await this.page.waitForTimeout(1000)
    await this.saveAndClose.click({timeout: 2000});
    await this.page.waitForTimeout(2000)
  }

  async clickPreviousStep(){
    await this.page.waitForTimeout(1000)
    await this.previousStep.click();
    await this.page.waitForTimeout(2000)
  }

  async clickContinueToInstallation(){
    await this.page.waitForTimeout(1000)
    await this.continueToComponentInstallation.click();
    await this.page.waitForTimeout(5000);
  }

  async isContinueToComponentInstallationDisabled(){
    await this.page.waitForTimeout(1000)
    return await this.continueToComponentInstallation.isDisabled()
  }

  async isContinueToComponentInstallationEnabled(){
    await this.page.waitForTimeout(1000)
    return await this.continueToComponentInstallation.isEnabled()
  }

  async clickAgreeLicense(){
    await this.page.waitForTimeout(1000)
    await this.agreeLicense.click();
  }

  async isLicenseAgreementGreenCheckVisible(){
    await this.page.waitForTimeout(1000)
    return await this.licenseAgreementGreenCheck.isVisible();
  }

  async clickUploadPaxButton(){
    await this.page.waitForTimeout(1000)
    await this.uploadPaxButton.click();
  }

  async enterRuntimeDir(runtimeDir: any){
    await this.page.waitForTimeout(1000)
    await this.runtimeDir.clear({timeout: 2000})
    await this.runtimeDir.fill(runtimeDir);
  }

  async clickValidateLocation(){
    await this.page.waitForTimeout(1000)
    await this.validateLocation.click({timeout: 5000});
    await this.page.waitForTimeout(2000)
  }

  async isValidateLocationGreenCheckVisible(){
    await this.page.waitForTimeout(1000)
    return await this.validateLocationGreenCheck.isVisible();
  }

  async downloadZowePaxAndNavigateToInstallationPage(){
    this.selectDownloadZowePax()
    this.clickLicenseAgreement()
    this.clickAgreeLicense()
  } 

  async uploadZowePaxAndNavigateToInstallationPage(uploadPaxPath: any){
    this.selectUploadZowePax()
    await this.page.waitForTimeout(2000)
    await this.uploadPaxButton.setInputFiles(uploadPaxPath)
    await this.page.waitForTimeout(2000)
  } 

  async smpeZowePaxAndNavigateToInstallationPage(runtimeDir: any){
    this.selectSmpe()
    this.enterRuntimeDir(runtimeDir)
    this.clickValidateLocation()
  } 
}
  export default InstallationTypePage;
