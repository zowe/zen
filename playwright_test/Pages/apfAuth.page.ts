import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class ApfAuthPage {
  page: Page;
  init_apfauth_greenCheckXpath: Locator;
  continue_security_setup: Locator;
  editor_title_element: Locator;
  datasetPrefix: Locator;
  authLoadLib: Locator;
  authpluginLib: Locator;
  run_zwe_init_apfauth: Locator;
  view_yaml: Locator;
  view_job_output: Locator;
  initApfauth: Locator;
  close_button: Locator;
  auth_load_lib_value: Locator;
  auth_plugin_lib_value: Locator;
  dataset_prefix_value: Locator;
  click_ApfAuth: Locator;
  continueToComponentInstallation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.init_apfauth_greenCheckXpath = page.locator("#card-upload-progress-card > div > svg > path")
    this.continue_security_setup = page.locator('//button[contains(text(),"Continue to Security Setup")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.datasetPrefix = page.getByLabel('Prefix')
    this.authLoadLib = page.getByLabel('Auth Loadlib')
    this.authpluginLib = page.getByLabel('Auth Plugin Lib')
    this.click_ApfAuth = page.locator('//span[text()="Apf Auth"]');
    this.run_zwe_init_apfauth = page.locator('//button[contains(text(),"zwe init apfauth")]')
    this.view_yaml = page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.view_job_output = page.locator('//button[contains(text(), "View Job Output")]')
    this.initApfauth = page.locator('//button[contains(text(),"Initialize APF Authorizations")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.dataset_prefix_value = page.getByLabel('Dataset Prefix')
    this.auth_load_lib_value = page.getByLabel('APF Authorized Load Library')
    this.auth_plugin_lib_value = page.getByLabel('Zowe ZIS Plugins Load Library')
  }

  commonPage = new CommonPage();

  async initializeApfauth() {
    await this.commonPage.waitForElement(this.initApfauth)
    await this.initApfauth.click()
  }

  async isInitApfGreenCheckVisible() {
    await this.commonPage.waitForElement(this.init_apfauth_greenCheckXpath)
    return await this.init_apfauth_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async viewYaml() {
    await this.commonPage.waitForElement(this.view_yaml)
    await this.view_yaml.click({ timeout: 2000 })
  }

  async closeButton() {
    await this.commonPage.waitForElement(this.close_button)
    await this.close_button.click({ timeout: 5000 })
  }

  async click_viewJobOutput() {
    await this.commonPage.waitForElement(this.view_job_output)
    await this.view_job_output.click({ timeout: 6000 })
  }

  async isContinueButtonDisable() {
    await this.commonPage.waitForElement(this.continue_security_setup)
    return await this.continue_security_setup.isDisabled({ timeout: 5000 });
  }

  async isContinueButtonEnable() {
    await this.commonPage.waitForElement(this.continue_security_setup)
    return await this.continue_security_setup.isEnabled({ timeout: 5000 });
  }

  async get_datasetPrefix_value() {
    await this.commonPage.waitForElement(this.dataset_prefix_value)
    const dataset_prefix = await this.dataset_prefix_value.textContent();
    return dataset_prefix;
  }

  async get_authPluginLib_value() {
    await this.commonPage.waitForElement(this.auth_plugin_lib_value)
    const authPluginLib_value = await this.auth_plugin_lib_value.textContent();
    return authPluginLib_value;
  }

  async get_authLoadLib_value() {
    await this.commonPage.waitForElement(this.auth_load_lib_value)
    const authPluginLib_value = await this.auth_load_lib_value.textContent();
    return authPluginLib_value;
  }

}
export default ApfAuthPage;