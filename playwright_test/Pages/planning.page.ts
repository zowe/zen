import { Locator, Page } from '@playwright/test';
import CommonPage from './common.page';

class PlanningPage {
  page: Page;
  pageTitle: Locator;
  zoweInstallationLink: Locator;
  jobStatement: Locator;
  saveAndValidate: Locator;
  saveAndValidateGreenCheck: Locator;
  runtimeDir: Locator;
  workspaceDir: Locator;
  logsDir: Locator;
  extensionsDir: Locator;
  rbacProfileIdentifier: Locator;
  jobName: Locator;
  jobPrefix: Locator;
  cookieIdentifier: Locator;
  javaLocation: Locator;
  nodeJsLocation: Locator;
  setZosmf: Locator;
  zosmfHost: Locator;
  zosmfPort: Locator;
  zosmfApplicationId: Locator;
  validateLocations: Locator;
  ValidateLocationsGreenCheck: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  continueInstallationOptions: Locator;
  readyToProceedMessage: Locator;
  errorMessage: Locator;
  save_and_close: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.zoweInstallationLink = page.locator("//a[contains(text(), 'installation overview for Zowe')]")
    this.jobStatement = page.locator("//label[text()='Job statement']//following-sibling::div/textarea[1]")
    this.saveAndValidate = page.locator("//button[text()='Save and validate']")
    this.saveAndValidateGreenCheck = page.locator("//button[text()='Save and validate']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.runtimeDir = page.locator("//label[contains(text(),'Run-time Directory')]//following-sibling::div/input")
    this.workspaceDir = page.locator("//label[contains(text(),'Workspace Directory')]//following-sibling::div/input")
    this.logsDir = page.locator("//label[contains(text(),'Log Directory')]//following-sibling::div/input")
    this.extensionsDir = page.locator("//label[contains(text(),'Extensions Directory')]//following-sibling::div/input")
    this.rbacProfileIdentifier = page.locator("//label[contains(text(),'Rbac Profile Identifier')]//following-sibling::div/input")
    this.jobName = page.locator("//label[contains(text(),'Job Name')]//following-sibling::div/input")
    this.jobPrefix = page.locator("//label[contains(text(),'Job Prefix')]//following-sibling::div/input")
    this.cookieIdentifier = page.locator("//label[contains(text(),'Cookie Identifier')]//following-sibling::div/input")
    this.javaLocation = page.locator("//input[@id='java-home-input']")
    this.nodeJsLocation = page.locator("//input[@id='node-home-input']")
    this.setZosmf = page.locator("//span[text()='Set z/OSMF Attributes (optional)']/preceding-sibling::span/input")
    this.zosmfHost = page.locator("//label[contains(text(),'z/OSMF Host')]//following-sibling::div/input")
    this.zosmfPort = page.locator("//label[contains(text(),'z/OSMF Port')]//following-sibling::div/input")
    this.zosmfApplicationId = page.locator("//label[contains(text(),'z/OSMF Application Id')]//following-sibling::div/input")
    this.validateLocations = page.locator("//button[contains(text(), 'Validate locations')]")
    this.ValidateLocationsGreenCheck = page.locator("//button[text()='Validate locations']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.saveAndClose = page.locator("//button[contains(text(),'Save & close')]")
    this.previousStep = page.locator("//button[contains(text(),'Previous step')]")
    this.continueInstallationOptions = page.locator("//button[contains(text(), 'Continue to Installation Options')]")
    this.readyToProceedMessage = page.locator("//div[contains(@class,'MuiBox-root css-hieomr')]/p")
    this.errorMessage = page.locator("//div[contains(@class,'MuiAlert-message')]")
    this.save_and_close = page.locator('//button[contains(text(),"Save & close")]')
  }

  commonPage = new CommonPage();

  async clickZoweInstallationLink() {
    await this.commonPage.waitForElement(this.zoweInstallationLink)
    await this.zoweInstallationLink.click();
  }

  async getPlanningPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent();
  }

  async click_saveAndClose() {
    await this.commonPage.waitForElement(this.save_and_close)
    this.save_and_close.click({ timeout: 2000 })
  }

  async enterJobStatement(jobStatement: string) {
    await this.commonPage.waitForElement(this.jobStatement)
    await this.jobStatement.clear({ timeout: 2000 });
    await this.jobStatement.fill(jobStatement);
    await this.commonPage.validateElementValue(this.jobStatement, jobStatement)
    return true
  }

  async clickSaveAndValidate() {
    await this.commonPage.waitForElement(this.saveAndValidate);
    await this.saveAndValidate.click({ timeout: 5000 });
  }

