import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare';
import CommonPage from '../Pages/common.page';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import NetworkingPage from '../Pages/networking.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
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
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage;
  let commonPage: CommonPage

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    commonPage = new CommonPage(page)
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    unpaxPage = new UnpaxPage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    commonPage.clickSkipStep()
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
    installationPage.clickInstallMvsDatasets()
    installationPage.clickContinueToNetworkSetup()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('test title of page', async ({ page }) => {
    const title = await commonPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
  })

  test('test all required fields', async ({ page }) => {
    expect(networkingPage.externalDomains).toBeTruthy()
    expect(networkingPage.externalPort).toBeTruthy()
    expect(networkingPage.components).toBeTruthy()
    expect(networkingPage.metricService).toBeTruthy()
    expect(networkingPage.zss).toBeTruthy()
    expect(networkingPage.explorerUss).toBeTruthy()
    expect(networkingPage.jobsApi).toBeTruthy()
    expect(networkingPage.filesApi).toBeTruthy()
    expect(networkingPage.filesApiDebug).toBeTruthy()
    expect(networkingPage.explorerMvs).toBeTruthy()
    expect(networkingPage.cloudGateway).toBeTruthy()
    expect(networkingPage.explorerJes).toBeTruthy()
    expect(networkingPage.apiCatalog).toBeTruthy()
    expect(networkingPage.gateway).toBeTruthy()
    expect(networkingPage.appServer).toBeTruthy()
    expect(networkingPage.cachingService).toBeTruthy()
    expect(networkingPage.discovery).toBeTruthy()
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
    expect(networkingPage.domainName).toBeTruthy()
  })
  test('test add special char in other port no', async ({ page }) => {
    await networkingPage.fillMetricServicePort('*^%$^&');
    const port = await networkingPage.get_metricServiceport_value();
    expect(port).not.toBe('*^%$^&');
  })

  test('test enabled debug component', async ({ page }) => {
    await networkingPage.click_checkBox('1');
    await networkingPage.click_checkBox('2');
    const isEnabled = await networkingPage.isCheckboxCheckedAndBlue('2');
    const isDebug = await networkingPage.isCheckboxCheckedAndBlue('1');
    expect(isEnabled).toBe(true);
    expect(isDebug).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    networkingPage.viewYaml()
    expect(networkingPage.editor_title_element).toBeTruthy();
    networkingPage.closeButton()
  })

  test('Test view job', async ({ page }) => {
    networkingPage.click_previewJob()
    expect(networkingPage.editor_title_element).toBeTruthy()
    networkingPage.closeButton()
  })

  test('Test save and close', async ({ page }) => {
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    commonPage.clickSaveAndClose()
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    const title = await commonPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
  })


  test('Test Previous step', async ({ page }) => {
    const is_prevButtonEnable = await commonPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    commonPage.clickPreviousStep()
    const title = await commonPage.getPageTitle();
    expect(title).toBe(INSTALLATION_TITLE);
  })

  test('Test continue to APF Auth button is disable', async ({ page }) => {
    const is_ContinueButtonDisable = await networkingPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test Skip networking button is enable', async ({ page }) => {
    const isLaunchConfigEnable = await commonPage.isSkipButtonEnable();
    expect(isLaunchConfigEnable).toBe(true);
  })

  test('Test yaml should be updated', async ({ page }) => {
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await networkingPage.viewYaml();
    expect(networkingPage.editor_title_element).toBeTruthy();
    const yaml = await networkingPage.read_yaml();
    expect(yaml).toContain(config.DOMAIN_NAME);
    expect(yaml).toContain(config.EXTERNAL_PORT);
  })
});
