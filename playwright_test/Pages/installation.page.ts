import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class InstallationPage {
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

  commonPage = new CommonPage();

  async getInstallationPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async enterPrefix(prefix: string): Promise<void>{
    await this.page.waitForTimeout(500)
    await this.prefix.fill(prefix);
    await this.commonPage.validateElementValue(this.prefix, prefix)
  }

  async getPrefixValue(): Promise<string> {
    return await this.prefix.inputValue();
  }

  async enterProcLib(proclib: string): Promise<void> {
    await this.page.waitForTimeout(500)
    await this.procLib.fill(proclib);
    await this.commonPage.validateElementValue(this.procLib, proclib)
  }


  async getProclibValue(): Promise<string> {
    return await this.procLib.inputValue();
  }

  async enterParmLib(parmlib: string): Promise<void>{
    await this.page.waitForTimeout(500)
    await this.parmLib.fill(parmlib);
    await this.commonPage.validateElementValue(this.parmLib, parmlib)
  }

  async getParmlibValue(): Promise<string> {
    return await this.parmLib.inputValue();
  }

  async enterZis(zis: string): Promise<void> {
    await this.page.waitForTimeout(500)
    await this.zis.fill(zis);
    await this.commonPage.validateElementValue(this.zis, zis)
  }

  async enterJclLib(Jcllib: string): Promise<void> {
    await this.page.waitForTimeout(500)
    await this.jclLib.fill(Jcllib);
    await this.commonPage.validateElementValue(this.jclLib, Jcllib)
  }

  async enterLoadLib(loadlib: string): Promise<void>{
    await this.page.waitForTimeout(500)
    await this.loadLib.fill(loadlib);
    await this.commonPage.validateElementValue(this.loadLib, loadlib)
  }

  async enterAuthLoadLib(authloadlib: string): Promise<void> {
    await this.authLoadLib.fill(authloadlib);
	await this.page.waitForTimeout(5000)
  }

  async getAuthLoadLibValue(): Promise<string> {
	return await this.authLoadLib.inputValue();
  }

  async enterAuthPluginLib(authpluginlib: string): Promise<void> {
    await this.authPluginLib.fill(authpluginlib);
	await this.page.waitForTimeout(5000)
  }

  async getAuthPluginLibValue(): Promise<string> {
    return await this.authPluginLib.inputValue();
  }

  async clickInstallMvsDatasets(){
	await this.installMVSDatasets.click();
	await this.waitForContinueButtonToBeEnabled();
  }

  async clickViewEditYaml(){
    await this.viewEditYaml.click();
  }

  async clickViewSubmitJob(){
    await this.viewSubmitJob.click();
  }

  async clickViewJobOutput(){
    await this.viewJobOutput.click();
    await this.page.waitForTimeout(2000);
  }

  async clickSaveAndClose(){
    await this.saveAndClose.click({timeout: 2000});
  }

  async clickPreviousStep() {
    await this.commonPage.waitForElement(this.previousStep)
    await this.previousStep.click();
  }

  async clickSkipInstallation() {
    await this.commonPage.waitForElement(this.skipInstallation)
    await this.skipInstallation.click();
  }

  async clickContinueToNetworkSetup() {
    await this.commonPage.waitForElement(this.continueToNetworkSetup)
    await this.continueToNetworkSetup.click();
  }

  async isContinueToNetworkSetupDisabled(){
    return await this.continueToNetworkSetup.isDisabled()
  }

  async isContinueToNetworkSetupEnabled(){
    return await this.continueToNetworkSetup.isEnabled()
  }

  async open_monacoEditor(){
    await this.page.waitForTimeout(1000)
    this.viewEditYaml.click({ timeout: 2000 })
    await this.commonPage.waitForElement(this.editorTitleElement)
    const editor_title = await this.editorTitleElement.textContent();
    return editor_title;
  }

  async clickCloseEditor() {
    await this.commonPage.waitForElement(this.closeEditorButton)
    await this.closeEditorButton.click();
  }

  async clickInstallMvsDatasetsInvalid(){
	await this.installMVSDatasets.click();
  }

  async fillAllFields(datasetPrefix: string, parmLib: string, procLib: string, jclLib: string, loadLib: string, authLoadLib: string, authPluginLib: string){
    await this.enterPrefix(datasetPrefix);
	await this.enterParmLib(parmLib);
	await this.enterProcLib(procLib);
	await this.enterJclLib(jclLib);
	await this.enterLoadLib(loadLib);
	await this.enterAuthLoadLib(authLoadLib);
	await this.enterAuthPluginLib(authPluginLib);
	await this.enterAuthLoadLib(authLoadLib);
	await this.enterAuthPluginLib(authPluginLib);
	await this.enterAuthLoadLib(authLoadLib);
	await this.enterAuthPluginLib(authPluginLib);
  }
}
export default InstallationPage;
