import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication
import yaml from 'js-yaml';

class CertificatesPage{
  page: Page;
  click_CertificatePage: Locator;
  CERTIFICATE_TITLE: Locator;
  option1: Locator;
  option1: Locator;
  certificate_type: Locator;
  click_dropdown: Locator;
  keystore_directory: Locator;
  certificate_alias_name: Locator;
  keystore_password: Locator;
  ca_alias: Locator;
  ca_password: Locator;
  lock: Locator;
  import_keystore: Locator;
  import_password: Locator;
  import_alias: Locator;
  ca_common_name: Locator;
  common_name: Locator;
  org_unit: Locator;
  org_certificate: Locator;
  locality_of_cert: Locator;
  state_of_cert: Locator;
  country_of_cert: Locator;
  validity_of_cert: Locator;
  san: Locator;
  add_button: Locator;
  delete_button: Locator;
  import_certificate_authorities: Locator;
  verify_certificates: Locator;
  verify_certificates_dropdown: Locator;
  verify_certificate_input: Locator;
  skip_button: Locator;
  vsamPage_title: Locator;
  view_yaml: Locator;
  viewJobOutput: Locator;
  close_button: Locator;
  editor_title_element: Locator;
  add_importCert_button: Locator;
  confirm_delete_alert: Locator;
  dialog_description: locator;
  viewAndSubmitJob: locator;
  keystore_value: locator;
  initcertificates: locator;
  keystore_file_key : locator;
  trustore_file_key: locator; 
  pem_certAuth_key: locator;
  pem_cert_key: locator;
  pem_key: locator;
  sanInput: locator;






