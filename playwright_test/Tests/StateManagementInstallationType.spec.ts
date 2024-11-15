import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page.ts';
import TitlePage from '../Pages/title.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import config from '../utils/config.ts';
let page: Page;

let electronApp: ElectronApplication

test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;

  async function launch_Zen({ page }) {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    await page.waitForTimeout(5000)
  }

  test.beforeEach(async () => {
    await launch_Zen({page})
    titlePage.navigateToConnectionTab();
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
  })

  test.afterEach(async () => {
    await electronApp.close()
    })

  test('Test Select Downlad Zowe Pax', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    const is_Download_Zowe_Pax_Selected = await installationTypePage.isDownloadZowePaxSelected();
    expect(is_Download_Zowe_Pax_Selected).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    installationTypePage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    expect(is_Download_Zowe_Pax_Selected).toBe(true);
  })

  test('Test Select Upload Zowe Pax', async ({ page }) => {
    installationTypePage.selectUploadZowePax()
    const is_Upload_Zowe_Pax_Selected = await installationTypePage.isUploadZowePaxSelected();
    expect(is_Upload_Zowe_Pax_Selected).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    installationTypePage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    expect(is_Upload_Zowe_Pax_Selected).toBe(true);
  })

  test('Test Select SMPE', async ({ page }) => {
    installationTypePage.selectSmpe();
    const is_SMPE_Selected = await installationTypePage.isSmpeSelected();
    expect(is_SMPE_Selected).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    installationTypePage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    expect(is_SMPE_Selected).toBe(true);
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Agree License Agreement', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    installationTypePage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(true);
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Disagree License Agreement', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickDisagreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToUnpaxEnabled();
    expect(Is_Continue_Button_Enable).toBe(false);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    installationTypePage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(false);
    expect(Is_Continue_Button_Enable).toBe(false);
  })
})