const { test, expect } = require('@playwright/test')
import { ElectronApplication, Page, _electron as electron } from 'playwright'


let electronApp: ElectronApplication
let page: Page

//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium';
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required';
const greenCheckIconSelector = 'div svg.MuiSvgIcon-colorSuccess';

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['.webpack/main/index.js'] })
  electronApp.on('window', async (page) => {
    const filename = page.url()?.split('/').pop()
    console.log(`Window opened: ${filename}`)
    page.on('pageerror', (error) => {
      console.error(error)
    })
    page.on('console', (msg) => {
      console.log(msg.text())
    })
	page.click('#card-install')
  })

})

test.afterAll(async () => {
  await electronApp.close()
})


test('Test Title', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  const title = await page.title();
  expect(title).toBe("Zowe Enterprise Necessity");
})


test('Test Required Elements', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  page = await electronApp.firstWindow()
  const usernameInput = await page.waitForSelector(userNameInputSelector);
  const passwordInput = await page.waitForSelector('#standard-password-input');
  const portInput = await page.waitForSelector('#standard-number');
  const hostInput = await page.waitForSelector('label:has-text("Host") + div input#standard-required');
  expect(usernameInput).toBeTruthy();
  expect(passwordInput).toBeTruthy();
  expect(portInput).toBeTruthy();
  expect(hostInput).toBeTruthy();
})


test('Test Continue Disable', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  page = await electronApp.firstWindow()
  const isButtonDisabled = await page.isDisabled(continueButtonSelector);
  expect(isButtonDisabled).toBe(true);
})


test('Test Invalid Credentials', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  page = await electronApp.firstWindow()
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill('random');
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.waitForTimeout(2000);
  await page.click('button.MuiButton-root')
  await page.waitForTimeout(1000);
  const isGreenCheckIconVisible = await page.isHidden(greenCheckIconSelector);
  expect(isGreenCheckIconVisible).toBe(true);
  const isButtonDisabled = await page.isDisabled(continueButtonSelector);
  expect(isButtonDisabled).toBe(true);
})


test('Test Valid Credentials', async () => {
  page = await electronApp.firstWindow()
  await page.waitForTimeout(2000);
  page = await electronApp.firstWindow()
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.waitForTimeout(2000);
  await page.click('button.MuiButton-root')
  await page.waitForTimeout(1000);
  await page.waitForSelector(greenCheckIconSelector);
  const isGreenCheckIconVisible = await page.isVisible(greenCheckIconSelector);
  expect(isGreenCheckIconVisible).toBe(true);
  const isButtonDisabled = await page.isDisabled(continueButtonSelector);
  expect(isButtonDisabled).toBe(false);
})
