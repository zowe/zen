import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class NetworkingPage{
  page: Page;
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
    this.addDomainField = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/p[1]/button');
    this.domainName = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div/div/input');
    this.click_networking = page.locator('//span[text()="Networking"]');
    this.fillExternalDomainValue = page.locator('//*[@id=":r1f:"]');
    this.externalDomains = page.getByLabel('//p[text()="External Domains "]');
    this.externalPort = page.getByLabel('External Port');
    this.getExternalPortValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[3]/div/input');
    this.components = page.locator('//p[text()="components"]');
    this.metricService = page.locator('//strong[text()="metrics-service"]');
    this.metricServiceEnbaled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[2]');
    this.metricServiceDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[1]');
    this.metricServicePort = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[4]/div/input');
    this.zss = page.getByLabel('zss');
    this.zssTls = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[3]');
    this.zssPort = page.locator('//*[@id=":r1l:-label"]');
    this.zssEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[4]');
    this.explorerUss = page.locator('//strong[text()="explorer-uss"]');
    this.explorerUssEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[5]');
    this.jobsApi = page.locator('//strong[text()="jobs-api"]');
    this.jobsApiDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[6]');
    this.jobsApiEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[7]');
    this.jobsApiPort = page.locator('//*[@id=":r1n:-label"]');
    this.filesApi = page.locator('//strong[text()="files-api"]');
    this.filesApiDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[8]');
    this.filesApiEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[9]');
    this.filesApiPort = page.locator('//*[@id=":r1p:-label"]');
    this.explorerMvs = page.locator('//strong[text()="explorer-mvs"]');
    this.explorerMvsEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[10]');
    this.cloudGateway = page.locator('//strong[text()="cloud-gateway"]');
    this.cloudGatewayDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[11]');
    this.cloudGatewayEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[12]');
    this.cloudGatewayPort = page.locator('//*[@id=":r1r:-label"]');
    this.explorerJes = page.locator('//strong[text()="explorer-jes"]');
    this.explorerJesEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[13]');
    this.apiCatalog = page.locator('//strong[text()="api-catalog"]');
    this.apiCatalogDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[14]');
    this.apiCatalogEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[15]');
    this.apicatalogPort = page.locator('//*[@id=":r1t:-label"]');
    this.gateway = page.locator('//strong[text()="gateway"]');
    this.gatewayDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[16]');
    this.gatewayEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[17]');
    this.gatewayPort = page.locator('//*[@id=":r1v:-label"]');
    this.appServer = page.locator('//strong[text()="app-server"]');
    this.appServerDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[18]');
    this.appServerEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[19]');
    this.appServerPort = page.locator('//*[@id=":r21:-label"]');
    this.cachingService = page.locator('//strong[text()="caching-service"]');
    this.cachingServiceDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[20]');
    this.cachingServiceEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[21]');
    this.cachingServicePort = page.locator('//*[@id=":r23:-label"]');
    this.discovery = page.locator('//strong[text()="discovery"]');
    this.discoveryDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[22]');
    this.discoveryEnabled = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[23]');
    this.discoveryPort = page.locator('//*[@id=":r25:-label"]');

    this.metricService_debug_checkbox = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[1]/span[1]/input');
    this.metricService_enabled_checkbox = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[2]/span[1]/input');
    this.deleteDomainName = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/div[2]/button');
    this.readYaml = page.locator('div.view-lines');
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]');
    this.skip_button = page.locator('//button[contains(text(),"Skip")]');
    this.editor_title_element = page.locator('//h2[text()="Editor"]');
    this.NETWORKING_TITLE = page.locator(' //div[text()="Networking"]');
    this.licenseAgreement = page.locator('//button[contains(text(), "License Agreement")]');
    this.acceptLicense = page.locator('//html/body/div[2]/div[3]/div/div[2]/button[1]');
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation"]');
    this.view_yaml =  page.locator('//button[contains(text(),"View Yaml")]');
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "Preview Job")]');
    this.view_job_output =  page.locator('//button[contains(text(), "Submit Job")]');
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]');
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]');
    this.skip_button = page.locator('//button[contains(text(),"Skip")]');
    this.close_button = page.locator('//button[contains(text(), "Close")]');
    this.APFAUTH_TITLE = page.locator('//div[text()="APF Authorize Load Libraries"]');
    this.continue_ReviewSelector = page.locator('//button[contains(text(), "Continue to APF Auth Setup")]');
    this.installationTitle = page.locator('//div[text()="Installation"]');
  }

  async movetoNetworkingPage(){
   await this.licenseAgreement.click({timeout: 9000})
   await this.acceptLicense.click({timeout: 9000})
   await this.page.waitForTimeout(5000)
   await this.continueToComponentInstallation.click({timeout: 5000})
   await this.click_networking.click({timeout: 5000})
  }
  async returnTitleOfNetworkingPage(){
   const networking_title = await this.NETWORKING_TITLE.textContent();
   return networking_title;
  }

  async fillExternalDomainPort(port:string){
   await this.externalPort.fill(port, { timeout: 10000 })
  }

  async fillMetricServicePort(port:string){
  // Scroll down a bit
   await this.page.evaluate(() => {
      window.scrollBy(0, 200);
    });
   // Add a wait after scrolling
   await this.page.waitForTimeout(5000);
   await this.metricServicePort.fill(port, { timeout: 10000 })
  }

  async get_metricServiceport_value(){
   const value = await this.metricServicePort.inputValue();
   return value;
  }

  async fillExternalDomainName(externalDomainName: string){
   await this.domainName.fill(externalDomainName, { timeout: 10000 });
  }

  async fillexternal_domainvalues(externalDomainName:string, port: string){
   await this.fillExternalDomainName(externalDomainName, { timeout: 10000 });
   await this.fillExternalDomainPort(port, { timeout: 10000 })
  }
  async get_externalDomainName_value(){
   const value = await this.domainName.inputValue();
   return value;
  }
  async get_externalDomainport_value(){
   const value = await this.getExternalPortValue.inputValue();
   return value;
  }

  async click_checkBox(n:string){
    const xpathLocator = `//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[${n}]/span[1]/input`;

    const checkbox = await this.page.waitForSelector(xpathLocator, { state: 'visible' });

    if (checkbox) {
        const isChecked = await checkbox.evaluate((input) => input.checked);
        console.log('Is checkbox checked:', isChecked);

        if (!isChecked) {
            await checkbox.click();
            console.log('Checkbox clicked');
        } else {
            console.log('Checkbox is already checked');
        }
    } else {
        console.log('Checkbox not found');
  }
}


  async isCheckboxCheckedAndBlue(nthChild: string){
    const xpathLocator = `//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[${nthChild}]/span[1]/input`;

    const checkbox = await this.page.waitForSelector(xpathLocator);

    if (checkbox) {
        // Check if the checkbox is clicked
        const isChecked = await checkbox.evaluate((input) => input.checked);
        console.log('Is checkbox clicked:', isChecked);
        return isChecked;
    } else {
        console.log('Checkbox not found');
        return false;
    }
  }


  async delete_DomainNameField(){
   await this.deleteDomainName.click();
   }
  async add_DomainNameField(){
    await this.addDomainField.click()
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
  async is_skipNetworkingButtonEnable(){
   return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipNetworking(){
   await this.skip_button.click({ timeout: 2000 });
   const apfAuth_title = await this.APFAUTH_TITLE.textContent();
   return apfAuth_title;
  }

  async isPreviousButtonEnable(){
   return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage(){
   await this.previous_step_button.click({ timeout: 2000 });
   const installation_title = await this.installationTitle.textContent();
   return installation_title;
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
 export default NetworkingPage;