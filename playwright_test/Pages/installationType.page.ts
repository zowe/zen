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
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async selectDownloadZowePax(){
    await this.downloadPax.click();
  }

  async selectUploadZowePax(){
    await this.uploadPax.click();
  }

  async selectSmpe(){
    await this.smpe.click();
  }

  async clickZoweLink(){
    await this.zoweLink.click();
  }

  async clickLicenseAgreement(){
    await this.licenseAgreement.click();
  }

  async clickSaveAndClose(){
    await this.saveAndClose.click({timeout: 2000});
  }

  async clickPreviousStep(){
    await this.previousStep.click();
  }

  async clickContinueToInstallation(){
   await this.continueToComponentInstallation.click();
  }

  async isContinueToComponentInstallationDisabled(){
    return await this.continueToComponentInstallation.isDisabled()
  }

  async isContinueToComponentInstallationEnabled(){
    return await this.continueToComponentInstallation.isEnabled()
  }

  async clickAgreeLicense(){
    await this.agreeLicense.click();
  }

  async isLicenseAgreementGreenCheckVisible(){
    return await this.licenseAgreementGreenCheck.isVisible();
  }

  async clickUploadPaxButton(){
    await this.uploadPaxButton.click();
  }

  async enterRuntimeDir(runtimeDir: any){
    await this.runtimeDir.clear({timeout: 2000})
    await this.runtimeDir.fill(runtimeDir);
  }

  async clickValidateLocation(){
    await this.validateLocation.click({timeout: 5000});
  }

  async isValidateLocationGreenCheckVisible(){
    return await this.validateLocationGreenCheck.isVisible();
  }

  async downloadZowePaxAndNavigateToInstallationPage(){
    this.selectDownloadZowePax()
    this.clickLicenseAgreement()
    this.clickAgreeLicense()
  } 

  async uploadZowePaxAndNavigateToInstallationPage(uploadPaxPath: any){
    this.selectUploadZowePax()
    await this.uploadPaxButton.setInputFiles(uploadPaxPath)
  } 

  async smpeZowePaxAndNavigateToInstallationPage(runtimeDir: any){
    this.selectSmpe()
    this.enterRuntimeDir(runtimeDir)
    this.clickValidateLocation()
  } 
}
  export default InstallationTypePage;
