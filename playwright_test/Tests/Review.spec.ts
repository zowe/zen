import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import TitlePage from '../Pages/title.page.ts';
import ConnectionPage from '../Pages/connection.page.ts';
import PlanningPage from '../Pages/planning.page.ts';
import InstallationTypePage from '../Pages/installationType.page.ts';
import InstallationPage from '../Pages/installation.page.ts';
import NetworkingPage from '../Pages/networking.page.ts';
import ApfAuthPage from '../Pages/ApfAuth.page';
import SecurityPage from '../Pages/security.page';
import CertificatesPage from '../Pages/certificates.page.ts';
import LaunchConfigPage from '../Pages/launchConfig.page';
import ReviewPage from '../Pages/review.page.ts';

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection';
const PLANNING_PAGE_TITLE = 'Before you start';
const INSTALLATION_TYPE_PAGE_TITLE = 'Installation Type';
const INSTALLATION_PAGE_TITLE = 'Installation';
const NETWORKING_PAGE_TITLE = 'Networking';
const APF_AUTH_PAGE_TITLE = 'APF Authorize Load Libraries';
const SECURITY_PAGE_TITLE = 'Security';
const CERTIFICATES_PAGE_TITLE = 'Certificates';
const LAUNCH_CONFIGURATION_PAGE_TITLE = 'Configuration';
const REVIEW_PAGE_TITLE = 'Review Installation';
const FINISH_INSTALLATION_PAGE_TITLE = 'Finish Installation'
const RUNTIME_DIR = process.env.ZOWE_ROOT_DIR;
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const ZOWE_EXTENSION_DIR= process.env.ZOWE_EXTENSION_DIR;
const ZOWE_LOG_DIR=process.env.ZOWE_LOG_DIR;
const ZOWE_WORKSPACE_DIR=process.env.ZOWE_WORKSPACE_DIR;
const JOB_NAME= process.env.JOB_NAME;
const JOB_PREFIX=process.env.JOB_PREFIX;
const JAVA_HOME=process.env.JAVA_HOME;
const NODE_HOME=process.env.NODE_HOME;
const ZOSMF_HOST=process.env.ZOSMF_HOST;
const ZOSMF_PORT=process.env.ZOSMF_PORT;
const ZOSMF_APP_ID=process.env.ZOSMF_APP_ID;

