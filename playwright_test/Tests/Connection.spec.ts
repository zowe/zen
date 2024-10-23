import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import path from 'path';
import { spawn } from 'child_process';
import { prepareEnvironment } from '../prepare.js';
import config from '../utils/config';
let page: Page;

let electronApp: ElectronApplication
const CONNECTION_PAGE_TITLE = 'Connection'
const INSTALLATION_TITLE = 'Installation'

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
    page= await electronApp.firstWindow()
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
	await titlePage.navigateToConnectionTab()
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('Test Save and close and Resume Progress', async ({ page }) => {
	await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential()
    await connectionPage.click_saveAndClose()
    await titlePage.clickOnResumeProgress();
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
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential()
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(true);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(true);
  })

  test('test valid credentials', async ({ page }) => {
    await connectionPage.fillConnectionDetails(config.SSH_HOST, config.SSH_PORT, config.SSH_USER, config.SSH_PASSWD);
    await connectionPage.SubmitValidateCredential()
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(false);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(false);
   })

  test('test required fields', async ({ page }) => {
    await expect(connectionPage.userName).toBeTruthy()
    await expect(connectionPage.password).toBeTruthy()
    await expect(connectionPage.port).toBeTruthy()
    await expect(connectionPage.host).toBeTruthy()
  })

  test('test continue disable', async ({ page }) => {
    const isContinueButtonDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueButtonDisable).toBe(true);
  })
})