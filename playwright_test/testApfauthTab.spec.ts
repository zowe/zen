import { test, expect } from '@playwright/test';
import { setup } from './setup';
import { ElectronApplication, Page } from 'playwright';
let electronApp: ElectronApplication;
let page: Page;

//selectors
const continueButtonSelector = '.MuiButton-containedPrimary.MuiButton-sizeMedium'
const userNameInputSelector = 'label:has-text("User Name") + div input#standard-required'
const writeConfig_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const uploadYaml_greenCheckXpath = '#card-download-progress-card svg.MuiSvgIcon-colorSuccess'
const init_apfauth_greenCheckXpath = '#card-upload-progress-card svg.MuiSvgIcon-colorSuccess'
const previous_step_button = '//button[contains(text(),"Previous step")]'
const skip_installation_button = '//button[contains(text(),"Skip")]'
const skip_apf_auth_button = '//button[contains(text(),"Skip")]'
const continue_apfauth_setup = '//button[contains(text(),"Continue to APF Auth Setup")]'
const continue_security_setup = '//button[contains(text(),"Continue to Security Setup")]'
const editor_title_element = '//h2[text()="Editor"]'
const INSTALLATION_TITLE = 'Installation'
const APFAUTH_TITLE = 'APF Authorize Load Libraries'
const SECURITY_TITLE = 'Security'
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
  await setupPage(page);
});

test.afterEach(async () => {
  await electronApp.close()
})


test('Test Titles', async () => {
  page = await electronApp.firstWindow();
  const installation_title = await page.locator('//div[text()="Installation"]').textContent();
  expect (installation_title).toBe(INSTALLATION_TITLE)
  await page.locator(skip_installation_button).click();
  const apfauth_title = await page.locator('//div[text()="APF Authorize Load Libraries"]').textContent();
  expect (apfauth_title).toBe(APFAUTH_TITLE)

});

test('Test all required fields on Installation Tab', async () => {
  page = await electronApp.firstWindow();
  const prefix = await page.waitForSelector('#/properties/prefix2-input');
  const auth_load_lib = await page.waitForSelector('#/properties/authLoadlib3-input');
  const auth_plugin_lib = await page.waitForSelector('#/properties/authPluginLib3-input');
  const install_mvs_datasets = await page.locator('//button[contains(text(),"Install MVS datasets")]');
  const skip_installation = await page.locator(skip_installation_button);
  await page.waitForTimeout(1000);
  expect(prefix).toBeTruthy();
  expect(auth_load_lib).toBeTruthy();
  expect(auth_plugin_lib).toBeTruthy();
  expect(install_mvs_datasets).toBeTruthy();
  expect(skip_installation).toBeTruthy();
  expect(continue_apfauth_setup).toBeTruthy();
  const isButtonDisabled = await page.isDisabled(continue_apfauth_setup);
  expect(isButtonDisabled).toBe(true);
});

test('Test all required fields on Apf Auth Tab', async () => {
  page = await electronApp.firstWindow();
  const dataset_prefix = await page.getByLabel('Dataset Prefix');
  const auth_load_lib = await page.getByLabel('APF Authorized Load Library');
  const auth_plugin_lib = await page.getByLabel('Zowe ZIS Plugins Load Library');
  const run_zwe_init_apfauth = await page.locator('//button[contains(text(),"zwe init apfauth")]');
  const view_yaml = await page.locator('//button[contains(text(),"View Yaml")]');
  const view_submit_job = await page.locator('//button[contains(text(),"View/Submit Job")]');
  const view_job_output = await page.locator('//button[contains(text(),"View Job Output")]');
  const save_and_close = await page.locator('//button[contains(text(),"Save & close")]');
  const previous_step = await page.locator(previous_step_button);
  const skip_apf_auth = await page.locator(skip_apf_auth_button);
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
  expect(skip_apf_auth).toBeTruthy();
  expect(continue_security_setup).toBeTruthy();
  const isButtonDisabled = await page.isDisabled(continue_security_setup);
  expect(isButtonDisabled).toBe(true);
});

test('Test Required fields after Run Zwe Init ApfAuth', async () => {
  page = await electronApp.firstWindow();
  await page.locator('//button[contains(text(),"zwe init apfauth")]').click();
  const write_config = await page.locator('//p[contains(text(),"Write configuration file locally to temp directory")]');
  const upload_config = await page.locator('//p[contains(text(),"Upload configuration file to")]');
  const zwe_init_apfauth = await page.locator('//p[contains(text(),"Run zwe init apfauth command")]');
  await page.waitForTimeout(1000);
  expect(write_config).toBeTruthy();
  expect(upload_config).toBeTruthy();
  expect(zwe_init_apfauth).toBeTruthy();
});

test('Test Run APF Auth with valid data', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[id="#/properties/prefix2-input"]').fill(DATASET_PREFIX);
  await page.locator('input[id="#/properties/authLoadlib3-input"]').fill(AUTH_LOAD_LIB);
  await page.locator('input[id="#/properties/authPluginLib3-input"]').fill(AUTH_PLUGIN_LIB);
  await page.locator(skip_installation_button).click();
  const dataset_prefix_value = await page.getByLabel('Dataset Prefix').textContent();
  const auth_load_lib_value = await page.getByLabel('APF Authorized Load Library').textContent();
  const auth_plugin_lib_value = await page.getByLabel('Zowe ZIS Plugins Load Library').textContent();
  expect(dataset_prefix_value).toBe(DATASET_PREFIX)
  expect(auth_load_lib_value).toBe(AUTH_LOAD_LIB)
  expect(auth_plugin_lib_value).toBe(AUTH_PLUGIN_LIB)
  await page.locator('//button[contains(text(),"zwe init apfauth")]').click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(true);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(true);

  await page.waitForSelector(init_apfauth_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_apfauth_greenCheckXpath);
  expect(isIconVisible3).toBe(true);

  const isButtonEnabled = await page.isEnabled(continue_security_setup);
  expect(isButtonEnabled).toBe(true);
});