  constructor(page: Page) {
    this.page = page;
    this.click_CertificatePage = page.locator('//span[text()="Certificates"]')
    this.option1 = page.locator('//span[text()="Option 1"]')
    this.option2 = page.locator('//span[text()="Option 2"]')
    this.certificate_type = page.locator('//label[text()="Type"]')
    this.click_dropdown = page.locator('//button[@title="Open"]')
    this.keystore_directory = page.locator('//label[text()="Directory"]')
    this.keystore_value = page.locator("//html/body/div[1]/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div[2]/div/div[2]/div/div/div/div[1]/div/div[1]/div/div/input");
    this.certificate_alias_name = page.locator('//label[text()="Name"]')
    this.keystore_password = page.locator('//label[text()="Password"]')
    this.ca_alias = page.locator('//label[text()="Ca Alias"]')
    this.ca_password = page.locator('//label[text()="Ca Password"]')
    this.lock = page.locator('//span[text()="Lock"]')
    this.import_keystore = page.locator('//label[text()="Keystore"]')
    this.import_password = page.locator('//label[text()="Password"]')
    this.import_alias = page.locator('//label[text()="Alias"]')
    this.ca_common_name = page.locator('//label[text()="Ca Common Name"]')
    this.common_name = page.locator('//label[text()="Common Name"]')
    this.org_unit = page.locator('//label[text()="Org Unit"]')
    this.org_certificate = page.locator('//label[text()="Org"]')
    this.locality_of_cert = page.locator('//label[text()="Locality"]')
    this.state_of_cert = page.locator('//label[text()="State"]')
    this.country_of_cert = page.locator('//label[text()="Country"]')
    this.validity_of_cert = page.locator('//label[text()="Validity"]')
    this.san = page.locator('//h6[text()="San"]')
    this.add_button = page.locator('//button[@aria-label="Add to San button"]')
    this.add_importCert_button = page.locator('//button[@aria-label="Add to Import Certificate Authorities button"]')
    this.delete_button = page.locator('//button[@aria-label="Delete button"]')
    this.import_certificate_authorities = page.locator('//h6[text()="Import Certificate Authorities"]')
    this.verify_certificates = page.locator('//p[text()="Verify Certificates"]')
    this.verify_certificate_input = page.locator('//div[@aria-haspopup="listbox"]')
    this.verify_certificates_dropdown = page.locator('//ul[@aria-labelledby="demo-simple-select-label"]')
    this.confirm_delete_alert = page.locator('//h2[text()="Confirm Deletion"]')
    this.dialog_description = page.locator('p#alert-dialog-confirmdelete-description')
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "View Job Output")]')
    this.vsamPage_title = page.locator(' //div[text()="CachingService"]')
    this.stcsTitle = page.locator(' //div[text()="Stcs"]')
    this.keystore_file_key = page.locator('//div[span/span[@class="mtk22" and text()="keystore"]]/following-sibling::div[2]//span[@class="mtk5"]')
    this.trustore_file_key = page.locator('//div[span/span[@class="mtk22" and text()="truststore"]]/following-sibling::div[2]//span[@class="mtk5"]')
    this.pem_certAuth_key = page.locator('//div[span/span[@class="mtk22" and text()="pem"]]/following-sibling::div[3]//span[@class="mtk5"]')
    this.pem_cert_key = page.locator('//div[span/span[@class="mtk22" and text()="pem"]]/following-sibling::div[2]//span[@class="mtk5"]')
    this.pem_key = page.locator('//div[span/span[@class="mtk22" and text()="pem"]]/following-sibling::div[1]//span[@class="mtk5"]')
    this.initcertificates = page.locator('//button[contains(text(),"Initialize Zowe Certificates")]')
    this.writeConfig_greenCheckXpath = page.locator('//*[@id="box-download-progress-card"][1]')
    this.uploadYaml_greenCheckXpath = page.locator('//*[@id="box-download-progress-card"][2]')
    this.init_cert_greenCheckXpath = page.locator('//*[@id="box-install-progress-card"]')
    this.sanInput = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[2]/div[5]/table/tbody/tr/td[1]/div/input')
    this.click_lockCheckbox = page.locator('//input[@type="checkbox"]')
    this.readYaml = page.locator('div.view-lines')
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]')
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.CERTIFICATE_TITLE = page.locator('//div[text()="Certificates"]')
    this.view_yaml =  page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.viewJobOutput =  page.locator('//button[contains(text(), "View Job Output")]')
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]')
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.continue_CachingService = page.locator('//button[text()="Continue to Caching Service Setup"]')
  }

  async movetoCertificatePage(){
   await this.click_CertificatePage.click({timeout: 5000})
  }

  async returnTitleOfCertiPage(){
   const certificate_title = await this.CERTIFICATE_TITLE.textContent();
   return certificate_title;
  }

  async verifyCertificatesList(){
    await this.verify_certificate_input.click();
    await this.verify_certificates_dropdown.waitFor({ state: 'visible' });
    const items = await this.verify_certificates_dropdown.locator('li').allTextContents();
    return items;
  }

  async select_VerifyCert(verifyCert:string){
   await this.page.waitForTimeout(1000);
   await this.verify_certificate_input.click({timeout: 5000});
   await this.page.waitForTimeout(15000);
   const itemLocator = this.page.locator(`//li[text()="${verifyCert}"]`);
   await itemLocator.waitFor({ state: 'visible' });
   await itemLocator.click();
  }

   async viewYaml(){
    await this.view_yaml.click({ timeout: 5000 })
  }
  async closeButton(){
   await this.close_button.click({ timeout: 2000 })
  }
  async click_viewJobOutput(){
   await this.viewJobOutput.click({ timeout: 2000 })
  }
  async click_previewJob(){
   await this.view_job_output.click({ timeout: 2000 })
  }
  async is_skipCertificateButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }
  async add_SanButton() {
   await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
   await this.add_button.click({ timeout: 2000 });
  }

  async add_SanButton() {
   await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
   await this.add_button.click({ timeout: 2000 });
  }

  async add_SanDeleteButton() {
   await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
   const button = await this.delete_button.first().click({ timeout: 5000 });
  }
  
  async add_ImportCertDeleteButton() {
   await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
   const button = await this.delete_button.nth(2).click({ timeout: 5000 });
  }

  async isSanInputVisible(): Promise<boolean> {
    const san_Input = this.sanInput;
    return await san_Input.isVisible({ timeout: 5000 });
  }

  async isImportCertInputVisible(): Promise<boolean> {
    const importCertInput = this.ImportCert_Input;
    return await importCertInput.isVisible({ timeout: 5000 });
  }

  async add_ImportCertificateButton() {
   await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
   await this.add_importCert_button.click({ timeout: 2000 });
  }

  async is_deleteAlertVisible(): Promise<boolean> {
   const alertElement = await this.page.locator('div.MuiDialogContent-root p#alert-dialog-confirmdelete-description').first();
   await alertElement.waitFor({ state: 'visible', timeout: 5000 });
   return alertElement.isVisible();
  }
 
  async Verify_alertText(){
    const description = await this.dialog_description.first().textContent();
    return description;
  }

  async accept_declinedAlert(action:string){
    const specificNoButton = this.page.locator(`//button[.='${action}']`).nth(0);
    await specificNoButton.click({ timeout: 5000 })
  }

  async click_skipCertificate(){
   await this.skip_button.click({ timeout: 2000 });
   const Vsam_title = await this.vsamPage_title.textContent();
   return Vsam_title;
  }

  async isPreviousButtonEnable(){
   return await this.previous_step_button.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const stcs_title = await this.stcsTitle.textContent();
   return stcs_title;
  }

  async open_monacoEditor(){
   this.view_yaml.click({ timeout: 5000 })
   const editor_title = await this.editor_title_element.textContent();
   return editor_title;
  }

  async isContinueButtonDisable(){
   return await this.continue_CachingService.isDisabled({ timeout: 5000 });
  }

  async click_viewAndSubmitJob(){
   await this.viewAndSubmitJob.click({ timeout: 6000 })
  }
  async click_saveAndClose(){
   await this.save_and_close.click({ timeout: 2000 })
  }
  async get_keystore_value(){
   const keystoreValue = await this.keystore_value.inputValue();
   console.log('value is', keystoreValue)
   return keystoreValue;
  }

  async isContinueButtonEnabled(){
   return await this.continue_CachingService.isEnabled();
  }

  async initializeCert(){
   await this.initcertificates.click()
   await this.waitForContinueButtonToBeEnabled();
  }

  async isWriteConfigGreenCheckVisible(){
   return await this.writeConfig_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isUploadConfigGreenCheckVisible(){
   return await this.uploadYaml_greenCheckXpath.isVisible({ timeout: 50000 });
  }
  async isInitCertGreenCheckVisible(){
   return await this.init_cert_greenCheckXpath.isVisible({ timeout: 50000 });
  }

  async Lock_checkbox_Ischecked(){
    await this.click_lockCheckbox.click({ timeout: 5000 });

   return await this.click_lockCheckbox.isChecked();

  }


  private async waitForContinueButtonToBeEnabled(): Promise<void> {
    const timeout = 50000000;
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
    return allText;
  }

  async fillKeystoreDir(dir: string): Promise<void> {
        try {
            await this.keystore_directory.fill(dir, { timeout: 10000 });
        } catch (error) {
            console.error('Error while filling Keystore directory:', error);
            throw new Error('Failed to fill Keystore directory');
        }
  }

 async updateEditorYaml(keyPath: string, newValue: string): Promise<void> {
    const editorLocator = this.page.locator('//*[@id="monaco-editor-container"]/div'); 
    await editorLocator.click();
    await this.page.keyboard.press('Control+F'); 
    await this.page.waitForTimeout(500); 

    await this.page.keyboard.type(keyPath);
    await this.page.waitForTimeout(500); 

    await this.page.keyboard.press('Control+H'); 
    await this.page.waitForTimeout(500); 
    await this.page.keyboard.type(newValue);

    await this.page.keyboard.press('Control+Alt+Enter');
    await this.page.waitForTimeout(5000);

    console.log(`Replaced all appearances of "${keyPath}" with "${newValue}"`);
 }
}
export default CertificatesPage;
