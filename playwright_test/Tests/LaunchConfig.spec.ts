import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare';
import VsamPage from '../Pages/vsam.page';
import ConnectionPage from '../Pages/connection.page';
import StcsPage from '../Pages/stcs.page';
import LaunchConfigPage from '../Pages/launchConfig.page';
import ApfAuthPage from '../Pages/apfAuth.page';
import TitlePage from '../Pages/title.page';
import CertificatesPage from '../Pages/certificates.page';
import PlanningPage from '../Pages/planning.page';
import InstallationTypePage from '../Pages/installationType.page';
import UnpaxPage from '../Pages/unpax.page';
import InstallationPage from '../Pages/installation.page';
import NetworkingPage from '../Pages/networking.page';
import SecurityPage from '../Pages/security.page';
import config from '../utils/config'

let electronApp: ElectronApplication
const CONFPAGE_TITLE = 'Configuration'
const VSAM_PAGE_TITLE = 'Vsam'
const VALIDATION_ERROR_MSG = 'is a required property'

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('launchConfigTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;
  let apfAuthPage: ApfAuthPage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let unpaxPage: UnpaxPage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage;
  let securityPage: SecurityPage;
  let launchConfigPage: LaunchConfigPage;
  let stcsPage: StcsPage;
  let certificatesPage: CertificatesPage;
  let vsamPage: VsamPage;

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
    apfAuthPage = new ApfAuthPage(page);
    stcsPage = new StcsPage(page);
    vsamPage = new VsamPage(page);
    securityPage = new SecurityPage(page);
    certificatesPage = new CertificatesPage(page);
    launchConfigPage = new LaunchConfigPage(page);
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
    networkingPage.click_skipNetworking()
    apfAuthPage.click_skipApfAuth()
    securityPage.click_skipSecurity()
    stcsPage.click_skipStcs()
    certificatesPage.clickSkipCertificates()
    vsamPage.click_skipVsam()
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('test title of page', async ({ page }) => {
    await page.waitForTimeout(5000);
    const title = await launchConfigPage.getPageTitle();
    expect(title).toBe(CONFPAGE_TITLE);
  })

  test('test all required fields', async ({ page }) => {
    await page.waitForTimeout(5000);
    expect(launchConfigPage.validation).toBeTruthy()
    expect(launchConfigPage.logLevel).toBeTruthy()
    expect(launchConfigPage.componentConfig).toBeTruthy()
  })

  test('test select validation level', async ({ page }) => {
    await page.waitForTimeout(5000);

    const values = ['STRICT', 'COMPONENT-COMPAT'];

    for (const value of values) {
      await launchConfigPage.fillvalues(value);
      await page.waitForTimeout(5000);

      const componentConfigValue = await launchConfigPage.get_validation_value();
      await page.waitForTimeout(5000);
      expect(componentConfigValue).toBe(value);
    }
  })

  test('test select log level', async ({ page }) => {
    await page.waitForTimeout(5000);
    const values = ['info', 'debug', 'trace'];
    for (const value of values) {
      await launchConfigPage.fillvalues_logLevel(value);
      await page.waitForTimeout(5000);
      const componentConfigValue = await launchConfigPage.get_logLevel_value();
      expect(componentConfigValue).toBe(value);
    }
  })

  test('test select component configure', async ({ page }) => {
    await page.waitForTimeout(5000);
    const values = ['warn', 'exit'];
    for (const value of values) {
      await launchConfigPage.fillvaluescomponentConfig(value);
      await page.waitForTimeout(5000);
      const componentConfigValue = await launchConfigPage.get_componentConfig_value();
      expect(componentConfigValue).toBe(value);
    }
  })

  test('Test view yaml button', async ({ page }) => {
    await page.waitForTimeout(7000);
    launchConfigPage.viewYaml()
    await page.waitForTimeout(5000);
    expect(launchConfigPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    launchConfigPage.closeButton()
    await page.waitForTimeout(2000);
  })

  test('Test view job', async ({ page }) => {
    await page.waitForTimeout(5000);
    launchConfigPage.click_previewJob()
    await page.waitForTimeout(5000);
    expect(launchConfigPage.editor_title_element).toBeTruthy()
    launchConfigPage.closeButton()
    await page.waitForTimeout(5000);
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    await page.waitForTimeout(5000);
    launchConfigPage.fillvalues('STRICT')
    launchConfigPage.fillvalues_logLevel('info')
    launchConfigPage.fillvaluescomponentConfig('warn')
    await page.waitForTimeout(5000);
    launchConfigPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(15000);
    const title = await launchConfigPage.getPageTitle();
    expect(title).toBe(CONFPAGE_TITLE);
    const Validation_Value = await launchConfigPage.get_validation_value();
    const LogLevel_Value = await launchConfigPage.get_logLevel_value();
    const ComponentConfig_Value = await launchConfigPage.get_componentConfig_value();
    expect(Validation_Value).toBe('STRICT');
    expect(LogLevel_Value).toBe('info');
    expect(ComponentConfig_Value).toBe('warn');
  })

  test('click Previous step button', async ({ page }) => {
    await page.waitForTimeout(5000);
    await launchConfigPage.clickPreviousStep();
    const title = launchConfigPage.getPageTitle()
    expect(title).toBe(VSAM_PAGE_TITLE);
  })

  test('Test previous button is enabled', async ({ page }) => {
    const is_prevButtonEnable = await launchConfigPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test continue to review button is disable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const is_ContinueButtonDisable = await launchConfigPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test Skip launch config button is enable', async ({ page }) => {
    await page.waitForTimeout(2000);
    const isLaunchConfigEnable = await launchConfigPage.is_skipLaunchConfigButtonEnable();
    expect(isLaunchConfigEnable).toBe(true);
    await page.waitForTimeout(2000);
  })

  test('Test yaml should be updated', async ({ page }) => {
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues('STRICT');
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues_logLevel('info');
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvaluescomponentConfig('warn');
    await page.waitForTimeout(15000);
    await launchConfigPage.viewYaml();
    await page.waitForTimeout(10000);
    expect(launchConfigPage.editor_title_element).toBeTruthy();
    await page.waitForTimeout(5000);
    const yaml = await launchConfigPage.read_yaml();
    await page.waitForTimeout(5000);
    expect(yaml).toContain('info');
    expect(yaml).toContain('STRICT');
    expect(yaml).toContain('warn');
  })

  test('Test keep mandatory field empty', async ({ page }) => {
    await page.waitForTimeout(5000);
    await launchConfigPage.fillvalues('');
    await page.waitForTimeout(5000);
    const Errormsg = await launchConfigPage.get_validation_error_msg();
    expect(Errormsg).toBe(VALIDATION_ERROR_MSG);
  })
});
