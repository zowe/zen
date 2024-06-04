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

  async enterPrefix(prefix: any) {
    await this.commonPage.waitForElement(this.prefix)
    await this.prefix.clear({ timeout: 2000 })
    await this.prefix.fill(prefix);
    await this.commonPage.validateElementValue(this.prefix, prefix)
  }

  async getPrefixValue() {
    await this.commonPage.waitForElement(this.prefix)
    return await this.prefix.textContent();
  }

  async enterProcLib(proclib: any) {
    await this.commonPage.waitForElement(this.procLib)
    await this.procLib.clear({ timeout: 2000 })
    await this.procLib.fill(proclib);
    await this.commonPage.validateElementValue(this.procLib, proclib)
  }

  async getProclibValue() {
    await this.commonPage.waitForElement(this.procLib)
    return await this.procLib.textContent();
  }

  async enterParmLib(parmlib: any) {
    await this.commonPage.waitForElement(this.parmLib)
    await this.parmLib.clear({ timeout: 2000 })
    await this.parmLib.fill(parmlib);
    await this.commonPage.validateElementValue(this.parmLib, parmlib)
  }

  async getParmlibValue() {
    await this.commonPage.waitForElement(this.parmLib)
    return await this.parmLib.textContent();
  }

  async enterZis(zis: any) {
    await this.commonPage.waitForElement(this.zis)
    await this.zis.clear({ timeout: 2000 })
    await this.zis.fill(zis);
    await this.commonPage.validateElementValue(this.zis, zis)
  }

  async enterJclLib(Jcllib: any) {
    await this.commonPage.waitForElement(this.jclLib)
    await this.jclLib.clear({ timeout: 2000 })
    await this.jclLib.fill(Jcllib);
    await this.commonPage.validateElementValue(this.jclLib, Jcllib)
  }

  async enterLoadLib(loadlib: any) {
    await this.commonPage.waitForElement(this.loadLib)
    await this.loadLib.clear({ timeout: 2000 })
    await this.loadLib.fill(loadlib);
    await this.commonPage.validateElementValue(this.loadLib, loadlib)
  }

  async enterAuthLoadLib(authloadlib: any) {
    await this.commonPage.waitForElement(this.authLoadLib)
    await this.authLoadLib.clear({ timeout: 2000 })
    await this.authLoadLib.fill(authloadlib);
    await this.commonPage.validateElementValue(this.authLoadLib, authloadlib)
  }

  async getAuthLoadLibValue() {
    await this.commonPage.waitForElement(this.authLoadLib)
    return await this.authLoadLib.textContent();
  }

  async enterAuthPluginLib(authpluginlib: any) {
    await this.commonPage.waitForElement(this.authPluginLib)
    await this.authPluginLib.clear({ timeout: 2000 })
    await this.authPluginLib.fill(authpluginlib);
    await this.commonPage.validateElementValue(this.authPluginLib, authpluginlib)
  }

  async getAuthPluginLibValue() {
    await this.commonPage.waitForElement(this.authPluginLib)
    return await this.authPluginLib.textContent();
  }

  async clickInstallMvsDatasets() {
    await this.commonPage.waitForElement(this.installMVSDatasets)
    await this.installMVSDatasets.click();
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

  async clickSkipInstallation() {
    await this.commonPage.waitForElement(this.skipInstallation)
    await this.skipInstallation.click();
  }

  async clickContinueToNetworkSetup() {
    await this.commonPage.waitForElement(this.continueToNetworkSetup)
    await this.continueToNetworkSetup.click();
  }

  async isContinueToNetworkSetupDisabled() {
    await this.commonPage.waitForElement(this.continueToNetworkSetup)
    return await this.continueToNetworkSetup.isDisabled()
  }

  async isContinueToNetworkSetupEnabled() {
    await this.commonPage.waitForElement(this.continueToNetworkSetup)
    return await this.continueToNetworkSetup.isEnabled()
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
export default InstallationPage;
