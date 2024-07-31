import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';

let electronApp: ElectronApplication
const NETWORKING_PAGE_TITLE = 'Networking'
const UNPAX_SMPE_TITLE = 'Continue to Initialization';
const RUNTIME_DIR = process.env.ZOWE_ROOT_DIR;
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD = process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR = process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR = process.env.ZOWE_LOG_DIR;
const ZOWE_WORKSPACE_DIR = process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME = process.env.JOB_NAME;
const JOB_PREFIX = process.env.JOB_PREFIX;
const JAVA_HOME = process.env.JAVA_HOME;
const NODE_HOME = process.env.NODE_HOME;
const ZOSMF_HOST = process.env.ZOSMF_HOST;
const ZOSMF_PORT = process.env.ZOSMF_PORT;
const ZOSMF_APP_ID = process.env.ZOSMF_APP_ID;
const DATASET_PREFIX = process.env.DATASET_PREFIX;
const PROC_LIB = process.env.PROC_LIB;
const PARM_LIB = process.env.PARM_LIB;
const ZIS = process.env.SECURITY_STC_ZIS;
const JCL_LIB = process.env.JCL_LIB;
const LOAD_LIB = process.env.LOAD_LIB;
const AUTH_LOAD_LIB = process.env.AUTH_LOAD_LIB;
const AUTH_PLUGIN_LIB = process.env.AUTH_PLUGIN_LIB;

test.describe('InstallationTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let installationTypePage: InstallationTypePage;
  let planningPage: PlanningPage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    unpaxPage = new UnpaxPage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    await page.waitForTimeout(2000);
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(RUNTIME_DIR, ZOWE_WORKSPACE_DIR, ZOWE_EXTENSION_DIR, ZOWE_LOG_DIR, '1', JOB_NAME, JOB_PREFIX, JAVA_HOME, NODE_HOME, ZOSMF_HOST, ZOSMF_PORT, ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    await page.waitForTimeout(5000);
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    await page.waitForTimeout(2000);
    unpaxPage.clickSkipUnpax()
    await page.waitForTimeout(5000);
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
    expect(installationPage.saveAndClose).toBeTruthy()
    expect(installationPage.previousStep).toBeTruthy()
    expect(installationPage.skipInstallation).toBeTruthy()
    expect(installationPage.continueToNetworkSetup).toBeTruthy()
    const is_Continue_Button_disable = await installationPage.isContinueToNetworkSetupDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Installation with Valid Data', async ({ page }) => {
    installationPage.fillInstallationPageDetails(DATASET_PREFIX, PROC_LIB, PARM_LIB, ZIS, JCL_LIB, LOAD_LIB, AUTH_LOAD_LIB, AUTH_PLUGIN_LIB)
    await page.waitForTimeout(10000)
    installationPage.clickInstallMvsDatasets()
    await page.waitForTimeout(70000);
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    installationPage.clickContinueToNetworkSetup();
    await page.waitForTimeout(2000);
    const title = await networkingPage.getPageTitle();
    expect(title).toBe(NETWORKING_PAGE_TITLE);
  })

  test('Test Installation with the Invalid Data', async ({ page }) => {
    installationPage.fillInstallationPageDetails('DSPREFID', 'PROC_LIB', '9999', 'ZIS', 'BLANK', '', 'AuthLoad', '')
    await page.waitForTimeout(10000)
    installationPage.clickInstallMvsDatasets()
    await page.waitForTimeout(70000);
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    installationPage.clickPreviousStep();
    await page.waitForTimeout(2000);
    const title = await installationTypePage.getPageTitle();
    expect(title).toBe(UNPAX_SMPE_TITLE);
  })

  test('Test Skip and Continue Buttons Disabled', async ({ page }) => {
    const is_Continue_Button_disable = await installationPage.isContinueToNetworkSetupDisabled();
    expect(is_Continue_Button_disable).toBe(true);
    const is_Skip_Button_disable = await installationPage.isSkipInstallationButtonDisabled();
    expect(is_Skip_Button_disable).toBe(true);
  })

  test('Test View Yaml Button', async ({ page }) => {
    installationPage.clickViewEditYaml()
    await page.waitForTimeout(5000);
    expect(installationPage.editorTitleElement).toBeTruthy();
    installationPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test View Job Output', async ({ page }) => {
    installationPage.clickViewJobOutput()
    await page.waitForTimeout(5000);
    expect(installationPage.editorTitleElement).toBeTruthy();
    installationPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
    installationPage.fillInstallationPageDetails(DATASET_PREFIX, PROC_LIB, PARM_LIB, ZIS, JCL_LIB, LOAD_LIB,
      AUTH_LOAD_LIB, AUTH_PLUGIN_LIB)
    await page.waitForTimeout(10000)
    installationPage.clickSaveAndClose();
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const prefix_value = await installationPage.getPrefixValue();
    const procLib_value = await installationPage.getProclibValue();
    const parmLib_value = await installationPage.getParmlibValue();
    const authLoadLib_value = await installationPage.getAuthLoadLibValue();
    const authPluginLib_value = await installationPage.getAuthPluginLibValue();
    expect(prefix_value).toBe(DATASET_PREFIX);
    expect(parmLib_value).toBe(PARM_LIB);
    expect(procLib_value).toBe(PROC_LIB);
    expect(authLoadLib_value).toBe(AUTH_LOAD_LIB);
    expect(authPluginLib_value).toBe(AUTH_PLUGIN_LIB);
  })
})