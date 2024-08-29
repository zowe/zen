import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class VsamPage{
  page: Page;
  Security_title = Locator;
  readYaml = Locator;
  previous_step_button = Locator;
  skip_button = Locator;
  editor_title_element = Locator;
  VSAM_TITLE = Locator;
  continueToComponentInstallation = Locator;
  view_yaml =  Locator;
  viewAndSubmitJob =  Locator;
  view_job_output =  Locator;
  save_and_close =  Locator;
  previous_step = Locator;
  skip_button = Locator;
  close_button = Locator;
  certificateTab_title = Locator;
  errorMsg = Locator;
  Error = Locator;
  invalidInput_msg = Locator;
  writeConfig_greenCheckXpath = Locator;
  uploadYaml_greenCheckXpath = Locator;
  init_stcs_greenCheckXpath = Locator;



  constructor(page: Page) {
    this.page = page;
    this.click_vsam = page.locator('//span[text()="Vsam"]')
    this.Security_title = page.locator('//div[text()="Security"]')
    this.mode = page.getByLabel('Mode');
    this.volume = page.getByLabel('Volume');
    this.StorageClass = page.getByLabel('Storage Class');
    this.VsamDatasetName   = page.getByLabel('Vsam Dataset Name');
    this.dataset_proclib = page.getByLabel('Dataset Proclib');
    this.readYaml = page.locator('div.view-lines')
    this.initVSAM = page.locator('//button[contains(text(),"Initialize Vsam Config")]')
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.VSAM_TITLE = page.locator(' //div[text()="Vsam"]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.view_yaml =  page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "Preview Job")]')
    this.view_job_output =  page.locator('//button[contains(text(), "View Job Output")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.certificateTab_title = page.locator('//div[text()="Certificates"]')
    this.LaunchConfigTab_title = page.locator('//div[text()="Configuration"]')
    this.errorMsg = page.locator('//p[text()="is a required property"]')
    this.continue_LaunchConfigSelector = page.locator('//button[contains(text(), "Continue to Launch Setup")]')
    this.writeConfig_greenCheckXpath = page.locator('#card-init-vsam-progress-card')
    this.uploadYaml_greenCheckXpath = page.locator('#card-download-progress-card')
    this.init_vsam_greenCheckXpath = page.locator("#card-success-progress-card")
    this.Error = page.locator('//div[@class="MuiAlert-message css-1pxa9xg-MuiAlert-message"]')
    this.invalidInput_msg = page.locator("//p[@style='margin-top: 5px; margin-bottom: 0px; font-size: smaller; color: red;']")
  }

  async movetoVsamPage(){
   await this.click_vsam.click({timeout: 5000})
  }
  async returnTitleOfVsamPage(){
   const Vsam_title = await this.VSAM_TITLE.textContent();
   return Vsam_title;
  }

  async fillVsamDetails(mode:string, volume:string,storage_class:string,VsamDatasetName:string){
   await this.page.waitForTimeout(1000);
   await this.mode.fill(mode)
   await this.page.waitForTimeout(1000);
   await this.volume.fill(volume)
   await this.page.waitForTimeout(1000);
   await this.StorageClass.fill(storage_class);
   await this.page.waitForTimeout(1000);
   await this.VsamDatasetName.fill(VsamDatasetName)
   await this.page.waitForTimeout(2000);
  }
  async get_VsamMode_value(): Promise<string> {
    await this.page.waitForTimeout(2000);
	  return await this.mode.inputValue();
  }

  async get_VsamVolume_value(){
    return await this.volume.inputValue();
  }

  async get_StorageClass_value(){
   return await this.StorageClass.inputValue();
  }

  async get_VsamDatasetName_value(){
   return await this.VsamDatasetName.inputValue();
  }

  async fillVsamDatasetName(VsamDatasetName:string){
   await this.page.waitForTimeout(1000);
   await this.VsamDatasetName.fill(VsamDatasetName)
  }

  async viewYaml(){
    await this.view_yaml.click({ timeout: 5000 })
  }
  async closeButton(){
   await this.close_button.click({ timeout: 2000 })
  }
  async click_viewAndSubmitJob(){
   await this.viewAndSubmitJob.click({ timeout: 2000 })
  }
  async click_previewJob(){
   await this.view_job_output.click({ timeout: 2000 })
  }
  async click_skipVsamButton(){
   await this.skip_button.click({ timeout: 2000 });
   const launchConfigPage_title = await this.LaunchConfigTab_title.textContent();
   return launchConfigPage_title;
  }
  async is_skipVsamButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }


  async isPreviousButtonEnable(){
   return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const certificate_title = await this.certificateTab_title.textContent();
   return certificate_title;
  }

  async open_monacoEditor(){
   await this.view_yaml.click({ timeout: 5000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async isWriteConfigGreenCheckVisible(){
   return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isUploadConfigGreenCheckVisible(){
   return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isInitVSAMGreenCheckVisible(){
   return await this.init_vsam_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async click_saveAndClose(){
   await this.save_and_close.click({ timeout: 5000 })
  }

  async isContinueButtonDisable(){
   return await this.continue_LaunchConfigSelector.isDisabled();
  }

  async isContinueButtonEnabled(){
   return await this.continue_LaunchConfigSelector.isEnabled();
  }

  async invalidInput_ErrorMsg(){
   return await this.invalidInput_msg.textContent();
  }

  async initializeVSAM(){
	 await this.initVSAM.click();
	 await this.waitForContinueButtonToBeEnabled();
  }

  async waitForErrorMsg(){
	  const timeout = 1000000;
    const interval = 500;
    const endTime = Date.now() + timeout;
    while (Date.now() < endTime) {
      errorMsg = await this.Error.textContent();
      if (errorMsg) {
        return errorMsg;
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error('Error message was not found within the timeout period');
  }


 private async waitForContinueButtonToBeEnabled(): Promise<void> {
    const timeout = 1000000;
    const interval = 500;
    const endTime = Date.now() + timeout;
    while (Date.now() < endTime) {
      if (await this.isContinueButtonEnabled()) {
        return;
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error('Continue button was not enabled within the timeout period');
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
            const svgElement = document.querySelector('#zen-root-container > div.wizard-container > div > div.MuiStepper-root.MuiStepper-horizontal.substepper.css-m5vj9m-MuiStepper-root > div:nth-child(13) > span > span.MuiStepLabel-iconContainer.Mui-active.Mui-error.css-vnkopk-MuiStepLabel-iconContainer > svg');

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
 export default VsamPage;
