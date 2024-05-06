import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;


let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection'
const SECURITY_TITLE = 'Security'
const DATASET_PREFIX = 'IBMUSER.ZWEV1'
const AUTH_LOAD_LIB = 'IBMUSER.ZWEV1.ZWEAUTH'
const AUTH_PLUGIN_LIB = 'IBMUSER.ZWEV1.CUST.ZWESAPL'
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR= process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR=process.env.ZOWE_LOG_DIR;
const ZOWE_ROOT_DIR=process.env.ZOWE_ROOT_DIR;
const ZOWE_WORKSPACE_DIR=process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME= process.env.JOB_NAME;
const JOB_PREFIX=process.env.JOB_PREFIX;
const  JAVA_HOME=process.env.JAVA_HOME;
const  NODE_HOME=process.env.NODE_HOME;
const  ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('ConnectionTab', () => {
   let connectionPage: ConnectionPage;
   let titlePage: TitlePage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
    })

    test.afterEach(async () => {
     await electronApp.close()
   })

test('Test Resume Progress', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(8000);
    connectionPage.click_saveAndClose()
    await page.waitForTimeout(8000);
    connectionPage.click_resumeProgress()
    await page.waitForTimeout(8000);
    const title = await connectionPage.getConnectionPageTitle();
    expect(title).toBe(CONNECTION_PAGE_TITLE);
  })

  test('test invalid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(2000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(true);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(true);
  })

  test('test valid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(8000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(false);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(false);
   })

  test('test required fields', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    await expect(connectionPage.userName).toBeTruthy()
    await expect(connectionPage.password).toBeTruthy()
    await expect(connectionPage.port).toBeTruthy()
    await expect(connectionPage.host).toBeTruthy()
    await page.waitForTimeout(2000);
  })

  test('test continue disable', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    const isContinueButtonDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })
})