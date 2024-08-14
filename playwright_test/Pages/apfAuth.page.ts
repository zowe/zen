import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class ApfAuthPage{
  page: Page;
  continueButtonSelector: Locator;
  userNameInputSelector: Locator;
  writeConfig_greenCheckXpath: Locator;
  uploadYaml_greenCheckXpath: Locator;
  init_apfauth_greenCheckXpath: Locator;
  previous_step_button: Locator;
  skip_installation_button: Locator;
  skip_apf_auth_button: Locator;
  continue_apfauth_setup: Locator;
  continue_security_setup: Locator;
  continueButtonSelector: Locator;
  editor_title_element: Locator;
  installationTitle: Locator;
  APFAUTH_TITLE: Locator;
  DATASET_PREFIX: Locator;
  AUTH_LOAD_LIB: Locator;
  AUTH_PLUGIN_LIB: Locator;
  licenseAgreement: Locator;
  acceptLicense: Locator;
  datasetPrefix: Locator;
  authLoadLib:Locator;
  authpluginLib: Locator;
  skipInstallation:Locator;
  run_zwe_init_apfauth:Locator;
  view_yaml:Locator;
  view_submit_job:Locator;
  view_job_output:Locator;
  save_and_close:Locator;
  skip_apf_auth:Locator;
  previous_step:Locator;
  securityTab_title:Locator;
  initApfauth:Locator;
  close_button:Locator;
  securityTab_title:Locator;
  auth_load_lib_value:Locator;
  auth_plugin_lib_value:Locator;
  dataset_prefix_value:Locator;







  constructor(page: Page) {
    this.page = page;
    this.continueButtonSelector = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.userNameInputSelector = page.locator('label:has-text("User Name") + div input#standard-required')
    this.writeConfig_greenCheckXpath = page.locator('#card-download-progress-card svg.MuiSvgIcon-colorSuccess')
    this.uploadYaml_greenCheckXpath = page.locator('#card-download-progress-card svg.MuiSvgIcon-colorSuccess')
    this.init_apfauth_greenCheckXpath = page.locator("#card-upload-progress-card svg.MuiSvgIcon-colorSuccess")
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_installation_button = page.locator('//button[contains(text(),"Skip")]')
    this.skip_apf_auth_button = page.locator('//button[contains(text(),"Skip")]')
    this.continue_apfauth_setup = page.locator('//button[contains(text(),"Continue to APF Auth Setup")]')
    this.continue_security_setup = page.locator('//button[contains(text(),"Continue to Security Setup")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.APFAUTH_TITLE = page.locator('APF Authorize Load Libraries')
    this.installationTitle = page.locator('//div[text()="Installation"]')
    this.licenseAgreement = page.locator('//button[contains(text(), "License Agreement")]')
    this.acceptLicense = page.locator('//html/body/div[2]/div[3]/div/div[2]/button[1]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.datasetPrefix = page.getByLabel('Prefix')
    this.authLoadLib = page.getByLabel('Auth Loadlib')
    this.authpluginLib = page.getByLabel('Auth Plugin Lib')
    this.click_ApfAuth = page.locator('//span[text()="Apf Auth"]');
    this.skipInstallation = page.locator('//button[contains(text(),"Skip")]')
    this.run_zwe_init_apfauth =  page.locator('//button[contains(text(),"zwe init apfauth")]')
    this.view_yaml =  page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "View Job Output")]')
    this.view_job_output =  page.locator('//button[contains(text(), "Submit Job")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_apf_auth = page.locator('//button[contains(text(),"Skip")]')
    this.initApfauth = page.locator('//button[contains(text(),"zwe init apfauth")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.securityTab_title = page.locator('//div[text()="Security"]')
    this.dataset_prefix_value = page.getByLabel('Dataset Prefix')
    this.auth_load_lib_value = page.getByLabel('APF Authorized Load Library')
    this.auth_plugin_lib_value = page.getByLabel('Zowe ZIS Plugins Load Library')
	
	//this.select_SMPE = page.getByLabel('//button[contains(text(),"SMP/E")]')
	this.select_SMPE = page.locator('span:has-text("SMP/E")');

  }
  async returnTitleOfApfAuthPage(){
   const ApfAuthTitle = await this.APFAUTH_TITLE.textContent();
   return ApfAuthTitle;
  }

  async movetoApfAuthPage(){
   await this.click_ApfAuth.click({timeout: 9000})
  }
  
  async selectInstallationType(){
   await this.select_SMPE.waitFor({ state: 'visible', timeout: 9000 }); // Adjust timeout if needed
   console.log('SMP/E span is visible.');
   await this.select_SMPE.click({timeout: 9000})
  }
  
  async movetoInstallationPage(){
   await this.licenseAgreement.click({timeout: 9000})
   await this.acceptLicense.click({timeout: 9000})
   await this.continueToComponentInstallation.click({timeout: 5000})
  }

  async fillApfDetails(datasetPrefix:string, authLoadLib:string,authpluginLib:string){
   await this.datasetPrefix.fill(datasetPrefix,{ timeout: 10000 })
   await this.authLoadLib.fill(authLoadLib,{ timeout: 10000 })
   await this.authpluginLib.fill(authpluginLib,{ timeout: 10000 })
  }
  async initializeApfauth(){
   await this.initApfauth.click()
  }
  async isWriteConfigGreenCheckVisible(){
   return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isUploadConfigGreenCheckVisible(){
   return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isInitApfGreenCheckVisible(){
   return await this.init_apfauth_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isPreviousButtonEnable(){
   return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const installation_title = await this.installationTitle.textContent();
   return installation_title;
  }
  async viewYaml(){
   await this.view_yaml.click({ timeout: 2000 })
  }
  async closeButton(){
   await this.close_button.click({ timeout: 5000 })
  }
  async click_viewAndSubmitJob(){
   await this.viewAndSubmitJob.click({ timeout: 6000 })
  }
  async click_previewJob(){
   await this.view_job_output.click({ timeout: 6000 })
  }
  async is_skipApfAuthButtonEnable(){
   return await this.skip_apf_auth_button.isEnabled({ timeout: 5000 });
  }

  async click_skipApfAuth(){
   await this.skip_apf_auth_button.click({ timeout: 2000 });
   const securityPage_title = await this.securityTab_title.textContent();
   return securityPage_title;
  }

  async open_monacoEditor(){
   this.view_yaml.click({ timeout: 2000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async isContinueButtonDisable(){
   return await this.continue_security_setup.isDisabled({ timeout: 5000 });
  }
  async click_saveAndClose(){
   this.save_and_close.click({ timeout: 2000 })
  }
  async get_datasetPrefix_value(){
   const dataset_prefix = await this.dataset_prefix_value.textContent();
   return dataset_prefix;
  }
  async get_authPluginLib_value(){
   const authPluginLib_value = await this.auth_plugin_lib_value.textContent();
   return authPluginLib_value;
  }

  async get_authLoadLib_value(){
   const authPluginLib_value = await this.auth_load_lib_value.textContent();
   return authPluginLib_value;
  }


}
  export default ApfAuthPage;