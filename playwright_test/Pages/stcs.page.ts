import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class StcsPage{
  page: Page;
  click_stcs = Locator;
  Security_title = Locator;
  zis = Locator;
  zowe = Locator;
  aux = Locator;
  dataset_proclib = Locator;
  readYaml = Locator;
  initSTC = Locator;
  previous_step_button = Locator;
  skip_button = Locator;
  editor_title_element = Locator;
  STCS_TITLE = Locator;
  continueToComponentInstallation = Locator;
  view_yaml =  Locator;
  viewAndSubmitJob =  Locator;
  view_job_output =  Locator;
  save_and_close =  Locator;
  previous_step = Locator;
  skip_button = Locator;
  close_button = Locator;
  certificateTab_title = Locator;
  continue_ReviewSelector = Locator;
  errorMsg = Locator;
  continue_CertificateSelector = Locator;
  get_zoweValue = Locator;
  get_zisValue = Locator;
  get_auxValue = Locator;
  get_datasetProclib = Locator;
  writeConfig_greenCheckXpath = Locator;
  uploadYaml_greenCheckXpath = Locator;
  init_stcs_greenCheckXpath = Locator;



  constructor(page: Page) {
    this.page = page;
    this.click_stcs = page.locator('//span[text()="Stcs"]')
    this.Security_title = page.locator('//div[text()="Security"]')
    this.zis = page.getByLabel('Zis');
    this.zowe = page.getByLabel('Zowe');
    this.aux = page.getByLabel('Aux');
    this.dataset_proclib = page.getByLabel('Dataset Proclib');
    this.readYaml = page.locator('div.view-lines')
    this.initSTC = page.locator('//button[contains(text(),"Initialize STC Config")]')
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.STCS_TITLE = page.locator(' //div[text()="Stcs"]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.view_yaml =  page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "Preview Job")]')
    this.view_job_output =  page.locator('//button[contains(text(), "View Job Output")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.certificateTab_title = page.locator('//div[text()="Certificates"]')
    this.continue_ReviewSelector = page.locator('//button[contains(text(), "Review")]')
    this.errorMsg = page.locator('//p[text()="is a required property"]')
    this.continue_CertificateSelector = page.locator('//button[contains(text(), "Continue to Certificates Setup")]')
    this.get_zoweValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div[1]/div/input')
    this.get_zisValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div[2]/div/input')
    this.get_auxValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div[3]/div/input')
    this.get_datasetProclib = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div[4]/div/input')
    this.writeConfig_greenCheckXpath = page.locator('#card-init-stcs-progress-card')
    this.uploadYaml_greenCheckXpath = page.locator('#card-download-progress-card')
    this.init_stcs_greenCheckXpath = page.locator("#card-success-progress-card")
  }

  async movetoStcsPage(){
   await this.click_stcs.click({timeout: 5000})
  }
  async returnTitleOfStcsPage(){
   const Stcs_title = await this.STCS_TITLE.textContent();
   return Stcs_title;
  }
  async get_zowe_value(){
  const value = await this.get_zoweValue.evaluate(el => el.value);
  console.log('Input field value:', value);
  return value;
  }

  async get_validation_error_msg(){
   const errorText = await this.page.locator('//p[text()="is a required property"]').textContent();
   console.log(errorText);
   return errorText;
  }

  async get_zis_value(){
  const value = await this.get_zisValue.evaluate(el => el.value);
  console.log('Input field value:', value);
  return value;
  }

  async get_aux_value(){
  const value = await this.get_auxValue.evaluate(el => el.value);
  console.log('Input field value:', value);
  return value;
  }

  async get_datasetProclib_value(){
  const value = await this.get_datasetProclib.evaluate(el => el.value);
  console.log('Input field value:', value);
  return value;
  }

  async viewYaml(){
    await this.view_yaml.click({ timeout: 5000 })
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
  async click_skipStcsButton(){
   await this.skip_button.click({ timeout: 2000 });
   const certificate_title = await this.certificateTab_title.textContent();
   return certificate_title;
  }
  async is_skipStcsButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }


  async isPreviousButtonEnable(){
   return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const security_title = await this.Security_title.textContent();
   return security_title;
  }

  async open_monacoEditor(){
   this.view_yaml.click({ timeout: 5000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async initializeSTC(){
   await this.initSTC.click({ timeout: 5000 })
  }
  async isWriteConfigGreenCheckVisible(){
   return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isUploadConfigGreenCheckVisible(){
   return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isInitSTCSGreenCheckVisible(){
   return await this.init_stcs_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isContinueButtonDisable(){
   return await this.continue_ReviewSelector.isDisabled({ timeout: 5000 });
  }
  async click_saveAndClose(){
   this.save_and_close.click({ timeout: 5000 })
  }

  async isContinueButtonDisable(){
   return await this.continue_CertificateSelector.isDisabled({ timeout: 5000 });
  }

  async read_yaml() {
    let previousScrollHeight = 0;
    let allText = '';

    while (true) {
        const newText = await this.page.evaluate(() => {
            const viewLines = document.querySelectorAll('.view-lines .view-line');
            let text = '';
            viewLines.forEach((line) => {
                text += line.textContent + '\n';
            });
            return text;
        });
        allText += newText;
        console.log(allText)
        await this.page.evaluate(() => {
            const editor = document.querySelector('.monaco-scrollable-element.editor-scrollable.vs');
            editor.scrollTop += 100;
        });

        await this.page.waitForTimeout(1000);

        const currentScrollHeight = await this.page.evaluate(() => {
            const editor = document.querySelector('.monaco-scrollable-element.editor-scrollable.vs');
            return editor.scrollHeight;
        });

        if (currentScrollHeight === previousScrollHeight) {
            break;
        }
        previousScrollHeight = currentScrollHeight;
    }

    console.log('All text:', allText);
    return allText;
}
 async isStatusChecked() {
    try {
        await this.page.waitForTimeout(1000);

        const isGreen = await this.page.evaluate(() => {
            const svgElement = document.querySelector('#zen-root-container > div.wizard-container > div > div.MuiStepper-root.MuiStepper-horizontal.substepper.css-m5vj9m-MuiStepper-root > div:nth-child(9) > span > span.MuiStepLabel-iconContainer.Mui-active.Mui-error.css-vnkopk-MuiStepLabel-iconContainer > svg');

            if (!svgElement) {
                return false;
            }
            const style = window.getComputedStyle(svgElement);

            return style.color === 'green' || style.fill === 'green';
        });

        return isGreen;
    } catch (error) {
        console.error('Error in isStatusChecked:', error);
        return false;
    }
}


}
 export default StcsPage;