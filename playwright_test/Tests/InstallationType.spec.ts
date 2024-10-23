import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import config from '../utils/config';

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_PAGE_TITLE = 'Installation';
const DOWNLOAD_ZOWE_PAX = 'Download Zowe Pax';


test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let installationTypePage: InstallationTypePage;
  let planningPage: PlanningPage;
  let installationPage: InstallationPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    titlePage.navigateToConnectionTab()
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await planningPage.fillPlanningPageWithRequiredFields(config.ZOWE_ROOT_DIR,
	    config.ZOWE_WORKSPACE_DIR,
		config.ZOWE_EXTENSION_DIR,
		config.ZOWE_LOG_DIR,
		'1',
		config.JOB_NAME,
		config.JOB_PREFIX,
		config.JAVA_HOME,
		config.NODE_HOME,
		config.ZOSMF_HOST,
		config.ZOSMF_PORT,
		config.ZOSMF_APP_ID
	  );
    await planningPage.clickValidateLocations()
    await planningPage.clickContinueToInstallation()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Installation Type page', async ({ page }) => {
    expect(installationTypePage.downloadPax).toBeTruthy()
    expect(installationTypePage.uploadPax).toBeTruthy()
    expect(installationTypePage.smpe).toBeTruthy()
    expect(installationTypePage.licenseAgreement).toBeTruthy()
    expect(installationTypePage.saveAndClose).toBeTruthy()
    expect(installationTypePage.previousStep).toBeTruthy()
    expect(installationTypePage.continueToComponentInstallation).toBeTruthy()
    const is_continue_button_enabled = await installationTypePage.isContinueUnpaxEnabled();
    expect(is_continue_button_enabled).toBe(false);
  })

  test('Test Downlad Zowe Pax', async ({ page }) => {
    await installationTypePage.selectDownloadZowePax()
    await installationTypePage.clickLicenseAgreement()
    await installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_continue_button_enabled = await installationTypePage.isContinueUnpaxEnabled();
    expect(is_continue_button_enabled).toBe(true);
  })

  /* Need to figure out new logic
  test('Test Upload Zowe Pax', async ({ page }) => {
    await installationTypePage.uploadZowePaxAndNavigateToInstallationPage(UPLOAD_PAX_PATH)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })*/

  test('Test SMPE ', async ({ page }) => {
    await installationTypePage.selectSmpe()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Previous step', async ({ page }) => {
    await installationTypePage.clickPreviousStep();
    const title = await planningPage.getPlanningPageTitle();
    expect(title).toBe(PLANNING_TITLE);
  })

  test('Test Continue To Components Installation Button', async ({ page }) => {
    await installationTypePage.selectDownloadZowePax()
    await installationTypePage.clickLicenseAgreement()
    await installationTypePage.clickAgreeLicense()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await installationTypePage.continueToUnpax()
    const title = await installationPage.getInstallationPageTitle();
    expect(title).toBe(DOWNLOAD_ZOWE_PAX);
  })

  test('Test Save and Close and Resume Progress', async ({page}) => {
    await installationTypePage.selectDownloadZowePax()
    await installationTypePage.clickLicenseAgreement()
    await installationTypePage.clickAgreeLicense()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await installationTypePage.clickSaveAndClose();
    await titlePage.clickOnResumeProgress();
	await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable_After_Save = await installationTypePage.isContinueUnpaxEnabled();
    expect(Is_Continue_Button_Enable_After_Save).toBe(true);
  })
})