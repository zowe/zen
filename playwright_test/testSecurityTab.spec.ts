import { test, expect } from '@playwright/test';
import { setup } from './setup';
import { ElectronApplication, _electron as electron, Page } from 'playwright';
let electronApp: ElectronApplication;
let page: Page;

//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium';
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required';
const greenCheckIconSelector = 'div.MuiCardContent-root svg.MuiSvgIcon-colorSuccess';
const mainXpath = '//html/body/div/div[2]/div/div[4]/div/form/div/div[3]/div[1]/div[3]/div/div[2]/div/div/div'
const writeConfig_greenCheckXpath = '#card-init-security-progress-card svg.MuiSvgIcon-colorSuccess'
const uploadYaml_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const init_security_greenCheckXpath = '#card-success-progress-card svg.MuiSvgIcon-colorSuccess'
const timeout = 30000;
const ADMIN = 'MVDUSER'
const SYS_PROG = 'MVDUSER'
const STC = 'MVDUSER'
const AUX = 'ZWEMVD09'
const USER_ZIS = 'ZWESISTC'
const USER_ZOWE = 'ZWESMVD'
const STC_ZIS = 'ZWESISHP'
const STC_ZOWE = 'ZWEMVDHP'

async function setupPage(page: Page) {
  electronApp = await setup();
  page = await electronApp.firstWindow();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'License Agreement')]").click();
  await page.locator("//html/body/div[2]/div[3]/div/div[2]/button[1]").click();
  await page.locator("//button[contains(text(), 'Continue to Components Installation')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
  await page.locator("//button[contains(text(), 'Skip ')]").click();
}

test.beforeEach(async () => {
  test.setTimeout(90000);
  await setupPage();
});

test.afterEach(async () => {
  await electronApp.close()
})


test('Test all required fields', async () => {
      page = await electronApp.firstWindow();
      const Security_Product = await page.locator('input[role="combobox"]')
      const admin = await page.getByLabel('Admin');
      const stc = await page.getByLabel('Stc');
      const sys_prog = await page.getByLabel('Sys Prog');
      const user_zis = await page.locator(mainXpath +'/div/div/div[2]/div/div/input');
      const user_zowe = await page.locator(mainXpath +'/div/div/div[1]/div/div/input');
      const aux = await page.getByLabel('Aux');
      const stc_zowe = await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input');
      const stc_zis = await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input');
      await page.waitForTimeout(1000);
      expect(Security_Product).toBeTruthy();
      expect(admin).toBeTruthy();
      expect(stc).toBeTruthy();
      expect(sys_prog).toBeTruthy();
      expect(user_zis).toBeTruthy();
      expect(user_zowe).toBeTruthy();
      expect(aux).toBeTruthy();
      expect(stc_zowe).toBeTruthy();
      expect(stc_zis).toBeTruthy();
});

test('Test Security RACF Product', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('RACF');
  await page.getByLabel('Admin').fill(ADMIN);
  await page.getByLabel('Stc').fill(STC);
  await page.getByLabel('Sys Prog').fill(SYS_PROG);
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill(USER_ZIS);
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill(USER_ZOWE);
  await page.getByLabel('Aux').fill(AUX);
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill(STC_ZOWE);
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill(STC_ZIS);
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(true);
});

test('Test Security TSS Product', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('TSS');
  await page.getByLabel('Admin').fill(ADMIN);
  await page.getByLabel('Stc').fill(STC);
  await page.getByLabel('Sys Prog').fill(SYS_PROG);
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill(USER_ZIS);
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill(USER_ZOWE);
  await page.getByLabel('Aux').fill(AUX);
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill(STC_ZOWE);
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill(STC_ZIS);
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(true);
});

test('Test Security AF2 Product', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('AF2');
  await page.getByLabel('Admin').fill(ADMIN);
  await page.getByLabel('Stc').fill(STC);
  await page.getByLabel('Sys Prog').fill(SYS_PROG);
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill(USER_ZIS);
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill(USER_ZOWE);
  await page.getByLabel('Aux').fill(AUX);
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill(STC_ZOWE);
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill(STC_ZIS);
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(true);
});

test('Test with all fields empty', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[role="combobox"]').fill('');
  await page.getByLabel('Admin').fill('');
  await page.getByLabel('Stc').fill('');
  await page.getByLabel('Sys Prog').fill('');
  await page.locator(mainXpath +'/div/div/div[2]/div/div/input').fill('');
  await page.locator(mainXpath +'/div/div/div[1]/div/div/input').fill('');
  await page.getByLabel('Aux').fill('');
  await page.locator(mainXpath + '/div[1]/div/div[1]/div/div/input').fill('');
  await page.locator(mainXpath + '/div[1]/div/div[2]/div/div/input').fill('');
  await page.locator("//button[contains(text(), 'Initialize Security Config')]").click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(false);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(false);

  await page.waitForSelector(init_security_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_security_greenCheckXpath);
  expect(isIconVisible3).toBe(false);
});