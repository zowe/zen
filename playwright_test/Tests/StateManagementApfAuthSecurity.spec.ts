import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ApfAuthPage from '../Pages/ApfAuth.page.js';
import TitlePage from '../Pages/title.page.js';
import ConnectionPage from '../Pages/connection.page.js';
import PlanningPage from '../Pages/planning.page.js';
import InstallationTypePage from '../Pages/installationType.page.js';
import InstallationPage from '../Pages/installation.page.js';
import NetworkingPage from '../Pages/networking.page.js';
import SecurityPage from '../Pages/security.page';
let page: Page;

let electronApp: ElectronApplication
const DATASET_PREFIX = 'IBMUSER.ZWEV1'
const AUTH_LOAD_LIB = 'IBMUSER.ZWEV1.ZWEAUTH'
const AUTH_PLUGIN_LIB = 'IBMUSER.ZWEV1.CUST.ZWESAPL'
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR= process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR=process.env.ZOWE_LOG_DIR;
const RUNTIME_DIR=process.env.ZOWE_ROOT_DIR;
const ZOWE_WORKSPACE_DIR=process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME= process.env.JOB_NAME;
const JOB_PREFIX=process.env.JOB_PREFIX;
const JAVA_HOME=process.env.JAVA_HOME;
const NODE_HOME=process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;
const SECURITY_ADMIN= process.env.SECURITY_ADMIN;
const SECURITY_STC = process.env.SECURITY_STC;
const SECURITY_SYSPROG = process.env.SECURITY_SYSPROG;
const SECURITY_USER_ZIS = process.env.SECURITY_USER_ZIS;
const SECURITY_USER_ZOWE = process.env.SECURITY_USER_ZOWE;
const SECURITY_AUX = process.env.SECURITY_AUX;
const SECURITY_STC_ZOWE = process.env.SECURITY_STC_ZOWE;
const SECURITY_STC_ZIS = process.env.SECURITY_STC_ZIS;

test.describe('ApfAuthTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let apfAuthPage : ApfAuthPage;
  let planningPage : PlanningPage;
  let installationTypePage : InstallationTypePage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage
  let securityPage : SecurityPage;

  async function launch_Zen_and_Navigate_to_Installation_Tab({ page }) {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    apfAuthPage = new ApfAuthPage(page);
    securityPage = new SecurityPage(page);
    await page.waitForTimeout(5000)
    titlePage.navigateToConnectionTab();
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential();
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    await page.waitForTimeout(2000);
    planningPage.clickSaveValidate();
    await page.waitForTimeout(20000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickValidateLocations()
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    await page.waitForTimeout(5000);
    installationTypePage.downloadZowePaxAndNavigateToInstallationPage()
    installationTypePage.clickContinueToInstallation()
  }

  test.beforeEach(async () => {
    await launch_Zen_and_Navigate_to_Installation_Tab({page})
  })
  
  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test Apf Auth Completed', async ({ page }) => {
    await page.waitForTimeout(2000);
    apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
    await page.waitForTimeout(5000);
    installationPage.clickSkipInstallation()
    await page.waitForTimeout(2000);
    networkingPage.clickContinueToApfAuth()
    await page.waitForTimeout(2000);
    const isWriteConfig_check_visible = await apfAuthPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(true);
    const isUploadConfig_check_visible = await apfAuthPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(true);
    const isInitApf_check_visible = await apfAuthPage.isInitApfGreenCheckVisible();
    expect(isInitApf_check_visible).toBe(true);
    const isContinueSecurityButtonEnabled = await apfAuthPage.isContinueButtonEnabled();
    expect(isContinueSecurityButtonEnabled).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Tab({page})
    apfAuthPage.clickApfAuthTab()
    await page.waitForTimeout(2000);
    expect(isWriteConfig_check_visible).toBe(true);
    expect(isUploadConfig_check_visible).toBe(true);
    expect(isInitApf_check_visible).toBe(true);
    expect(isContinueSecurityButtonEnabled).toBe(true);
  })   

  test('Test Apf Auth Pending', async ({ page }) => {
    await page.waitForTimeout(2000);
    apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
    await page.waitForTimeout(5000);
    installationPage.clickSkipInstallation()
    await page.waitForTimeout(2000);
    const isContinueSecurityButtonEnabled = await apfAuthPage.isContinueButtonEnabled();
    expect(isContinueSecurityButtonEnabled).toBe(false);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Tab({page})
    apfAuthPage.clickApfAuthTab()
    await page.waitForTimeout(2000);
    expect(isContinueSecurityButtonEnabled).toBe(false);
  })
  
  test('Test Security Setup Completed', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.fillSecurityDetails('RACF',SECURITY_ADMIN,SECURITY_STC,SECURITY_SYSPROG,SECURITY_USER_ZIS,SECURITY_USER_ZOWE,SECURITY_AUX,SECURITY_STC_ZOWE,SECURITY_STC_ZIS)
    await page.waitForTimeout(5000);
    securityPage.initializeSecurity()
    await page.waitForTimeout(5000);
    const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
    expect(isWriteConfig_check_visible).toBe(true);
    const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
    expect(isUploadConfig_check_visible).toBe(true);
    const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
    expect(isInitSecurity_check_visible).toBe(true);
    const isContinueCertificatesButtonEnabled = await securityPage.isContinueButtonEnabled();
    expect(isContinueCertificatesButtonEnabled).toBe(true);
    await page.waitForTimeout(2000);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Tab({page})
    securityPage.clickSecurityTab()
    await page.waitForTimeout(2000);
    expect(isWriteConfig_check_visible).toBe(true);
    expect(isUploadConfig_check_visible).toBe(true);
    expect(isInitSecurity_check_visible).toBe(true);
    expect(isContinueCertificatesButtonEnabled).toBe(true);
  })

  test('Test Security Setup Pending', async ({ page }) => {
    await page.waitForTimeout(5000);
    securityPage.fillSecurityDetails('RACF',SECURITY_ADMIN,SECURITY_STC,SECURITY_SYSPROG,SECURITY_USER_ZIS,SECURITY_USER_ZOWE,SECURITY_AUX,SECURITY_STC_ZOWE,SECURITY_STC_ZIS)
    await page.waitForTimeout(5000);
    const isContinueCertificatesButtonEnabled = await securityPage.isContinueButtonEnabled();
    expect(isContinueCertificatesButtonEnabled).toBe(false);
    await page.waitForTimeout(2000);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Tab({page})
    securityPage.clickSecurityTab()
    await page.waitForTimeout(2000);
    expect(isContinueCertificatesButtonEnabled).toBe(false);
  })

})