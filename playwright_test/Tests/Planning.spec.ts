import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const PLANNING_TITLE = 'Before you start';
const INSTALLATION_TYPE_TITLE = 'Installation Type';
const JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS=A\n//STEP01   EXEC PGM=IEFBR14\n//SYSPRINT DD  SYSOUT=A\n//SYSIN    DD  DUMMY";
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
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
const ZOSMF_HOST = 'RS28.rocketsoftware.com';
const ZOSMF_PORT = '11443';
const ZOSMF_APPID = process.env.ZOSMF_APP_ID;

test.describe('PlanningTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let planningPage: PlanningPage;
    let installationTypePage: InstallationTypePage

    test.beforeAll(async () => {
      const createDirsScriptPath = path.resolve(__dirname, '../prepare.js');
      console.log('Creating child process with command:', 'node', [createDirsScriptPath]);
      const child = spawn('node', [createDirsScriptPath]);
      if (!child) {
        console.error('Failed to spawn child process');
        return;
      }
      console.log('Child process created successfully');
      child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      });
      child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      child.on('error', (error) => {
        console.error('Child process encountered an error:', error);
      });
    })

    test.beforeEach(async () => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
      installationTypePage = new InstallationTypePage(page);
      titlePage.navigateToConnectionTab();
      connectionPage.fillConnectionDetails(process.env.SSH_HOST, process.env.SSH_PORT, process.env.SSH_USER, process.env.SSH_PASSWD);
      connectionPage.SubmitValidateCredential();
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton();
      await page.waitForTimeout(5000);
      
    })

    test('Test Title', async () => {
      await page.waitForTimeout(5000);
      const planning_title = await planningPage.getPlanningPageTitle();
      expect (planning_title).toBe(PLANNING_TITLE);
    });

    test('Test all required fields on Planning Tab', async () => {
      await page.waitForTimeout(5000);
      expect(planningPage.planningPageTitle).toBeTruthy();
      expect(planningPage.zoweInstallationLink).toBeTruthy();
      expect(planningPage.jobStatement).toBeTruthy();
      expect(planningPage.saveAndValidate).toBeTruthy();
    })

    test('Test Valid Job Statement and Save Validate', async () => {
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(true);
    })

    test('Test Invalid Job Statement and Save Validate', async () => {
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })
  
    test('Test Empty Job Statement and Save Validate', async () => {
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement('');
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
      expect(isGreen_check_visible).toBe(false);
    })
  
    test('Test all required fields on Planning Tab After Job Validation', async () => {
      await page.waitForTimeout(2000);
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
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      planningPage.enterRuntimeDir(RUNTIME_DIR);
      planningPage.enterWorkspaceDir(WORKSPACE_DIR);
      planningPage.enterLogsDir(LOG_DIR);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      planningPage.enterRbacProfileIdentifier(RBAC_IDENTIFIER);
      planningPage.enterJobName(JOB_NAME);
      planningPage.enterJobPrefix(JOB_PREFIX);
      planningPage.enterCookieIdentifier(COOKIE_IDENTIFIER);
      planningPage.enterJavaLocation(JAVA_LOCATION);
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      planningPage.checkSetZosmfAttribute();
      planningPage.enterZosmfHost(ZOSMF_HOST);
      planningPage.enterZosmfPort(ZOSMF_PORT);     
      planningPage.enterZosmfApplicationId(ZOSMF_APPID);
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
      planningPage.enterWorkspaceDir('Workspace Dir');
      planningPage.enterLogsDir(LOG_DIR);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      planningPage.enterRbacProfileIdentifier(22);
      planningPage.enterJobName(JOB_NAME);
      planningPage.enterJobPrefix(JOB_PREFIX);
      planningPage.enterCookieIdentifier(99999);
      planningPage.enterJavaLocation('/');
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      planningPage.checkSetZosmfAttribute();
      planningPage.enterZosmfHost(ZOSMF_HOST);
      planningPage.enterZosmfPort(987776);     
      planningPage.enterZosmfApplicationId('ABCDDDETT');
      planningPage.clickValidateLocations();
      await page.waitForTimeout(20000);
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(false);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(false);
    })

    test('Test Previous step', async ({ page }) => {
      await page.waitForTimeout(2000);
      planningPage.clickPreviousStep();
      await page.waitForTimeout(2000);
      const title = await connectionPage.getConnectionPageTitle();
      expect(title).toBe(CONNECTION_PAGE_TITLE);
     })

     test('Test Save and Close and Resume Progress', async () => {
      await page.waitForTimeout(2000);
      planningPage.enterJobStatement(JOB_STATEMENT);
      planningPage.clickSaveAndValidate();
      await page.waitForTimeout(20000);
      planningPage.enterRuntimeDir(RUNTIME_DIR);
      planningPage.enterWorkspaceDir(WORKSPACE_DIR);
      planningPage.enterLogsDir(LOG_DIR);
      planningPage.enterExtensionsDir(EXTENSIONS_DIR);
      planningPage.enterRbacProfileIdentifier(RBAC_IDENTIFIER);
      planningPage.enterJobName(JOB_NAME);
      planningPage.enterJobPrefix(JOB_PREFIX);
      planningPage.enterCookieIdentifier(COOKIE_IDENTIFIER);
      planningPage.enterJavaLocation(JAVA_LOCATION);
      planningPage.enterNodeJsLocation(NODEJS_LOCATION);
      planningPage.clickValidateLocations();
      await page.waitForTimeout(20000);
      planningPage.clickSaveAndClose();
      await page.waitForTimeout(3000);
      titlePage.clickOnResumeProgress();
      const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
      expect(is_GreenCheck_Visible).toBe(true);
      const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
      expect(is_Continue_Button_enable).toBe(true);
    }) 
  })
