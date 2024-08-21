import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import config from '../utils/config'
let page: Page;

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_TYPE_TITLE = 'Installation Type';
const JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS=A\n//STEP01   EXEC PGM=IEFBR14\n//SYSPRINT DD  SYSOUT=A\n//SYSIN    DD  DUMMY";
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
const ERROR_MESSAGE = "Failed to verify job statement";
const ERROR_MESSAGE1 = "Error invoking remote method 'get-env-vars': Error: Failed to submit jcl, job id not found"
const RBAC_IDENTIFIER = '1';
const COOKIE_IDENTIFIER = '1';

test.describe('PlanningTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage

  test.beforeEach(async () => {
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
    connectionPage.clickContinueButton();
    await page.waitForTimeout(3000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Planning Tab', async () => {
    expect(planningPage.pageTitle).toBeTruthy();
    expect(planningPage.zoweInstallationLink).toBeTruthy();
    expect(planningPage.jobStatement).toBeTruthy();
    expect(planningPage.saveAndValidate).toBeTruthy();
  })

  test('Test Valid Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    await page.waitForTimeout(20000);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Invalid Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement(INVALID_JOB_STATEMENT);
    await page.waitForTimeout(20000);
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toContain(ERROR_MESSAGE);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test Empty Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement('');
    await page.waitForTimeout(20000);
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toBe(ERROR_MESSAGE1);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test all required fields on Planning Tab After Job Validation', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    await page.waitForTimeout(20000);
    expect(planningPage.runtimeDir).toBeTruthy();
    expect(planningPage.workspaceDir).toBeTruthy();
    expect(planningPage.logsDir).toBeTruthy();
    expect(planningPage.extensionsDir).toBeTruthy();
    expect(planningPage.rbacProfileIdentifier).toBeTruthy();
    expect(planningPage.jobName).toBeTruthy();
    expect(planningPage.jobPrefix).toBeTruthy();
    expect(planningPage.cookieIdentifier).toBeTruthy();
    expect(planningPage.javaLocation).toBeTruthy();
    expect(planningPage.nodeJsLocation).toBeTruthy();
    expect(planningPage.setZosmf).toBeTruthy();
    expect(planningPage.zosmfHost).toBeTruthy();
    expect(planningPage.zosmfPort).toBeTruthy();
    expect(planningPage.zosmfApplicationId).toBeTruthy();
    expect(planningPage.validateLocations).toBeTruthy();
    expect(planningPage.saveAndClose).toBeTruthy();
    expect(planningPage.previousStep).toBeTruthy();
    expect(planningPage.continueInstallationOptions).toBeTruthy();
  })

  test('Test Validate Locations with Valid Data', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    planningPage.clickContinueToInstallation();
    await page.waitForTimeout(1000);
    const installationType_title = await installationTypePage.getPageTitle()
    expect(installationType_title).toBe(INSTALLATION_TYPE_TITLE);
  })

  test('Test Validate Locations with Invalid Data', async () => {
    await page.waitForTimeout(1000);
    planningPage.validateJobStatement(JOB_STATEMENT);
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations('Test/DIR', 'Workspace Dir', EXTENSIONS_DIR, LOG_DIR, '22',
      JOB_NAME, JOB_PREFIX, '/', NODEJS_LOCATION, ZOSMF_HOST, '988776', 'ABCCD')
    await page.waitForTimeout(20000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    planningPage.clickPreviousStep();
    await page.waitForTimeout(1000);
    const title = await connectionPage.getConnectionPageTitle();
    expect(title).toBe(CONNECTION_PAGE_TITLE);
  })

  test('Test Save and Close and Resume Progress', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const title = await planningPage.getPlanningPageTitle();
    expect(title).toBe(PLANNING_TITLE);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
  })
})
