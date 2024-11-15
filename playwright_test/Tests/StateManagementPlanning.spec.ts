import { test, ElectronApplication, expect, _electron as electron, Page } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page.ts';
import TitlePage from '../Pages/title.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import config from '../utils/config.ts';
let page: Page;

let electronApp: ElectronApplication
const VALID_JOB_STATEMENT = "//ZWEJOB01 JOB IZUACCT,'SYSPROG',CLASS=A,\n//         MSGLEVEL=(1,1),MSGCLASS=A";
const INVALID_JOB_STATEMENT = "//HELLOJOB JOB 'HELLO, WORLD!',CLASS=A,MSGCLASS";

test.describe('State_Management_PlanningTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let planningPage: PlanningPage;

  async function launch_Zen({ page }) {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    await page.waitForTimeout(5000)
  }

  test.beforeEach(async () => {
    await launch_Zen({page})
    titlePage.navigateToConnectionTab();
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
  })

  test.afterEach(async () => {
    await electronApp.close()
    })

  test('Test Added Job Statement and Not Validated', async ({page}) => {
    planningPage.enterJobStatement(INVALID_JOB_STATEMENT);
    await page.waitForTimeout(2000)
    planningPage.clickSaveAndValidate();
    await page.waitForTimeout(5000)
    const jobstatement = await planningPage.getJobStatement();
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(false);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(jobstatement).toBe(INVALID_JOB_STATEMENT);
    expect(isGreen_check_visible).toBe(false);
  })

  test('Test Added Job Statement and Validated Successfully', async ({page}) => {
    planningPage.enterJobStatement(VALID_JOB_STATEMENT);
    await page.waitForTimeout(2000)
    planningPage.clickSaveAndValidate();
    await page.waitForTimeout(5000);
    const isGreen_check_visible = await planningPage.isSaveAndValidateGreenCheckVisible();
    expect(isGreen_check_visible).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(isGreen_check_visible).toBe(true);
  })

  test('Test Locations Validated and Planning Step Completed', async ({page}) => {
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
    await page.waitForTimeout(5000);
    const is_GreenCheck_Visible = await planningPage.isValidateLocationsGreenCheckVisible();
    expect(is_GreenCheck_Visible).toBe(true);
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(true);
    expect(is_Continue_Button_enable).toBe(true);
  })

  test('Test Locations Not Validated and Planning Step Pending', async ({page}) => {
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
    const is_Continue_Button_enable = await planningPage.isContinueToInstallationEnabled();
    expect(is_Continue_Button_enable).toBe(false);
    await electronApp.close()
    await launch_Zen({page})
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await page.waitForTimeout(2000);
    await connectionPage.SubmitValidateCredential();
    await connectionPage.clickContinueButton();
    await page.waitForTimeout(2000);
    expect(is_GreenCheck_Visible).toBe(false);
    expect(is_Continue_Button_enable).toBe(false);
  })
})
