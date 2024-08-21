import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import { prepareEnvironment } from '../prepare';
import config from '../utils/config'

let electronApp: ElectronApplication
const SSH_INVALID_PASSWD = 'InvalidPass';
const CONNECTION_PAGE_TITLE = 'Connection'
const ERROR_MESSAGE_PASSWORD = "PASS command failed";

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: false, remove: false });
  } catch (error) {
    console.error('Error during environment preparation:', error);
    process.exit(1);
  }
});

test.describe('ConnectionTab', () => {
  let connectionPage: ConnectionPage;
  let titlePage: TitlePage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(900000);
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
    page = await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
    await titlePage.navigateToConnectionTab()
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('Test Save and close and Resume Progress', async ({ page }) => {
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(5000);
    const title = await connectionPage.getConnectionPageTitle();
    expect(title).toBe(CONNECTION_PAGE_TITLE);
    const hostValue = await connectionPage.getHostValue();
    expect(hostValue).toBe(config.SSH_HOST);
    const portValue = await connectionPage.getPortValue();
    expect(portValue).toBe(config.SSH_PORT);
    const userNameValue = await connectionPage.getUsernameValue();
    expect(userNameValue).toBe(config.SSH_USER);
  })

  test('test invalid credentials', async ({ page }) => {
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, SSH_INVALID_PASSWD)
    await page.waitForTimeout(5000);
    const error_Message = await connectionPage.getErrorMessage()
    expect(error_Message).toBe(ERROR_MESSAGE_PASSWORD);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(true);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(true);
  })

  test('test valid credentials', async ({ page }) => {
    connectionPage.performLogin(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD)
    await page.waitForTimeout(5000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(false);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(false);
  })

  test('test required fields', async ({ page }) => {
    expect(connectionPage.userName).toBeTruthy()
    expect(connectionPage.password).toBeTruthy()
    expect(connectionPage.port).toBeTruthy()
    expect(connectionPage.host).toBeTruthy()
    await page.waitForTimeout(2000);
  })

  test('test continue disable', async ({ page }) => {
    const isContinueButtonDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })
})