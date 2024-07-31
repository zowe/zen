import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class CertificatesPage {
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

  commonPage = new CommonPage();

  async getCertificatesPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async clickViewEditYaml() {
    await this.commonPage.waitForElement(this.viewEditYaml)
    await this.viewEditYaml.click();
  }

  async clickViewSubmitJob() {
    await this.commonPage.waitForElement(this.viewSubmitJob)
    await this.viewSubmitJob.click();
  }

  async clickViewJobOutput() {
    await this.commonPage.waitForElement(this.viewJobOutput)
    await this.viewJobOutput.click();
    await this.page.waitForTimeout(2000);
  }

  async clickSaveAndClose() {
    await this.commonPage.waitForElement(this.saveAndClose)
    await this.saveAndClose.click({ timeout: 2000 });
  }

  async clickPreviousStep() {
    await this.commonPage.waitForElement(this.previousStep)
    await this.previousStep.click();
  }

  async clickSkipCertificates() {
    await this.commonPage.waitForElement(this.skipCertificates)
    await this.skipCertificates.click({ timeout: 2000 });
  }

  async clickContinueToLaunchSetup() {
    await this.commonPage.waitForElement(this.continueToLaunchSetup)
    await this.continueToLaunchSetup.click();
  }

  async isContinueToLaunchSetupDisabled() {
    await this.commonPage.waitForElement(this.continueToLaunchSetup)
    return await this.continueToLaunchSetup.isDisabled()
  }

  async isContinueToLaunchSetupEnabled() {
    await this.commonPage.waitForElement(this.continueToLaunchSetup)
    return await this.continueToLaunchSetup.isEnabled()
  }

  async open_monacoEditor() {
    await this.commonPage.waitForElement(this.viewEditYaml)
    this.viewEditYaml.click({ timeout: 2000 })
    await this.commonPage.waitForElement(this.editorTitleElement)
    const editor_title = await this.editorTitleElement.textContent();
    return editor_title;
  }

  async clickCloseEditor() {
    await this.commonPage.waitForElement(this.closeEditorButton)
    await this.closeEditorButton.click();
  }
}
export default CertificatesPage;
