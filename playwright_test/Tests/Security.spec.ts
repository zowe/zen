import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { setup } from './setup.ts';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;


let electronApp: ElectronApplication
const CERTIFICATE_TITLE = 'Certificates'
const RUNTIME_DIR = process.env.ROOT_PATH + '/'+ process.env.ZOWE_ROOT_DIR;

test.describe('securityTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let securityPage : SecurityPage;
    let planningPage : PlanningPage;
    let apfAuthPage : ApfAuthPage;

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

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
      apfAuthPage = new ApfAuthPage(page);
      securityPage = new SecurityPage(page);
      titlePage.navigateToConnectionTab()
      connectionPage.fillConnectionDetails(process.env.SSH_HOST,process.env.SSH_PORT,process.env.SSH_USER,process.env.SSH_PASSWD)
      connectionPage.SubmitValidateCredential()
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton()
      planningPage.clickSaveValidate()
      await page.waitForTimeout(20000);
      planningPage.fillPlanningPage(RUNTIME_DIR, process.env.ZOWE_WORKSPACE_DIR,process.env.ZOWE_EXTENSION_DIR,process.env.ZOWE_LOG_DIR,'1',process.env.JOB_NAME,process.env.JOB_PREFIX,process.env.JAVA_HOME,process.env.NODE_HOME,process.env.ZOSMF_APP_ID)
      planningPage.clickValidateLocations()
      await page.waitForTimeout(20000);
      planningPage.continueInstallation()
      await page.waitForTimeout(5000);
      securityPage.movetoSecurityPage()
      await page.waitForTimeout(5000);
    })

    test.afterEach(async () => {
     await electronApp.close()
   })

    test('Test all required fields on security page', async ({ page }) => {
      await page.waitForTimeout(5000);
      await expect(securityPage.product).toBeTruthy()
      await expect(securityPage.admin).toBeTruthy()
      await expect(securityPage.stc).toBeTruthy()
      await expect(securityPage.sys_prog).toBeTruthy()
      await expect(securityPage.user_zis).toBeTruthy()
      await expect(securityPage.user_zowe).toBeTruthy()
      await expect(securityPage.aux).toBeTruthy()
      await expect(securityPage.stc_zowe).toBeTruthy()
      await expect(securityPage.stc_zis).toBeTruthy()
      await expect(securityPage.view_yaml).toBeTruthy()
      await expect(securityPage.save_and_close).toBeTruthy()
      await expect(securityPage.previous_step).toBeTruthy()
      await expect(securityPage.skip_button).toBeTruthy()
      await expect(securityPage.continue_CertificateSelector).toBeTruthy()

    })
    test('test security with empty data', async ({ page }) => {
      await page.waitForTimeout(5000);
      securityPage.fillSecurityDetails('','','','','','','','','')
      await page.waitForTimeout(5000);
      securityPage.initializeSecurity()
      await page.waitForTimeout(15000);
      const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
      expect(isWriteConfig_check_visible).toBe(false);
      const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
      expect(isUploadConfig_check_visible).toBe(false);
      const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
      expect(isInitSecurity_check_visible).toBe(false);
      await page.waitForTimeout(15000);

    })
    test('test security with valid data', async ({ page }) => {
      await page.waitForTimeout(5000);
      securityPage.fillSecurityDetails('RACF',process.env.SECURITY_ADMIN,process.env.SECURITY_STC,process.env.SECURITY_SYSPROG,process.env.SECURITY_USER_ZIS,process.env.SECURITY_USER_ZOWE,process.env.SECURITY_AUX,process.env.SECURITY_STC_ZOWE,process.env.SECURITY_STC_ZIS)
      await page.waitForTimeout(5000);
      securityPage.initializeSecurity()
      await page.waitForTimeout(5000);
      const isWriteConfig_check_visible = await securityPage.isWriteConfigGreenCheckVisible();
      expect(isWriteConfig_check_visible).toBe(true);
      const isUploadConfig_check_visible = await securityPage.isUploadConfigGreenCheckVisible();
      expect(isUploadConfig_check_visible).toBe(true);
      const isInitSecurity_check_visible = await securityPage.isInitSecurityGreenCheckVisible();
      expect(isInitSecurity_check_visible).toBe(true);
      await page.waitForTimeout(5000);

    })

    test('click Previous step button', async ({ page }) => {
     await page.waitForTimeout(5000);
     const title = await securityPage.returnTitleOfPrevPage();
     expect(title).toBe(APF_AUTH_TITLE);
    })


    test('test click skip security button', async ({ page }) => {
     await page.waitForTimeout(5000);
     const certificate_title = await securityPage.click_skipSecurity();
     expect(certificate_title).toBe(CERTIFICATE_TITLE);
    })

    test('Test previous button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await securityPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

    test('Test continue to certificate button is disable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const is_ContinueButtonDisable = await securityPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
     await page.waitForTimeout(2000);
    })

    test('Test Skip security button is enable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const isSkipSecurityEnable = await securityPage.is_skipSecurityButtonEnable();
     expect(isSkipSecurityEnable).toBe(true);
     await page.waitForTimeout(2000);
    })


    test('Test view yaml button', async ({ page }) => {
     await page.waitForTimeout(7000);
     securityPage.viewYaml()
     await page.waitForTimeout(5000);
     await expect(securityPage.editor_title_element).toBeTruthy();
     securityPage.closeButton()
     await page.waitForTimeout(2000);
    })

    test('Test view and submit button', async ({ page }) => {
     await page.waitForTimeout(5000);
     securityPage.click_viewAndSubmitJob()
     await page.waitForTimeout(5000);
     await expect(securityPage.editor_title_element).toBeTruthy()
     securityPage.closeButton()
     await page.waitForTimeout(2000);
    })


    test('Test view job', async ({ page }) => {
     await page.waitForTimeout(5000);
     securityPage.click_previewJob()
     await page.waitForTimeout(5000);
     await expect(securityPage.editor_title_element).toBeTruthy()
     securityPage.closeButton()
     await page.waitForTimeout(5000);
    })

    test('Test save and close', async ({ page }) => {
     await page.waitForTimeout(5000);
     securityPage.fillSecurityDetails('RACF',process.env.SECURITY_ADMIN,process.env.SECURITY_STC,process.env.SECURITY_SYSPROG,process.env.SECURITY_USER_ZIS,process.env.SECURITY_USER_ZOWE,process.env.SECURITY_AUX,process.env.SECURITY_STC_ZOWE,process.env.SECURITY_STC_ZIS)
     await page.waitForTimeout(5000);
     securityPage.click_saveAndClose()
     await page.waitForTimeout(5000);
     titlePage.navigateToConnectionTab()
     connectionPage.clickContinueButton()
     await page.waitForTimeout(5000);
     planningPage.continueInstallation()
     await page.waitForTimeout(5000);
     securityPage.movetoSecurityPage()
     await page.waitForTimeout(15000);
     const sysProg_value = await securityPage.get_sysProg_value();
     const admin_value = await securityPage.get_admin_value();
     const stc_value = await securityPage.get_stc_value();
     const userZowe_value = await securityPage.get_user_zowe_value();
     const userZis_value = await securityPage.get_user_zis_value();
     const aux_value = await securityPage.get_aux_value();
     const stcZis_value = await securityPage.get_stc_zis_value();
     const stcZowe_value = await securityPage.get_stc_zowe_value();
     expect(sysProg_value).toBe(process.env.SECURITY_SYSPROG);
     expect(admin_value).toBe(process.env.SECURITY_ADMIN);
     expect(stc_value).toBe(process.env.SECURITY_STC);
     expect(userZowe_value).toBe(process.env.SECURITY_USER_ZOWE);
     expect(userZis_value).toBe(process.env.SECURITY_USER_ZIS);
     expect(stcZowe_value).toBe(process.env.SECURITY_STC_ZOWE);
     expect(stcZis_value).toBe(process.env.SECURITY_STC_ZIS);
     expect(aux_value).toBe(process.env.SECURITY_AUX);
    })
})