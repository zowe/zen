import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page';
import ConnectionPage from '../Pages/connection.page';
import PlanningPage from '../Pages/planning.page';
import NetworkingPage from '../Pages/networking.page';
import VsamPage from '../Pages/vsam.page';
import StcsPage from '../Pages/stcs.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import ApfAuthPage from '../Pages/apfAuth.page';
import CertificatesPage from '../Pages/certificates.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import SecurityPage from '../Pages/security.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
const INSTALLATION_TITLE = 'Installation';

test.describe('networkingTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    unpaxPage = new UnpaxPage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(config.ZOWE_ROOT_DIR, config.ZOWE_WORKSPACE_DIR,
      config.ZOWE_EXTENSION_DIR, config.ZOWE_LOG_DIR, '1', config.JOB_NAME, config.JOB_PREFIX,
      config.JAVA_HOME, config.NODE_HOME, config.ZOSMF_HOST, config.ZOSMF_PORT, config.ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    await page.waitForTimeout(2000);
    unpaxPage.clickSkipUnpax()
    await page.waitForTimeout(5000);
    installationPage.fillInstallationPageDetails(config.DATASET_PREFIX, config.PROC_LIB, config.PARM_LIB,
      config.ZIS, config.JCL_LIB, config.LOAD_LIB, config.AUTH_LOAD_LIB, config.AUTH_PLUGIN_LIB)
    await page.waitForTimeout(10000)
    installationPage.clickInstallMvsDatasets()
    await page.waitForTimeout(50000);
    installationPage.clickContinueToNetworkSetup()
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('test title of page', async ({ page }) => {
    await page.waitForTimeout(5000);
    const title = await networkingPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
  })

  test('test all required fields', async ({ page }) => {
    await page.waitForTimeout(5000);
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
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
    await page.waitForTimeout(5000);
  })

  test('test deleting domain name field', async ({ page }) => {
    await networkingPage.delete_DomainNameField();
    await page.waitForTimeout(5000);
    const isDomainNameVisible = await networkingPage.domainName.isVisible();
    expect(isDomainNameVisible).toBeFalsy()
  })

  test('test add more domain name field', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.add_DomainNameField();
    await page.waitForTimeout(5000);
    expect(networkingPage.domainName).toBeTruthy()
  })

  test('test add special char in other port no', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillMetricServicePort('*^%$^&');
    await page.waitForTimeout(5000);
    const port = await networkingPage.get_metricServiceport_value();
    expect(port).not.toBe('*^%$^&');
  })

  test('test enabled debug component', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.click_checkBox('1');
    await networkingPage.click_checkBox('2');
    await page.waitForTimeout(10000);
    const isEnabled = await networkingPage.isCheckboxCheckedAndBlue('2');
    const isDebug = await networkingPage.isCheckboxCheckedAndBlue('1');
    expect(isEnabled).toBe(true);
    expect(isDebug).toBe(true);
  })

  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    networkingPage.viewYaml()
    await page.waitForTimeout(5000);
    expect(networkingPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    networkingPage.closeButton()
    await page.waitForTimeout(2000);
  })

  test('Test view job', async ({ page }) => {
    await page.waitForTimeout(5000);
    networkingPage.click_previewJob()
    await page.waitForTimeout(5000);
    expect(networkingPage.editor_title_element).toBeTruthy()
    networkingPage.closeButton()
    await page.waitForTimeout(5000);
  })

  test('Test save and close', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    networkingPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const title = await networkingPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(config.EXTERNAL_PORT);
    expect(domainName).toBe(config.DOMAIN_NAME);
    await page.waitForTimeout(5000);

  })

  test('click Previous step button', async ({ page }) => {
    await page.waitForTimeout(5000);
    const title = await networkingPage.click_PreviousStep();
    expect(title).toBe(INSTALLATION_TITLE);
  })

  test('Test previous button is enabled', async ({ page }) => {
    const is_prevButtonEnable = await networkingPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test continue to APF Auth button is disable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const is_ContinueButtonDisable = await networkingPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test Skip networking button is enable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const isLaunchConfigEnable = await networkingPage.is_skipNetworkingButtonEnable();
    expect(isLaunchConfigEnable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test yaml should be updated', async ({ page }) => {
    await page.waitForTimeout(5000);
    await networkingPage.fillexternal_domainvalues(config.DOMAIN_NAME, config.EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    await networkingPage.viewYaml();
    await page.waitForTimeout(10000);
    expect(networkingPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await networkingPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain(config.DOMAIN_NAME);
    expect(yaml).toContain(config.EXTERNAL_PORT);
  })
});
