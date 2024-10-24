import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class LaunchConfigPage{
  page: Page;
  pageTitle: Locator;
  fillValidation: Locator;
  logLevel: Locator;
  fillLogLevel: Locator;
  readYaml: Locator;
  previous_step_button: Locator;
  continue_ReviewSelector: Locator;
  editor_title_element: Locator;
  licenseAgreement: Locator;
  acceptLicense: Locator;
  skip_button:Locator;
  view_yaml:Locator;
  view_submit_job:Locator;
  view_job_output:Locator;
  save_and_close:Locator;
  previous_step:Locator;
  close_button:Locator;
  CONFPAGE_TITLE: Locator;
  continueToComponentInstallation: Locator;



  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.click_launchConfig = page.locator('//span[text()="Launch Config"]')
    this.validation = page.getByLabel('Validation');
    this.logLevel = page.getByLabel('LogLevel');
    this.componentConfig = page.getByLabel('On Component Configure Fail');
    this.fillValidation = page.locator('input[id="#/properties/configmgr/properties/validation2"]')
    this.readYaml = page.locator('div.view-lines')
    this.fillConfigLaunchValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/div/div/div/input')
    this.fillLogLevel = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div/div[1]/div/div/div/input')
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.CONFPAGE_TITLE = page.locator(' //div[text()="Configuration"]')
    this.licenseAgreement = page.locator('//button[contains(text(), "License Agreement")]')
    this.acceptLicense = page.locator('//html/body/div[2]/div[3]/div/div[2]/button[1]')
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]')
    this.view_yaml =  page.locator('//button[contains(text(),"View Yaml")]')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "Preview Job")]')
    this.view_job_output =  page.locator('//button[contains(text(), "Submit Job")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.certificateTab_title = page.locator('//div[text()="Certificates"]')
    this.continue_ReviewSelector = page.locator('//button[contains(text(), "Review")]')
    this.errorMsg = page.locator('//p[text()="is a required property"]')
  }

  async getLaunchConfigurationPageTitle() {
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async movetoLaunchConfigPage() {
    await this.licenseAgreement.click({ timeout: 9000 })
    await this.acceptLicense.click({ timeout: 9000 })
    await this.continueToComponentInstallation.click({ timeout: 5000 })
    await this.click_launchConfig.click({ timeout: 5000 })
  }
  async returnTitleOfConfPage(){
   const apfAuth_title = await this.CONFPAGE_TITLE.textContent();
   return apfAuth_title;
  }
  async fillvalues(validation:string){
   await this.page.fill('input[id="#/properties/configmgr/properties/validation"]', validation, { timeout: 10000 });
  }
  async fillvalues_logLevel(logLevel:string){
   await this.fillLogLevel.fill(logLevel,{ timeout: 10000 })
   }
  async fillvaluescomponentConfig(componentConfig:string){
    await this.fillConfigLaunchValue.fill(componentConfig,{ timeout: 10000 })

  }
  async get_validation_value(){
  const inputLocator = await this.page.locator('input[id="#/properties/configmgr/properties/validation"]');
  const value = await inputLocator.inputValue();
  console.log('Input field value:', value);
  return value;
  }

  async get_validation_error_msg(){
   const errorText = await this.page.locator('//p[text()="is a required property"]').textContent();
   console.log(errorText);
   return errorText;
  }

 async get_logLevel_value(){
   const value = await this.fillLogLevel.inputValue();
   console.log('Input field value:', value);
   return value;
  }
  async get_componentConfig_value(){
  const value = await this.fillConfigLaunchValue.inputValue();
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
  async is_skipLaunchConfigButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipLaunhConfig(){
   await this.skip_button.click({ timeout: 2000 });
   const certificatePage_title = await this.certificateTab_title.textContent();
   return certificatePage_title;
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
   this.view_yaml.click({ timeout: 5000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async isContinueButtonDisable(){
   return await this.continue_ReviewSelector.isDisabled({ timeout: 5000 });
  }
  async click_saveAndClose(){
   this.save_and_close.click({ timeout: 2000 })
  }
  async read_yaml() {
    let previousScrollHeight = 0;
    let allText = '';

    while (true) {
        // Extract text from all div.view-line elements
        const newText = await this.page.evaluate(() => {
            const viewLines = document.querySelectorAll('.view-lines .view-line');
            let text = '';
            viewLines.forEach((line) => {
                text += line.textContent + '\n';
            });
            return text;
        });

        // Append the new text to the existing text
        allText += newText;
        console.log(allText)

        // Scroll a little to load more content
        await this.page.evaluate(() => {
            const editor = document.querySelector('.monaco-scrollable-element.editor-scrollable.vs');
            editor.scrollTop += 100; // Adjust the scroll amount as needed
        });

        // Wait for a brief moment for new content to load
        await this.page.waitForTimeout(1000); // Adjust timeout as needed

        // Get the current scroll height
        const currentScrollHeight = await this.page.evaluate(() => {
            const editor = document.querySelector('.monaco-scrollable-element.editor-scrollable.vs');
            return editor.scrollHeight;
        });

        // If the scroll height hasn't changed since the last iteration, we've reached the end
        if (currentScrollHeight === previousScrollHeight) {
            break;
        }

        // Update the previous scroll height for the next iteration
        previousScrollHeight = currentScrollHeight;
    }

    console.log('All text:', allText);
    return allText;
}


}
 export default LaunchConfigPage;