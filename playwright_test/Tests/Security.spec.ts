import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/apfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import StcsPage from '../Pages/stcs.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import CertificatesPage from '../Pages/certificates.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import NetworkingPage from '../Pages/networking.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const STCS_TITLE = 'Stcs'
const SECURITY_TITLE = 'Security'
const APF_AUTH_TITLE = 'APF Authorize Load Libraries'

test.describe('securityTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let apfAuthPage: ApfAuthPage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage;
  let securityPage: SecurityPage;
  let launchConfigPage: LaunchConfigPage;
  let stcsPage: StcsPage;
  let certificatesPage: CertificatesPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    unpaxPage = new UnpaxPage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    apfAuthPage = new ApfAuthPage(page);
    stcsPage = new StcsPage(page);
    securityPage = new SecurityPage(page);
    certificatesPage = new CertificatesPage(page);
    launchConfigPage = new LaunchConfigPage(page); titlePage.navigateToConnectionTab()
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
    apfAuthPage.click_skipApfAuth()
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on security page', async ({ page }) => {
    await page.waitForTimeout(5000);
    expect(securityPage.product).toBeTruthy()
    expect(securityPage.admin).toBeTruthy()
    expect(securityPage.stc).toBeTruthy()
    expect(securityPage.sys_prog).toBeTruthy()
    expect(securityPage.user_zis).toBeTruthy()
    expect(securityPage.user_zowe).toBeTruthy()
    expect(securityPage.aux).toBeTruthy()
    expect(securityPage.stc_zowe).toBeTruthy()
    expect(securityPage.stc_zis).toBeTruthy()
    expect(securityPage.view_yaml).toBeTruthy()
    expect(securityPage.save_and_close).toBeTruthy()
    expect(securityPage.previous_step).toBeTruthy()
    expect(securityPage.skip_button).toBeTruthy()
    expect(securityPage.continue_STC_Setup).toBeTruthy()
  })

  test('test security with empty data', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.fillSecurityDetails('', '', '', '', '', '', '', '', '')
    await page.waitForTimeout(5000);
    securityPage.initializeSecurity()
    await page.waitForTimeout(15000);
    const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(false);
    const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(false);
    const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
    expect(isInitSecurity_check_visible).toBe(false);
    await page.waitForTimeout(15000);
  })

  test('test security with valid data', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.fillSecurityDetails('RACF', config.SECURITY_ADMIN, config.SECURITY_STC,
      config.SECURITY_SYSPROG, config.SECURITY_USER_ZIS, config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX, config.SECURITY_STC_ZOWE, config.SECURITY_STC_ZIS)
    await page.waitForTimeout(5000);
    securityPage.initializeSecurity()
    await page.waitForTimeout(5000);
    const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(true);
    const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(true);
    const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
    expect(isInitSecurity_check_visible).toBe(true);
    await page.waitForTimeout(5000);
  })

  test('click Previous step button', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.clickPreviousStep()
    const title = await securityPage.getPageTitle();
    expect(title).toBe(APF_AUTH_TITLE);
  })

  test('test click skip security button', async ({ page }) => {
    await page.waitForTimeout(5000);
    await securityPage.click_skipSecurity();
    const title = await securityPage.getPageTitle();
    expect(title).toBe(STCS_TITLE);
  })

  test('Test previous button is enabled', async ({ page }) => {
    await page.waitForTimeout(2000);
    const is_prevButtonEnable = await securityPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
  })

  test('Test continue button is disable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const is_ContinueButtonDisable = await securityPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test Skip security button is enable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const isSkipSecurityEnable = await securityPage.is_skipSecurityButtonEnable();
    expect(isSkipSecurityEnable).toBe(true);
    await page.waitForTimeout(2000);
  })


  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    securityPage.viewYaml()
    await page.waitForTimeout(5000);
    expect(securityPage.editor_title_element).toBeTruthy();
    securityPage.closeButton()
    await page.waitForTimeout(2000);
  })

  test('Test view job', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.click_previewJob()
    await page.waitForTimeout(5000);
    expect(securityPage.editor_title_element).toBeTruthy()
    securityPage.closeButton()
    await page.waitForTimeout(5000);
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.fillSecurityDetails('RACF', config.SECURITY_ADMIN, config.SECURITY_STC,
      config.SECURITY_SYSPROG, config.SECURITY_USER_ZIS, config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX, config.SECURITY_STC_ZOWE, config.SECURITY_STC_ZIS)
    await page.waitForTimeout(5000);
    securityPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const title = await securityPage.getPageTitle();
    expect(title).toBe(SECURITY_TITLE);
    const sysProg_value = await securityPage.get_sysProg_value();
    const admin_value = await securityPage.get_admin_value();
    const stc_value = await securityPage.get_stc_value();
    const userZowe_value = await securityPage.get_user_zowe_value();
    const userZis_value = await securityPage.get_user_zis_value();
    const aux_value = await securityPage.get_aux_value();
    const stcZis_value = await securityPage.get_stc_zis_value();
    const stcZowe_value = await securityPage.get_stc_zowe_value();
    expect(sysProg_value).toBe(process.env.SECURITY_SYSPROG);
    expect(admin_value).toBe(process.env.SECURITY_ADMIN);
    expect(stc_value).toBe(process.env.SECURITY_STC);
    expect(userZowe_value).toBe(process.env.SECURITY_USER_ZOWE);
    expect(userZis_value).toBe(process.env.SECURITY_USER_ZIS);
    expect(stcZowe_value).toBe(process.env.SECURITY_STC_ZOWE);
    expect(stcZis_value).toBe(process.env.SECURITY_STC_ZIS);
    expect(aux_value).toBe(process.env.SECURITY_AUX);
  })
})