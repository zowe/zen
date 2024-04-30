import { test, ElectronApplication, expect, _electron as electron } from '@playwright/test';
import ConnectionPage from '../Pages/connection.page';
import TitlePage from '../Pages/title.page';
import path from 'path';
import { spawn } from 'child_process';
import { prepareEnvironment } from '../prepare.js';

let electronApp: ElectronApplication
const SSH_HOST = process.env.SSH_HOST;
const SSH_PASSWD =  process.env.SSH_PASSWD;
const SSH_PORT = process.env.SSH_PORT;
const SSH_USER = process.env.SSH_USER;

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
    electronApp = await electron.launch({ args: ['.webpack/main/index.js'] });
    page = await electronApp.firstWindow();
    connectionPage = new ConnectionPage(page);
    titlePage = new TitlePage(page);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('test invalid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(2000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(true);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(true);
  })

  test('test valid credentials', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    connectionPage.fillConnectionDetails(SSH_HOST,SSH_PORT,SSH_USER,SSH_PASSWD)
    connectionPage.SubmitValidateCredential()
    await page.waitForTimeout(8000);
    const isGreenIconHidden = await connectionPage.isGreenCheckIconVisible();
    expect(isGreenIconHidden).toBe(false);
    const isContinueDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueDisable).toBe(false);
   })

  test('test required fields', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    await expect(connectionPage.userName).toBeTruthy()
    await expect(connectionPage.password).toBeTruthy()
    await expect(connectionPage.port).toBeTruthy()
    await expect(connectionPage.host).toBeTruthy()
    await page.waitForTimeout(2000);
  })

  test('test continue disable', async ({ page }) => {
    titlePage.navigateToConnectionTab()
    const isContinueButtonDisable = await connectionPage.isContinueButtonVisible();
    expect(isContinueButtonDisable).toBe(true);
    await page.waitForTimeout(2000);
  })

})