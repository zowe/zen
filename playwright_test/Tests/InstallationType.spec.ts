import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';
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
const UPLOAD_PAX_PATH = process.env.ZOWE_ROOT_DIR

test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let installationTypePage: InstallationTypePage;
  let planningPage: PlanningPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(RUNTIME_DIR, ZOWE_WORKSPACE_DIR, ZOWE_EXTENSION_DIR, ZOWE_LOG_DIR, '1', JOB_NAME, JOB_PREFIX, JAVA_HOME, NODE_HOME, ZOSMF_HOST, ZOSMF_PORT, ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Installation Type page', async ({ page }) => {
    await page.waitForTimeout(5000)
    expect(installationTypePage.downloadPax).toBeTruthy()
    expect(installationTypePage.uploadPax).toBeTruthy()
    expect(installationTypePage.smpe).toBeTruthy()
    expect(installationTypePage.licenseAgreement).toBeTruthy()
    expect(installationTypePage.saveAndClose).toBeTruthy()
    expect(installationTypePage.previousStep).toBeTruthy()
    expect(installationTypePage.continueToUnpax).toBeTruthy()
    const is_Continue_Button_disable = await installationTypePage.isContinueToUnpaxDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Select Downlad Zowe Pax', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Select Upload Zowe Pax', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.uploadZowePaxAndNavigateToInstallationPage(UPLOAD_PAX_PATH)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Select SMPE', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectSmpe()
    await page.waitForTimeout(2000)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Previous step', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.clickPreviousStep();
    await page.waitForTimeout(2000);
    const title = await planningPage.getPlanningPageTitle();
    expect(title).toBe(PLANNING_TITLE);
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectSmpe()
    await page.waitForTimeout(2000)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    installationTypePage.clickSaveAndClose();
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const Is_Continue_Button_Enable_After_Save = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable_After_Save).toBe(true);
  })
})