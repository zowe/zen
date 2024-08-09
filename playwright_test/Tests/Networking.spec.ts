import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import SecurityPage from '../Pages/security.page';
import ApfAuthPage from '../Pages/ApfAuth.page';
import { prepareEnvironment } from '../prepare.js';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import InstallationPage from '../Pages/installation.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import PlanningPage from '../Pages/planning.page';
import NetworkingPage from '../Pages/networking.page';
import path from 'path';
import config from '../utils/config';

let page: Page;

let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
const APFAUTH_TITLE = 'APF Authorize Load Libraries';
const INSTALLATION_TITLE = 'Installation';


test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1); 
  }
});

test.describe('networkingTab', () => {
    let connectionPage: ConnectionPage;
    let titlePage : TitlePage;
    let securityPage : SecurityPage;
    let planningPage : PlanningPage;
    let networkingPage : NetworkingPage;
	let installationTypePage : InstallationTypePage;
	let installationPage : InstallationPage;

    test.beforeEach(async ({ page }) => {
      test.setTimeout(900000);
      electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
      page = await electronApp.firstWindow()
      connectionPage = new ConnectionPage(page);
      networkingPage = new NetworkingPage(page);
      titlePage = new TitlePage(page);
      planningPage = new PlanningPage(page);
	  installationPage = new InstallationPage(page);
	  installationTypePage = new InstallationTypePage(page);
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
      await installationTypePage.continueToUnpax()
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
    })

    test.afterEach(async () => {
      await electronApp.close()
    })

  test('test title of page', async ({ page }) => {
   const title = await networkingPage.returnTitleOfNetworkingPage();
   expect(title).toBe(NETWORKING_TITLE);
   })
   
  test('test all required fields', async ({ page }) => {
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
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
  })

  test('test deleting domain name field', async ({ page }) => {
    await networkingPage.delete_DomainNameField();
    const isDomainNameVisible = await networkingPage.domainName.isVisible();
    expect(isDomainNameVisible).toBeFalsy()
  })

  test('test add more domain name field', async ({ page }) => {
    await networkingPage.add_DomainNameField();
    await expect(networkingPage.domainName).toBeTruthy()
  })
  
  test('test add special char in other port no', async ({ page }) => {
    const originalValue = await networkingPage.get_metricServiceport_value();
    await networkingPage.fillMetricServicePort('*^%$^&');
    const newValue = await networkingPage.get_metricServiceport_value();
    expect(newValue).toBe(originalValue);
  })

  test('test enabled metric service debug', async ({ page }) => {
    const beforeClick = await networkingPage.isMetricsServiceDebugChecked();
	expect(beforeClick).toBe(false);
	await networkingPage.clickMetricsServiceDebug();
	const afterClick = await networkingPage.isMetricsServiceDebugChecked();
	expect(afterClick).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    await networkingPage.viewYaml()
    await expect(networkingPage.editor_title_element).toBeTruthy();
    await networkingPage.closeButton()
    })


  test('Test save and close', async ({ page }) => {
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await networkingPage.click_saveAndClose()
    await titlePage.clickOnResumeProgress();
	await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
	await connectionPage.SubmitValidateCredential();
    const title = await networkingPage.returnTitleOfNetworkingPage();
    expect(title).toBe(NETWORKING_TITLE);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
    })

  test('click Previous step button', async ({ page }) => {
     const is_prevButtonEnable = await networkingPage.isPreviousButtonEnable();
     expect(is_prevButtonEnable).toBe(true);
     const title = await networkingPage.returnTitleOfPrevPage();
     expect(title).toBe(INSTALLATION_TITLE);
    })

  test('Test continue to APF Auth button is disable', async ({ page }) => {
     const is_ContinueButtonDisable = await networkingPage.isContinueButtonDisable();
     expect(is_ContinueButtonDisable).toBe(true);
    })
	
  test('Test Skip networking button is enable', async ({ page }) => {
     const isLaunchConfigEnable = await networkingPage.is_skipNetworkingButtonEnable();
     expect(isLaunchConfigEnable).toBe(true);
    })

  test('Test yaml should be updated', async ({ page }) => {
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await networkingPage.viewYaml();
    await expect(networkingPage.editor_title_element).toBeTruthy();
    const yaml = await networkingPage.read_yaml();
    expect(yaml).toContain(config.DOMAIN_NAME);
    expect(yaml).toContain(config.EXTERNAL_PORT);
   })
});
