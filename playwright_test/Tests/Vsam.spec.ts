import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
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
import { runSSHCommand } from '../utils/sshUtils';


let electronApp: ElectronApplication
const VSAM_TITLE = 'Vsam'
const CERTIFICATE_TITLE = 'Certificates';
const LAUNCHCONFIG_TITLE = 'Configuration'
const INVALID_ERRORMSG = 'Invalid input. Please enter a valid VSAM dataset name.'

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
		'1',
		config.JOB_NAME,
		config.JOB_PREFIX,
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


  test('test title of page', async ({ page }) => {
    const title = await vsamPage.returnTitleOfVsamPage();
    expect(title).toBe(VSAM_TITLE);
  })


  test('test with invalid vsam dataset name ', async ({ page }) => {
    await vsamPage.fillVsamDatasetName('%^%%&^')
    const errorMsg = await vsamPage.invalidInput_ErrorMsg();
    expect(errorMsg).toBe(INVALID_ERRORMSG);

  })

  test('test all required fields', async ({ page }) => {
   await expect(vsamPage.mode).toBeTruthy()
   await expect(vsamPage.volume).toBeTruthy()
   await expect(vsamPage.StorageClass).toBeTruthy()
   await expect(vsamPage.VsamDatasetName).toBeTruthy()
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

  test('click Previous step button', async ({ page }) => {
   const title = await vsamPage.returnTitleOfPrevPage();
   expect(title).toBe(CERTIFICATE_TITLE);
  })

  test('Test previous button is enabled', async ({ page }) => {
    const is_prevButtonEnable = await vsamPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
  })

  test('Test Skip Vsam button is enable', async ({ page }) => {
   const isSkipStcsEnable = await vsamPage.is_skipVsamButtonEnable();
   expect(isSkipStcsEnable).toBe(true);
 })

  test('Test click skip VSAM button', async ({ page }) => {
   const reviewPage_title = await vsamPage.click_skipVsamButton();
   expect(reviewPage_title).toBe(LAUNCHCONFIG_TITLE);
 })

  test('Test continue to lauch button is disable', async ({ page }) => {
   const is_ContinueButtonDisable = await vsamPage.isContinueButtonDisable();
   expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test fill vsam details NONRLS mode', async ({ page }) => {
   await vsamPage.fillVsamDetails(config.mode,config.volume,'', config.vsamDatasetName)
   await vsamPage.initializeVSAM();
   const isWriteConfig_check_visible = await vsamPage.isWriteConfigGreenCheckVisible();
   expect(isWriteConfig_check_visible).toBe(true);
   const isUploadConfig_check_visible = await vsamPage.isUploadConfigGreenCheckVisible();
   expect(isUploadConfig_check_visible).toBe(true);
   const isInitStcs_check_visible = await vsamPage.isInitVSAMGreenCheckVisible();
   expect(isInitStcs_check_visible).toBe(true);

  })

  test('Test fill vsam details RLS mode and verify all green checks', async ({ page }) => {
   await vsamPage.fillVsamDetails(config.mode,config.volume,config.StorageClass, config.vsamDatasetName)
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

  test('verify yaml updated successfully on zos', async ({ page }) => {
    await vsamPage.fillVsamDetails(config.mode,config.volume,'', config.vsamDatasetName)
    await vsamPage.initializeVSAM();
    const command = `cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`;
    try {
        const yaml = await runSSHCommand(command);
        expect(yaml).toContain(config.mode);
        expect(yaml).toContain(config.volume);
        expect(yaml).toContain(config.vsamDatasetName);
    } catch (error) {
        console.error('Error executing command:', error.message);
    }
    });

  test('verify stcs applied successfully on zos', async ({ page }) => {
    await vsamPage.fillVsamDetails(config.mode,config.volume,'', config.vsamDatasetName)
    await vsamPage.initializeVSAM();
    const command = `tso "LISTCAT"`;

    try {
        const yaml = await runSSHCommand(command);
        expect(yaml).toContain(config.vsamDatasetName);
    } catch (error) {
        console.error('Error executing command:', error.message);
    }
    });

  test('Test save and close and Resume Progress', async ({ page }) => {
     await vsamPage.fillVsamDetails(config.mode,config.volume,'', config.vsamDatasetName)
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
     expect(vsamMode).toBe(config.mode);
     expect(vsamVolume).toBe(config.volume);
     expect(storageClass).toBe('');
     expect(vsamDatasetName).toBe(config.vsamDatasetName);
    })
})
