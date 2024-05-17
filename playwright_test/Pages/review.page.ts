import { Page,Locator } from '@playwright/test';

class ReviewPage{
  page: Page;
  pageTitle: Locator;
  reviewInstallationTab: Locator;
  connectionTab: Locator;
  planningTab: Locator;
  installationTypeTab: Locator;
  initializationTab: Locator;
  installationTab: Locator;
  networkingTab: Locator;
  apfAuthTab: Locator;
  securityTab: Locator;
  certificatesTab: Locator;
  launchConfigTab: Locator;
  connectionTabSuccessfulIcon: Locator;
  planningTabSuccessfulIcon: Locator;
  installationTypeTabSuccessfulIcon: Locator;
  initializationTabPendingIcon: Locator;
  installationTabPendingIcon: Locator;
  networkingTabPendingIcon: Locator;
  apfAuthTabPendingIcon: Locator;
  securityTabPendingIcon: Locator;
  certificatesTabPendingIcon: Locator;
  launchConfigTabPendingIcon: Locator;
  viewEditYaml: Locator;
  viewSubmitJob: Locator;
  viewJobOutput: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  finishInstallation: Locator;
  editorTitleElement: Locator;
  closeEditorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.reviewInstallationTab = page.locator("//span[text()='Review Installation']")
    this.connectionTab = page.locator("//p[text()='Connection']")
    this.planningTab = page.locator("//p[text()='Planning']")
    this.installationTypeTab = page.locator("//p[text()='Installation Type']")
    this.initializationTab = page.locator("//p[text()='Initialization']")
    this.installationTab = page.locator("//p[text()='Installation']")    
    this.networkingTab = page.locator("//p[text()='Networking']")    
    this.connectionTabSuccessfulIcon = page.locator("//p[text()='Connection']/following-sibling::*[@data-testid='CheckCircleIcon']")
    this.planningTabSuccessfulIcon = page.locator("//p[text()='Planning']/following-sibling::*[@data-testid='CheckCircleIcon']")
    this.installationTypeTabSuccessfulIcon = page.locator("//p[text()='Installation Type']/following-sibling::*[@data-testid='CheckCircleIcon']")
    this.initializationTabPendingIcon = page.locator("//p[text()='Initialization']/following-sibling::*[@data-testid='WarningIcon']")
    this.installationTabPendingIcon = page.locator("//p[text()='Installation']/following-sibling::*[@data-testid='WarningIcon']")
    this.networkingTabPendingIcon = page.locator("//p[text()='Networking']/following-sibling::*[@data-testid='WarningIcon']")
    this.apfAuthTabPendingIcon = page.locator("//p[text()='APF Auth']/following-sibling::*[@data-testid='WarningIcon']")
    this.securityTabPendingIcon = page.locator("//p[text()='Security']/following-sibling::*[@data-testid='WarningIcon']")
    this.certificatesTabPendingIcon = page.locator("//p[text()='Certificates']/following-sibling::*[@data-testid='WarningIcon']")
    this.launchConfigTabPendingIcon = page.locator("//p[text()='Launch Config']/following-sibling::*[@data-testid='WarningIcon']")
    this.apfAuthTab = page.locator("//p[text()='APF Auth']")    
    this.securityTab = page.locator("//p[text()='Security']")    
    this.certificatesTab = page.locator("//p[text()='Certificates']")    
    this.launchConfigTab = page.locator("//p[text()='Launch Config']")    
    this.viewEditYaml = page.locator("//button[text()='View Yaml']")    
    this.viewSubmitJob = page.locator("//button[text()='View/Submit Job']")    
    this.viewJobOutput = page.locator("//button[text()='View Job Output']")    
	  this.saveAndClose = page.locator("//button[text()='Save & close']")
    this.previousStep = page.locator("//button[text()='Previous step']")
    this.finishInstallation = page.locator("//button[text()='Finish Installation']")    
    this.editorTitleElement = page.locator("//h2[text()='Editor']")
    this.closeEditorButton = page.locator("//button[text()='Close']")
  }

  async getReviewPageTitle(){
    await this.page.waitForTimeout(1000)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async clickReviewInstallationTab(){
    await this.page.waitForTimeout(500)
    await this.reviewInstallationTab.click();
  }

  async clickConnectionTab(){
    await this.page.waitForTimeout(500)
    await this.connectionTab.click();
  }

  async clickPlanningTab(){
    await this.page.waitForTimeout(500)
    await this.planningTab.click();
  }

  async clickInstallationTypeTab(){
    await this.page.waitForTimeout(500)
    await this.installationTypeTab.click();
  }

  async clickInstallationTab(){
    await this.page.waitForTimeout(500)
    await this.installationTab.click();
  }

  async clickNetworkingTab(){
    await this.page.waitForTimeout(500)
    await this.networkingTab.click();
  }

  async clickApfAuthTab(){
    await this.page.waitForTimeout(500)
    await this.apfAuthTab.click();
  }

  async clickSecurityTab(){
    await this.page.waitForTimeout(500)
    await this.securityTab.click();
  }

  async clickCertificatesTab(){
    await this.page.waitForTimeout(500)
    await this.certificatesTab.click();
  }

  async clickLaunchConfigTab(){
    await this.page.waitForTimeout(500)
    await this.launchConfigTab.click();
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

  async clickFinishInstallation(){
    await this.page.waitForTimeout(500)
    await this.finishInstallation.click();
  }

  async isFinishInstallationDisabled(){
    await this.page.waitForTimeout(500)
    return await this.finishInstallation.isDisabled()
  }

  async isFinishInstallationEnabled(){
    await this.page.waitForTimeout(500)
    return await this.finishInstallation.isEnabled()
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
  export default ReviewPage;
