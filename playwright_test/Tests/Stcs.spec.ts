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
import { runSSHCommand } from '../utils/sshUtils';


let electronApp: ElectronApplication
const STCS_TITLE = 'Stcs'
const SECURITY_TITLE = 'Security';
const CERTIFICATE_TITLE = 'Certificates'


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

   test('test title of page', async ({ page }) => {
   const title = await stcsPage.returnTitleOfStcsPage();
   expect(title).toBe(STCS_TITLE);
   })

   test('test all required fields', async ({ page }) => {
    await expect(stcsPage.zis).toBeTruthy()
    await expect(stcsPage.zowe).toBeTruthy()
    await expect(stcsPage.aux).toBeTruthy()
    await expect(stcsPage.dataset_proclib).toBeTruthy()
    })

   test('verify yaml on zos', async ({ page }) => {
    const command = `cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`;

    try {
        const yaml = await runSSHCommand(command);
        expect(yaml).toContain(SECURITY_AUX);
        expect(yaml).toContain(SECURITY_STC_ZOWE);
        expect(yaml).toContain(SECURITY_STC_ZIS);
    } catch (error) {
        console.error('Error executing command:', error.message);
    }
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

   test('click Previous step button', async ({ page }) => {
     const title = await stcsPage.returnTitleOfPrevPage();
     expect(title).toBe(SECURITY_TITLE);
   })
   test('Test previous button is enabled', async ({ page }) => {
     const is_prevButtonEnable = await stcsPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
    })

   test('Test Skip Stcs button is enable', async ({ page }) => {
     const isSkipStcsEnable = await stcsPage.is_skipStcsButtonEnable();
     expect(isSkipStcsEnable).toBe(true);
   })

   test('test click skip STCS button', async ({ page }) => {
     const certificate_title = await stcsPage.click_skipStcsButton();
     expect(certificate_title).toBe(CERTIFICATE_TITLE);

   })

   test('Test continue to certificate button is disable', async ({ page }) => {
     const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
    })

   test('Test yaml should be updated', async ({ page }) => {
    await stcsPage.viewYaml();
    await expect(stcsPage.editor_title_element).toBeTruthy();
    const yaml = await stcsPage.read_yaml();
    expect(yaml).toContain(SECURITY_AUX);
    expect(yaml).toContain(SECURITY_STC_ZOWE);
    expect(yaml).toContain(SECURITY_STC_ZIS);
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
     expect(ZoweValue).toBe(SECURITY_STC_ZOWE);
     expect(Zis_Value).toBe(SECURITY_STC_ZIS);
     expect(Aux_Value).toBe(SECURITY_AUX);
     expect(DatasetProclib_Value).toBe(PROC_LIB);
     })

   test('verify stcs applied successfully on zos', async ({ page }) => {
      await stcsPage.initializeSTC()
      const command = `tsocmd "LISTDS '${config.PROC_LIB}' MEMBERS"`;

      try {
          const yaml = await runSSHCommand(command);
          expect(yaml).toContain(SECURITY_AUX);
          expect(yaml).toContain(SECURITY_STC_ZOWE);
          expect(yaml).toContain(SECURITY_STC_ZIS);
      } catch (error) {
          console.error('Error executing command:', error.message);
      }
      });

   test('Test initialize stcs', async ({ page }) => {
     await stcsPage.initializeSTC()
     const isWriteConfig_check_visible = await stcsPage.isWriteConfigGreenCheckVisible();
     expect(isWriteConfig_check_visible).toBe(true);
     const isUploadConfig_check_visible = await stcsPage.isUploadConfigGreenCheckVisible();
     expect(isUploadConfig_check_visible).toBe(true);
     const isInitStcs_check_visible = await stcsPage.isInitSTCSGreenCheckVisible();
     expect(isInitStcs_check_visible).toBe(true);
     const is_GreenCheck_Visible = await stcsPage.isStatusChecked();
     expect(is_GreenCheck_Visible).toBe(false);
     })

   test('Test continue Button enabled after init stcs', async ({ page }) => {
     await stcsPage.initializeSTC()
     const is_ContinueButtonDisable = await stcsPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(false);
     })

})
