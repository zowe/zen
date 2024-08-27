import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import CommonPage from '../Pages/common.page';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import config from '../utils/config';

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';

test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;
  let commonPage: CommonPage

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    commonPage = new CommonPage(page)
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    planningPage.clickContinueToInstallation()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Installation Type page', async ({ page }) => {
    expect(installationTypePage.downloadPax).toBeTruthy()
    expect(installationTypePage.uploadPax).toBeTruthy()
    expect(installationTypePage.smpe).toBeTruthy()
    expect(installationTypePage.licenseAgreement).toBeTruthy()
    expect(commonPage.save_and_close_button).toBeTruthy()
    expect(commonPage.previous_step_button).toBeTruthy()
    expect(installationTypePage.continueToUnpax).toBeTruthy()
    const is_Continue_Button_disable = await installationTypePage.isContinueToUnpaxDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Select Downlad Zowe Pax', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Select Upload Zowe Pax', async ({ page }) => {
    installationTypePage.uploadZowePaxAndNavigateToInstallationPage(config.ZOWE_ROOT_DIR)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Select SMPE', async ({ page }) => {
    installationTypePage.selectSmpe()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Previous step', async ({ page }) => {
    const is_prevButtonEnable = await commonPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    commonPage.clickPreviousStep();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(PLANNING_TITLE);
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
    installationTypePage.selectSmpe()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    commonPage.clickSaveAndClose();
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    const Is_Continue_Button_Enable_After_Save = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable_After_Save).toBe(true);
  })
})