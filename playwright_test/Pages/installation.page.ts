import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class InstallationPage {
  page: Page;
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
  viewJobOutput: Locator;
  continueToNetworkSetup: Locator;
  editorTitleElement: Locator;
  closeEditorButton: Locator;

  constructor(page: Page) {
    this.page = page;
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
    this.viewJobOutput = page.locator("//button[text()='View Job Output']")
    this.continueToNetworkSetup = page.locator("//button[text()='Continue to Network Setup']")
    this.editorTitleElement = page.locator("//h2[text()='Editor']")
    this.closeEditorButton = page.locator("//button[text()='Close']")
  }

  commonPage = new CommonPage();

  async enterPrefix(prefix: string): Promise<void> {
    await this.commonPage.waitForElement(this.prefix)
    await this.prefix.clear({ timeout: 2000 })
    await this.prefix.fill(prefix);
    await this.commonPage.validateElementValue(this.prefix, prefix)
  }

  async getPrefixValue(): Promise<string> {
    await this.commonPage.waitForElement(this.prefix)
    return await this.prefix.inputValue();
  }

  async enterProcLib(proclib: string): Promise<void> {
    await this.commonPage.waitForElement(this.procLib)
    await this.procLib.clear({ timeout: 2000 })
    await this.procLib.fill(proclib);
    await this.commonPage.validateElementValue(this.procLib, proclib)
  }

  async getProclibValue(): Promise<string> {
    await this.commonPage.waitForElement(this.procLib)
    return await this.procLib.inputValue();
  }

  async enterParmLib(parmlib: string): Promise<void> {
    await this.commonPage.waitForElement(this.parmLib)
    await this.parmLib.clear({ timeout: 2000 })
    await this.parmLib.fill(parmlib);
    await this.commonPage.validateElementValue(this.parmLib, parmlib)
  }

  async getParmlibValue(): Promise<string> {
    await this.commonPage.waitForElement(this.parmLib)
    return await this.parmLib.inputValue();
  }

  async enterZis(zis: string): Promise<void> {
    await this.commonPage.waitForElement(this.zis)
    await this.zis.clear({ timeout: 2000 })
    await this.zis.fill(zis);
    await this.commonPage.validateElementValue(this.zis, zis)
  }

  async enterJclLib(Jcllib: string): Promise<void> {
    await this.commonPage.waitForElement(this.jclLib)
    await this.jclLib.clear({ timeout: 2000 })
    await this.jclLib.fill(Jcllib);
    await this.commonPage.validateElementValue(this.jclLib, Jcllib)
  }

  async enterLoadLib(loadlib: string): Promise<void> {
    await this.commonPage.waitForElement(this.loadLib)
    await this.loadLib.clear({ timeout: 2000 })
    await this.loadLib.fill(loadlib);
    await this.commonPage.validateElementValue(this.loadLib, loadlib)
  }

  async enterAuthLoadLib(authloadlib: string): Promise<void> {
    await this.commonPage.waitForElement(this.authLoadLib)
    await this.authLoadLib.clear({ timeout: 2000 })
    await this.authLoadLib.fill(authloadlib);
    await this.commonPage.validateElementValue(this.authLoadLib, authloadlib)
  }

  async getAuthLoadLibValue(): Promise<string> {
    await this.commonPage.waitForElement(this.authLoadLib)
    return await this.authLoadLib.inputValue();
  }

  async enterAuthPluginLib(authpluginlib: string): Promise<void> {
    await this.commonPage.waitForElement(this.authPluginLib)
    await this.authPluginLib.clear({ timeout: 2000 })
    await this.authPluginLib.fill(authpluginlib);
    await this.commonPage.validateElementValue(this.authPluginLib, authpluginlib)
  }

  async getAuthPluginLibValue(): Promise<string> {
    await this.commonPage.waitForElement(this.authPluginLib)
    return await this.authPluginLib.inputValue();
  }

  async clickInstallMvsDatasets() {
    await this.commonPage.waitForElement(this.installMVSDatasets)
    await this.installMVSDatasets.click();
    await this.waitForContinueButtonToBeEnabled();
  }

  async clickViewEditYaml() {
    await this.commonPage.waitForElement(this.viewEditYaml)
    await this.viewEditYaml.click();
  }

  async clickViewJobOutput() {
    await this.commonPage.waitForElement(this.viewJobOutput)
    await this.viewJobOutput.click();
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

  private async waitForContinueButtonToBeEnabled(): Promise<void> {
    const timeout = 100000;
    const interval = 500;
    const endTime = Date.now() + timeout;
    while (Date.now() < endTime) {
      if (await this.isContinueToNetworkSetupEnabled()) {
        return;
      }
      await this.page.waitForTimeout(interval);
    }
    throw new Error('Continue button was not enabled within the timeout period');
  }

  async clickCloseEditor() {
    await this.commonPage.waitForElement(this.closeEditorButton)
    await this.closeEditorButton.click();
  }

  async clickInstallMvsDatasetsInvalid() {
    await this.installMVSDatasets.click();
  }

  async fillInstallationPageDetails(DATASET_PREFIX: string, PROC_LIB: string, PARM_LIB: string, ZIS: string, JCL_LIB: string, LOAD_LIB: string, AUTH_LOAD_LIB: string, AUTH_PLUGIN_LIB: string) {
    await this.enterPrefix(DATASET_PREFIX)
    await this.enterProcLib(PROC_LIB)
    await this.enterParmLib(PARM_LIB)
    await this.enterZis(ZIS)
    await this.enterJclLib(JCL_LIB)
    await this.enterLoadLib(LOAD_LIB)
    await this.enterAuthLoadLib(AUTH_LOAD_LIB)
    await this.enterAuthPluginLib(AUTH_PLUGIN_LIB)
  }
}
export default InstallationPage;
