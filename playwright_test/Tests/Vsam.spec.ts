import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare.js';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import SecurityPage from '../Pages/security.page.ts'
import StcsPage from '../Pages/stcs.page.ts'
import config from '../utils/config';
import ApfAuthPage from '../Pages/ApfAuth.page';
import VsamPage from '../Pages/Vsam.page';
import { connectArgs, Script }  from '../setup';


let electronApp: ElectronApplication
const VSAM_TITLE = 'CachingService'
const CERTIFICATE_TITLE = 'Certificates';
const LAUNCHCONFIG_TITLE = 'Configuration'
const INVALID_ERRORMSG = 'must match pattern "^([A-Z$#@]){1}([A-Z0-9$#@-]){0,7}(.([A-Z$#@]){1}([A-Z0-9$#@-]){0,7}){0,11}$"'
const script = new Script()

test.beforeAll(async () => {
  test.setTimeout(800000); 
  try {
    await prepareEnvironment({ install: true, cleanup:true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('VsamPage', () => {
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

  test.beforeEach(async ({ page }) => {
    test.setTimeout(600000);
     electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
     page = await electronApp.firstWindow()
     connectionPage = new ConnectionPage(page);
     titlePage = new TitlePage(page);
     planningPage = new PlanningPage(page)
     apfAuthPage = new ApfAuthPage(page);
	   installationTypePage = new InstallationTypePage(page);
	   installationPage = new InstallationPage(page);
	   networkingPage = new NetworkingPage(page);
	   securityPage = new SecurityPage(page);
	   stcsPage = new StcsPage(page);
	   vsamPage = new VsamPage(page);
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
    await vsamPage.movetoVsamPage();
  });

  test.afterEach(async () => {
    await electronApp.close()
 })

  test('test title and required fields of page', async ({ page }) => {
   const title = await vsamPage.returnTitleOfVsamPage();
   expect(title).toBe(VSAM_TITLE);
   await expect(vsamPage.storage_mode).toBeTruthy()
   await expect(vsamPage.Mode).toBeTruthy()
   await expect(vsamPage.volume).toBeTruthy()
   await expect(vsamPage.StorageClass).toBeTruthy()
   await expect(vsamPage.VsamDatasetName).toBeTruthy()
 })
 
   test('test with invalid vsam dataset name ', async ({ page }) => {
   await vsamPage.fillVsamDatasetName('%^%%&^')
   const errorMsg = await vsamPage.invalidInput_ErrorMsg();
   expect(errorMsg).toBe(INVALID_ERRORMSG);

 })


 test('Test view yaml button', async ({ page }) => {
   await vsamPage.viewYaml()
   await expect(vsamPage.editor_title_element).toBeTruthy();
   await vsamPage.closeButton()
 })

 test('Test view job', async ({ page }) => {
  await vsamPage.click_previewJob()
  await expect(vsamPage.editor_title_element).toBeTruthy()
  await vsamPage.closeButton()
 })

 test('click and verify Previous step button is enabled', async ({ page }) => {
  const is_prevButtonEnable = await vsamPage.isPreviousButtonEnable();
  expect(is_prevButtonEnable).toBe(true);
  const title = await vsamPage.returnTitleOfPrevPage();
  expect(title).toBe(CERTIFICATE_TITLE);
 })

 test('Click and verify Skip Vsam button is enabled', async ({ page }) => {
  const isSkipStcsEnable = await vsamPage.is_skipVsamButtonEnable();
  expect(isSkipStcsEnable).toBe(true);
  const reviewPage_title = await vsamPage.click_skipVsamButton();
  expect(reviewPage_title).toBe(LAUNCHCONFIG_TITLE);
})


 test('Test continue to lauch button is disable', async ({ page }) => {
  const is_ContinueButtonDisable = await vsamPage.isContinueButtonDisable();
  expect(is_ContinueButtonDisable).toBe(true);
 })


 test('Test fill vsam details RLS mode and verify all green checks', async ({ page }) => {
  await vsamPage.select_storageMode('VSAM');
  await vsamPage.fillVsamDetails('RLS',config.VOLUME,config.STORAGECLASS, config.VSAM_DATASET_NAME)
  await vsamPage.initializeVSAM();
  const isWriteConfig_check_visible = await vsamPage.isWriteConfigGreenCheckVisible();
  expect(isWriteConfig_check_visible).toBe(true);
  const isUploadConfig_check_visible = await vsamPage.isUploadConfigGreenCheckVisible();
  expect(isUploadConfig_check_visible).toBe(true);
  const isInitStcs_check_visible = await vsamPage.isInitVSAMGreenCheckVisible();
  expect(isInitStcs_check_visible).toBe(true);
  const is_GreenCheck_Visible = await vsamPage.isStatusChecked();
  expect(is_GreenCheck_Visible).toBe(false);

 })

 test('Test NONRLS YAML Update on z/OS After Init', async ({ page }) => {
   await vsamPage.select_storageMode('VSAM');
   await vsamPage.fillVsamDetails('NONRLS',config.VOLUME,'', config.VSAM_DATASET_NAME)
   await vsamPage.initializeVSAM();
   const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`);
   await expect(result.details).toContain('NONRLS');
   await expect(result.details).toContain(config.VOLUME);
   await expect(result.details).toContain(config.VSAM_DATASET_NAME);
   
   const isWriteConfig_check_visible = await vsamPage.isWriteConfigGreenCheckVisible();
   expect(isWriteConfig_check_visible).toBe(true);
   const isUploadConfig_check_visible = await vsamPage.isUploadConfigGreenCheckVisible();
   expect(isUploadConfig_check_visible).toBe(true);
   const isInitStcs_check_visible = await vsamPage.isInitVSAMGreenCheckVisible();
   expect(isInitStcs_check_visible).toBe(true);
   });

 test('Verify VSAM dataset was successfully created on z/OS.', async ({ page }) => {
   await vsamPage.select_storageMode('VSAM');
   await vsamPage.fillVsamDetails('RLS',config.VOLUME,'', config.VSAM_DATASET_NAME)
   await vsamPage.initializeVSAM();
   const result = await script.runCommand(`tso "LISTCAT"`);

   await expect(result.details).toContain(config.VSAM_DATASET_NAME);
  
   });


 test('Test save and close and Resume Progress', async ({ page }) => {
    await vsamPage.select_storageMode('VSAM');
    await vsamPage.fillVsamDetails('NONRLS',config.VOLUME,'', config.VSAM_DATASET_NAME)
    await vsamPage.click_saveAndClose();
    await titlePage.clickOnResumeProgress();
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential()
    const title = await vsamPage.returnTitleOfVsamPage();
    expect(title).toBe(VSAM_TITLE);
    const vsamMode = await vsamPage.get_VsamMode_value();
    const vsamVolume = await vsamPage.get_VsamVolume_value();
    const storageClass = await vsamPage.get_StorageClass_value();
    const vsamDatasetName = await vsamPage.get_VsamDatasetName_value();
    expect(vsamMode).toBe('NONRLS');
    expect(vsamVolume).toBe(config.VOLUME);
    expect(storageClass).toBe('');
    expect(vsamDatasetName).toBe(config.VSAM_DATASET_NAME);
   })
 

    test('Test skip vsam page if Infinispan storage Mode', async ({ page }) => {
     await vsamPage.select_storageMode('INFINISPAN');
     const is_ContinueButtonDisable = await vsamPage.isContinueButtonEnabled();
     expect(is_ContinueButtonDisable).toBe(true);
     const is_InitVsam_Button_Visible = await vsamPage.is_initVsamButtonVisible();
     expect(is_InitVsam_Button_Visible).toBe(false)
     const isVolumeVisible = await vsamPage.isElement_Visible(vsamPage.volume);
     await expect(isVolumeVisible).toBeFalsy();
     const isModeVisible = await vsamPage.isElement_Visible(vsamPage.mode);
     await expect(isModeVisible).toBeFalsy();
     const isStorageClassVisible = await vsamPage.isElement_Visible(vsamPage.StorageClass);
     await expect(isStorageClassVisible).toBeFalsy();
     const isVsamdatasetnameVisible = await vsamPage.isElement_Visible(vsamPage.VsamDatasetName);
     await expect(isVsamdatasetnameVisible).toBeFalsy();
     await expect(vsamPage.storage_mode).toBeTruthy()
     
     
    })
})
