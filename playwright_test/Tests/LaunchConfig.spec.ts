import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import config from '../utils/config';
import { prepareEnvironment } from '../prepare.js';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import SecurityPage from '../Pages/security.page.ts'
import StcsPage from '../Pages/stcs.page.ts'
import ApfAuthPage from '../Pages/ApfAuth.page';
import VsamPage from '../Pages/Vsam.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import { spawn } from 'child_process';
import path from 'path';
import { connectArgs, Script }  from '../setup';
let page: Page;


let electronApp: ElectronApplication
const CONFPAGE_TITLE = 'Configuration'
const CACHINGSERVICE_TITLE = 'CachingService'
const REVIEWPAGE_TITLE = 'Review Installation'
const VALIDATION_ERROR_MSG = 'is a required property'
const script = new Script()



test.beforeAll(async () => {
  test.setTimeout(600000);
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
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage
  let stcsPage : StcsPage
  let securityPage : SecurityPage
  let apfAuthPage : ApfAuthPage;
  let vsamPage : VsamPage;
  let launchConfigPage : LaunchConfigPage;


    test.beforeEach(async ({ page }) => {
     test.setTimeout(900000);
     electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
     page= await electronApp.firstWindow()
     connectionPage = new ConnectionPage(page);
     launchConfigPage = new LaunchConfigPage(page);
     titlePage = new TitlePage(page);
     planningPage = new PlanningPage(page)
     apfAuthPage = new ApfAuthPage(page);
	   installationTypePage = new InstallationTypePage(page);
	   installationPage = new InstallationPage(page);
	   networkingPage = new NetworkingPage(page);
	   securityPage = new SecurityPage(page);
	   stcsPage = new StcsPage(page);
	   vsamPage = new VsamPage(page);
      await titlePage.navigateToConnectionTab()
      await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
	    await connectionPage.SubmitValidateCredential();
	    await connectionPage.clickContinueButton();
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
      await planningPage.clickValidateLocations()
      await planningPage.clickContinueToInstallation()
	  await installationTypePage.downloadZowePaxAndNavigateToInstallationPage()
    await installationTypePage.clickOnContinueToUnpax()
	  await installationTypePage.skipUnpax()
	  await installationPage.fillAllFields(config.DATASET_PREFIX,
	    config.PARM_LIB,
		config.PROC_LIB,
		config.JCL_LIB,
		config.LOAD_LIB,
		config.AUTH_LOAD_LIB,
		config.AUTH_PLUGIN_LIB
	  )
    await installationPage.clickInstallMvsDatasets();
    await installationPage.clickContinueToNetworkSetup();
    await launchConfigPage.movetoLaunchConfigPage();
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

  test('Test Skip launch config button is enable', async ({ page }) => {
    const isLaunchConfigEnable = await launchConfigPage.is_skipLaunchConfigButtonEnable();
    expect(isLaunchConfigEnable).toBe(true);
    const title = await launchConfigPage.click_skipLaunhConfig();
    expect(title).toBe(REVIEWPAGE_TITLE);
  })

  test('test select component configure', async ({ page }) => {
    const values = ['warn', 'exit'];
    for (const value of values) {
        await launchConfigPage.fillvaluescomponentConfig(value);
        const componentConfigValue = await launchConfigPage.get_componentConfig_value();
        expect(componentConfigValue).toBe(value);
    }
  })

  test('Test view yaml button', async ({ page }) => {
    await launchConfigPage.viewYaml()
    await expect(launchConfigPage.editor_title_element).toBeTruthy();
    await launchConfigPage.closeButton()
    })

  test('Test view job output button', async ({ page }) => {
     await launchConfigPage.click_viewJobOutput()
     await expect(launchConfigPage.editor_title_element).toBeTruthy()
     await launchConfigPage.closeButton()
    })

  test('Test save and close and Resume Progress', async ({ page }) => {
    await launchConfigPage.fillvalues('STRICT');
    await launchConfigPage.fillvalues_logLevel('info');
    await launchConfigPage.fillvaluescomponentConfig('warn');
    await launchConfigPage.click_saveAndClose();
    await titlePage.clickOnResumeProgress();
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);    
    await connectionPage.SubmitValidateCredential();
    const title = await launchConfigPage.returnTitleOfConfPage();
    expect(title).toBe(CONFPAGE_TITLE);
    const Validation_Value = await launchConfigPage.get_validation_value();
    const LogLevel_Value = await launchConfigPage.get_logLevel_value();
    const ComponentConfig_Value = await launchConfigPage.get_componentConfig_value();
    expect(Validation_Value).toBe('STRICT');
    expect(LogLevel_Value).toBe('info');
    expect(ComponentConfig_Value).toBe('warn');
  });

  test('click and verify Previous step button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await launchConfigPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     const title = await launchConfigPage.returnTitleOfPrevPage();
     expect(title).toBe(CACHINGSERVICE_TITLE);
   })

  test('Test yaml should be updated', async ({ page }) => {
    await launchConfigPage.fillvalues('STRICT');
    await launchConfigPage.fillvalues_logLevel('info');
    await launchConfigPage.fillvaluescomponentConfig('warn');
    await launchConfigPage.viewYaml();
    await expect(launchConfigPage.editor_title_element).toBeTruthy();
    const yaml = await launchConfigPage.read_yaml();
    console.log(yaml)
    expect(yaml).toContain('logLevel: info');
    expect(yaml).toContain('validation: STRICT');
    expect(yaml).toContain('onComponentConfigureFail: warn');
   })

  test('Test keep mandatory field empty', async ({ page }) => {
    await launchConfigPage.fillvalues('');
    const Errormsg = await launchConfigPage.get_validation_error_msg();
    expect(Errormsg).toBe(VALIDATION_ERROR_MSG);
   })

  test('verify yaml updated on zos correctly', async ({ page }) => {
    await launchConfigPage.fillvalues('STRICT');
    await launchConfigPage.fillvalues_logLevel('info');
    await launchConfigPage.fillvaluescomponentConfig('warn');
    const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`); 
    await expect(result.details).toContain('STRICT');
    await expect(result.details).toContain('info');
    await expect(result.details).toContain('warn');
    });
});
