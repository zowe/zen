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
const APF_AUTH_TITLE ='APF Authorize Load Libraries'
const NETWORKING_TITLE = 'Networking'
const INSTALLATION_TITLE = 'Installation'
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
const JAVA_HOME=process.env.JAVA_HOME;
const NODE_HOME=process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1); 
  }
});

test.describe('ApfAuthTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let apfAuthPage : ApfAuthPage;
    let planningPage : PlanningPage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page)
      apfAuthPage = new ApfAuthPage(page);
      titlePage.navigateToConnectionTab()
      connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
      connectionPage.SubmitValidateCredential()
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton()
      planningPage.clickSaveValidate()
      await page.waitForTimeout(20000);
      planningPage.fillPlanningPageWithRequiredFields(ZOWE_ROOT_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
      await page.waitForTimeout(20000);
      planningPage.clickValidateLocations()
      await page.waitForTimeout(30000);
      planningPage.clickContinueToInstallation()
      await page.waitForTimeout(5000);
      apfAuthPage.movetoInstallationPage()
      await page.waitForTimeout(5000);
    })

    test.afterEach(async () => {
     await electronApp.close()
   })
    test('Test Resume Progress', async ({ page }) => {
     await page.waitForTimeout(8000);
     apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
     await page.waitForTimeout(5000);
     apfAuthPage.click_saveAndClose()
     await page.waitForTimeout(8000);
     connectionPage.click_resumeProgress()
     await page.waitForTimeout(8000);
     const title = await apfAuthPage.returnTitleOfApfAuthPage();
     expect(title).toBe(APF_AUTH_TITLE);
     const datatsetPrefixValue = await apfAuthPage.get_datasetPrefix_value();
     const AuthLoadLib_Value = await apfAuthPage.get_authLoadLib_value();
     const AuthPluginLib_Value = await apfAuthPage.get_authPluginLib_value();
     expect(datatsetPrefixValue).toBe(DATASET_PREFIX);
     expect(AuthLoadLib_Value).toBe(AUTH_LOAD_LIB);
     expect(AuthPluginLib_Value).toBe(AUTH_PLUGIN_LIB);
    })

    test('Verify title', async ({ page }) => {
      await page.waitForTimeout(5000);
      apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
      await page.waitForTimeout(5000);
      apfAuthPage.movetoApfAuthPage()
      await page.waitForTimeout(5000);
      await expect(apfAuthPage.datasetPrefix).toBeTruthy()
      await expect(apfAuthPage.authLoadLib).toBeTruthy()
      await expect(apfAuthPage.authpluginLib).toBeTruthy()
      await expect(apfAuthPage.run_zwe_init_apfauth).toBeTruthy()
      await expect(apfAuthPage.view_yaml).toBeTruthy()
      await expect(apfAuthPage.save_and_close).toBeTruthy()
      await expect(apfAuthPage.previous_step).toBeTruthy()
      await expect(apfAuthPage.skip_apf_auth).toBeTruthy()
      await expect(apfAuthPage.continue_security_setup).toBeTruthy()

    })
    test('test apfAuth with empty data', async ({ page }) => {
      await page.waitForTimeout(5000);
      apfAuthPage.fillApfDetails('','','')
      await page.waitForTimeout(5000);
      apfAuthPage.movetoApfAuthPage()
      await page.waitForTimeout(5000);
      apfAuthPage.initializeApfauth()
      await page.waitForTimeout(5000);
      const isWriteConfig_check_visible = await apfAuthPage.isWriteConfigGreenCheckVisible();
      expect(isWriteConfig_check_visible).toBe(false);
      const isUploadConfig_check_visible = await apfAuthPage.isUploadConfig_check_visible();
      expect(isUploadConfig_check_visible).toBe(false);
      const isInitApf_check_visible = await apfAuthPage.isInitApf_check_visible();
      expect(isInitApf_check_visible).toBe(false);
    })
    test('test apfAuth with valid data', async ({ page }) => {
     await page.waitForTimeout(5000);
     apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
     await page.waitForTimeout(5000);
     apfAuthPage.movetoApfAuthPage()
     await page.waitForTimeout(5000);
     apfAuthPage.initializeApfauth()
     await page.waitForTimeout(5000);
     const isWriteConfig_check_visible = await apfAuthPage.isWriteConfigGreenCheckVisible();
     expect(isWriteConfig_check_visible).toBe(true);
     const isUploadConfig_check_visible = await apfAuthPage.isUploadConfig_check_visible();
     expect(isUploadConfig_check_visible).toBe(true);
     const isInitApf_check_visible = await apfAuthPage.isInitApf_check_visible();
     expect(isInitApf_check_visible).toBe(true);
    })

    test('click Previous step', async ({ page }) => {
     await page.waitForTimeout(5000);
     apfAuthPage.movetoApfAuthPage()
     const title = await apfAuthPage.returnTitleOfPrevPage();
     expect(title).toBe(NETWORKING_TITLE);
    })

    test('test skip apfAuth button is enable', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     const isSkipApfAuthEnable = await apfAuthPage.is_skipApfAuthButtonEnable();
     expect(isSkipApfAuthEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

    test('test previous button is enabled', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     const is_prevButtonEnable = await apfAuthPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

    test('test continue button is disable', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     const is_ContinueButtonDisable = await apfAuthPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
     await page.waitForTimeout(2000);
    })

    test('click view yaml button', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     await page.waitForTimeout(5000);
     apfAuthPage.viewYaml()
     await page.waitForTimeout(5000);
     await expect(apfAuthPage.editor_title_element).toBeTruthy();
     apfAuthPage.closeButton()
     await page.waitForTimeout(2000);
    })

    test('test click skip APFAuth button', async ({ page }) => {
     await apfAuthPage.movetoApfAuthPage()
     const security_title = await apfAuthPage.click_skipApfAuth();
     expect(security_title).toBe(SECURITY_TITLE);

   })

    test('Test view and submit button', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     await page.waitForTimeout(5000);
     apfAuthPage.click_viewAndSubmitJob()
     await page.waitForTimeout(5000);
     await expect(apfAuthPage.editor_title_element).toBeTruthy()
     apfAuthPage.closeButton()
     await page.waitForTimeout(2000);
    })


    test('Test view job', async ({ page }) => {
     apfAuthPage.movetoApfAuthPage()
     await page.waitForTimeout(5000);
     apfAuthPage.click_previewJob()
     await page.waitForTimeout(5000);
     await expect(apfAuthPage.editor_title_element).toBeTruthy()
     apfAuthPage.closeButton()
     await page.waitForTimeout(5000);
    })

    test('Test save and close and Resume Progress', async ({ page }) => {
     await page.waitForTimeout(5000);
     apfAuthPage.fillApfDetails(DATASET_PREFIX,AUTH_LOAD_LIB,AUTH_PLUGIN_LIB)
     await page.waitForTimeout(5000);
     apfAuthPage.movetoApfAuthPage()
     await page.waitForTimeout(5000);
     apfAuthPage.click_saveAndClose()
     await page.waitForTimeout(3000);
     titlePage.clickOnResumeProgress();
     await page.waitForTimeout(15000);
     const title = await securityPage.returnTitleOfSecurityPage();
     expect(title).toBe(SECURITY_TITLE);
     const datatsetPrefixValue = await apfAuthPage.get_datasetPrefix_value();
     const authPluginLibValue = await apfAuthPage.get_authPluginLib_value();
     const authLoadLibValue = await apfAuthPage.get_authLoadLib_value();
     expect(datatsetPrefixValue).toBe(DATASET_PREFIX);
     expect(authLoadLibValue).toBe(AUTH_LOAD_LIB);
     expect(authPluginLibValue).toBe(AUTH_PLUGIN_LIB);
    })


})