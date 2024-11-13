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
import { connectArgs, Script }  from '../setup';


let page: Page;

let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
const APFAUTH_TITLE = 'APF Authorize Load Libraries';
const INSTALLATION_TITLE = 'Installation';
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

  test('test external domain field & verify value updated on yaml', async ({ page }) => {
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
    const result = await script.runCommand(`cat ${process.env.ZOWE_ROOT_DIR}/zowe.yaml`); 
    await expect(result.details).toContain(config.EXTERNAL_PORT);
    await expect(result.details).toContain(config.DOMAIN_NAME);
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

  test('Test debug checkbox functionality across all components', async ({ page }) => {
	  const after_click_metric = await networkingPage.isCheckBoxChecked('metrics-service','debug');
    const after_click_gateway = await networkingPage.isCheckBoxChecked('gateway','debug');
    const after_click_zaas = await networkingPage.isCheckBoxChecked('zaas','debug');
    const after_click_apicatalog = await networkingPage.isCheckBoxChecked('api-catalog','debug');
    const after_click_discovery = await networkingPage.isCheckBoxChecked('discovery','debug');
    const after_click_caching = await networkingPage.isCheckBoxChecked('caching-service','debug');
    const after_click_appServer = await networkingPage.isCheckBoxChecked('app-server','debug');
    const after_click_zss = await networkingPage.isCheckBoxChecked('zss','tls');
    const after_click_jobsApi = await networkingPage.isCheckBoxChecked('jobs-api','debug');
    const after_click_filesApi = await networkingPage.isCheckBoxChecked('files-api','debug');
    const after_click_cloudGateway = await networkingPage.isCheckBoxChecked('cloud-gateway','debug');
	  expect(after_click_metric).toBe(true);
    expect(after_click_gateway).toBe(true);
    expect(after_click_zaas).toBe(true);
    expect(after_click_apicatalog).toBe(true);
    expect(after_click_discovery).toBe(true);
    expect(after_click_caching).toBe(true);
    expect(after_click_appServer).toBe(true);
    expect(after_click_zss).toBe(true);
    expect(after_click_jobsApi).toBe(true);
    expect(after_click_filesApi).toBe(true);
    expect(after_click_cloudGateway).toBe(true);
    })

    test('Test enabled checkbox functionality across all components', async ({ page }) => {
	  const after_click_metric = await networkingPage.isCheckBoxChecked('metrics-service','enabled');
    const after_click_gateway = await networkingPage.isCheckBoxChecked('gateway','enabled');
    const after_click_zaas = await networkingPage.isCheckBoxChecked('zaas','enabled');
    const after_click_apicatalog = await networkingPage.isCheckBoxChecked('api-catalog','enabled');
    const after_click_discovery = await networkingPage.isCheckBoxChecked('discovery','enabled');
    const after_click_caching = await networkingPage.isCheckBoxChecked('caching-service','enabled');
    const after_click_appServer = await networkingPage.isCheckBoxChecked('app-server','enabled');
    const after_click_zss = await networkingPage.isCheckBoxChecked('zss','enabled');
    const after_click_jobsApi = await networkingPage.isCheckBoxChecked('jobs-api','enabled');
    const after_click_filesApi = await networkingPage.isCheckBoxChecked('files-api','enabled');
    const after_click_cloudGateway = await networkingPage.isCheckBoxChecked('cloud-gateway','enabled');
    const after_click_explorerJes = await networkingPage.isCheckBoxChecked('explorer-jes','enabled');
    const after_click_explorerMvs = await networkingPage.isCheckBoxChecked('explorer-mvs','enabled');
    const after_click_explorerUss = await networkingPage.isCheckBoxChecked('explorer-uss','enabled');
	  expect(after_click_metric).toBe(true);
    expect(after_click_gateway).toBe(true);
    expect(after_click_zaas).toBe(true);
    expect(after_click_apicatalog).toBe(true);
    expect(after_click_discovery).toBe(true);
    expect(after_click_caching).toBe(true);
    expect(after_click_appServer).toBe(true);
    expect(after_click_zss).toBe(true);
    expect(after_click_jobsApi).toBe(true);
    expect(after_click_filesApi).toBe(true);
    expect(after_click_cloudGateway).toBe(true);
    expect(after_click_explorerJes).toBe(true);
    expect(after_click_explorerMvs).toBe(true);
    expect(after_click_explorerUss).toBe(true);
    })

  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(5000);
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
