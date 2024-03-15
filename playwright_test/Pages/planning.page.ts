import { Locator, Page } from '@playwright/test';
let page: Page;

class PlanningPage{
  page: Page;
  planningPageTitle: Locator;
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

  constructor(page: Page) {
    this.page = page;
    this.planningPageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
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
    this.javaLocation = page.locator("//label[contains(text(),'Java location')]//following-sibling::div/input")
    this.nodeJsLocation = page.locator("//label[contains(text(),'Node.js location')]//following-sibling::div/input")
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
  }

  async clickZoweInstallationLink(){
    await this.zoweInstallationLink.click();
  }

  async getPlanningPageTitle(){
    return await this.planningPageTitle.textContent();
  }

  async enterJobStatement(jobStatement: any){
    await page.waitForTimeout(2000);
    await this.jobStatement.click();
    await this.jobStatement.fill(jobStatement);
  }

  async clickSaveAndValidate(){
    await page.waitForTimeout(3000);
    await this.saveAndValidate.click();
    await page.waitForTimeout(5000);
  }

  async isSaveAndValidateGreenCheckVisible(){
    return await this.saveAndValidateGreenCheck.isVisible();
  }

  async enterRuntimeDir(runtimeDir: any){
    await this.runtimeDir.fill(runtimeDir);
  }

  async enterWorkspaceDir(workspaceDir: any){
    await this.workspaceDir.fill(workspaceDir);
  }

  async enterLogsDir(logsDir: any){
    await this.logsDir.fill(logsDir);
  }

  async enterExtensionsDir(extensionsDir: any){
    await this.extensionsDir.fill(extensionsDir);
  }

  async enterRbacProfileIdentifier(rbacProfileIdentifier: any){
    await this.rbacProfileIdentifier.fill(rbacProfileIdentifier);
  }

  async enterJobName(jobName: any){
    await this.jobName.fill(jobName);
  }

  async enterJobPrefix(jobPrefix: any){
    await this.jobPrefix.fill(jobPrefix);
  }

  async enterCookieIdentifier(cookieIdentifier: any){
    await this.cookieIdentifier.fill(cookieIdentifier);
  }

  async enterJavaLocation(javaLocation: any){
    await this.javaLocation.fill(javaLocation);
  }

  async enterNodeJsLocation(nodeJsLocation: any){
    await this.nodeJsLocation.fill(nodeJsLocation);
  }

  async isSetZosmfAttributeChecked(){
    return await this.setZosmf.isChecked();
  }

  async checkSetZosmfAttribute(){
    if (await this.isSetZosmfAttributeChecked() == false){
      await this.setZosmf.click();
    }
    
  }

  async enterZosmfHost(zosmfHost: any){
    await this.zosmfHost.fill(zosmfHost);
  }

  async enterZosmfPort(zosmfPort: any){
    await this.zosmfPort.fill(zosmfPort);
  }

  async enterZosmfApplicationId(zosmfApplicationId: any){
    await this.zosmfApplicationId.fill(zosmfApplicationId);
  }

  async clickValidateLocations(){
    await this.validateLocations.click({timeout: 5000});
  }

  async isValidateLocationsGreenCheckVisible(){
    return await this.ValidateLocationsGreenCheck.isVisible();
  }

  async clickSaveAndClose(){
    await this.saveAndClose.click({timeout: 2000});
  }

  async clickPreviousStep(){
    await this.previousStep.click();
  }

  async clickContinueToInstallation(){
   await this.continueInstallationOptions.click();
  }

  async isContinueToInstallationDisabled(){
    return await this.continueInstallationOptions.isDisabled()
  }

  async getReadyToProceedMessage(){
    return await this.readyToProceedMessage.textContent({ timeout: 2000 });
  }

  async isContinueToInstallationEnabled(){
    return await this.continueInstallationOptions.isEnabled()
  }

  async clickSaveValidate(){
    await this.jobStatement.fill("//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS=A\n//STEP01   EXEC PGM=IEFBR14\n//SYSPRINT DD  SYSOUT=A\n//SYSIN    DD  DUMMY")
    await this.saveAndValidate.click();
  }
   async fillPlanningPageWithRequiredFields(runtimeDir: any, workspaceDir: any, extensionDir: any, logDir: any, profileIdentifier:any, jobPrefix:any,jobname:any, javaLocation:any,nodejsLocation:any,zOSMFAppID:any){
    await this.clickSaveValidate();
    await this.runtimeDir.fill(runtimeDir);
    await this.workspaceDir.fill(workspaceDir);
    await this.extensionsDir.fill(extensionDir);
    await this.logsDir.fill(logDir);
    await this.rbacProfileIdentifier.fill(profileIdentifier);
    await this.jobName.fill(jobname);
    await this.jobPrefix.fill(jobPrefix);
    await this.javaLocation.fill(javaLocation);
    await this.nodeJsLocation.fill(nodejsLocation);
    await this.zosmfApplicationId.fill(zOSMFAppID);
  }

}
  export default PlanningPage;
