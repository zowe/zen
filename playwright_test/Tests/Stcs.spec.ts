import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import SecurityPage from '../Pages/security.page.ts'

let electronApp: ElectronApplication
const STCS_TITLE = 'Stcs'
const SECURITY_TITLE = 'Security';
const CERTIFICATE_TITLE = 'Certificates'
const RUNTIME_DIR = process.env.ZOWE_ROOT_DIR;
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR= process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR=process.env.ZOWE_LOG_DIR;
const ZOWE_WORKSPACE_DIR=process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME= process.env.JOB_NAME;
const JOB_PREFIX=process.env.JOB_PREFIX;
const JAVA_HOME=process.env.JAVA_HOME;
const NODE_HOME=process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;
const DATASET_PREFIX= process.env.DATASET_PREFIX;
const PROC_LIB = process.env.PROC_LIB;
const PARM_LIB = process.env.PARM_LIB;
const ZIS = process.env.SECURITY_STC_ZIS;
const JCL_LIB = process.env.JCL_LIB;
const LOAD_LIB = process.env.LOAD_LIB;
const AUTH_LOAD_LIB = process.env.AUTH_LOAD_LIB;
const AUTH_PLUGIN_LIB = process.env.AUTH_PLUGIN_LIB;
const UPLOAD_PAX_PATH= process.env.ZOWE_ROOT_DIR

test.describe('StcsTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage
  let stcsPage : StcsPage
  let securityPage : SecurityPage


  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    titlePage.navigateToConnectionTab()
    securityPage = new SecurityPage(page);
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    await page.waitForTimeout(2000);
    planningPage.clickSaveValidate()
    await page.waitForTimeout(20000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickValidateLocations()
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    await page.waitForTimeout(5000);
    installationTypePage.selectSmpe()
    installationTypePage.clickOnContinueToUnpax()
    await page.waitForTimeout(30000);
    installationTypePage.clickSkipUnpaxButton()
    await page.waitForTimeout(2000);
    installationTypePage.clickContinueToInstallation()
    installationPage.fillInstallationPage(DATASET_PREFIX, PROC_LIB, PARM_LIB, ZIS, JCL_LIB,LOAD_LIB,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
    await page.waitForTimeout(1800000);
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await page.waitForTimeout(10000);
    installationPage.clickContinueToNetworkSetup()
    securityPage.movetoSecurityPage()
    securityPage.fillSecurityDetails('RACF',SECURITY_ADMIN,SECURITY_STC,SECURITY_SYSPROG,SECURITY_USER_ZIS,SECURITY_USER_ZOWE,SECURITY_AUX,SECURITY_STC_ZOWE,SECURITY_STC_ZIS)
    stcsPage.movetoStcsPage()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

   test('test title of page', async ({ page }) => {
   await page.waitForTimeout(5000);
   const title = await stcsPage.returnTitleOfStcsPage();
   expect(title).toBe(STCS_TITLE);
   })

   test('test all required fields', async ({ page }) => {
    await page.waitForTimeout(5000);
    await expect(stcsPage.zis).toBeTruthy()
    await expect(stcsPage.zowe).toBeTruthy()
    await expect(stcsPage.aux).toBeTruthy()
    await expect(stcsPage.dataset_proclib).toBeTruthy()
    })

   test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    stcsPage.viewYaml()
    await page.waitForTimeout(5000);
    await expect(stcsPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    stcsPage.closeButton()
    await page.waitForTimeout(2000);
    })

    test('Test view job', async ({ page }) => {
     await page.waitForTimeout(5000);
     stcsPage.click_previewJob()
     await page.waitForTimeout(5000);
     await expect(stcsPage.editor_title_element).toBeTruthy()
     stcsPage.closeButton()
     await page.waitForTimeout(5000);
    })

    test('click Previous step button', async ({ page }) => {
     await page.waitForTimeout(5000);
     const title = await stcsPage.returnTitleOfPrevPage();
     expect(title).toBe(SECURITY_TITLE);
   })
    test('Test previous button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await stcsPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

   test('Test Skip Stcs button is enable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const isSkipStcsEnable = await stcsPage.is_skipStcsButtonEnable();
     expect(isSkipStcsEnable).toBe(true);
     await page.waitForTimeout(2000);
   })

   test('test click skip STCS button', async ({ page }) => {
     await page.waitForTimeout(2000);
     const certificate_title = await stcsPage.click_skipStcsButton();
     expect(certificate_title).toBe(CERTIFICATE_TITLE);

   })

    test('Test continue to certificate button is disable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
     await page.waitForTimeout(2000);
    })

   test('Test yaml should be updated', async ({ page }) => {
    await page.waitForTimeout(5000);
    await stcsPage.viewYaml();
    await page.waitForTimeout(10000);
    await expect(stcsPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await stcsPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain(SECURITY_AUX);
    expect(yaml).toContain(SECURITY_STC_ZOWE);
    expect(yaml).toContain(SECURITY_STC_ZIS);
   })

   test('Test Resume Progress', async ({ page }) => {
     await page.waitForTimeout(8000);
     connectionPage.click_resumeProgress()
     await page.waitForTimeout(8000);
     const title = await stcsPage.returnTitleOfStcsPage();
     expect(title).toBe(STCS_TITLE);
     const ZoweValue = await stcsPage.get_zowe_value();
     const Zis_Value = await stcsPage.get_zis_value();
     const Aux_Value = await stcsPage.get_aux_value();
     const DatasetProclib_Value = await stcsPage.get_datasetProclib_value();
     expect(ZoweValue).toBe(SECURITY_STC_ZOWE);
     expect(Zis_Value).toBe(SECURITY_STC_ZIS);
     expect(Aux_Value).toBe(SECURITY_AUX);
     expect(DatasetProclib_Value).toBe(PROC_LIB);
     })

   test('Test initialize stcs', async ({ page }) => {
     await page.waitForTimeout(8000);
     stcsPage.initializeSTC()
     await page.waitForTimeout(10000);
     const isWriteConfig_check_visible = await stcsPage.isWriteConfigGreenCheckVisible();
     expect(isWriteConfig_check_visible).toBe(true);
     const isUploadConfig_check_visible = await stcsPage.isUploadConfig_check_visible();
     expect(isUploadConfig_check_visible).toBe(true);
     const isInitStcs_check_visible = await stcsPage.isInitSTCSGreenCheckVisible();
     expect(isInitStcs_check_visible).toBe(true);
     })

   test('Test continue Button enabled after init stcs', async ({ page }) => {
     await page.waitForTimeout(8000);
     stcsPage.initializeSTC()
     await page.waitForTimeout(10000);
     const isWriteConfig_check_visible = await stcsPage.isWriteConfigGreenCheckVisible();
     expect(isWriteConfig_check_visible).toBe(true);
     const isUploadConfig_check_visible = await stcsPage.isUploadConfig_check_visible();
     expect(isUploadConfig_check_visible).toBe(true);
     const isInitStcs_check_visible = await stcsPage.isInitSTCSGreenCheckVisible();
     expect(isInitStcs_check_visible).toBe(true);
     await page.waitForTimeout(2000);
     const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(false);
     await page.waitForTimeout(2000);
     })

})
