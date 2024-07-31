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
import InstallationTypePage from '../Pages/installationType.page.js';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page.js';
import SecurityPage from '../Pages/security.page';

let electronApp: ElectronApplication
const NETWORKING_TITLE = 'Networking';
const INSTALLATION_TITLE = 'Installation';
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const EXTERNAL_PORT = process.env.EXTERNAL_PORT;
const ZOWE_ROOT_DIR = process.env.ZOWE_ROOT_DIR;
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD = process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR = process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR = process.env.ZOWE_LOG_DIR;
const ZOWE_WORKSPACE_DIR = process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME = process.env.JOB_NAME;
const JOB_PREFIX = process.env.JOB_PREFIX;
const JAVA_HOME = process.env.JAVA_HOME;
const NODE_HOME = process.env.NODE_HOME;
const ZOSMF_HOST = process.env.ZOSMF_HOST;
const ZOSMF_PORT = process.env.ZOSMF_PORT;
const ZOSMF_APP_ID = process.env.ZOSMF_APP_ID;
const DATASET_PREFIX = process.env.DATASET_PREFIX;
const PROC_LIB = process.env.PROC_LIB;
const PARM_LIB = process.env.PARM_LIB;
const ZIS = process.env.SECURITY_STC_ZIS;
const JCL_LIB = process.env.JCL_LIB;
const LOAD_LIB = process.env.LOAD_LIB;
const AUTH_LOAD_LIB = process.env.AUTH_LOAD_LIB;
const AUTH_PLUGIN_LIB = process.env.AUTH_PLUGIN_LIB;

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
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    planningPage.insertValidateJobStatement()
    await page.waitForTimeout(20000);
    planningPage.validatePlanningStageLocations(ZOWE_ROOT_DIR, ZOWE_WORKSPACE_DIR, ZOWE_EXTENSION_DIR, ZOWE_LOG_DIR, '1',
      JOB_NAME, JOB_PREFIX, JAVA_HOME, NODE_HOME, ZOSMF_HOST, ZOSMF_PORT, ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    installationTypePage.selectSmpe()
    installationTypePage.clickContinueToUnpax()
    await page.waitForTimeout(2000);
    unpaxPage.clickSkipUnpax()
    await page.waitForTimeout(5000);
    installationPage.fillInstallationPageDetails(DATASET_PREFIX, PROC_LIB, PARM_LIB, ZIS, JCL_LIB, LOAD_LIB,
      AUTH_LOAD_LIB, AUTH_PLUGIN_LIB)
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
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME, EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(EXTERNAL_PORT);
    expect(domainName).toBe(DOMAIN_NAME);
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
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME, EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    networkingPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillpassword(SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    const title = await networkingPage.getPageTitle();
    expect(title).toBe(NETWORKING_TITLE);
    const port = await networkingPage.get_externalDomainport_value();
    const domainName = await networkingPage.get_externalDomainName_value();
    expect(port).toBe(EXTERNAL_PORT);
    expect(domainName).toBe(DOMAIN_NAME);
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
    await networkingPage.fillexternal_domainvalues(DOMAIN_NAME, EXTERNAL_PORT);
    await page.waitForTimeout(5000);
    await networkingPage.viewYaml();
    await page.waitForTimeout(10000);
    expect(networkingPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await networkingPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain(DOMAIN_NAME);
    expect(yaml).toContain(EXTERNAL_PORT);
  })
});
