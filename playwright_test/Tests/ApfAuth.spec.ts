import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ApfAuthPage from '../Pages/apfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page.js';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page.js';
import NetworkingPage from '../Pages/networking.page.js';

let electronApp: ElectronApplication
const APF_AUTH_TITLE = 'APF Authorize Load Libraries'
const NETWORKING_TITLE = 'Networking'
const SECURITY_TITLE = 'Security'
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD = process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR = process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR = process.env.ZOWE_LOG_DIR;
const ZOWE_ROOT_DIR = process.env.ZOWE_ROOT_DIR;
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

test.describe('ApfAuthTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let apfAuthPage: ApfAuthPage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage;

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
    apfAuthPage = new ApfAuthPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(ZOWE_ROOT_DIR, ZOWE_WORKSPACE_DIR, ZOWE_EXTENSION_DIR, ZOWE_LOG_DIR, '1',
      JOB_NAME, JOB_PREFIX, JAVA_HOME, NODE_HOME, ZOSMF_HOST, ZOSMF_PORT, ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    await page.waitForTimeout(2000);
    unpaxPage.clickSkipUnpax()
    await page.waitForTimeout(5000);
    installationPage.fillInstallationPageDetails(DATASET_PREFIX, PROC_LIB, PARM_LIB, ZIS, JCL_LIB,
      LOAD_LIB, AUTH_LOAD_LIB, AUTH_PLUGIN_LIB)
    await page.waitForTimeout(10000)
    installationPage.clickInstallMvsDatasets()
    await page.waitForTimeout(50000);
    installationPage.clickContinueToNetworkSetup()
    networkingPage.click_skipNetworking()
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Verify title and all the required fields', async ({ page }) => {
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(APF_AUTH_TITLE);
    expect(apfAuthPage.datasetPrefix).toBeTruthy()
    expect(apfAuthPage.authLoadLib).toBeTruthy()
    expect(apfAuthPage.authpluginLib).toBeTruthy()
    expect(apfAuthPage.run_zwe_init_apfauth).toBeTruthy()
    expect(apfAuthPage.view_yaml).toBeTruthy()
    expect(apfAuthPage.save_and_close).toBeTruthy()
    expect(apfAuthPage.previous_step_button).toBeTruthy()
    expect(apfAuthPage.skip_apf_auth_button).toBeTruthy()
    expect(apfAuthPage.continue_security_setup).toBeTruthy()
  })

  test('test apfAuth with valid data', async ({ page }) => {
    apfAuthPage.initializeApfauth()
    await page.waitForTimeout(50000);
    const isInitApf_check_visible = await apfAuthPage.isInitApfGreenCheckVisible();
    expect(isInitApf_check_visible).toBe(true);
    const is_ContinueButtonEnable = await apfAuthPage.isContinueButtonEnable();
    expect(is_ContinueButtonEnable).toBe(true);
  })

  test('test Previous step', async ({ page }) => {
    apfAuthPage.clickPreviousStep()
    await page.waitForTimeout(5000);
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
  })

  test('test skip apfAuth button is enable', async ({ page }) => {
    const isSkipApfAuthEnable = await apfAuthPage.is_skipApfAuthButtonEnable();
    expect(isSkipApfAuthEnable).toBe(true);
  })

  test('test previous button is enabled', async ({ page }) => {
    const is_prevButtonEnable = await apfAuthPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
  })

  test('test continue button is disable', async ({ page }) => {
    const is_ContinueButtonDisable = await apfAuthPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('click view yaml button', async ({ page }) => {
    apfAuthPage.viewYaml()
    await page.waitForTimeout(5000);
    expect(apfAuthPage.editor_title_element).toBeTruthy();
    apfAuthPage.closeButton()
    await page.waitForTimeout(2000);
  })

  test('test click skip APFAuth button', async ({ page }) => {
    apfAuthPage.click_skipApfAuth()
    await page.waitForTimeout(5000);
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(SECURITY_TITLE);
  })

  test('Test view job output', async ({ page }) => {
    apfAuthPage.click_viewJobOutput()
    await page.waitForTimeout(5000);
    expect(apfAuthPage.editor_title_element).toBeTruthy()
    apfAuthPage.closeButton()
    await page.waitForTimeout(2000);
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    apfAuthPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(8000);
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(APF_AUTH_TITLE);
    const datatsetPrefixValue = await apfAuthPage.get_datasetPrefix_value();
    const AuthLoadLib_Value = await apfAuthPage.get_authLoadLib_value();
    const AuthPluginLib_Value = await apfAuthPage.get_authPluginLib_value();
    expect(datatsetPrefixValue).toBe(DATASET_PREFIX);
    expect(AuthLoadLib_Value).toBe(AUTH_LOAD_LIB);
    expect(AuthPluginLib_Value).toBe(AUTH_PLUGIN_LIB);
  })
})