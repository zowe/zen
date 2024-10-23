import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import path from 'path';
let page: Page;
import config from '../utils/config';

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_TYPE_TITLE = 'Installation Type';
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
const ERROR_MESSAGE = "Failed to verify job statement STMT NO. MESSAGE\n         1 IEFC006I POSITIONAL PARAMETERS MUST BE SPECIFIED BEFORE KEYWORD PARAMETERS";
const EMPTY_ERROR = "Error invoking remote method 'get-env-vars': Error: Failed to submit jcl, job id not found";

test.describe('PlanningTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
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
      titlePage.navigateToConnectionTab();
      await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
	  await connectionPage.SubmitValidateCredential();
	  await connectionPage.clickContinueButton();
    })

    test.afterEach(async () => {
      await electronApp.close()
      })

    test('Test all required fields on Planning Tab', async () => {
      expect(planningPage.planningPageTitle).toBeTruthy();
      expect(planningPage.zoweInstallationLink).toBeTruthy();
      expect(planningPage.jobStatement).toBeTruthy();
      expect(planningPage.saveAndValidate).toBeTruthy();
    })

    test('Test Valid Job Statement and Save Validate', async () => {
      await planningPage.clickSaveValidate();
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(true);
    })

    test('Test Invalid Job Statement and Save Validate', async () => {
      await planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
      await planningPage.clickSaveAndValidate();
      const error_Message = await planningPage.getErrorMessage()
      expect (error_Message).toBe(ERROR_MESSAGE);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })

    test('Test Empty Job Statement and Save Validate', async () => {
      await planningPage.enterJobStatement('');
      await planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const error_Message = await planningPage.getErrorMessage()
      expect (error_Message).toBe(EMPTY_ERROR);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })

    test('Test all required fields on Planning Tab After Job Validation', async () => {
      await planningPage.clickSaveValidate();
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
      const is_Continue_Button_disable = await planningPage.isContinueToInstallationDisabled();
      expect(is_Continue_Button_disable).toBe(true);
    })

    test('Test Validate Locations with Valid Data', async () => {
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
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(true);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(true);
      await planningPage.clickContinueToInstallation();
      const installationType_title = await installationTypePage.getInstallationTypePageTitle()
      expect (installationType_title).toBe(INSTALLATION_TYPE_TITLE);
    })

    test('Test Validate Locations with Invalid Data', async () => {
      await planningPage.clickSaveValidate();
      await planningPage.enterRuntimeDir('Test/DIR');
      await planningPage.enterWorkspaceDir('Workspace Dir');
      await planningPage.enterLogsDir(config.ZOWE_LOG_DIR);
      await planningPage.enterExtensionsDir(config.ZOWE_EXTENSION_DIR);
      await planningPage.enterRbacProfileIdentifier('TEST');
      await planningPage.enterJobName(config.JOB_NAME);
      await planningPage.enterJobPrefix(config.JOB_PREFIX);
      await planningPage.enterCookieIdentifier('9999');
      await planningPage.enterJavaLocation('/');
      await planningPage.enterNodeJsLocation(config.NODE_HOME);
      await planningPage.enterZosmfApplicationId('ABCDDDETT');
      await planningPage.clickValidateLocations();
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(false);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(false);
    })

    test('Test Previous step', async ({ page }) => {
      await planningPage.clickPreviousStep();
      const title = await connectionPage.getConnectionPageTitle();
      expect(title).toBe(CONNECTION_PAGE_TITLE);
     })

     test('Test Save and Close and Resume Progress', async () => {
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
      await planningPage.clickSaveAndClose();
      await titlePage.clickOnResumeProgress();
	  await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
	  await connectionPage.SubmitValidateCredential();
      const title = await planningPage.getPlanningPageTitle();
      expect(title).toBe(PLANNING_TITLE);
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(true);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(true);
    })
  })
