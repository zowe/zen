import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import { prepareEnvironment } from '../prepare';
import CommonPage from '../Pages/common.page';
import ConnectionPage from '../Pages/connection.page';
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
  let certificatesPage: CertificatesPage;
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
    apfAuthPage = new ApfAuthPage(page);
    securityPage = new SecurityPage(page);
    certificatesPage = new CertificatesPage(page);
    launchConfigPage = new LaunchConfigPage(page);
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
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
    commonPage.clickSkipStep()
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('test title of page', async ({ page }) => {
    const title = await commonPage.getPageTitle();
    expect(title).toBe(CONFPAGE_TITLE);
  })

  test('test all required fields', async ({ page }) => {
    expect(launchConfigPage.validation).toBeTruthy()
    expect(launchConfigPage.logLevel).toBeTruthy()
    expect(launchConfigPage.componentConfig).toBeTruthy()
  })

  test('test select validation level', async ({ page }) => {
    const values = ['STRICT', 'COMPONENT-COMPAT'];
    for (const value of values) {
      await launchConfigPage.fillvalues(value);
      const componentConfigValue = await launchConfigPage.get_validation_value();
      expect(componentConfigValue).toBe(value);
    }
  })

  test('test select log level', async ({ page }) => {
    const values = ['info', 'debug', 'trace'];
    for (const value of values) {
      await launchConfigPage.fillvalues_logLevel(value);
      const componentConfigValue = await launchConfigPage.get_logLevel_value();
      expect(componentConfigValue).toBe(value);
    }
  })

  test('test select component configure', async ({ page }) => {
    const values = ['warn', 'exit'];
    for (const value of values) {
      await launchConfigPage.fillvaluescomponentConfig(value);
      const componentConfigValue = await launchConfigPage.get_componentConfig_value();
      expect(componentConfigValue).toBe(value);
    }
  })

  test('Test view yaml button', async ({ page }) => {
    launchConfigPage.viewYaml()
    expect(launchConfigPage.editor_title_element).toBeTruthy();
    launchConfigPage.closeButton()
  })

  test('Test view job', async ({ page }) => {
    launchConfigPage.click_previewJob()
    expect(launchConfigPage.editor_title_element).toBeTruthy()
    launchConfigPage.closeButton()
  })

  test('Test save and close and Resume Progress', async ({ page }) => {
    launchConfigPage.fillvalues('STRICT')
    launchConfigPage.fillvalues_logLevel('info')
    launchConfigPage.fillvaluescomponentConfig('warn')
    commonPage.clickSaveAndClose()
    titlePage.clickOnResumeProgress();
    const title = await commonPage.getPageTitle();
    expect(title).toBe(CONFPAGE_TITLE);
    const Validation_Value = await launchConfigPage.get_validation_value();
    const LogLevel_Value = await launchConfigPage.get_logLevel_value();
    const ComponentConfig_Value = await launchConfigPage.get_componentConfig_value();
    expect(Validation_Value).toBe('STRICT');
    expect(LogLevel_Value).toBe('info');
    expect(ComponentConfig_Value).toBe('warn');
  })

  test('Test Previous step', async ({ page }) => {
    const is_prevButtonEnable = await commonPage.isPreviousButtonEnable();
    expect(is_prevButtonEnable).toBe(true);
    commonPage.clickPreviousStep()
    const title = await commonPage.getPageTitle();
    expect(title).toBe(VSAM_PAGE_TITLE);
  })

  test('Test continue to review button is disable', async ({ page }) => {
    const is_ContinueButtonDisable = await launchConfigPage.isContinueButtonDisable();
    expect(is_ContinueButtonDisable).toBe(true);
  })

  test('Test Skip launch config button is enable', async ({ page }) => {
    const isLaunchConfigEnable = await commonPage.isSkipButtonEnable();
    expect(isLaunchConfigEnable).toBe(true);
  })

  test('Test yaml should be updated', async ({ page }) => {
    await launchConfigPage.fillvalues('STRICT');
    await launchConfigPage.fillvalues_logLevel('info');
    await launchConfigPage.fillvaluescomponentConfig('warn');
    await launchConfigPage.viewYaml();
    expect(launchConfigPage.editor_title_element).toBeTruthy();
    const yaml = await launchConfigPage.read_yaml();
    expect(yaml).toContain('info');
    expect(yaml).toContain('STRICT');
    expect(yaml).toContain('warn');
  })

  test('Test keep mandatory field empty', async ({ page }) => {
    await launchConfigPage.fillvalues('');
    const Errormsg = await launchConfigPage.get_validation_error_msg();
    expect(Errormsg).toBe(VALIDATION_ERROR_MSG);
  })
});
