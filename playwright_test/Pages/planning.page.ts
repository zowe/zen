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
  errorMessage: Locator;
  save_and_close: Locator;

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
    this.javaLocation = page.locator("//label[contains(text(),'Java Home Directory')]//following-sibling::div/input")
    this.nodeJsLocation = page.locator("//label[contains(text(),'Node.js Home Directory')]//following-sibling::div/input")
    this.setZosmf = page.locator("//span[text()='Set z/OSMF Attributes (optional)']/preceding-sibling::span/input")
    this.zosmfHost = page.locator("//label[contains(text(),'z/OSMF Host')]//following-sibling::div/input")
    this.zosmfPort = page.locator('//label[contains(text(), "z/OSMF Port")]/following-sibling::div/input[@id="zosmf-port"]')
	//this.zosmfPort = page.locator('//input[@id="zosmf-port"]');
    this.zosmfApplicationId = page.locator("//label[contains(text(),'z/OSMF Application Id')]//following-sibling::div/input")
    this.validateLocations = page.locator("//button[contains(text(), 'Validate locations')]")
    this.ValidateLocationsGreenCheck = page.locator("//button[text()='Validate locations']//following-sibling::*[@data-testid='CheckCircleIcon']")
    this.saveAndClose = page.locator("//button[contains(text(),'Save & close')]")
    this.previousStep = page.locator("//button[contains(text(),'Previous step')]")
    this.continueInstallationOptions = page.locator("//button[contains(text(), 'Continue to Installation Options')]")
    this.readyToProceedMessage = page.locator("//div[contains(@class,'MuiBox-root css-hieomr')]/p")
    this.errorMessage = page.locator("//div[contains(@class,'MuiAlert-message')]")
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
  }

  async clickZoweInstallationLink(){
    await this.page.waitForTimeout(500);
    await this.zoweInstallationLink.click();
  }

  async getPlanningPageTitle(){
    await this.page.waitForTimeout(1000);
    return await this.planningPageTitle.textContent();
  }

  async getJobStatement(){
    await this.page.waitForTimeout(1000);
    return await this.jobStatement.textContent();
  }

  async click_saveAndClose(){
   this.save_and_close.click({ timeout: 2000 })
  }

  async enterJobStatement(jobStatement: string){
    await this.page.waitForTimeout(500);
    await this.jobStatement.fill(jobStatement);
  }

  async clickSaveAndValidate(){
    await this.saveAndValidate.click({ timeout: 5000 });
  }

  async isSaveAndValidateGreenCheckVisible(): Promise<boolean> {
    try {
      await this.saveAndValidateGreenCheck.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      console.error('Error checking visibility:', error);
      return false;
    }
  }

  async getErrorMessage(){
    await this.page.waitForTimeout(1000);
    return await this.errorMessage.textContent();
  }

  async enterRuntimeDir(runtimeDir: any){
    await this.page.waitForTimeout(500);
    //await this.runtimeDir.clear({timeout: 2000})
    await this.runtimeDir.fill(runtimeDir);
  }

  async getrRuntimeDir(){
   const value = await this.runtimeDir.inputValue();
   return value;
  }

  async enterWorkspaceDir(workspaceDir: any){
    await this.page.waitForTimeout(500);
    await this.workspaceDir.clear({timeout: 2000})
    await this.workspaceDir.fill(workspaceDir);
  }

  async enterLogsDir(logsDir: any){
    await this.page.waitForTimeout(500);
    await this.logsDir.clear({timeout: 2000})
    await this.logsDir.fill(logsDir);
  }

  async enterExtensionsDir(extensionsDir: any){
    await this.page.waitForTimeout(500);
    await this.extensionsDir.clear({timeout: 2000})
    await this.extensionsDir.fill(extensionsDir);
  }

  async enterRbacProfileIdentifier(rbacProfileIdentifier: any){
    await this.page.waitForTimeout(500);
    await this.rbacProfileIdentifier.clear({timeout: 2000})
    await this.rbacProfileIdentifier.fill(rbacProfileIdentifier);
  }

  async enterJobName(jobName: any){
    await this.page.waitForTimeout(500);
    await this.jobName.clear({timeout: 2000})
    await this.jobName.fill(jobName);
  }

  async enterJobPrefix(jobPrefix: any){
    await this.page.waitForTimeout(500);
    await this.jobPrefix.clear({timeout: 2000})
    await this.jobPrefix.fill(jobPrefix);
  }

  async enterCookieIdentifier(cookieIdentifier: any){
    await this.page.waitForTimeout(500);
    await this.cookieIdentifier.clear({timeout: 2000})
    await this.cookieIdentifier.fill(cookieIdentifier);
  }

  async enterJavaLocation(javaLocation: any){
    await this.page.waitForTimeout(500);
    await this.javaLocation.clear({timeout: 2000})
    await this.javaLocation.fill(javaLocation);
  }

  async enterNodeJsLocation(nodeJsLocation: any){
    await this.page.waitForTimeout(500);
    await this.nodeJsLocation.clear({timeout: 2000})
    await this.nodeJsLocation.fill(nodeJsLocation);
  }

  async isSetZosmfAttributeChecked(){
    await this.page.waitForTimeout(1000);
    return await this.setZosmf.isChecked();
  }

  async checkSetZosmfAttribute(){
    await this.page.waitForTimeout(1000);
    if (await this.isSetZosmfAttributeChecked() == false){
      await this.setZosmf.click();
    }

  }

  async enterZosmfHost(zosmfHost: any){
    await this.page.waitForTimeout(500);
    await this.zosmfHost.clear({timeout: 2000})
    await this.zosmfHost.fill(zosmfHost);
  }

  async enterZosmfPort(zosmfPort: any){
    await this.page.waitForTimeout(500);
    await this.zosmfPort.clear({timeout: 2000})
    await this.zosmfPort.fill(zosmfPort);
  }

  async enterZosmfApplicationId(zosmfApplicationId: any){
    await this.page.waitForTimeout(500);
    await this.zosmfApplicationId.clear({timeout: 2000})
    await this.zosmfApplicationId.fill(zosmfApplicationId);
  }

  async clickValidateLocations(){
    await this.validateLocations.click({timeout: 5000});
	await this.isContinueToInstallationEnabled()
  }

  async isValidateLocationsGreenCheckVisible(): Promise<boolean> {
    try {
      await this.ValidateLocationsGreenCheck.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch (error) {
      console.error('Error checking visibility:', error);
      return false;
    }
  }


  async clickSaveAndClose(){
    await this.saveAndClose.click({timeout: 15000});
  }

  async clickPreviousStep(){
    await this.page.waitForTimeout(500);
    await this.previousStep.click();
  }

  async clickContinueToInstallation(){
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

  async isContinueToInstallationDisabled(){
    await this.page.waitForTimeout(500);
    return await this.continueInstallationOptions.isDisabled()
  }

  async getReadyToProceedMessage(){
    await this.page.waitForTimeout(1000);
    return await this.readyToProceedMessage.textContent({ timeout: 2000 });
  }

  async isContinueToInstallationEnabled(){
    await this.page.waitForTimeout(500);
    return await this.continueInstallationOptions.isEnabled()
  }

  async clickSaveValidate(){
    await this.jobStatement.fill("//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A")
    await this.saveAndValidate.click();
	await this.page.waitForTimeout(500);
  }


  async fillPlanningPageWithRequiredFields(runtimeDir: any, workspaceDir: any, extensionDir: any, logDir: any, profileIdentifier:any, jobPrefix:any,jobname:any, javaLocation:any,nodejsLocation:any,zOSMFHost:any,zOSMFPort:any,zOSMFAppID:any){
    await this.clickSaveValidate();
    await this.enterRuntimeDir(runtimeDir);
    await this.enterWorkspaceDir(workspaceDir);
    await this.enterLogsDir(logDir);
    await this.enterExtensionsDir(extensionDir);
    await this.enterRbacProfileIdentifier(profileIdentifier);
    await this.enterJobName(jobname);
    await this.enterJobPrefix(jobPrefix);
    await this.enterJavaLocation(javaLocation);
    await this.enterNodeJsLocation(nodejsLocation);
    //await this.enterZosmfHost(zOSMFHost);
    //await this.enterZosmfPort(zOSMFPort);
    await this.enterZosmfApplicationId(zOSMFAppID);
    await this.page.waitForTimeout(2000);
  }

}
  export default PlanningPage;