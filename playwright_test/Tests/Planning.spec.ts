import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import path from 'path';
let page: Page;

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_TYPE_TITLE = 'Installation Type';
const JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS=A\n//STEP01   EXEC PGM=IEFBR14\n//SYSPRINT DD  SYSOUT=A\n//SYSIN    DD  DUMMY";
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
const ERROR_MESSAGE = "Failed to verify job statement";
const RUNTIME_DIR = process.env.ZOWE_ROOT_DIR;
const WORKSPACE_DIR = process.env.ZOWE_WORKSPACE_DIR;
const LOG_DIR = process.env.ZOWE_LOG_DIR;
const EXTENSIONS_DIR = process.env.ZOWE_EXTENSION_DIR;
const RBAC_IDENTIFIER = '1';
const JOB_NAME = process.env.JOB_NAME;
const JOB_PREFIX = process.env.JOB_PREFIX;
const COOKIE_IDENTIFIER = '1';
const JAVA_LOCATION = process.env.JAVA_HOME;
const NODEJS_LOCATION = process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;

test.describe('PlanningTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let planningPage: PlanningPage;
    let installationTypePage: InstallationTypePage

    test.beforeEach(async () => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
      installationTypePage = new InstallationTypePage(page);
      titlePage.navigateToConnectionTab();
      connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
      connectionPage.SubmitValidateCredential();
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton();
      await page.waitForTimeout(3000);
      
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
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(true);
    })

    test('Test Invalid Job Statement and Save Validate', async () => {
      planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const error_Message = await planningPage.getErrorMessage()
      expect (error_Message).toBe(ERROR_MESSAGE);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })

    test('Test Empty Job Statement and Save Validate', async () => {
      planningPage.enterJobStatement('');
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const error_Message = await planningPage.getErrorMessage()
      expect (error_Message).toBe(ERROR_MESSAGE);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })

    test('Test all required fields on Planning Tab After Job Validation', async () => {
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
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
      const is_Continue_Button_disable = await planningPage.isContinueToInstallationDisabled();
      expect(is_Continue_Button_disable).toBe(true);
    })

    test('Test Validate Locations with Valid Data', async () => {
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      planningPage.enterRuntimeDir(RUNTIME_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterWorkspaceDir(WORKSPACE_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterLogsDir(LOG_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterRbacProfileIdentifier(RBAC_IDENTIFIER);
      await page.waitForTimeout(2000);
      planningPage.enterJobName(JOB_NAME);
      await page.waitForTimeout(2000);
      planningPage.enterJobPrefix(JOB_PREFIX);
      await page.waitForTimeout(2000);
      planningPage.enterCookieIdentifier(COOKIE_IDENTIFIER);
      await page.waitForTimeout(2000);
      planningPage.enterJavaLocation(JAVA_LOCATION);
      await page.waitForTimeout(2000);
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      await page.waitForTimeout(2000);
      planningPage.checkSetZosmfAttribute();
      await page.waitForTimeout(2000);
      planningPage.enterZosmfHost(ZOSMF_HOST);
      await page.waitForTimeout(2000);
      planningPage.enterZosmfPort(ZOSMF_PORT);
      await page.waitForTimeout(2000);
      planningPage.enterZosmfApplicationId(ZOSMF_APPID);
      await page.waitForTimeout(2000);
      planningPage.clickValidateLocations();
      await page.waitForTimeout(20000);
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(true);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(true);
      planningPage.clickContinueToInstallation();
      await page.waitForTimeout(2000);
      const installationType_title = await installationTypePage.getInstallationTypePageTitle()
      expect (installationType_title).toBe(INSTALLATION_TYPE_TITLE);
    })

    test('Test Validate Locations with Invalid Data', async () => {
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      planningPage.enterRuntimeDir('Test/DIR');
      await page.waitForTimeout(2000);
      planningPage.enterWorkspaceDir('Workspace Dir');
      await page.waitForTimeout(2000);
      planningPage.enterLogsDir(LOG_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterRbacProfileIdentifier(22);
      await page.waitForTimeout(2000);
      planningPage.enterJobName(JOB_NAME);
      await page.waitForTimeout(2000);
      planningPage.enterJobPrefix(JOB_PREFIX);
      await page.waitForTimeout(2000);
      planningPage.enterCookieIdentifier(99999);
      await page.waitForTimeout(2000);
      planningPage.enterJavaLocation('/');
      await page.waitForTimeout(2000);
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      await page.waitForTimeout(2000);
      planningPage.checkSetZosmfAttribute();
      await page.waitForTimeout(2000);
      planningPage.enterZosmfHost(ZOSMF_HOST);
      await page.waitForTimeout(2000);
      planningPage.enterZosmfPort(987776);
      await page.waitForTimeout(2000);
      planningPage.enterZosmfApplicationId('ABCDDDETT');
      await page.waitForTimeout(2000);
      planningPage.clickValidateLocations();
      await page.waitForTimeout(20000);
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(false);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(false);
    })

    test('Test Previous step', async ({ page }) => {
      planningPage.clickPreviousStep();
      await page.waitForTimeout(2000);
      const title = await connectionPage.getConnectionPageTitle();
      expect(title).toBe(CONNECTION_PAGE_TITLE);
     })

     test('Test Save and Close and Resume Progress', async () => {
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      planningPage.enterRuntimeDir(RUNTIME_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterWorkspaceDir(WORKSPACE_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterLogsDir(LOG_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      await page.waitForTimeout(2000);
      planningPage.enterRbacProfileIdentifier(RBAC_IDENTIFIER);
      await page.waitForTimeout(2000);
      planningPage.enterJobName(JOB_NAME);
      await page.waitForTimeout(2000);
      planningPage.enterJobPrefix(JOB_PREFIX);
      await page.waitForTimeout(2000);
      planningPage.enterCookieIdentifier(COOKIE_IDENTIFIER);
      await page.waitForTimeout(2000);
      planningPage.enterJavaLocation(JAVA_LOCATION);
      await page.waitForTimeout(2000);
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      await page.waitForTimeout(2000);
      planningPage.clickValidateLocations();
      await page.waitForTimeout(20000);
      planningPage.clickSaveAndClose();
      await page.waitForTimeout(3000);
      titlePage.clickOnResumeProgress();
      await page.waitForTimeout(5000);
      const title = await planningPage.getPlanningPageTitle();
      expect(title).toBe(PLANNING_TITLE);
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(true);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(true);
    })
  })
