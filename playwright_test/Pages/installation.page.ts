import { Page,Locator } from '@playwright/test';

class InstallationPage{
  page: Page;
  pageTitle: Locator;
  prefix: Locator;
  procLib: Locator;
  parmLib: Locator;
  zis: Locator;
  jclLib: Locator;
  loadLib: Locator;
  authLoadLib: Locator;
  authPluginLib: Locator;
  installMVSDatasets: Locator;
  viewEditYaml: Locator;
  viewSubmitJob: Locator;
  viewJobOutput: Locator;
  saveAndClose: Locator;
  previousStep: Locator;
  skipInstallation: Locator;
  continueToNetworkSetup: Locator;
  editorTitleElement: Locator;
  closeEditorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.prefix = page.locator("//label[text()='Prefix']//following-sibling::div/input")
    this.procLib = page.locator("//label[text()='Proclib']//following-sibling::div/input")
    this.parmLib = page.locator("//label[text()='Parmlib']//following-sibling::div/input")
    this.zis = page.locator("//label[text()='Zis']//following-sibling::div/input")
    this.jclLib = page.locator("//label[text()='Jcllib']//following-sibling::div/input")    
    this.loadLib = page.locator("//label[text()='Loadlib']//following-sibling::div/input")    
    this.authLoadLib = page.locator("//label[text()='Auth Loadlib']//following-sibling::div/input")    
    this.authPluginLib = page.locator("//label[text()='Auth Plugin Lib']//following-sibling::div/input")    
    this.installMVSDatasets = page.locator("//button[text()='Install MVS datasets']")    
    this.viewEditYaml = page.locator("//button[text()='View/Edit Yaml']")    
    this.viewSubmitJob = page.locator("//button[text()='View/Submit Job']")    
    this.viewJobOutput = page.locator("//button[text()='View Job Output']")    
	this.saveAndClose = page.locator("//button[text()='Save & close']")
    this.previousStep = page.locator("//button[text()='Previous step']")
    this.skipInstallation = page.locator("//button[contains(text(),'Skip')]")    
    this.continueToNetworkSetup = page.locator("//button[text()='Continue to Network Setup']")
    this.editorTitleElement = page.locator("//h2[text()='Editor']")
    this.closeEditorButton = page.locator("//button[text()='Close']")
  }

  async getInstallationPageTitle(){
    await this.page.waitForTimeout(1000)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async enterPrefix(prefix: any){
    await this.page.waitForTimeout(500)
    await this.prefix.fill(prefix);
  }

  async getPrefixValue(){
    await this.page.waitForTimeout(500)
    return await this.prefix.textContent();
  }
 
  async enterProcLib(proclib: any){
    await this.page.waitForTimeout(500)
    await this.procLib.fill(proclib);
  }

  async getProclibValue(){
    await this.page.waitForTimeout(500)
    return await this.procLib.textContent();
  }
 
  async enterParmLib(parmlib: any){
    await this.page.waitForTimeout(500)
    await this.parmLib.fill(parmlib);
  }

  async getParmlibValue(){
    await this.page.waitForTimeout(500)
    return await this.parmLib.textContent();
  }

  async enterZis(zis: any){
    await this.page.waitForTimeout(500)
    await this.zis.fill(zis);
  }

  async enterJclLib(Jcllib: any){
    await this.page.waitForTimeout(500)
    await this.jclLib.fill(Jcllib);
  }

  async enterLoadLib(loadlib: any){
    await this.page.waitForTimeout(500)
    await this.loadLib.fill(loadlib);
  }

  async enterAuthLoadLib(authloadlib: any){
    await this.page.waitForTimeout(500)
    await this.authLoadLib.fill(authloadlib);
  }

  async getAuthLoadLibValue(){
    await this.page.waitForTimeout(500)
    return await this.authLoadLib.textContent();
  }

  async enterAuthPluginLib(authpluginlib: any){
    await this.page.waitForTimeout(500)
    await this.authPluginLib.fill(authpluginlib);
  }

  async getAuthPluginLibValue(){
    await this.page.waitForTimeout(500)
    return await this.authPluginLib.textContent();
  }

  async clickInstallMvsDatasets(){
    await this.page.waitForTimeout(1000)
    await this.installMVSDatasets.click();
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

  async clickSkipInstallation(){
    await this.page.waitForTimeout(500)
    await this.skipInstallation.click();
  }

  async clickContinueToNetworkSetup(){
    await this.page.waitForTimeout(500)
    await this.continueToNetworkSetup.click();
  }

  async isContinueToNetworkSetupDisabled(){
    await this.page.waitForTimeout(500)
    return await this.continueToNetworkSetup.isDisabled()
  }

  async isContinueToNetworkSetupEnabled(){
    await this.page.waitForTimeout(500)
    return await this.continueToNetworkSetup.isEnabled()
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
  export default InstallationPage;
