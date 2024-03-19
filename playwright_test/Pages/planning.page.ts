import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
let electronApp: ElectronApplication
let page: Page;

class PlanningPage{
  page: Page;
  continueButtonSelector: Locator;
  userNameInputSelector: Locator;
  greenCheckIconSelector: Locator;
  javaLocation: Locator;
  nodejsLocation: Locator;
  jobPrefix: Locator;
  jobname: Locator;
  logDir: Locator;
  workspaceDir: Locator;
  extensionDir: Locator;
  runtimeDir: Locator;
  profileIdentifier: Locator;
  zOSMFAppID: Locator;
  saveValidateButton: Locator;
  ContinueToInstallation: Locator;
  validateLocations: Locator;


  constructor(page: Page) {
    this.page = page;
    this.greenCheckIconSelector = page.locator('div svg.MuiSvgIcon-colorSuccess');
    this.continueButtonSelector = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.userNameInputSelector = page.locator('label:has-text("User Name") + div input#standard-required')
    this.runtimeDir = page.getByLabel('Run-time Directory (or installation location)')
    this.extensionDir = page.getByLabel('Extensions Directory')
    this.workspaceDir = page.getByLabel('Workspace Directory')
    this.logDir = page.getByLabel('Log Directory')
    this.profileIdentifier = page.getByLabel('Rbac Profile Identifier')
    this.jobname = page.getByLabel('Job Name')
    this.jobPrefix = page.getByLabel('Job Prefix')
    this.javaLocation = page.getByLabel('Java location')
    this.nodejsLocation = page.getByLabel('Node.js location')
    this.zOSMFAppID = page.getByLabel('z/OSMF Application Id')
    this.validateLocations = page.locator("//button[contains(text(), 'Validate locations')]")
    this.ContinueToInstallation = page.locator("//button[contains(text(), 'Continue to Installation Options')]")
    this.saveValidateButton = page.locator("//button[contains(text(), 'Save and validate')]")
    this.job_statement = page.getByLabel('Job statement')

  }
   async clickSaveValidate(){
    await this.job_statement.fill("//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS=A\n//STEP01   EXEC PGM=IEFBR14\n//SYSPRINT DD  SYSOUT=A\n//SYSIN    DD  DUMMY")
    await this.saveValidateButton.click();
  }
   async fillPlanningPage(runtimeDir: string, workspaceDir: string, extensionDir: string, logDir: string, profileIdentifier:string, jobPrefix:string,jobname:string, javaLocation:string,nodejsLocation:string,zOSMFAppID:string){
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await wait(5000);
    await this.runtimeDir.fill(runtimeDir);
    await wait(2000);
    await this.workspaceDir.fill(workspaceDir);
    await wait(2000);
    await this.extensionDir.fill(extensionDir);
    await wait(2000);
    await this.logDir.fill(logDir);
    await wait(2000);
    await this.profileIdentifier.fill(profileIdentifier);
    await wait(2000);
    await this.jobname.fill(jobname);
    await wait(2000);
    await this.jobPrefix.fill(jobPrefix);
    await wait(2000);
    await this.javaLocation.fill(javaLocation);
    await wait(2000);
    await this.nodejsLocation.fill(nodejsLocation);
    await wait(2000);
    await this.zOSMFAppID.fill(zOSMFAppID);
    await wait(2000);

  }
  async clickValidateLocations(){
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await wait(20000);
    await this.validateLocations.click();
  }

  async continueInstallation(){
   await this.ContinueToInstallation.click();
  }

}
  export default PlanningPage;