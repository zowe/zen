import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class SecurityPage {
  page: Page;
  pageTitle: Locator;
  writeConfig_greenCheckXpath: Locator;
  uploadYaml_greenCheckXpath: Locator;
  init_security_greenCheckXpath: Locator;
  continue_STC_Setup: Locator;
  editor_title_element: Locator;
  skip_button: Locator;
  view_yaml: Locator;
  view_job_output: Locator;
  save_and_close: Locator;
  previous_step: Locator;
  initSecurity: Locator;
  close_button: Locator;
  admin: Locator;
  stc: Locator;
  sys_prog: Locator;
  user_zis: Locator;
  user_zowe: Locator;
  aux: Locator;
  stc_zowe: Locator;
  stc_zis: Locator;
  product: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.writeConfig_greenCheckXpath = page.locator('#card-init-security-progress-card svg.MuiSvgIcon-colorSuccess')
    this.uploadYaml_greenCheckXpath = page.locator('#card-download-progress-card svg.MuiSvgIcon-colorSuccess')
    this.init_security_greenCheckXpath = page.locator("#card-success-progress-card svg.MuiSvgIcon-colorSuccess")
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.product = page.locator('input[role="combobox"]')
    this.view_yaml = page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.view_job_output = page.locator('//button[contains(text(), "View Job Output")]')
    this.save_and_close = page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.initSecurity = page.locator("//button[contains(text(), 'Initialize Security Config')]")
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.continue_STC_Setup = page.locator('//button[contains(text(), "Continue to STC Setup")]')
    this.admin = page.getByLabel('Admin');
    this.stc = page.getByLabel('Stc');
    this.sys_prog = page.getByLabel('Sys Prog');
    this.user_zis = page.locator('//input[@id="#/properties/users/properties/zis5-input"]');
    this.user_zowe = page.locator('//input[@id="#/properties/users/properties/zowe5-input"]');
    this.aux = page.locator('//input[@id="#/properties/stcs/properties/aux5-input"]');
    this.stc_zowe = page.locator('//input[@id="#/properties/stcs/properties/zowe5-input"]');
    this.stc_zis = page.locator('//input[@id="#/properties/stcs/properties/zis5-input"]');
  }

  commonPage = new CommonPage();

  async getPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async fillSecurityDetails(product: string, admin: string, stc: string, sys_prog: string, user_zis: string,
    user_zowe: string, aux: string, stc_zowe: string, stc_zis: string) {
    await this.commonPage.waitForElement(this.product)
    await this.product.clear({ timeout: 2000 })
    await this.product.fill(product, { timeout: 10000 })
    await this.commonPage.waitForElement(this.admin)
    await this.admin.clear({ timeout: 2000 })
    await this.admin.fill(admin, { timeout: 10000 })
    await this.commonPage.waitForElement(this.stc)
    await this.stc.clear({ timeout: 2000 })
    await this.stc.fill(stc, { timeout: 10000 })
    await this.commonPage.waitForElement(this.sys_prog)
    await this.sys_prog.clear({ timeout: 2000 })
    await this.sys_prog.fill(sys_prog, { timeout: 10000 })
    await this.commonPage.waitForElement(this.user_zis)
    await this.user_zis.clear({ timeout: 2000 })
    await this.user_zis.fill(user_zis, { timeout: 10000 })
    await this.commonPage.waitForElement(this.user_zowe)
    await this.user_zowe.clear({ timeout: 2000 })
    await this.user_zowe.fill(user_zowe, { timeout: 10000 })
    await this.commonPage.waitForElement(this.aux)
    await this.aux.clear({ timeout: 2000 })
    await this.aux.fill(aux, { timeout: 10000 })
    await this.commonPage.waitForElement(this.stc_zowe)
    await this.stc_zowe.clear({ timeout: 2000 })
    await this.stc_zowe.fill(stc_zowe, { timeout: 10000 })
    await this.commonPage.waitForElement(this.stc_zis)
    await this.stc_zis.clear({ timeout: 2000 })
    await this.stc_zis.fill(stc_zis, { timeout: 10000 })
  }

  async initializeSecurity() {
    await this.commonPage.waitForElement(this.initSecurity)
    await this.initSecurity.click()
  }

  async isWriteConfigGreenCheckVisible() {
    await this.commonPage.waitForElement(this.writeConfig_greenCheckXpath)
    return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async isUploadConfigGreenCheckVisible() {
    await this.commonPage.waitForElement(this.uploadYaml_greenCheckXpath)
    return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async isInitSecurityGreenCheckVisible() {
    await this.commonPage.waitForElement(this.init_security_greenCheckXpath)
    return await this.init_security_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async isPreviousButtonEnable() {
    await this.commonPage.waitForElement(this.previous_step)
    return await this.previous_step.isEnabled({ timeout: 5000 });
  }

  async clickPreviousStep() {
    await this.commonPage.waitForElement(this.previous_step)
    await this.previous_step.click({ timeout: 5000 });
  }

  async viewYaml() {
    await this.commonPage.waitForElement(this.view_yaml)
    await this.view_yaml.click({ timeout: 2000 })
  }

  async closeButton() {
    await this.commonPage.waitForElement(this.close_button)
    this.close_button.click({ timeout: 2000 })
  }

  async click_previewJob() {
    await this.commonPage.waitForElement(this.view_job_output)
    this.view_job_output.click({ timeout: 2000 })
  }

  async is_skipSecurityButtonEnable() {
    await this.commonPage.waitForElement(this.skip_button)
    return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipSecurity() {
    await this.commonPage.waitForElement(this.skip_button)
    await this.skip_button.click({ timeout: 2000 });
  }

  async isContinueButtonDisable() {
    await this.commonPage.waitForElement(this.continue_STC_Setup)
    return await this.continue_STC_Setup.isDisabled({ timeout: 5000 });
  }

  async click_saveAndClose() {
    await this.commonPage.waitForElement(this.save_and_close)
    this.save_and_close.click({ timeout: 2000 })
  }

  async get_admin_value() {
    await this.commonPage.waitForElement(this.admin)
    const admin_value = await this.admin.textContent();
    return admin_value;
  }

  async get_stc_value() {
    await this.commonPage.waitForElement(this.stc)
    const stc_value = await this.stc.textContent();
    return stc_value;
  }

  async get_user_zowe_value() {
    await this.commonPage.waitForElement(this.user_zowe)
    const userZowe_value = await this.user_zowe.textContent();
    return userZowe_value;
  }

  async get_user_zis_value() {
    await this.commonPage.waitForElement(this.user_zis)
    const userZis_value = await this.user_zis.textContent();
    return userZis_value;
  }

  async get_aux_value() {
    await this.commonPage.waitForElement(this.aux)
    const aux_value = await this.aux.textContent();
    return aux_value;
  }

  async get_stc_zis_value() {
    await this.commonPage.waitForElement(this.stc_zis)
    const stcZis_value = await this.stc_zis.textContent();
    return stcZis_value;
  }

  async get_stc_zowe_value() {
    await this.commonPage.waitForElement(this.stc_zowe)
    const stcZowe_value = await this.stc_zowe.textContent();
    return stcZowe_value;
  }

  async get_sysProg_value() {
    await this.commonPage.waitForElement(this.sys_prog)
    const sysProg_value = await this.sys_prog.textContent();
    return sysProg_value;
  }
}
export default SecurityPage;