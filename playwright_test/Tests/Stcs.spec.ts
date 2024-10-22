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
import { connectArgs, Script }  from '../setup';


let electronApp: ElectronApplication
const STCS_TITLE = 'Stcs'
const SECURITY_TITLE = 'Security';
const CERTIFICATE_TITLE = 'Certificates'
const script = new Script();

test.beforeAll(async () => {
  test.setTimeout(600000); 
  try {
    await prepareEnvironment({ install: true, cleanup:true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('StcsTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage : TitlePage;
  let installationTypePage : InstallationTypePage;
  let planningPage : PlanningPage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage
  let stcsPage : StcsPage
  let securityPage : SecurityPage
  let apfAuthPage : ApfAuthPage;



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
	  await page.waitForTimeout(2000);
    await installationPage.clickContinueToNetworkSetup();
	  await networkingPage.click_skipNetworking()
    await apfAuthPage.click_skipApfAuth()
    await page.waitForTimeout(20000);
    await securityPage.fillSecurityDetails('RACF',
	    config.SECURITY_ADMIN,
		config.SECURITY_STC,
		config.SECURITY_SYSPROG,
		config.SECURITY_USER_ZIS,
		config.SECURITY_USER_ZOWE,
		config.SECURITY_AUX,
		config.SECURITY_STC_ZOWE,
		config.SECURITY_STC_ZIS
	  )
    await stcsPage.movetoStcsPage()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })


   test('test title and required fields of page', async ({ page }) => {
     const title = await stcsPage.returnTitleOfStcsPage();
     expect(title).toBe(STCS_TITLE);
     await expect(stcsPage.zis).toBeTruthy()
     await expect(stcsPage.zowe).toBeTruthy()
     await expect(stcsPage.aux).toBeTruthy()
     await expect(stcsPage.dataset_proclib).toBeTruthy()
   })

   test('test values match with previous step', async ({ page }) => {
     const ZoweValue = await stcsPage.get_zowe_value();
     const Zis_Value = await stcsPage.get_zis_value();
     const Aux_Value = await stcsPage.get_aux_value();
     await stcsPage.returnTitleOfPrevPage();
     const aux_value = await securityPage.get_aux_value();
     const stcZis_value = await securityPage.get_stc_zis_value();
     const stcZowe_value = await securityPage.get_stc_zowe_value();
     console.log(stcZowe_value,stcZis_value,aux_value)

     expect(ZoweValue).toBe(stcZowe_value);
     expect(stcZis_value).toBe(Zis_Value);
     expect(Aux_Value).toBe(aux_value);
 })
   test('verify yaml updated on zos correctly', async ({ page }) => {
    await stcsPage.initializeSTC()
    const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`); 
    await expect(result.details).toContain(config.SECURITY_AUX);
    await expect(result.details).toContain(config.SECURITY_STC_ZOWE);
    await expect(result.details).toContain(config.SECURITY_STC_ZIS);
    });


   test('Test view yaml button', async ({ page }) => {
     await stcsPage.viewYaml()
     await expect(stcsPage.editor_title_element).toBeTruthy();
     await stcsPage.closeButton()
    })

   test('Test view job', async ({ page }) => {
     await stcsPage.click_previewJob()
     await expect(stcsPage.editor_title_element).toBeTruthy()
     await stcsPage.closeButton()
    })

   test('test Previous step button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await stcsPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     const title = await stcsPage.returnTitleOfPrevPage();
     expect(title).toBe(SECURITY_TITLE);
   })

   test('Test Skip Stcs button is enable', async ({ page }) => {
     const isSkipStcsEnable = await stcsPage.is_skipStcsButtonEnable();
     expect(isSkipStcsEnable).toBe(true);
     const certificate_title = await stcsPage.click_skipStcsButton();
     expect(certificate_title).toBe(CERTIFICATE_TITLE);
   })


   test('Test continue to certificate button is disable', async ({ page }) => {
     const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
     await expect(is_ContinueButtonDisable).toBe(true);
    })

   test('Test Resume Progress', async ({ page }) => {
     await stcsPage.click_saveAndClose()
     await titlePage.clickOnResumeProgress()
	   await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
     await connectionPage.SubmitValidateCredential()
     const title = await stcsPage.returnTitleOfStcsPage();
     expect(title).toBe(STCS_TITLE);
     const ZoweValue = await stcsPage.get_zowe_value();
     const Zis_Value = await stcsPage.get_zis_value();
     const Aux_Value = await stcsPage.get_aux_value();
     const DatasetProclib_Value = await stcsPage.get_datasetProclib_value();
     expect(ZoweValue).toBe(config.SECURITY_STC_ZOWE);
     expect(Aux_Value).toBe(config.SECURITY_AUX);
     expect(Zis_Value).toBe(config.SECURITY_STC_ZIS);
     expect(DatasetProclib_Value).toBe(config.PROC_LIB);
     })

   test('verify stcs applied successfully on zos after initialization', async ({ page }) => {
      await stcsPage.initializeSTC()
      const result = await script.runCommand(`tsocmd "LISTDS '${config.PROC_LIB}' MEMBERS"`);
      await expect(result.details).toContain(config.SECURITY_AUX);
      await expect(result.details).toContain(config.SECURITY_STC_ZOWE);
      await expect(result.details).toContain(config.SECURITY_STC_ZIS);
    
    // verify all checks are sucessfully checked
      const isWriteConfig_check_visible = await stcsPage.isWriteConfigGreenCheckVisible();
      expect(isWriteConfig_check_visible).toBe(true);
      const isUploadConfig_check_visible = await stcsPage.isUploadConfigGreenCheckVisible();
      expect(isUploadConfig_check_visible).toBe(true);
      const isInitStcs_check_visible = await stcsPage.isInitSTCSGreenCheckVisible();
      expect(isInitStcs_check_visible).toBe(true);
      const is_GreenCheck_Visible = await stcsPage.isStatusChecked();
      expect(is_GreenCheck_Visible).toBe(false);
    //verify continue Button enabled after init stcs//
      const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
      expect(is_ContinueButtonDisable).toBe(false);
      });

})
