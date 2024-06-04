import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import { prepareEnvironment } from '../prepare.js';

let electronApp: ElectronApplication
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD = process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;
const CONNECTION_PAGE_TITLE = 'Connection'

test.beforeAll(async () => {
  try {
    await prepareEnvironment({ install: true, remove: false });
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
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('Test Save and close and Resume Progress', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    connectionPage.click_saveAndClose()
    await page.waitForTimeout(3000);
    titlePage.clickOnResumeProgress();
    await page.waitForTimeout(5000);
    const title = await connectionPage.getConnectionPageTitle();
    expect(title).toBe(CONNECTION_PAGE_TITLE);
    const hostValue = await connectionPage.getHostValue();
    expect(hostValue).toBe(SSH_HOST);
    const portValue = await connectionPage.getPortValue();
    expect(portValue).toBe(SSH_PORT);
    const userNameValue = await connectionPage.getUsernameValue();
    expect(userNameValue).toBe(SSH_USER);
  })

  test('test invalid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
    await page.waitForTimeout(5000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(true);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(true);
  })

  test('test valid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.performLogin(SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWD)
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
    titlePage.navigateToConnectionTab()
    const isContinueButtonDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })
})