import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class SecurityPage{
  page: Page;
  writeConfig_greenCheckXpath: Locator;
  uploadYaml_greenCheckXpath: Locator;
  init_security_greenCheckXpath: Locator;
  previous_step_button: Locator;
  continue_CertificateSelector: Locator;
  editor_title_element: Locator;
  licenseAgreement: Locator;
  acceptLicense: Locator;
  skip_button:Locator;
  view_yaml:Locator;
  view_submit_job:Locator;
  view_job_output:Locator;
  save_and_close:Locator;
  previous_step:Locator;
  initSecurity:Locator;
  close_button:Locator;
  admin:Locator;
  stc:Locator;
  sys_prog:Locator;
  user_zis:Locator;
  user_zowe:Locator;
  aux:Locator;
  stc_zowe:Locator;
  stc_zis:Locator;
  product: Locator;
  APFAUTH_TITLE: Locator;
  continueToComponentInstallation: Locator;



  constructor(page: Page) {
    this.page = page;
    this.writeConfig_greenCheckXpath = page.locator('#card-init-security-progress-card svg.MuiSvgIcon-colorSuccess')
    this.uploadYaml_greenCheckXpath = page.locator('#card-download-progress-card svg.MuiSvgIcon-colorSuccess')
    this.init_security_greenCheckXpath = page.locator("#card-success-progress-card svg.MuiSvgIcon-colorSuccess")
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.APFAUTH_TITLE = page.locator('//div[text()="APF Authorize Load Libraries"]')
    this.licenseAgreement = page.locator('//button[contains(text(), "License Agreement")]')
    this.acceptLicense = page.locator('//html/body/div[2]/div[3]/div/div[2]/button[1]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.mainXpath = '//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[1]/div[3]/div/div[2]/div/div/div'
    this.stc_mainXpath = '//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[1]/div[4]/div/div[2]/div/div/div'
    this.product = page.locator('input[role="combobox"]')
    this.view_yaml =  page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "View Job Output")]')
    this.view_job_output =  page.locator('//button[contains(text(), "Submit Job")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip ")]')
    this.initSecurity = page.locator("//button[contains(text(), 'Initialize Security Config')]")
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.certificateTab_title = page.locator('//div[text()="Certificates"]')
	  this.stc_title = page.locator('//div[text()="Stcs"]')
    this.securityTab_title = page.locator('//div[text()="Security"]')
    this.click_security = page.locator('//span[text()="Security"]')
    this.continue_CertificateSelector = page.locator('//button[contains(text(), "Continue to STC Setup")]')

    this.admin = page.getByLabel('Admin');
    this.stc =  page.getByLabel('Stc');
    this.sys_prog =  page.getByLabel('Sys Prog');
    this.user_zis =  page.locator(this.mainXpath +'/div/div/div[2]/div/label');
    this.user_zowe =  page.locator(this.mainXpath +'/div/div/div[1]/div/label');
    this.aux =  page.getByLabel('Aux');
    this.stc_zowe =  page.locator(this.stc_mainXpath + '/div[1]/div/div[1]/div/label');
    this.stc_zis =  page.locator(this.stc_mainXpath + '/div[1]/div/div[2]/div/label');

  }

  async movetoSecurityPage(){
   await this.click_security.click({timeout: 5000})
  }
  async fillProduct(product:string){
   await this.product.fill(product,{ timeout: 10000 })
  }
  async fillSecurityDetails(product:string, admin:string,stc:string,sys_prog:string,user_zis:string,user_zowe:string,aux: string, stc_zowe: string, stc_zis:string){await this.page.waitForTimeout(1000);
   await this.product.fill(product)
   await this.page.waitForTimeout(1000);
   await this.admin.fill(admin)
   await this.page.waitForTimeout(1000);
   await this.stc.fill(stc);
   await this.page.waitForTimeout(1000);
   await this.sys_prog.fill(sys_prog)
   await this.page.waitForTimeout(1000);
   await this.user_zis.fill(user_zis)
   await this.page.waitForTimeout(1000);
   await this.user_zowe.fill(user_zowe)
   await this.page.waitForTimeout(1000);
   await this.aux.fill(aux)
   await this.page.waitForTimeout(1000);
   await this.stc_zowe.fill(stc_zowe)
   await this.page.waitForTimeout(1000);
   await this.stc_zis.fill(stc_zis)
   await this.page.waitForTimeout(1000);

  }

  async fillAdmin(admin:string){
   await this.admin.fill(admin,{ timeout: 10000 })
  }

  async initializeSecurity(){
   await this.initSecurity.click()
  }
  async isWriteConfigGreenCheckVisible(){
   return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isUploadConfigGreenCheckVisible(){
   await this.uploadYaml_greenCheckXpath.waitFor({ timeout: 50000 });
   return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isInitSecurityGreenCheckVisible(){
   await this.init_security_greenCheckXpath.waitFor({ timeout: 50000 });
   return await this.init_security_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isPreviousButtonEnable(){
   return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const apfAuth_title = await this.APFAUTH_TITLE.textContent();
   return apfAuth_title;
  }
  async viewYaml(){
    await this.view_yaml.click({ timeout: 2000 })
  }
  async closeButton(){
   this.close_button.click({ timeout: 2000 })
  }
  async click_viewAndSubmitJob(){
   this.viewAndSubmitJob.click({ timeout: 2000 })
  }
  async click_previewJob(){
   this.view_job_output.click({ timeout: 2000 })
  }
  async is_skipSecurityButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipSecurity(){
   await this.skip_button.click({ timeout: 2000 });
  }

  async open_monacoEditor(){
   this.view_yaml.click({ timeout: 2000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async isContinueButtonDisable(){
   return await this.continue_CertificateSelector.isDisabled({ timeout: 5000 });
  }
  async click_saveAndClose(){
   this.save_and_close.click({ timeout: 2000 })
  }
  async get_admin_value(){
   const admin_value = await this.admin.textContent();
   return admin_value;
  }
  async get_stc_value(){
   const stc_value = await this.stc.textContent();
   return stc_value;
  }
  async get_user_zowe_value(){
   const userZowe_value = await this.user_zowe.textContent();
   return userZowe_value;
  }
  async get_user_zis_value(){
   const userZis_value = await this.user_zis.textContent();
   return userZis_value;
  }
  async get_aux_value(){
   return await this.aux.inputValue();
  }
  async get_stc_zis_value(){
   return await this.stc_zis.inputValue();
//    const stcZis_value = await this.stc_zis.textContent();
//    return stcZis_value;
  }
  async get_stc_zowe_value(){
   return await this.stc_zowe.inputValue();
//    const stcZowe_value = await this.stc_zowe.textContent();
//    return stcZowe_value;
  }

  async get_sysProg_value(){
   const sysProg_value = await this.sys_prog.textContent();
   return sysProg_value;
  }
  async returnTitleOfSecurityPage(){
   const securityPage_title = await this.securityTab_title.textContent();
   return securityPage_title;
  }

  async returnTitleOfCertPage(){
    const certPage_title = await this.certificateTab_title.textContent();
    return certPage_title;
  }

  async returnTitleOfstcPage(){
   const stcPage_title = await this.stc_title.textContent();
   return stcPage_title;
  }

}

export default SecurityPage;
