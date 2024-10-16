import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import CommonPage from '../Pages/common.page';
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

test.describe('PlanningTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage
  let commonPage: CommonPage

  test.beforeEach(async () => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    commonPage = new CommonPage(page)
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    connectionPage.clickContinueButton();
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on Planning Tab', async () => {
    expect(commonPage.pageTitle).toBeTruthy();
    expect(planningPage.zoweInstallationLink).toBeTruthy();
    expect(planningPage.jobStatement).toBeTruthy();
    expect(planningPage.saveAndValidate).toBeTruthy();
  })

  test('Test Valid Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Invalid Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement(INVALID_JOB_STATEMENT);
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toContain(ERROR_MESSAGE);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test Empty Job Statement and Save Validate', async () => {
    planningPage.validateJobStatement('');
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toBe(ERROR_MESSAGE1);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test all required fields on Planning Tab After Job Validation', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
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
    expect(commonPage.save_and_close_button).toBeTruthy();
    expect(commonPage.previous_step_button).toBeTruthy();
    expect(planningPage.continueInstallationOptions).toBeTruthy();
  })

  test('Test Validate Locations with Valid Data', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    planningPage.clickContinueToInstallation();
    const installationType_title = await commonPage.getPageTitle()
    expect(installationType_title).toBe(INSTALLATION_TYPE_TITLE);
  })

  test('Test Validate Locations with Invalid Data', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    planningPage.validatePlanningStageLocations('Test/DIR', 'Workspace Dir', config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '22',
      config.JOB_NAME, config.JOB_PREFIX, '/', config.NODE_HOME, config.ZOSMF_HOST, '988776', 'ABCCD')
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    const is_prevButtonEnable = await commonPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    commonPage.clickPreviousStep();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(CONNECTION_PAGE_TITLE);
  })

  test('Test Save and Close and Resume Progress', async () => {
    planningPage.validateJobStatement(JOB_STATEMENT);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    commonPage.clickSaveAndClose();
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    const title = await commonPage.getPageTitle();
    expect(title).toBe(PLANNING_TITLE);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
  })
})
