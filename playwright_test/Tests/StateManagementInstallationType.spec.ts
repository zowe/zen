import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
let page: Page;

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_PAGE_TITLE = 'Installation';
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
const UPLOAD_PAX_PATH= process.env.ZOWE_ROOT_DIR

test.describe('InstallationTypeTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;

  async function launch_Zen_and_Navigate_to_Installation_Type_Tab({ page }) {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(2000);
    connectionPage.SubmitValidateCredential()
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
  }

  test.beforeEach(async () => {
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
  })
  
  test.afterEach(async () => {
    await electronApp.close()
    })

  test('Test Select Downlad Zowe Pax', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    const is_Download_Zowe_Pax_Selected = await installationTypePage.isDownloadZowePaxSelected();
    expect(is_Download_Zowe_Pax_Selected).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(is_Download_Zowe_Pax_Selected).toBe(true);
  })

  test('Test Select Upload Zowe Pax', async ({ page }) => {
    installationTypePage.selectUploadZowePax()
    const is_Upload_Zowe_Pax_Selected = await installationTypePage.isUploadZowePaxSelected();
    expect(is_Upload_Zowe_Pax_Selected).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(is_Upload_Zowe_Pax_Selected).toBe(true);
  })

  test('Test Select SMPE', async ({ page }) => {
    installationTypePage.selectSmpe();
    const is_SMPE_Selected = await installationTypePage.isSmpeSelected();
    expect(is_SMPE_Selected).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(is_SMPE_Selected).toBe(true);
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Agree License Agreement', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickAgreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(is_GreenCheck_Visible).toBe(true);
    expect(Is_Continue_Button_Enable).toBe(true);
  })

  test('Test Disagree License Agreement', async ({ page }) => {
    installationTypePage.selectDownloadZowePax()
    installationTypePage.clickLicenseAgreement()
    installationTypePage.clickDisagreeLicense()
    const is_GreenCheck_Visible = await installationTypePage.isLicenseAgreementGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(false);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(is_GreenCheck_Visible).toBe(false);
    expect(Is_Continue_Button_Enable).toBe(false);
  })

  test('Test Upload Zowe Pax', async ({ page }) => {
    await page.waitForTimeout(5000)
    installationTypePage.uploadZowePaxAndNavigateToInstallationPage(UPLOAD_PAX_PATH)
    const Is_Continue_Button_Enable = await installationTypePage.isContinueToComponentInstallationEnabled();
    expect(Is_Continue_Button_Enable).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Installation_Type_Tab({page})
    expect(Is_Continue_Button_Enable).toBe(true);
  })

})