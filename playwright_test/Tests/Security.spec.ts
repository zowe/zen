import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import NetworkingPage from '../Pages/networking.page';
import InstallationPage from '../Pages/installation.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import path from 'path';
import config from '../utils/config';
let page: Page;


let electronApp: ElectronApplication
const CERTIFICATE_TITLE = 'Certificates'
const SECURITY_TITLE = 'Security'
const APF_AUTH_TITLE = 'APF Authorize Load Libraries'
const STC_TITTLE = 'Stcs'


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
  let securityPage: SecurityPage;
  let planningPage: PlanningPage;
  let apfAuthPage: ApfAuthPage;
  let networkingPage: NetworkingPage;
  let installationTypePage: InstallationTypePage;
  let installationPage: InstallationPage;


  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    networkingPage = new NetworkingPage(page);
    apfAuthPage = new ApfAuthPage(page);
    securityPage = new SecurityPage(page);
    installationPage = new InstallationPage(page);
    installationTypePage = new InstallationTypePage(page);
    titlePage.navigateToConnectionTab()
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await planningPage.fillPlanningPageWithRequiredFields(config.ZOWE_ROOT_DIR,
      config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR,
      config.ZOWE_LOG_DIR,
      config.JAVA_HOME,
      config.NODE_HOME,
      config.ZOSMF_HOST,
      config.ZOSMF_PORT,
      config.ZOSMF_APP_ID
    );
    await planningPage.clickValidateLocations()
    await planningPage.clickContinueToInstallation()
    await installationTypePage.downloadZowePaxAndNavigateToInstallationPage()
    await installationTypePage.continueToUnpax()
    await installationTypePage.skipUnpax()
    await installationPage.fillInstallationPageDetails(config.DATASET_PREFIX,
      config.PROC_LIB,
      config.PARM_LIB,
      config.ZIS,
      config.JCL_LIB,
      config.LOAD_LIB,
      config.AUTH_LOAD_LIB,
      config.AUTH_PLUGIN_LIB
    )
    await installationPage.clickInstallMvsDatasets();
    await installationPage.clickContinueToNetworkSetup();
    await networkingPage.click_skipNetworking()
    await apfAuthPage.click_skipApfAuth()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on security page', async ({ page }) => {
    await expect(securityPage.product).toBeTruthy()
    await expect(securityPage.admin).toBeTruthy()
    await expect(securityPage.stc).toBeTruthy()
    await expect(securityPage.sys_prog).toBeTruthy()
    await expect(securityPage.user_zis).toBeTruthy()
    await expect(securityPage.user_zowe).toBeTruthy()
    await expect(securityPage.aux).toBeTruthy()
    await expect(securityPage.stc_zowe).toBeTruthy()
    await expect(securityPage.stc_zis).toBeTruthy()
    await expect(securityPage.view_yaml).toBeTruthy()
    await expect(securityPage.save_and_close).toBeTruthy()
    await expect(securityPage.previous_step).toBeTruthy()
    await expect(securityPage.skip_button).toBeTruthy()
    await expect(securityPage.continue_CertificateSelector).toBeTruthy()

  })
  //needs to be done
  test('test security with valid data', async ({ page }) => {
    await securityPage.fillSecurityDetails('RACF',
      config.SECURITY_ADMIN,
      config.SECURITY_STC,
      config.SECURITY_SYSPROG,
      config.SECURITY_USER_ZIS,
      config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX,
      config.SECURITY_STC_ZOWE,
      config.SECURITY_STC_ZIS
    )
    await securityPage.initializeSecurity()
    const is_ContinueButtonDisable = await securityPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(false);
  })

  test('click Previous step button', async ({ page }) => {
    const is_prevButtonEnable = await securityPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    const title = await securityPage.returnTitleOfPrevPage();
    expect(title).toBe(APF_AUTH_TITLE);
  })


  test('test click skip security button', async ({ page }) => {
    const isSkipSecurityEnable = await securityPage.is_skipSecurityButtonEnable();
    expect(isSkipSecurityEnable).toBe(true);
    await securityPage.click_skipSecurity();
    const title = await securityPage.returnTitleOfstcPage()
    expect(title).toBe(STC_TITTLE);
  })


  test('Test continue to certificate button is disable', async ({ page }) => {
    const is_ContinueButtonDisable = await securityPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    await securityPage.viewYaml()
    await expect(securityPage.editor_title_element).toBeTruthy();
    await securityPage.closeButton()
  })



  test('Test view job output', async ({ page }) => {
    await securityPage.click_viewAndSubmitJob()
    await expect(securityPage.editor_title_element).toBeTruthy()
    await securityPage.closeButton()
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    await securityPage.fillSecurityDetails('RACF',
      config.SECURITY_ADMIN,
      config.SECURITY_STC,
      config.SECURITY_SYSPROG,
      config.SECURITY_USER_ZIS,
      config.SECURITY_USER_ZOWE,
      config.SECURITY_AUX,
      config.SECURITY_STC_ZOWE,
      config.SECURITY_STC_ZIS
    )
    await securityPage.click_saveAndClose()
    await titlePage.clickOnResumeProgress();
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    const title = await securityPage.returnTitleOfSecurityPage();
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