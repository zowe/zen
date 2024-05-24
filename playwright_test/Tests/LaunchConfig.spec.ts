import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;


let electronApp: ElectronApplication
const CONFPAGE_TITLE = 'Configuration'
const CERTIFICATE_TITLE = 'Certificates'
const VALIDATION_ERROR_MSG = 'is a required property'
const ZOWE_ROOT_DIR = process.env.ZOWE_ROOT_DIR;
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR= process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR=process.env.ZOWE_LOG_DIR;
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

test.describe('launchConfigTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let planningPage : PlanningPage;
    let launchConfigPage : LaunchConfigPage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page= await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      launchConfigPage = new LaunchConfigPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
      titlePage.navigateToConnectionTab()
      connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
      connectionPage.SubmitValidateCredential()
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton()
      await page.waitForTimeout(20000);
      planningPage.fillPlanningPageWithRequiredFields(ZOWE_ROOT_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
      await page.waitForTimeout(20000);
      planningPage.clickValidateLocations()
      await page.waitForTimeout(20000);
      planningPage.clickContinueToInstallation()
      await page.waitForTimeout(5000);
      launchConfigPage.movetoLaunchConfigPage()
      await page.waitForTimeout(5000);
    })

    test.afterEach(async () => {
     await electronApp.close()
   })

  test('test title of page', async ({ page }) => {
   await page.waitForTimeout(5000);
   const title = await launchConfigPage.returnTitleOfConfPage();
   expect(title).toBe(CONFPAGE_TITLE);
   })

  test('test all required fields', async ({ page }) => {
    await page.waitForTimeout(5000);
    await expect(launchConfigPage.validation).toBeTruthy()
    await expect(launchConfigPage.logLevel).toBeTruthy()
    await expect(launchConfigPage.componentConfig).toBeTruthy()
    })

  test('test select validation level', async ({ page }) => {
    await page.waitForTimeout(5000);

    const values = ['STRICT', 'COMPONENT-COMPAT'];

    for (const value of values) {
        await launchConfigPage.fillvalues(value);
        await page.waitForTimeout(5000);

        const componentConfigValue = await launchConfigPage.get_validation_value();
        await page.waitForTimeout(5000);
        expect(componentConfigValue).toBe(value);
    }
  })


  test('test select log level', async ({ page }) => {
    await page.waitForTimeout(5000);
    const values = ['info', 'debug', 'trace'];
    for (const value of values) {
        await launchConfigPage.fillvalues_logLevel(value);
        await page.waitForTimeout(5000);
        const componentConfigValue = await launchConfigPage.get_logLevel_value();
        expect(componentConfigValue).toBe(value);
    }
  })

  test('test select component configure', async ({ page }) => {
    await page.waitForTimeout(5000);
    const values = ['warn', 'exit'];
    for (const value of values) {
        await launchConfigPage.fillvaluescomponentConfig(value);
        await page.waitForTimeout(5000);
        const componentConfigValue = await launchConfigPage.get_componentConfig_value();
        expect(componentConfigValue).toBe(value);
    }
  })
  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    launchConfigPage.viewYaml()
    await page.waitForTimeout(5000);
    await expect(launchConfigPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    launchConfigPage.closeButton()
    await page.waitForTimeout(2000);
    })

  test('Test view and submit button', async ({ page }) => {
     await page.waitForTimeout(5000);
     launchConfigPage.click_viewAndSubmitJob()
     await page.waitForTimeout(5000);
     await expect(launchConfigPage.editor_title_element).toBeTruthy()
     launchConfigPage.closeButton()
     await page.waitForTimeout(2000);
    })


  test('Test view job', async ({ page }) => {
     await page.waitForTimeout(5000);
     launchConfigPage.click_previewJob()
     await page.waitForTimeout(5000);
     await expect(launchConfigPage.editor_title_element).toBeTruthy()
     launchConfigPage.closeButton()
     await page.waitForTimeout(5000);
    })

  test('Test save and close and Resume Progress', async ({ page }) => {
    await page.waitForTimeout(5000);
    launchConfigPage.fillvalues('STRICT')
    launchConfigPage.fillvalues_logLevel('info')
    launchConfigPage.fillvaluescomponentConfig('warn')
    await page.waitForTimeout(5000);
    launchConfigPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(15000);
    const title = await launchConfigPage.returnTitleOfConfPage();
    expect(title).toBe(CONFPAGE_TITLE);
    const Validation_Value = await launchConfigPage.get_validation_value();
    const LogLevel_Value = await launchConfigPage.get_logLevel_value();
    const ComponentConfig_Value = await launchConfigPage.get_componentConfig_value();
    expect(Validation_Value).toBe('STRICT');
    expect(LogLevel_Value).toBe('info');
    expect(ComponentConfig_Value).toBe('warn');
    })

  test('click Previous step button', async ({ page }) => {
     await page.waitForTimeout(5000);
     const title = await launchConfigPage.returnTitleOfPrevPage();
     expect(title).toBe(CERTIFICATE_TITLE);
   })
  test('Test previous button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await launchConfigPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

  test('Test continue to review button is disable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const is_ContinueButtonDisable = await launchConfigPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
     await page.waitForTimeout(2000);
    })

  test('Test Skip launch config button is enable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const isLaunchConfigEnable = await launchConfigPage.is_skipLaunchConfigButtonEnable();
     expect(isLaunchConfigEnable).toBe(true);
     await page.waitForTimeout(2000);
   })

  test('Test yaml should be updated', async ({ page }) => {
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues('STRICT');
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues_logLevel('info');
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvaluescomponentConfig('warn');
    await page.waitForTimeout(15000);
    await launchConfigPage.viewYaml();
    await page.waitForTimeout(10000);
    await expect(launchConfigPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await launchConfigPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain('info');
    expect(yaml).toContain('STRICT');
    expect(yaml).toContain('warn');
   })

  test('Test keep mandatory field empty', async ({ page }) => {
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues('');
    await page.waitForTimeout(5000);
    const Errormsg = await launchConfigPage.get_validation_error_msg();
    expect(Errormsg).expect(VALIDATION_ERROR_MSG);
   })
});
