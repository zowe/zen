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


test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(2000);
    connectionPage.clickContinueButton()
    planningPage.clickSaveValidate()
    await page.waitForTimeout(20000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickValidateLocations()
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
    expect(installationTypePage.continueToComponentInstallation).toBeTruthy()
    const is_Continue_Button_disable = await installationTypePage.isContinueToComponentInstallationDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Downlad Zowe Pax', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Upload Zowe Pax', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.uploadZowePaxAndNavigateToInstallationPage(UPLOAD_PAX_PATH)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test SMPE with Valid Path', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectSmpe()
    installationTypePage.enterRuntimeDir(RUNTIME_DIR)
    installationTypePage.clickValidateLocation()
    await page.waitForTimeout(5000)
    const is_GreenCheck_Visible = await installationTypePage.isValidateLocationGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test SMPE with Invalid Path', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectSmpe()
    installationTypePage.enterRuntimeDir('ABCDE')
    installationTypePage.clickValidateLocation()
    await page.waitForTimeout(5000)
    const is_GreenCheck_Visible = await installationTypePage.isValidateLocationGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(false);
  })

  test('Test SMPE with Empty Path', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectSmpe()
    installationTypePage.enterRuntimeDir('')
    installationTypePage.clickValidateLocation()
    await page.waitForTimeout(5000)
    const is_GreenCheck_Visible = await installationTypePage.isValidateLocationGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    installationTypePage.clickPreviousStep();
    await page.waitForTimeout(2000);
    const title = await planningPage.getPlanningPageTitle();
    expect(title).toBe(PLANNING_TITLE);
  })

  test('Test Continue To Components Installation Button', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    installationTypePage.clickContinueToInstallation()
    const title = await installationPage.getInstallationPageTitle();
    expect(title).toBe(INSTALLATION_PAGE_TITLE);
  })

  test('Test Save and Close and Resume Progress', async ({page}) => {
    await page.waitForTimeout(5000)
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    installationTypePage.clickSaveAndClose();
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(5000);
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable_After_Save = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable_After_Save).toBe(true);
  }) 
})