import { Page,Locator } from '@playwright/test';

class CertificatesPage{
  page: Page;
  pageTitle: Locator;
  viewEditYaml: Locator;
  viewSubmitJob: Locator;
  viewJobOutput: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  skipCertificates: Locator;
  continueToLaunchSetup: Locator;
  editorTitleElement: Locator;
  closeEditorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.viewEditYaml = page.locator("//button[text()='View/Edit Yaml']")    
    this.viewSubmitJob = page.locator("//button[text()='View/Submit Job']")    
    this.viewJobOutput = page.locator("//button[text()='View Job Output']")    
	  this.saveAndClose = page.locator("//button[text()='Save & close']")
    this.previousStep = page.locator("//button[text()='Previous step']")
    this.skipCertificates = page.locator("//button[contains(text(),'Skip')]")    
    this.continueToLaunchSetup = page.locator("//button[text()='Continue to Launch Setup']")
    this.editorTitleElement = page.locator("//h2[text()='Editor']")
    this.closeEditorButton = page.locator("//button[text()='Close']")
  }

  async getCertificatesPageTitle(){
    await this.page.waitForTimeout(1000)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async clickViewEditYaml(){
    await this.page.waitForTimeout(500)
    await this.viewEditYaml.click();
  }

  async clickViewSubmitJob(){
    await this.page.waitForTimeout(500)
    await this.viewSubmitJob.click();
  }

  async clickViewJobOutput(){
    await this.page.waitForTimeout(500)
    await this.viewJobOutput.click();
    await this.page.waitForTimeout(2000);
  }

  async clickSaveAndClose(){
    await this.page.waitForTimeout(500)
    await this.saveAndClose.click({timeout: 2000});
  }

  async clickPreviousStep(){
    await this.page.waitForTimeout(500)
    await this.previousStep.click();
  }

  async clickSkipCertificates(){
    await this.page.waitForTimeout(500)
    await this.skipCertificates.click();
  }

  async clickContinueToLaunchSetup(){
    await this.page.waitForTimeout(500)
    await this.continueToLaunchSetup.click();
  }

  async isContinueToLaunchSetupDisabled(){
    await this.page.waitForTimeout(500)
    return await this.continueToLaunchSetup.isDisabled()
  }

  async isContinueToLaunchSetupEnabled(){
    await this.page.waitForTimeout(500)
    return await this.continueToLaunchSetup.isEnabled()
  }

  async open_monacoEditor(){
    await this.page.waitForTimeout(1000)
    this.viewEditYaml.click({ timeout: 2000 })
    const editor_title = await this.editorTitleElement.textContent();
    return editor_title;
  }

  async clickCloseEditor(){
    await this.page.waitForTimeout(500)
    await this.closeEditorButton.click();
  }
}
  export default CertificatesPage;
