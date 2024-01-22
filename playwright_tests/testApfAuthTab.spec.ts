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
const writeConfig_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const uploadYaml_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const init_apfauth_greenCheckXpath = '#card-upload-progress-card svg.MuiSvgIcon-colorSuccess'
const timeout = 30000;
const DATASET_PREFIX = 'IBMUSER.ZWEV2'
const AUTH_LOAD_LIB = 'IBMUSER.ZWEV2.ZWEAUTH'
const AUTH_PLUGIN_LIB = 'IBMUSER.ZWEV2.CUST.ZWESAPL'

async function setupPage(page: Page) {
  electronApp = await setup();
  page = await electronApp.firstWindow();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'License Agreement')]").click();
  await page.locator("//html/body/div[2]/div[3]/div/div[2]/button[1]").click();
  await page.locator("//button[contains(text(), 'Continue to Components Installation')]").click();
}

test.beforeEach(async () => {
  test.setTimeout(90000);
  await setupPage();
});

test.afterEach(async () => {
  await electronApp.close()
})


test('Test all required fields on Installation Tab', async () => {
      page = await electronApp.firstWindow();
      const prefix = await page.waitForSelector('#/properties/prefix2-input');
      const auth_load_lib = await page.waitForSelector('#/properties/authLoadlib3-input');
      const auth_plugin_lib = await page.waitForSelector('#/properties/authPluginLib3-input');
      const install_mvs_datasets = await page.locator('//button[contains(text(),"Install MVS datasets")]');
      const skip_installation = await page.locator('//button[contains(text(),"Skip")]');
      const continue_apfauth_setup = await page.locator('//button[contains(text(),"Continue to APF Auth Setup")]');
      await page.waitForTimeout(1000);
      expect(prefix).toBeTruthy();
      expect(auth_load_lib).toBeTruthy();
      expect(auth_plugin_lib).toBeTruthy();
      expect(install_mvs_datasets).toBeTruthy();
      expect(skip_installation).toBeTruthy();
      expect(continue_apfauth_setup).toBeTruthy();
});

test('Test all required fields on Apf Auth Tab', async () => {
      page = await electronApp.firstWindow();
      const dataset_prefix = await page.getByLabel('Dataset Prefix');
      const auth_load_lib = await page.getByLabel('APF Authorized Load Library');
      const auth_plugin_lib = await page.getByLabel('Zowe ZIS Plugins Load Library');
      const run_zwe_init_apfauth = await page.locator('//button[contains(text(),"Run 'zwe init apfauth'")]');
      const view_yaml = await page.locator('//button[contains(text(),"View Yaml")]');
      const view_submit_job = await page.locator('//button[contains(text(),"View/Submit Job")]');
      const view_job_output = await page.locator('//button[contains(text(),"View Job Output")]');
      const save_and_close = await page.locator('//button[contains(text(),"Save & close")]');
      const previous_step = await page.locator('//button[contains(text(),"Previous step")]');
      const skip_apf_auth = await page.locator('//button[contains(text(),"Skip")]');
      const continue_security_setup = await page.locator('//button[contains(text(),"Continue to Security Setup")]');
      await page.waitForTimeout(1000);
      expect(dataset_prefix).toBeTruthy();
      expect(auth_load_lib).toBeTruthy();
      expect(auth_plugin_lib).toBeTruthy();
      expect(run_zwe_init_apfauth).toBeTruthy();
      expect(view_yaml).toBeTruthy();
      expect(view_submit_job).toBeTruthy();
      expect(view_job_output).toBeTruthy();
      expect(save_and_close).toBeTruthy();
      expect(previous_step).toBeTruthy();
      expect(previous_step).toBeTruthy();
      expect(skip_apf_auth).toBeTruthy();
      expect(continue_security_setup).toBeTruthy();
});

test('Test Required fields after Run Zwe Init ApfAuth', async () => {
    page = await electronApp.firstWindow();
    await page.locator('//button[contains(text(),"Run 'zwe init apfauth'")]').click();
    const write_config = await page.locator('//p[text()='Write configuration file locally to temp directory']');
    const upload_config = await page.locator('//p[contains(text(),'Upload configuration file to')]');
    const zwe_init_apfauth = await page.locator('//p[text()='Run zwe init apfauth command']');
    await page.waitForTimeout(1000);
    expect(write_config).toBeTruthy();
    expect(upload_config).toBeTruthy();
    expect(zwe_init_apfauth).toBeTruthy();
});

test('Test Run APF Auth with Empty data', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[id="#/properties/prefix2-input"]').fill(DATASET_PREFIX);
  await page.locator('input[id="#/properties/authLoadlib3-input"]').fill(AUTH_LOAD_LIB);
  await page.locator('input[id="#/properties/authPluginLib3-input"]').fill(AUTH_PLUGIN_LIB);
  await page.locator('//button[contains(text(),"Skip")]').click();
  const dataset_prefix_value = await page.getByLabel('Dataset Prefix').textContent();
  const auth_load_lib_value = await page.getByLabel('APF Authorized Load Library').textContent();
  const auth_plugin_lib_value = await page.getByLabel('Zowe ZIS Plugins Load Library').textContent();
  expect(dataset_prefix_value).not.toBe(DATASET_PREFIX)
  expect(auth_load_lib_value).not.toBe(AUTH_LOAD_LIB)
  expect(auth_plugin_lib_value).not.toBe(AUTH_PLUGIN_LIB)
  await page.locator('//button[contains(text(),"Run 'zwe init apfauth'")]').click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(false);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(false);

  await page.waitForSelector(init_apfauth_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_apfauth_greenCheckXpath);
  expect(isIconVisible3).toBe(false);
});
