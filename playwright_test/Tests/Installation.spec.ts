import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import config from '../utils/config';
import { prepareEnvironment } from '../prepare.js';
import { connectArgs, Script }  from '../setup';


let electronApp: ElectronApplication
const NETWORKING_PAGE_TITLE = 'Networking'
const INSTALLATION_TYPE_TITLE = 'Installation';
const DOWNLOAD_ZOWE_TITLE = 'Download Zowe Pax';
const ERROR_MSG ='One or more required dataset values are missing. Please ensure all fields are filled in.'
const script = new Script()


test.beforeAll(async () => {
  test.setTimeout(600000); 
  try {
    await prepareEnvironment({ install: true, cleanup:true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('InstallationTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage


  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
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
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  
  test('Test all required fields on Installation page', async ({ page }) => {
    expect(installationPage.prefix).toBeTruthy()
    expect(installationPage.procLib).toBeTruthy()
    expect(installationPage.parmLib).toBeTruthy()
    expect(installationPage.zis).toBeTruthy()
    expect(installationPage.jclLib).toBeTruthy()
    expect(installationPage.loadLib).toBeTruthy()
    expect(installationPage.authLoadLib).toBeTruthy()
    expect(installationPage.authPluginLib).toBeTruthy()
    expect(installationPage.installMVSDatasets).toBeTruthy()
    expect(installationPage.viewEditYaml).toBeTruthy()
    expect(installationPage.viewSubmitJob).toBeTruthy()
    expect(installationPage.viewJobOutput).toBeTruthy()
    expect(installationPage.saveAndClose).toBeTruthy()
    expect(installationPage.previousStep).toBeTruthy()
    expect(installationPage.skipInstallation).toBeTruthy()
    expect(installationPage.clickContinueToNetworkSetup).toBeTruthy()
    const isContinueButtonEnabled = await installationPage.isContinueToNetworkSetupEnabled();
    expect(isContinueButtonEnabled).toBe(false);
	})

  test('Test Installation with Valid Data with Download Pax', async ({ page }) => {
    await installationPage.fillAllFields(config.DATASET_PREFIX,
	    config.PARM_LIB,
		config.PROC_LIB,
		config.JCL_LIB,
		config.LOAD_LIB,
		config.AUTH_LOAD_LIB,
		config.AUTH_PLUGIN_LIB
	  )
    await installationPage.clickInstallMvsDatasets();
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(true);
    await installationPage.clickContinueToNetworkSetup();
    const networkconfig_title = await networkingPage.returnTitleOfNetworkingPage()
    expect (networkconfig_title).toBe(NETWORKING_PAGE_TITLE);     
  })

  test('Test Installation with the Invalid Data', async ({ page }) => {
    await installationPage.enterPrefix('^&*(^$')
    await installationPage.enterProcLib('')
    await installationPage.enterParmLib('test.')
    await installationPage.enterJclLib('BLANK')
    await installationPage.enterLoadLib('')
    await installationPage.enterAuthLoadLib('AuthLoad')
    await installationPage.enterAuthPluginLib('')
    await installationPage.clickInstallMvsDatasetsInvalid();
    const ErrorMsgOnEmpyFields = await installationPage.getErrorMsg();
    expect(ErrorMsgOnEmpyFields).toBe(ERROR_MSG);
    const is_Continue_Button_enable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_enable).toBe(false);
  })

  test('Test Previous step', async ({ page }) => {
    await installationPage.clickPreviousStep();
    const title = await installationTypePage.getInstallationTypePageTitle();
    expect(title).toBe(DOWNLOAD_ZOWE_TITLE);
  })

  test('Test Skip Installation Button', async ({ page }) => {
    const is_Continue_Button_disable = await installationPage.isContinueToNetworkSetupEnabled();
    expect(is_Continue_Button_disable).toBe(false);
	const is_Skip_Button_disable = await installationPage.isSkipToNetworkSetupEnabled();
    expect(is_Skip_Button_disable).toBe(false);
	const title = await installationTypePage.getInstallationTypePageTitle();
    expect(title).toBe(INSTALLATION_TYPE_TITLE);
  })

  test('Test View Yaml Button', async ({ page }) => {
    await installationPage.clickViewEditYaml()
    expect(installationPage.editorTitleElement).toBeTruthy();
    await installationPage.clickCloseEditor()
  })

  test('Test View Job Output', async ({ page }) => {
    await installationPage.clickViewJobOutput()
    expect(installationPage.editorTitleElement).toBeTruthy();
    await installationPage.clickCloseEditor()
  })
 

  test('verify yaml updated on zos correctly', async ({ page }) => {
  await installationPage.fillAllFields(config.DATASET_PREFIX,
	    config.PARM_LIB,
		config.PROC_LIB,
		config.JCL_LIB,
		config.LOAD_LIB,
		config.AUTH_LOAD_LIB,
		config.AUTH_PLUGIN_LIB
	  )
    await installationPage.clickInstallMvsDatasets();
    const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`); 
    await expect(result.details).toContain(config.DATASET_PREFIX);
    await expect(result.details).toContain(config.PARM_LIB);
    await expect(result.details).toContain(config.PROC_LIB);
    await expect(result.details).toContain(config.JCL_LIB);
    await expect(result.details).toContain(config.LOAD_LIB);
    await expect(result.details).toContain(config.AUTH_LOAD_LIB);
    await expect(result.details).toContain(config.AUTH_PLUGIN_LIB);
    });

  test('Verify MVS dataset was successfully created on z/OS.', async ({ page }) => {
   await installationPage.fillAllFields(config.DATASET_PREFIX,
	    config.PARM_LIB,
		config.PROC_LIB,
		config.JCL_LIB,
		config.LOAD_LIB,
		config.AUTH_LOAD_LIB,
		config.AUTH_PLUGIN_LIB
	  )
    await installationPage.clickInstallMvsDatasets();
   const result = await script.runCommand(`tso "LISTCAT"`);

   await expect(result.details).toContain(config.DATASET_PREFIX);
   await expect(result.details).toContain(config.PARM_LIB);
   await expect(result.details).toContain(config.JCL_LIB);
   await expect(result.details).toContain(config.LOAD_LIB);
   await expect(result.details).toContain(config.AUTH_LOAD_LIB);
   await expect(result.details).toContain(config.AUTH_PLUGIN_LIB);
   });

  test('Test Save and Close and Resume Progress', async ({page}) => {
    await installationPage.fillAllFields(config.DATASET_PREFIX,
	    config.PARM_LIB,
		config.PROC_LIB,
		config.JCL_LIB,
		config.LOAD_LIB,
		config.AUTH_LOAD_LIB,
		config.AUTH_PLUGIN_LIB
	  )
    await installationPage.clickSaveAndClose();
    await titlePage.clickOnResumeProgress();
	await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential();
    const prefix_value = await installationPage.getPrefixValue();
    const procLib_value = await installationPage.getProclibValue();
    const parmLib_value = await installationPage.getParmlibValue();
    const authLoadLib_value = await installationPage.getAuthLoadLibValue();
    const authPluginLib_value = await installationPage.getAuthPluginLibValue();
    expect(prefix_value).toBe(config.DATASET_PREFIX);
    expect(parmLib_value).toBe(config.PARM_LIB);
    expect(procLib_value).toBe(config.PROC_LIB);
    expect(authLoadLib_value).toBe(config.AUTH_LOAD_LIB);
    expect(authPluginLib_value).toBe(config.AUTH_PLUGIN_LIB);
  }) 
})