test('Test Run APF Auth with Empty data', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[id="#/properties/prefix2-input"]').fill('');
  await page.locator('input[id="#/properties/authLoadlib3-input"]').fill('');
  await page.locator('input[id="#/properties/authPluginLib3-input"]').fill('');
  await page.locator(skip_installation_button).click();
  const dataset_prefix_value = await page.getByLabel('Dataset Prefix').textContent();
  const auth_load_lib_value = await page.getByLabel('APF Authorized Load Library').textContent();
  const auth_plugin_lib_value = await page.getByLabel('Zowe ZIS Plugins Load Library').textContent();
  expect(dataset_prefix_value).toBe('')
  expect(auth_load_lib_value).toBe('')
  expect(auth_plugin_lib_value).toBe('')
  await page.locator('//button[contains(text(),"zwe init apfauth")]').click();
  await page.waitForSelector(writeConfig_greenCheckXpath, { timeout: 50000 });
  const isIconVisible1 = await page.isVisible(writeConfig_greenCheckXpath);
  expect(isIconVisible1).toBe(false);

  await page.waitForSelector(uploadYaml_greenCheckXpath, { timeout: 50000 });
  const isIconVisible2 = await page.isVisible(uploadYaml_greenCheckXpath);
  expect(isIconVisible2).toBe(false);

  await page.waitForSelector(init_apfauth_greenCheckXpath, { timeout: 50000 });
  const isIconVisible3 = await page.isVisible(init_apfauth_greenCheckXpath);
  expect(isIconVisible3).toBe(false);

  const isButtonEnabled = await page.isEnabled(continue_security_setup);
  expect(isButtonEnabled).toBe(false);
});

test('Test Skip APF Auth', async () => {
  page = await electronApp.firstWindow();
  const is_skipInstallation_ButtonEnabled = await page.isEnabled(skip_installation_button);
  expect(is_skipInstallation_ButtonEnabled).toBe(true);
  await page.locator(skip_installation_button).click();
  const is_skipApfauth_ButtonEnabled = await page.isEnabled(skip_apf_auth_button);
  expect(is_skipApfauth_ButtonEnabled).toBe(true);
  await page.locator(skip_apf_auth_button).click();
  const security_title = await page.locator('//div[text()="Security"]').textContent();
  expect (security_title).toBe(SECURITY_TITLE)
});

test('Test Previous Step', async () => {
  page = await electronApp.firstWindow();
  await page.locator(skip_installation_button).click();
  const apfauth_title = await page.locator('//div[text()="APF Authorize Load Libraries"]').textContent();
  expect (apfauth_title).toBe(APFAUTH_TITLE)
  const isButtonEnabled = await page.isEnabled(previous_step_button);
  expect(isButtonEnabled).toBe(true);
  await page.locator(previous_step_button).click();
  const installation_title = await page.locator('//div[text()="Installation"]').textContent();
  expect (installation_title).toBe(INSTALLATION_TITLE)
});

test('Test View Yaml', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "View Yaml")]');
  const editor_dialog = await page.waitForSelector(editor_title_element, { timeout: 5000 });
  expect(editor_dialog).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test View/Submit Job', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "Preview Job")]');
  const editor_dialog = await page.waitForSelector(editor_title_element, { timeout: 5000 });
  expect(editor_dialog).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test View Job', async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(2000);
  await page.click('//button[contains(text(), "Submit Job")]');
  const editor_dialog = await page.waitForSelector(editor_title_element, { timeout: 5000 });
  expect(editor_dialog).toBeTruthy();
  await page.click('//button[contains(text(), "Close")]');
})

test('Test Save & Close', async () => {
  page = await electronApp.firstWindow();
  await page.locator('input[id="#/properties/prefix2-input"]').fill(DATASET_PREFIX);
  await page.locator('input[id="#/properties/authLoadlib3-input"]').fill(AUTH_LOAD_LIB);
  await page.locator('input[id="#/properties/authPluginLib3-input"]').fill(AUTH_PLUGIN_LIB);
  await page.locator('//button[contains(text(),"Save & close")]').click();
  page.click('#card-install')
  await page.locator(userNameInputSelector).fill(process.env.SSH_USER);
  await page.getByLabel('Password').fill(process.env.SSH_PASSWD);
  await page.getByLabel('Host').fill(process.env.SSH_HOST);
  await page.getByLabel('FTP Port').fill(process.env.SSH_PORT);
  await page.click('button.MuiButton-root')
  await page.click(continueButtonSelector)
  await page.locator("//button[contains(text(), 'Continue to Installation Options')]").click();
  await page.waitForTimeout(1000);
  await page.locator("//button[contains(text(), 'License Agreement')]").click();
  await page.locator("//html/body/div[2]/div[3]/div/div[2]/button[1]").click();
  await page.locator("//button[contains(text(), 'Continue to Components Installation')]").click();
  await page.locator(skip_installation_button).click();

  const dataset_prefix_value = await page.getByLabel('Dataset Prefix').textContent();
  const auth_load_lib_value = await page.getByLabel('APF Authorized Load Library').textContent();
  const auth_plugin_lib_value = await page.getByLabel('Zowe ZIS Plugins Load Library').textContent();
  expect(dataset_prefix_value).toBe(DATASET_PREFIX)
  expect(auth_load_lib_value).toBe(AUTH_LOAD_LIB)
  expect(auth_plugin_lib_value).toBe(AUTH_PLUGIN_LIB)
});
