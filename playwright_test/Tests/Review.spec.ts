import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import ApfAuthPage from '../Pages/ApfAuth.page.ts';
import SecurityPage from '../Pages/security.page.ts';
import CertificatesPage from '../Pages/certificates.page.ts';
import LaunchConfigPage from '../Pages/launchConfig.page';
import ReviewPage from '../Pages/review.page.ts';
import config from '../utils/config.ts';
import { prepareEnvironment } from '../prepare.js';

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const PLANNING_PAGE_TITLE = 'Before you start';
const INSTALLATION_TYPE_PAGE_TITLE = 'Installation Type';
const INSTALLATION_PAGE_TITLE = 'Installation';
const NETWORKING_PAGE_TITLE = 'Networking';
const APF_AUTH_PAGE_TITLE = 'APF Authorize Load Libraries';
const SECURITY_PAGE_TITLE = 'Security';
const STCS_PAGE_TITLE = 'Stcs';
const CERTIFICATES_PAGE_TITLE = 'Certificates';
const CACHING_SERVICE_PAGE_TITLE = 'CachingService';
const LAUNCH_CONFIGURATION_PAGE_TITLE = 'Configuration';
const REVIEW_PAGE_TITLE = 'Review Installation';

test.describe('ReviewTab', () => {
  let titlePage: TitlePage;
  let connectionPage: ConnectionPage;
  let planningPage: PlanningPage;
  let installationTypePage: InstallationTypePage;
  let installationPage: InstallationPage;
  let networkingPage: NetworkingPage
  let apfAuthPage: ApfAuthPage
  let securityPage: SecurityPage
  let certificatesPage: CertificatesPage;
  let launchConfigPage: LaunchConfigPage;
  let reviewPage: ReviewPage;

  test.beforeAll(async () => {
    try {
      await prepareEnvironment({ install: true, remove: false });
    } catch (error) {
      console.error('Error during environment preparation:', error);
      process.exit(1);
    }
  });

    test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    titlePage = new TitlePage(page);
    connectionPage = new ConnectionPage(page);
    planningPage = new PlanningPage(page);
    installationTypePage = new InstallationTypePage(page);
    installationPage = new InstallationPage(page);
    networkingPage = new NetworkingPage(page);
    apfAuthPage = new ApfAuthPage(page);
    securityPage = new SecurityPage(page);
    certificatesPage = new CertificatesPage(page);
    launchConfigPage = new LaunchConfigPage(page);
    reviewPage = new ReviewPage(page);
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
    await installationTypePage.continueToUnpax()
    await installationTypePage.skipUnpax()
    await page.waitForTimeout(5000);
    reviewPage.clickReviewInstallationTab();
    await page.waitForTimeout(5000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test Title and all required fields on the Review page', async ({ page }) => {
    const review_title = await reviewPage.getReviewPageTitle();
    expect(review_title).toBe(REVIEW_PAGE_TITLE);
    expect(reviewPage.connectionTab).toBeTruthy()
    expect(reviewPage.planningTab).toBeTruthy()
    expect(reviewPage.installationTypeTab).toBeTruthy()
    expect(reviewPage.installationTab).toBeTruthy()
    expect(reviewPage.networkingTab).toBeTruthy()
    expect(reviewPage.apfAuthTab).toBeTruthy()
    expect(reviewPage.securityTab).toBeTruthy()
    expect(reviewPage.certificatesTab).toBeTruthy()
    expect(reviewPage.launchConfigTab).toBeTruthy()
    expect(reviewPage.viewEditYaml).toBeTruthy()
    expect(reviewPage.viewJobOutput).toBeTruthy()
    expect(reviewPage.saveAndClose).toBeTruthy()
    expect(reviewPage.previousStep).toBeTruthy()
    const is_Finish_Button_disable = await reviewPage.isFinishInstallationDisabled();
    expect(is_Finish_Button_disable).toBe(true);
  })

  test('Test Navigation to Connection page', async ({ page }) => {
    reviewPage.clickConnectionTab();
    await page.waitForTimeout(1000);
    const connection_title = await connectionPage.getConnectionPageTitle();
    expect(connection_title).toBe(CONNECTION_PAGE_TITLE);
  })

  test('Test Navigation to Planning page', async ({ page }) => {
    reviewPage.clickPlanningTab();
    await page.waitForTimeout(1000);
    const planning_title = await planningPage.getPlanningPageTitle();
    expect(planning_title).toBe(PLANNING_PAGE_TITLE);
  })

  test('Test Navigation to Installation Type page', async ({ page }) => {
    reviewPage.clickInstallationTypeTab();
    await page.waitForTimeout(1000);
    const installation_type_title = await installationTypePage.getInstallationTypePageTitle();
    expect(installation_type_title).toBe(INSTALLATION_TYPE_PAGE_TITLE);
  })

  test('Test Navigation to Installation page', async ({ page }) => {
    reviewPage.clickInstallationTab();
    await page.waitForTimeout(1000);
    const installation_title = await installationPage.getInstallationPageTitle();
    expect(installation_title).toBe(INSTALLATION_PAGE_TITLE);
  })

  test('Test Navigation to Networking page', async ({ page }) => {
    reviewPage.clickNetworkingTab();
    await page.waitForTimeout(1000);
    const networking_title = await networkingPage.returnTitleOfNetworkingPage();
    expect(networking_title).toBe(NETWORKING_PAGE_TITLE);
  })

  test('Test Navigation to Apf Auth page', async ({ page }) => {
    reviewPage.clickApfAuthTab();
    await page.waitForTimeout(1000);
    const apfAuth_title = await apfAuthPage.returnTitleOfApfAuthPage();
    expect(apfAuth_title).toBe(APF_AUTH_PAGE_TITLE);
  })

  test('Test Navigation to Security page', async ({ page }) => {
    reviewPage.clickSecurityTab();
    await page.waitForTimeout(1000);
    const security_title = await securityPage.getSecurityPageTitle();
    expect(security_title).toBe(SECURITY_PAGE_TITLE);
  })

  test('Test Navigation to Stcs page', async ({ page }) => {
    reviewPage.clickStcsTab();
    await page.waitForTimeout(1000);
    const stcs_title = await securityPage.getSecurityPageTitle();
    expect(stcs_title).toBe(STCS_PAGE_TITLE);
  })

  test('Test Navigation to Certificates page', async ({ page }) => {
    reviewPage.clickCertificatesTab();
    await page.waitForTimeout(1000);
    const certificates_title = await certificatesPage.getCertificatesPageTitle();
    expect(certificates_title).toBe(CERTIFICATES_PAGE_TITLE);
  })

  test('Test Navigation to Caching Service page', async ({ page }) => {
    reviewPage.clickCachingServiceTab();
    await page.waitForTimeout(1000);
    const cachingService_title = await securityPage.getSecurityPageTitle();
    expect(cachingService_title).toBe(CACHING_SERVICE_PAGE_TITLE);
  })

  test('Test Navigation to Launch Config page', async ({ page }) => {
    reviewPage.clickLaunchConfigTab();
    await page.waitForTimeout(1000);
    const launchConfig_title = await launchConfigPage.getLaunchConfigurationPageTitle();
    expect(launchConfig_title).toBe(LAUNCH_CONFIGURATION_PAGE_TITLE);
  })

  test('Test Successful and Pending Operations Tabs', async ({ page }) => {
    expect(reviewPage.connectionTabSuccessfulIcon).toBeTruthy()
    expect(reviewPage.planningTabSuccessfulIcon).toBeTruthy()
    expect(reviewPage.installationTypeTabSuccessfulIcon).toBeTruthy()
    expect(reviewPage.installationTabPendingIcon).toBeTruthy()
    expect(reviewPage.networkingTabPendingIcon).toBeTruthy()
    expect(reviewPage.apfAuthTabPendingIcon).toBeTruthy()
    expect(reviewPage.securityTabPendingIcon).toBeTruthy()
    expect(reviewPage.certificatesTabPendingIcon).toBeTruthy()
    expect(reviewPage.launchConfigTabPendingIcon).toBeTruthy()
  })

  test('Test Finish Installation and Test Previous step', async ({ page }) => {
    const is_Finish_Button_enable = await reviewPage.isFinishInstallationEnabled();
    expect(is_Finish_Button_enable).toBe(false);
    reviewPage.clickPreviousStep();
    await page.waitForTimeout(2000);
    const title = await launchConfigPage.getLaunchConfigurationPageTitle();
    expect(title).toBe(INSTALLATION_PAGE_TITLE);
  })

  test('Test View Yaml Button', async ({ page }) => {
    reviewPage.clickViewEditYaml()
    await page.waitForTimeout(2000);
    expect(reviewPage.editorTitleElement).toBeTruthy();
    reviewPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test View Job Output', async ({ page }) => {
    reviewPage.clickViewJobOutput()
    await page.waitForTimeout(2000);
    expect(reviewPage.editorTitleElement).toBeTruthy();
    reviewPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test Save and Close and Resume Progress', async ({ page }) => {
    reviewPage.clickSaveAndClose();
    await page.waitForTimeout(2000);
    titlePage.clickOnResumeProgress();
    connectionPage.fillPassword(config.SSH_PASSWD)
    await connectionPage.SubmitValidateCredential();
    await page.waitForTimeout(5000);
    const title = await reviewPage.getReviewPageTitle();
    expect(title).toBe(REVIEW_PAGE_TITLE);
  })
})
