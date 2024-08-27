import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import CommonPage from '../Pages/common.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import NetworkingPage from '../Pages/networking.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const NETWORKING_PAGE_TITLE = 'Networking'
const UNPAX_SMPE_TITLE = 'Continue to Initialization';

test.describe('InstallationTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let installationTypePage: InstallationTypePage;
  let planningPage: PlanningPage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage
  let commonPage: CommonPage

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    commonPage = new CommonPage(page)
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    unpaxPage = new UnpaxPage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    commonPage.clickSkipStep()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Installation page', async ({ page }) => {
    expect(installationPage.prefix).toBeTruthy()
    expect(installationPage.procLib).toBeTruthy()
    expect(installationPage.parmLib).toBeTruthy()
    expect(installationPage.zis).toBeTruthy()
    expect(installationPage.jclLib).toBeTruthy()
    expect(installationPage.loadLib).toBeTruthy()
    expect(installationPage.authLoadLib).toBeTruthy()
    expect(installationPage.authPluginLib).toBeTruthy()
    expect(installationPage.installMVSDatasets).toBeTruthy()
    expect(installationPage.viewEditYaml).toBeTruthy()
    expect(installationPage.viewJobOutput).toBeTruthy()
    expect(commonPage.save_and_close_button).toBeTruthy()
    expect(commonPage.previous_step_button).toBeTruthy()
    expect(commonPage.skip_button).toBeTruthy()
    expect(installationPage.continueToNetworkSetup).toBeTruthy()
    const is_Continue_Button_disable = await installationPage.isContinueToNetworkSetupDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Installation with Valid Data', async ({ page }) => {
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
    installationPage.clickInstallMvsDatasets()
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    installationPage.clickContinueToNetworkSetup();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(NETWORKING_PAGE_TITLE);
  })

  test('Test Installation with the Invalid Data', async ({ page }) => {
    installationPage.fillInstallationPageDetails('DSPREFID', 'PROC_LIB', '9999', 'ZIS', 'BLANK', '', 'AuthLoad', '')
    installationPage.clickInstallMvsDatasets()
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    commonPage.clickPreviousStep();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(UNPAX_SMPE_TITLE);
  })

  test('Test Skip and Continue Buttons Disabled', async ({ page }) => {
    const is_Continue_Button_disable = await installationPage.isContinueToNetworkSetupDisabled();
    expect(is_Continue_Button_disable).toBe(true);
    const is_Skip_Button_disable = await commonPage.isSkipButtonDisable();
    expect(is_Skip_Button_disable).toBe(true);
  })

  test('Test View Yaml Button', async ({ page }) => {
    installationPage.clickViewEditYaml()
    expect(installationPage.editorTitleElement).toBeTruthy();
    installationPage.clickCloseEditor()
  })

  test('Test View Job Output', async ({ page }) => {
    installationPage.clickViewJobOutput()
    expect(installationPage.editorTitleElement).toBeTruthy();
    installationPage.clickCloseEditor()
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
    commonPage.clickSaveAndClose();
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    const prefix_value = await installationPage.getPrefixValue();
    const procLib_value = await installationPage.getProclibValue();
    const parmLib_value = await installationPage.getParmlibValue();
    const authLoadLib_value = await installationPage.getAuthLoadLibValue();
    const authPluginLib_value = await installationPage.getAuthPluginLibValue();
    expect(prefix_value).toBe(config.DATASET_PREFIX);
    expect(parmLib_value).toBe(config.PARM_LIB);
    expect(procLib_value).toBe(config.PROC_LIB);
    expect(authLoadLib_value).toBe(config.AUTH_LOAD_LIB);
    expect(authPluginLib_value).toBe(config.AUTH_PLUGIN_LIB);
  })
})