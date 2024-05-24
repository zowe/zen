import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page.ts';
import TitlePage from '../Pages/title.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
let page: Page;

let electronApp: ElectronApplication
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const JOB_STATEMENT = "//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A"
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";
const RUNTIME_DIR = process.env.ZOWE_ROOT_DIR;
const WORKSPACE_DIR = process.env.ZOWE_WORKSPACE_DIR;
const LOG_DIR = process.env.ZOWE_LOG_DIR;
const EXTENSIONS_DIR = process.env.ZOWE_EXTENSION_DIR;
const JOB_NAME = process.env.JOB_NAME;
const JOB_PREFIX = process.env.JOB_PREFIX;
const JAVA_HOME = process.env.JAVA_HOME;
const NODE_HOME = process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;

test.describe('State_Management_PlanningTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let planningPage: PlanningPage;

  async function launch_Zen_and_Navigate_to_Planning_Tab({ page }) {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    await page.waitForTimeout(5000)
    titlePage.navigateToConnectionTab();
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential();
    await page.waitForTimeout(3000);
    connectionPage.clickContinueButton();
    await page.waitForTimeout(5000);
  }

  test.beforeEach(async () => {
    await launch_Zen_and_Navigate_to_Planning_Tab({page})
  })
  
  test.afterEach(async () => {
    await electronApp.close()
    })

  test('Test Added Job Statement and Not Validated', async ({page}) => {
    planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
    await page.waitForTimeout(5000)
    const jobstatement = await planningPage.getJobStatement();
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Planning_Tab({page})
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    expect(isGreen_check_visible).toBe(false);
  })
  
  test('Test Added Job Statement and Validated Successfully', async ({page}) => {
    planningPage.enterJobStatement(JOB_STATEMENT);
    planningPage.clickSaveAndValidate();
    await page.waitForTimeout(30000);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Planning_Tab({page})
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Locations Validated and Planning Step Completed', async ({page}) => {
    await page.waitForTimeout(2000);
    planningPage.clickSaveValidate();
    await page.waitForTimeout(20000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, WORKSPACE_DIR,EXTENSIONS_DIR,LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(30000);
    planningPage.clickValidateLocations()
    await page.waitForTimeout(30000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Planning_Tab({page})
    expect(is_GreenCheck_Visible).toBe(true);
    expect(is_Continue_Button_enable).toBe(true);
  })

  test('Test Locations Not Validated and Planning Step Pending', async ({page}) => {
    await page.waitForTimeout(2000)
    planningPage.clickSaveValidate();
    await page.waitForTimeout(20000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, WORKSPACE_DIR,EXTENSIONS_DIR,LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(30000);
    planningPage.clickValidateLocations()
    await page.waitForTimeout(30000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(false);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(false);
    await electronApp.close()
    await launch_Zen_and_Navigate_to_Planning_Tab({page})
    expect(is_GreenCheck_Visible).toBe(false);
    expect(is_Continue_Button_enable).toBe(false);
  })
})
