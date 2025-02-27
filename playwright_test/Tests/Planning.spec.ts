import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import config from '../utils/config';

let electronApp: ElectronApplication
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_TYPE_TITLE = 'Installation Type';
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
const ERROR_MESSAGE = `Failed to verify job statement STMT NO. MESSAGE\r\n         1 IEFC006I POSITIONAL PARAMETERS MUST BE SPECIFIED BEFORE KEYWORD PARAMETERS`;
const EMPTY_ERROR = "Error invoking remote method 'get-env-vars': Error: Failed to submit jcl, job id not found";
const INVALID_INPUT_ERROR = 'Test/DIR is not a valid z/OS Unix path'
const VALID_JOB_STATEMENT = "//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A";

test.describe('PlanningTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage

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

  test.beforeEach(async ({ page }) => {
    await launch_Zen({ page })
    titlePage.navigateToConnectionTab();
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test Valid Job Statement and Save Validate', async ({ page }) => {
    await planningPage.clickSaveValidate();
    await page.waitForTimeout(5000)
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Invalid Job Statement and Save Validate', async () => {
    await planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
    await planningPage.clickSaveAndValidate();
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message.trim()).toBe(ERROR_MESSAGE.trim());
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test Empty Job Statement and Save Validate', async () => {
    await planningPage.enterJobStatement('');
    await planningPage.clickSaveAndValidate();
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toBe(EMPTY_ERROR);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test all required fields on Planning Tab After Job Validation', async () => {
    await planningPage.clickSaveValidate();
    expect(planningPage.runtimeDir).toBeTruthy();
    expect(planningPage.workspaceDir).toBeTruthy();
    expect(planningPage.logsDir).toBeTruthy();
    expect(planningPage.extensionsDir).toBeTruthy();
    expect(planningPage.javaLocation).toBeTruthy();
    expect(planningPage.nodeJsLocation).toBeTruthy();
    expect(planningPage.zosmfHost).toBeTruthy();
    expect(planningPage.zosmfPort).toBeTruthy();
    expect(planningPage.zosmfApplicationId).toBeTruthy();
    expect(planningPage.validateLocations).toBeTruthy();
    expect(planningPage.save_and_close).toBeTruthy();
    expect(planningPage.previousStep).toBeTruthy();
    expect(planningPage.continueInstallationOptions).toBeTruthy();
    const is_Continue_Button_disable = await planningPage.isContinueToInstallationDisabled();
    expect(is_Continue_Button_disable).toBe(true);
  })

  test('Test Validate Locations with Valid Data', async ({ page }) => {
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
    await planningPage.waitForContinueButtonToBeEnabled();
    await page.waitForTimeout(5000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await planningPage.clickContinueToInstallation();
    const installationType_title = await installationTypePage.getInstallationTypePageTitle()
    expect(installationType_title).toBe(INSTALLATION_TYPE_TITLE);
  })

  test('Test Validate Locations with Invalid Data', async () => {
    await planningPage.clickSaveValidate();
    await planningPage.enterRuntimeDir('Test/DIR');
    await planningPage.enterWorkspaceDir('Workspace Dir');
    await planningPage.enterLogsDir(config.ZOWE_LOG_DIR);
    await planningPage.enterExtensionsDir(config.ZOWE_EXTENSION_DIR);
    await planningPage.enterJavaLocation('/');
    await planningPage.enterNodeJsLocation(config.NODE_HOME);
    await planningPage.enterZosmfApplicationId('ABCDDDETT');
    await planningPage.clickValidateLocations();
    const error_Message = await planningPage.getErrorMessage()
    expect(error_Message).toBe(INVALID_INPUT_ERROR);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationDisabled();
    expect(is_Continue_Button_enable).toBe(true);
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
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
    await planningPage.waitForContinueButtonToBeEnabled();
    await page.waitForTimeout(5000);
    await planningPage.click_saveAndClose()
    await titlePage.clickOnResumeProgress();
    await connectionPage.fillPassword(config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    const title = await planningPage.getPlanningPageTitle();
    expect(title).toBe(PLANNING_TITLE);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
  })

  test('Test Added Job Statement and Not Validated', async ({ page }) => {
    planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
    await page.waitForTimeout(2000)
    planningPage.clickSaveAndValidate();
    await page.waitForTimeout(5000)
    const jobstatement = await planningPage.getJobStatement();
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
    await electronApp.close()
    await launch_Zen({ page })
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test Added Job Statement and Validated Successfully', async ({ page }) => {
    planningPage.enterJobStatement(VALID_JOB_STATEMENT);
    await page.waitForTimeout(2000)
    planningPage.clickSaveAndValidate();
    await page.waitForTimeout(5000);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
    await electronApp.close()
    await launch_Zen({ page })
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Locations Validated and Planning Step Completed', async ({ page }) => {
    await page.waitForTimeout(2000);
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
    await page.waitForTimeout(2000);
    planningPage.clickValidateLocations()
    planningPage.waitForContinueButtonToBeEnabled();
    await page.waitForTimeout(5000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await electronApp.close()
    await launch_Zen({ page })
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(true);
    expect(is_Continue_Button_enable).toBe(true);
  })

  test('Test Locations Not Validated and Planning Step Pending', async ({ page }) => {
    await page.waitForTimeout(2000)
    await planningPage.fillPlanningPageWithRequiredFields(config.ZOWE_ROOT_DIR,
      'TESTABC',
      config.ZOWE_EXTENSION_DIR,
      config.ZOWE_LOG_DIR,
      'JAVA_HOME',
      '12345',
      config.ZOSMF_HOST,
      config.ZOSMF_PORT,
      config.ZOSMF_APP_ID
    );
    await page.waitForTimeout(2000)
    planningPage.clickValidateLocations()
    await page.waitForTimeout(5000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const is_Continue_Button_disable = await planningPage.isContinueToInstallationDisabled();
    expect(is_Continue_Button_disable).toBe(true);
    await electronApp.close()
    await launch_Zen({ page })
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(false);
    expect(is_Continue_Button_disable).toBe(true);
  })
})
