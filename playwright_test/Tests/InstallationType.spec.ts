import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';

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
    installationTypePage.uploadZowePaxAndNavigateToInstallationPage(config.ZOWE_ROOT_DIR)
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
    connectionPage.fillpassword(config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const Is_Continue_Button_Enable_After_Save = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable_After_Save).toBe(true);
  })
})