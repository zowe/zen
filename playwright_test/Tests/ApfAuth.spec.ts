import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ApfAuthPage from '../Pages/apfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import NetworkingPage from '../Pages/networking.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const APF_AUTH_TITLE = 'APF Authorize Load Libraries'
const NETWORKING_TITLE = 'Networking'
const SECURITY_TITLE = 'Security'

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
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    await page.waitForTimeout(2000);
    unpaxPage.clickSkipUnpax()
    await page.waitForTimeout(5000);
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
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
    const is_prevButtonEnable = await apfAuthPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    apfAuthPage.clickPreviousStep()
    await page.waitForTimeout(5000);
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
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
    const isSkipApfAuthEnable = await apfAuthPage.is_skipApfAuthButtonEnable();
    expect(isSkipApfAuthEnable).toBe(true);
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
    connectionPage.fillpassword(config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(8000);
    const title = await apfAuthPage.getPageTitle();
    expect(title).toBe(APF_AUTH_TITLE);
    const datatsetPrefixValue = await apfAuthPage.get_datasetPrefix_value();
    const AuthLoadLib_Value = await apfAuthPage.get_authLoadLib_value();
    const AuthPluginLib_Value = await apfAuthPage.get_authPluginLib_value();
    expect(datatsetPrefixValue).toBe(config.DATASET_PREFIX);
    expect(AuthLoadLib_Value).toBe(config.AUTH_LOAD_LIB);
    expect(AuthPluginLib_Value).toBe(config.AUTH_PLUGIN_LIB);
  })
})