  async validateJobStatement(jobStatement: string) {
    const jobStatementFilled = await this.enterJobStatement(jobStatement);
    if (jobStatementFilled) {
      this.clickSaveAndValidate();
    } else {
      this.enterJobStatement(jobStatement);
      this.clickSaveAndValidate();
    }
  }

  async isSaveAndValidateGreenCheckVisible(): Promise<boolean> {
    await this.commonPage.waitForElement(this.saveAndValidateGreenCheck)
    try {
      await this.saveAndValidateGreenCheck.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      console.error('Error checking visibility:', error);
      return false;
    }
  }

  async getErrorMessage() {
    await this.commonPage.waitForElement(this.errorMessage)
    return await this.errorMessage.textContent();
  }

  async enterRuntimeDir(runtimeDir: any) {
    await this.commonPage.waitForElement(this.runtimeDir)
    await this.runtimeDir.clear({ timeout: 2000 })
    await this.runtimeDir.fill(runtimeDir);
    await this.commonPage.validateElementValue(this.runtimeDir, runtimeDir)
  }

  async getrRuntimeDir() {
    await this.commonPage.waitForElement(this.runtimeDir)
    const value = await this.runtimeDir.inputValue();
    return value;
  }

  async enterWorkspaceDir(workspaceDir: any) {
    await this.commonPage.waitForElement(this.workspaceDir)
    await this.workspaceDir.clear({ timeout: 2000 })
    await this.workspaceDir.fill(workspaceDir);
    await this.commonPage.validateElementValue(this.workspaceDir, workspaceDir)
  }

  async enterLogsDir(logsDir: any) {
    await this.commonPage.waitForElement(this.logsDir)
    await this.logsDir.clear({ timeout: 2000 })
    await this.logsDir.fill(logsDir);
    await this.commonPage.validateElementValue(this.logsDir, logsDir)
  }

  async enterExtensionsDir(extensionsDir: any) {
    await this.commonPage.waitForElement(this.extensionsDir)
    await this.extensionsDir.clear({ timeout: 2000 })
    await this.extensionsDir.fill(extensionsDir);
    await this.commonPage.validateElementValue(this.extensionsDir, extensionsDir)
  }

  async enterRbacProfileIdentifier(rbacProfileIdentifier: any) {
    await this.commonPage.waitForElement(this.rbacProfileIdentifier)
    await this.rbacProfileIdentifier.clear({ timeout: 2000 })
    await this.rbacProfileIdentifier.fill(rbacProfileIdentifier);
    await this.commonPage.validateElementValue(this.rbacProfileIdentifier, rbacProfileIdentifier)
  }

  async enterJobName(jobName: any) {
    await this.commonPage.waitForElement(this.jobName)
    await this.jobName.clear({ timeout: 2000 })
    await this.jobName.fill(jobName);
    await this.commonPage.validateElementValue(this.jobName, jobName)
  }

  async enterJobPrefix(jobPrefix: any) {
    await this.commonPage.waitForElement(this.jobPrefix)
    await this.jobPrefix.clear({ timeout: 2000 })
    await this.jobPrefix.fill(jobPrefix);
    await this.commonPage.validateElementValue(this.jobPrefix, jobPrefix)
  }

  async enterCookieIdentifier(cookieIdentifier: any) {
    await this.commonPage.waitForElement(this.cookieIdentifier)
    await this.cookieIdentifier.clear({ timeout: 2000 })
    await this.cookieIdentifier.fill(cookieIdentifier);
    await this.commonPage.validateElementValue(this.cookieIdentifier, cookieIdentifier)
  }

  async enterJavaLocation(javaLocation: any) {
    await this.commonPage.waitForElement(this.javaLocation)
    await this.javaLocation.clear({ timeout: 2000 })
    await this.javaLocation.fill(javaLocation);
    await this.commonPage.validateElementValue(this.javaLocation, javaLocation)
  }

  async enterNodeJsLocation(nodeJsLocation: any) {
    await this.commonPage.waitForElement(this.nodeJsLocation)
    await this.nodeJsLocation.clear({ timeout: 2000 })
    await this.nodeJsLocation.fill(nodeJsLocation);
    await this.commonPage.validateElementValue(this.nodeJsLocation, nodeJsLocation)
  }

  async enterZosmfHost(zosmfHost: any) {
    await this.commonPage.waitForElement(this.zosmfHost)
    await this.zosmfHost.clear({ timeout: 2000 })
    await this.zosmfHost.fill(zosmfHost);
    await this.commonPage.validateElementValue(this.zosmfHost, zosmfHost)
  }

