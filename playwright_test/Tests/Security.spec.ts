import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/apfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import CertificatesPage from '../Pages/certificates.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import NetworkingPage from '../Pages/networking.page';
import CommonPage from '../Pages/common.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const STCS_TITLE = 'Stcs'
const SECURITY_TITLE = 'Security'
const APF_AUTH_TITLE = 'APF Authorize Load Libraries'

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

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
  let certificatesPage: CertificatesPage;
  let commonPage: CommonPage

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
    securityPage = new SecurityPage(page);
    certificatesPage = new CertificatesPage(page);
    launchConfigPage = new LaunchConfigPage(page);
    commonPage = new CommonPage(page);
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
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
    installationPage.clickInstallMvsDatasets()
    installationPage.clickContinueToNetworkSetup()
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on security page', async ({ page }) => {
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
    expect(commonPage.save_and_close_button).toBeTruthy()
    expect(commonPage.previous_step_button).toBeTruthy()
    expect(commonPage.skip_button).toBeTruthy()
    expect(securityPage.continue_STC_Setup).toBeTruthy()
  })

  test('test security with empty data', async ({ page }) => {
    securityPage.fillSecurityDetails('', '', '', '', '', '', '', '', '')
    securityPage.initializeSecurity()
    const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(false);
    const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(false);
    const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
    expect(isInitSecurity_check_visible).toBe(false);
  })

  test('test security with valid data', async ({ page }) => {
    securityPage.fillSecurityDetails('RACF', config.SECURITY_ADMIN, config.SECURITY_STC,
      config.SECURITY_SYSPROG, config.SECURITY_USER_ZIS, config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX, config.SECURITY_STC_ZOWE, config.SECURITY_STC_ZIS)
    securityPage.initializeSecurity()
    const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(true);
    const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(true);
    const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
    expect(isInitSecurity_check_visible).toBe(true);
  })

  test('test click skip security button', async ({ page }) => {
    const isSkipSecurityEnable = await commonPage.isSkipButtonEnable();
    expect(isSkipSecurityEnable).toBe(true);
    await commonPage.clickSkipStep();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(STCS_TITLE);
  })

  test('Test Previous step', async ({ page }) => {
    const is_prevButtonEnable = await commonPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    commonPage.clickPreviousStep()
    const title = await commonPage.getPageTitle();
    expect(title).toBe(APF_AUTH_TITLE);
  })

  test('Test continue button is disable', async ({ page }) => {
    const is_ContinueButtonDisable = await securityPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    securityPage.viewYaml()
    expect(securityPage.editor_title_element).toBeTruthy();
    securityPage.closeButton()
  })

  test('Test view job', async ({ page }) => {
    securityPage.click_previewJob()
    expect(securityPage.editor_title_element).toBeTruthy()
    securityPage.closeButton()
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    securityPage.fillSecurityDetails('RACF', config.SECURITY_ADMIN, config.SECURITY_STC,
      config.SECURITY_SYSPROG, config.SECURITY_USER_ZIS, config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX, config.SECURITY_STC_ZOWE, config.SECURITY_STC_ZIS)
    commonPage.clickSaveAndClose()
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    const title = await commonPage.getPageTitle();
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