test.describe('ReviewTab', () => {
  let titlePage : TitlePage;
  let connectionPage: ConnectionPage;
  let planningPage : PlanningPage;
  let installationTypePage : InstallationTypePage;
  let installationPage : InstallationPage;
  let networkingPage : NetworkingPage
  let apfAuthPage : ApfAuthPage
  let securityPage : SecurityPage
  let certificatesPage : CertificatesPage;
  let launchConfigPage : LaunchConfigPage;
  let reviewPage : ReviewPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page= await electronApp.firstWindow()
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
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(5000);
    connectionPage.clickContinueButton()
    await page.waitForTimeout(2000);
    planningPage.clickSaveValidate()
    await page.waitForTimeout(10000);
    planningPage.fillPlanningPageWithRequiredFields(RUNTIME_DIR, ZOWE_WORKSPACE_DIR,ZOWE_EXTENSION_DIR,ZOWE_LOG_DIR,'1',JOB_NAME,JOB_PREFIX,JAVA_HOME,NODE_HOME,ZOSMF_HOST,ZOSMF_PORT,ZOSMF_APP_ID)
    await page.waitForTimeout(20000);
    planningPage.clickValidateLocations()
    await page.waitForTimeout(20000);
    planningPage.clickContinueToInstallation()
    await page.waitForTimeout(2000);
    installationTypePage.downloadZowePaxAndNavigateToInstallationPage()
    await page.waitForTimeout(2000);
    reviewPage.clickReviewInstallationTab();
    await page.waitForTimeout(2000);
  })

  test.afterEach(async () => {
    await electronApp.close()
  })

  test('Test all required fields on the Review page', async ({ page }) => {
    await page.waitForTimeout(5000)
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
    expect(reviewPage.viewSubmitJob).toBeTruthy()
    expect(reviewPage.viewJobOutput).toBeTruthy()
    expect(reviewPage.saveAndClose).toBeTruthy()
    expect(reviewPage.previousStep).toBeTruthy()
    const is_Finish_Button_disable = await reviewPage.isFinishInstallationDisabled();
    expect(is_Finish_Button_disable).toBe(true);
	})

  test('Test Navigation to Connection page', async ({ page }) => {
    await page.waitForTimeout(5000);
    reviewPage.clickConnectionTab();
    await page.waitForTimeout(2000);
    const connection_title = await connectionPage.getConnectionPageTitle();
    expect(connection_title).toBe(CONNECTION_PAGE_TITLE);
  })

  test('Test Navigation to Planning page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickPlanningTab();
    await page.waitForTimeout(2000);
    const planning_title = await planningPage.getPlanningPageTitle();
    expect(planning_title).toBe(PLANNING_PAGE_TITLE);
  })

  test('Test Navigation to Installation Type page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickInstallationTypeTab();
    await page.waitForTimeout(2000);
    const installation_type_title = await installationTypePage.getInstallationTypePageTitle();
    expect(installation_type_title).toBe(INSTALLATION_TYPE_PAGE_TITLE);
  })

  test('Test Navigation to Installation page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickInstallationTab();
    await page.waitForTimeout(2000);
    const installation_title = await installationPage.getInstallationPageTitle();
    expect(installation_title).toBe(INSTALLATION_PAGE_TITLE);
  })

  test('Test Navigation to Networking page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickNetworkingTab();
    await page.waitForTimeout(2000);
    const networking_title = await networkingPage.returnTitleOfNetworkingPage();
    expect(networking_title).toBe(NETWORKING_PAGE_TITLE);
  })

  test('Test Navigation to Apf Auth page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickApfAuthTab();
    await page.waitForTimeout(2000);
    const apfAuth_title = await apfAuthPage.getApfAuthPageTitle();
    expect(apfAuth_title).toBe(APF_AUTH_PAGE_TITLE);
  })

  test('Test Navigation to Security page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickSecurityTab();
    await page.waitForTimeout(2000);
    const security_title = await securityPage.getSecurityPageTitle();
    expect(security_title).toBe(SECURITY_PAGE_TITLE);
  })

  test('Test Navigation to Certificates page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickCertificatesTab();
    await page.waitForTimeout(2000);
    const certificates_title = await certificatesPage.getCertificatesPageTitle();
    expect(certificates_title).toBe(CERTIFICATES_PAGE_TITLE);
  })

  test('Test Navigation to Launch Config page', async ({ page }) => {
    await page.waitForTimeout(2000);
    reviewPage.clickLaunchConfigTab();
    await page.waitForTimeout(2000);
    const launchConfig_title = await launchConfigPage.getLaunchConfigurationPageTitle();
    expect(launchConfig_title).toBe(LAUNCH_CONFIGURATION_PAGE_TITLE);
    reviewPage.clickReviewInstallationTab();
    await page.waitForTimeout(2000);
    const review_title = await reviewPage.getReviewPageTitle();
    expect(review_title).toBe(REVIEW_PAGE_TITLE);
  })

  test('Test Successful Operations Tabs', async ({ page }) => {
    await page.waitForTimeout(5000);
    expect(reviewPage.connectionTabSuccessfulIcon).toBeTruthy()
    expect(reviewPage.planningTabSuccessfulIcon).toBeTruthy()
    expect(reviewPage.installationTypeTabSuccessfulIcon).toBeTruthy()
  })

  test('Test Pending Operations Tabs', async ({ page }) => {
    await page.waitForTimeout(5000);
    expect(reviewPage.installationTabPendingIcon).toBeTruthy()
    expect(reviewPage.networkingTabPendingIcon).toBeTruthy()
    expect(reviewPage.apfAuthTabPendingIcon).toBeTruthy()
    expect(reviewPage.securityTabPendingIcon).toBeTruthy()
    expect(reviewPage.certificatesTabPendingIcon).toBeTruthy()
    expect(reviewPage.launchConfigTabPendingIcon).toBeTruthy()
  })

  test('Test Previous step', async ({ page }) => {
    await page.waitForTimeout(5000);
    reviewPage.clickPreviousStep();
    await page.waitForTimeout(2000);
    const title = await launchConfigPage.returnTitleOfConfPage();
    expect(title).toBe(LAUNCH_CONFIGURATION_PAGE_TITLE);
  })

  test('Test Finish Installation Button', async ({ page }) => {
    await page.waitForTimeout(5000);
    const is_Finish_Button_enable = await reviewPage.isFinishInstallationEnabled();
    expect(is_Finish_Button_enable).toBe(true);
    reviewPage.clickFinishInstallation()
    await page.waitForTimeout(2000);
  })

  test('Test View Yaml Button', async ({ page }) => {
    await page.waitForTimeout(5000);
    reviewPage.clickViewEditYaml()
    await page.waitForTimeout(5000);
    expect(reviewPage.editorTitleElement).toBeTruthy();
    reviewPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test View and Submit button', async ({ page }) => {
    await page.waitForTimeout(5000);
    reviewPage.clickViewSubmitJob()
    await page.waitForTimeout(5000);
    expect(reviewPage.editorTitleElement).toBeTruthy();
    reviewPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test View Job Output', async ({ page }) => {
    await page.waitForTimeout(5000);
    reviewPage.clickViewJobOutput()
    await page.waitForTimeout(5000);
    expect(reviewPage.editorTitleElement).toBeTruthy();
    reviewPage.clickCloseEditor()
    await page.waitForTimeout(2000);
  })

  test('Test Save and Close and Resume Progress', async ({page}) => {
    await page.waitForTimeout(5000);
    reviewPage.clickSaveAndClose();
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(5000);
    const title = await reviewPage.getReviewPageTitle();
    expect(title).toBe(REVIEW_PAGE_TITLE);
  }) 
})