  async enterZosmfPort(zosmfPort: any) {
    await this.commonPage.waitForElement(this.zosmfPort)
    await this.zosmfPort.clear({ timeout: 2000 })
    await this.zosmfPort.fill(zosmfPort);
    await this.commonPage.validateElementValue(this.zosmfPort, zosmfPort)
  }

  async enterZosmfApplicationId(zosmfApplicationId: any) {
    await this.commonPage.waitForElement(this.zosmfApplicationId)
    await this.zosmfApplicationId.clear({ timeout: 2000 })
    await this.zosmfApplicationId.fill(zosmfApplicationId);
    await this.commonPage.validateElementValue(this.zosmfApplicationId, zosmfApplicationId)
  }

  async clickValidateLocations() {
    await this.commonPage.waitForElement(this.validateLocations)
    await this.validateLocations.click({ timeout: 5000 });
  }

  async isValidateLocationsGreenCheckVisible() {
    await this.commonPage.waitForElement(this.ValidateLocationsGreenCheck)
    try {
      await this.ValidateLocationsGreenCheck.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch (error) {
      console.error('Error checking visibility:', error);
      return false;
    }
  }

  async clickSaveAndClose() {
    await this.commonPage.waitForElement(this.saveAndClose)
    await this.saveAndClose.click({ timeout: 15000 });
  }

  async clickPreviousStep() {
    await this.commonPage.waitForElement(this.previousStep)
    await this.previousStep.click();
  }

  async clickContinueToInstallation() {
    await this.commonPage.waitForElement(this.continueInstallationOptions)
    const timeout = 30000;
    const interval = 100;
    const startTime = Date.now();
	  const isButtonEnabled = async (): Promise<boolean> => {
      return await this.isContinueToInstallationEnabled();
    };
	while (!(await isButtonEnabled())) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timed out waiting for the button to be enabled.');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    await this.continueInstallationOptions.click();
  }

  async isContinueToInstallationDisabled() {
    await this.commonPage.waitForElement(this.continueInstallationOptions)
    return await this.continueInstallationOptions.isDisabled()
  }

  async isContinueToInstallationEnabled() {
    await this.commonPage.waitForElement(this.continueInstallationOptions)
    return await this.continueInstallationOptions.isEnabled()
  }

  async insertValidateJobStatement() {
    const jobStatement = "//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A"
    const jobStatementFilled = await this.enterJobStatement(jobStatement);
    if (jobStatementFilled) {
      this.clickSaveAndValidate();
    } else {
      this.enterJobStatement(jobStatement);
      this.clickSaveAndValidate();
    }
  }

  async fillPlanningPageWithRequiredFields(runtimeDir: any, workspaceDir: any, extensionDir: any, logDir: any,
    profileIdentifier: any, jobPrefix: any, jobname: any, javaLocation: any, nodejsLocation: any, zOSMFHost: any,
    zOSMFPort: any, zOSMFAppID: any) {
    await this.page.waitForTimeout(2000);
    await this.enterRuntimeDir(runtimeDir);
    await this.enterWorkspaceDir(workspaceDir);
    await this.enterLogsDir(logDir);
    await this.enterExtensionsDir(extensionDir);
    await this.enterRbacProfileIdentifier(profileIdentifier);
    await this.enterJobName(jobname);
    await this.enterJobPrefix(jobPrefix);
    await this.enterJavaLocation(javaLocation);
    await this.enterNodeJsLocation(nodejsLocation);
    await this.enterZosmfHost(zOSMFHost);
    await this.enterZosmfPort(zOSMFPort);
    await this.enterZosmfApplicationId(zOSMFAppID);
    await this.page.waitForTimeout(2000);
    return true
  }

  async validatePlanningStageLocations(runtimeDir: any, workspaceDir: any, extensionDir: any, logDir: any, profileIdentifier: any,
    jobPrefix: any, jobname: any, javaLocation: any, nodejsLocation: any, zOSMFHost: any, zOSMFPort: any, zOSMFAppID: any) {
    const planningDetailsFilled = await this.fillPlanningPageWithRequiredFields(runtimeDir, workspaceDir, extensionDir, logDir,
      profileIdentifier, jobPrefix, jobname, javaLocation, nodejsLocation, zOSMFHost, zOSMFPort, zOSMFAppID);
    if (planningDetailsFilled) {
      this.clickValidateLocations();
    } else {
      this.fillPlanningPageWithRequiredFields(runtimeDir, workspaceDir, extensionDir, logDir, profileIdentifier, jobPrefix,
        jobname, javaLocation, nodejsLocation, zOSMFHost, zOSMFPort, zOSMFAppID);
      this.clickValidateLocations();
    }
  }

}
export default PlanningPage;