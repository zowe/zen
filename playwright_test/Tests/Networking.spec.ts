import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { setup } from './setup.ts';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import NetworkingPage from '../Pages/networking.page';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;


let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
const APFAUTH_TITLE = 'APF Authorize Load Libraries';
const INSTALLATION_TITLE = 'Installation';
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const EXTERNAL_PORT = process.env.EXTERNAL_PORT;
const RUNTIME_DIR = process.env.ROOT_PATH + process.env.ZOWE_ROOT_DIR;
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

test.describe('securityTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let securityPage : SecurityPage;
    let planningPage : PlanningPage;
    let networkingPage : NetworkingPage;

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
      networkingPage = new NetworkingPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
      titlePage.navigateToConnectionTab()
      connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
      connectionPage.SubmitValidateCredential()
      await page.waitForTimeout(5000);
      connectionPage.clickContinueButton()
      planningPage.clickSaveValidate()
      await page.waitForTimeout(20000);
      planningPage.fillPlanningPage(RUNTIME_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_APP_ID)
      planningPage.clickValidateLocations()
      await page.waitForTimeout(20000);
      planningPage.continueInstallation()
      await page.waitForTimeout(5000);
      networkingPage.movetoNetworkingPage()
      await page.waitForTimeout(5000);
    })

  test.afterEach(async () => {
   await electronApp.close()
   })

  test('test title of page', async ({ page }) => {
   await page.waitForTimeout(5000);
   const title = await networkingPage.returnTitleOfNetworkingPage();
   expect(title).toBe(NETWORKING_TITLE);
   })
  test('test all required fields', async ({ page }) => {
    await page.waitForTimeout(5000);
    await expect(networkingPage.externalDomains).toBeTruthy()
    await expect(networkingPage.externalPort).toBeTruthy()
    await expect(networkingPage.components).toBeTruthy()
    await expect(networkingPage.metricService).toBeTruthy()
    await expect(networkingPage.zss).toBeTruthy()
    await expect(networkingPage.explorerUss).toBeTruthy()
    await expect(networkingPage.jobsApi).toBeTruthy()
    await expect(networkingPage.filesApi).toBeTruthy()
    await expect(networkingPage.filesApiDebug).toBeTruthy()
    await expect(networkingPage.explorerMvs).toBeTruthy()
    await expect(networkingPage.cloudGateway).toBeTruthy()
    await expect(networkingPage.explorerJes).toBeTruthy()
    await expect(networkingPage.apiCatalog).toBeTruthy()
    await expect(networkingPage.gateway).toBeTruthy()
    await expect(networkingPage.appServer).toBeTruthy()
    await expect(networkingPage.cachingService).toBeTruthy()
    await expect(networkingPage.discovery).toBeTruthy()

    })

  test('test external domain field', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME,EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    console.log(port,domainName)
    expect(port).toBe(DOMAIN_NAME);
    expect(domainName).toBe(EXTERNAL_PORT);
    await page.waitForTimeout(5000);
  })

  test('test deleting domain name field', async ({ page }) => {
    await networkingPage.delete_DomainNameField();
    await page.waitForTimeout(5000);
    const isDomainNameVisible = await networkingPage.domainName.isVisible();
    expect(isDomainNameVisible).toBeFalsy()
  })

  test('test add more domain name field', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.add_DomainNameField();
    await page.waitForTimeout(5000);
    await expect(networkingPage.domainName).toBeTruthy()
  })
  test('test add special char in other port no', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillMetricServicePort('*^%$^&');
    await page.waitForTimeout(5000);
    const port = await networkingPage.get_metricServiceport_value();
    expect(port).toBe('');
  })

  test('test enabled debug component', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.click_checkBox('1');
    await networkingPage.click_checkBox('2');
    await page.waitForTimeout(10000);
    const isEnabled = await networkingPage.isCheckboxCheckedAndBlue('2');
    const isDebug = await networkingPage.isCheckboxCheckedAndBlue('1');
    expect(isEnabled).toBe(true);
    expect(isDebug).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    networkingPage.viewYaml()
    await page.waitForTimeout(5000);
    await expect(networkingPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    networkingPage.closeButton()
    await page.waitForTimeout(2000);
    })

  test('Test view and submit button', async ({ page }) => {
     await page.waitForTimeout(5000);
     networkingPage.click_viewAndSubmitJob()
     await page.waitForTimeout(5000);
     await expect(networkingPage.editor_title_element).toBeTruthy()
     networkingPage.closeButton()
     await page.waitForTimeout(2000);
    })


  test('Test view job', async ({ page }) => {
     await page.waitForTimeout(5000);
     networkingPage.click_previewJob()
     await page.waitForTimeout(5000);
     await expect(networkingPage.editor_title_element).toBeTruthy()
     networkingPage.closeButton()
     await page.waitForTimeout(5000);
    })

  test('Test save and close', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME,EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    networkingPage.click_saveAndClose()
    await page.waitForTimeout(5000);
    titlePage.navigateToConnectionTab()
    connectionPage.clickContinueButton()
    await page.waitForTimeout(5000);
    planningPage.continueInstallation()
    await page.waitForTimeout(5000);
    networkingPage.movetoNetworkingPage()
    await page.waitForTimeout(15000);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    console.log(port,domainName)
    expect(port).toBe(EXTERNAL_PORT);
    expect(domainName).toBe(DOMAIN_NAME);
    await page.waitForTimeout(5000);

    })

  test('click Previous step button', async ({ page }) => {
     await page.waitForTimeout(5000);
     const title = await networkingPage.returnTitleOfPrevPage();
     expect(title).toBe(INSTALLATION_TITLE);
    })
  test('Test previous button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await networkingPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

  test('Test continue to APF Auth button is disable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const is_ContinueButtonDisable = await networkingPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
     await page.waitForTimeout(2000);
    })
  test('Test Skip networking button is enable', async ({ page }) => {
     await page.waitForTimeout(2000);
     const isLaunchConfigEnable = await networkingPage.is_skipNetworkingButtonEnable();
     expect(isLaunchConfigEnable).toBe(true);
     await page.waitForTimeout(2000);
    })

  test('Test yaml should be updated', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME,EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    await networkingPage.viewYaml();
    await page.waitForTimeout(10000);
    await expect(networkingPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await networkingPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain(DOMAIN_NAME);
    expect(yaml).toContain(EXTERNAL_PORT);
   })
});
