import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import ApfAuthPage from '../Pages/ApfAuth.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page';
import config from '../utils/config';
import { spawn } from 'child_process';
import path from 'path';
let page: Page;


let electronApp: ElectronApplication
const APF_AUTH_TITLE ='APF Authorize Load Libraries'
const NETWORKING_TITLE = 'Networking'
const INSTALLATION_TITLE = 'Installation'
const SECURITY_TITLE = 'Security'


test.beforeAll(async () => {
  test.setTimeout(600000);
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
	let installationTypePage : InstallationTypePage;
	let installationPage : InstallationPage;
	let networkingPage : NetworkingPage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page = await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page)
      apfAuthPage = new ApfAuthPage(page);
	  installationTypePage = new InstallationTypePage(page);
	  installationPage = new InstallationPage(page);
	  networkingPage = new NetworkingPage(page);
      titlePage.navigateToConnectionTab()
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
	  await networkingPage.click_skipNetworking()
      await page.waitForTimeout(1000);
    })

    test.afterEach(async () => {
     await electronApp.close()
   })
    test('Verify title', async ({ page }) => {
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

    test('test apfAuth with valid data', async ({ page }) => {
     await apfAuthPage.initializeApfauth()
     const isWriteConfig_check_visible = await apfAuthPage.isWriteConfigGreenCheckVisible();
     await expect(isWriteConfig_check_visible).toBe(true);
     const isUploadConfig_check_visible = await apfAuthPage.isUploadConfigGreenCheckVisible();
     await expect(isUploadConfig_check_visible).toBe(true);
     const isInitApf_check_visible = await apfAuthPage.isInitApfGreenCheckVisible();
     await expect(isInitApf_check_visible).toBe(true);
    })

    test('Click Previous Step and verify that the Previous button is enabled.', async ({ page }) => {
     const is_prevButtonEnable = await apfAuthPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     const title = await apfAuthPage.returnTitleOfPrevPage();
     expect(title).toBe(NETWORKING_TITLE);
    })

    test('test skip apfAuth button is enable and click Skip button', async ({ page }) => {
     const isSkipApfAuthEnable = await apfAuthPage.is_skipApfAuthButtonEnable();
     expect(isSkipApfAuthEnable).toBe(true);
     const security_title = await apfAuthPage.click_skipApfAuth();
     expect(security_title).toBe(SECURITY_TITLE);
    })


    test('test continue button is disable', async ({ page }) => {
     const is_ContinueButtonDisable = await apfAuthPage.isContinueButtonDisable();
     await expect(is_ContinueButtonDisable).toBe(true);
    })

    test('click view yaml button', async ({ page }) => {
     await apfAuthPage.viewYaml()
     await expect(apfAuthPage.editor_title_element).toBeTruthy();
     await apfAuthPage.closeButton()
    })

    test('Test view job output button', async ({ page }) => {
     await apfAuthPage.click_viewAndSubmitJob()
     await expect(apfAuthPage.editor_title_element).toBeTruthy()
     await apfAuthPage.closeButton()
    })


    test('Test save and close and Resume Progress', async ({ page }) => {
     apfAuthPage.click_saveAndClose()
     await titlePage.clickOnResumeProgress();
     await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
     await connectionPage.SubmitValidateCredential()
     const title = await apfAuthPage.returnTitleOfApfAuthPage();
     await expect(title).toBe(APF_AUTH_TITLE);
     const datatsetPrefixValue = await apfAuthPage.get_datasetPrefix_value();
     const AuthLoadLib_Value = await apfAuthPage.get_authLoadLib_value();
     const AuthPluginLib_Value = await apfAuthPage.get_authPluginLib_value();
     await expect(datatsetPrefixValue).toBe(config.DATASET_PREFIX);
     await expect(AuthLoadLib_Value).toBe(config.AUTH_LOAD_LIB);
     await expect(AuthPluginLib_Value).toBe(config.AUTH_PLUGIN_LIB);
    })
})
