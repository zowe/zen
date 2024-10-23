import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class NetworkingPage {
  page: Page;
  fillValidation: Locator;
  logLevel: Locator;
  fillLogLevel: Locator;
  readYaml: Locator;
  previous_step_button: Locator;
  continueToApfAuthSetup: Locator;
  editor_title_element: Locator;
  licenseAgreement: Locator;
  acceptLicense: Locator;
  skip_button: Locator;
  view_yaml: Locator;
  view_submit_job: Locator;
  view_job_output: Locator;
  save_and_close: Locator;
  previous_step: Locator;
  close_button: Locator;
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
    this.metricServicePort = page.locator('input[id=":rq:"]');
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
    this.explorerUSS_debug_checkbox = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[4]/div[1]/label/span[1]/input');
	this.app_server_debug = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[11]/div[1]/label/span[1]/input');
    this.metricService_debug_checkbox = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[1]/div[1]/label/span[1]/input');
    this.metricService_enabled_checkbox = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[2]/span[1]/input');
    this.deleteDomainName = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/div[2]/button');
    this.readYaml = page.locator('div.view-lines');
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]');
    this.editor_title_element = page.locator('//h2[text()="Editor"]');
    this.NETWORKING_TITLE = page.locator(' //div[text()="Networking"]');
    this.licenseAgreement = page.locator('//button[contains(text(), "License Agreement")]');
    this.acceptLicense = page.locator('//html/body/div[2]/div[3]/div/div[2]/button[1]');
    this.continueToComponentInstallation = page.locator('//button[contains(text(), "Continue to Components Installation")]');
    this.view_yaml =  page.locator('//button[contains(text(), "View/Edit Yaml")]');
    this.viewAndSubmitJob =  page.locator('//button[contains(text(), "Preview Job")]');
    this.view_job_output =  page.locator('//button[contains(text(), "Submit Job")]');
    this.save_and_close =  page.locator('//button[contains(text(),"Save & close")]');
    this.previous_step = page.locator('//button[contains(text(),"Previous step")]');
    this.skip_button = page.locator('//button[contains(text(),"Skip ")]');
	//*[@id="zen-root-container"]/div[2]/div/div[5]/button[2]
    this.close_button = page.locator("//button[text()='Close']");
    this.APFAUTH_TITLE = page.locator('//div[text()="APF Authorize Load Libraries"]');
    this.continueToApfAuthSetup = page.locator('//button[contains(text(), "Continue to APF Auth Setup")]');
    this.installationTitle = page.locator('//div[text()="Installation"]');
  }

  commonPage = new CommonPage();

  async movetoNetworkingPage() {
    await this.commonPage.waitForElement(this.licenseAgreement)
    await this.licenseAgreement.click({ timeout: 9000 })
    await this.commonPage.waitForElement(this.acceptLicense)
    await this.acceptLicense.click({ timeout: 9000 })
    await this.commonPage.waitForElement(this.continueToComponentInstallation)
    await this.continueToComponentInstallation.click({ timeout: 5000 })
    await this.commonPage.waitForElement(this.click_networking)
    await this.click_networking.click({ timeout: 5000 })
  }

  async returnTitleOfNetworkingPage() {
    await this.commonPage.waitForElement(this.NETWORKING_TITLE)
    const networking_title = await this.NETWORKING_TITLE.textContent();
    return networking_title;
  }

  async fillExternalDomainPort(port: number){
   await this.externalPort.fill(port, { timeout: 10000 })
  }

  async fillMetricServicePort(port: string){
    await this.metricServicePort.waitFor({ state: 'visible', timeout: 10000 });
    await this.metricServicePort.fill(port, { timeout: 10000 });
  }

  async get_metricServiceport_value(): Promise<string> {
   return await this.metricServicePort.inputValue();
  }

  async fillExternalDomainName(externalDomainName: string, p0: { timeout: number; }) {
    await this.commonPage.waitForElement(this.domainName)
    await this.domainName.clear({ timeout: 2000 })
    await this.domainName.fill(externalDomainName, { timeout: 10000 });
  }

  async fillexternal_domainvalues(externalDomainName:string, port: number){
   await this.fillExternalDomainName(externalDomainName, { timeout: 10000 });
   await this.fillExternalDomainPort(port, { timeout: 10000 })
  }

  async get_externalDomainName_value() {
    await this.commonPage.waitForElement(this.domainName)
    const value = await this.domainName.inputValue();
    return value;
  }

  async get_externalDomainport_value() {
    await this.commonPage.waitForElement(this.getExternalPortValue)
    const value = await this.getExternalPortValue.inputValue();
    return value;
  }

  async click_checkBox(xpath: string): Promise<void> {
    //const html = await this.page.content(); // Get the HTML content
    //console.log(html);
    try {
	  const checkbox = await this.page.waitForSelector(xpath, { state: 'visible' });
	  const isChecked = await checkbox.evaluate((input) => input.checked);
      if (!isChecked) {
        await checkbox.click();
	  }
	 } catch (error) {
        console.error(`Error checking checkbox with XPath "${xpath}":`, error);
        return false;
     }
  }



  async isCheckboxCheckedAndBlue(xpath: string): Promise<boolean>{
    try{
      const checkbox = await this.page.waitForSelector(xpath);
      if (checkbox) {
          const isChecked = await checkbox.evaluate((input) => input.checked);
          return isChecked;
      } else {
          return false;
      }
	 } catch (error){
	   console.log('Checkbox not found');
       return false;

	 }
  }

  async isMetricsServiceDebugChecked(): Promise<boolean> {
    return await this.isCheckboxCheckedAndBlue(this.metricService_debug_checkbox);
  }

  async clickMetricsServiceDebug(): Promise<void> {
    await this.click_checkBox(this.metricService_debug_checkbox);
  }

  async isExplorerUssDebugChecked(): Promise<boolean> {
    return await this.isCheckboxCheckedAndBlue(this.explorerUSS_debug_checkbox);
  }

  async isAppServerDebugChecked(): Promise<boolean> {
    return await this.isCheckboxCheckedAndBlue(this.app_server_debug);
  }

  async clickExplorerUssDebug(): Promise<void> {
    await this.click_checkBox(this.explorerUSS_debug_checkbox);
  }

  async clickAppServerDebug(): Promise<void> {
    await this.click_checkBox(this.app_server_debug);
  }

  async delete_DomainNameField() {
    await this.commonPage.waitForElement(this.deleteDomainName)
    await this.deleteDomainName.click();
  }

  async add_DomainNameField() {
    await this.commonPage.waitForElement(this.addDomainField)
    await this.addDomainField.click()
  }

  async viewYaml() {
    await this.commonPage.waitForElement(this.view_yaml)
    await this.view_yaml.click({ timeout: 5000 })
  }

  async closeButton() {
    await this.commonPage.waitForElement(this.close_button)
    this.close_button.click({ timeout: 2000 })
  }

  async click_viewAndSubmitJob() {
    await this.commonPage.waitForElement(this.viewAndSubmitJob)
    this.viewAndSubmitJob.click({ timeout: 2000 })
  }

  async click_previewJob() {
    await this.commonPage.waitForElement(this.view_job_output)
    this.view_job_output.click({ timeout: 2000 })
  }

  async is_skipNetworkingButtonEnable() {
    await this.commonPage.waitForElement(this.skip_button)
    return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipNetworking(){
   const isEnabled = await this.is_skipNetworkingButtonEnable();
    if (isEnabled) {
        await this.skip_button.click({ timeout: 2000 });
    } else {
        throw new Error('Skip button is not enabled and cannot be clicked.');
    }
  }

  async isPreviousButtonEnable() {
    await this.commonPage.waitForElement(this.previous_step)
    return await this.previous_step.isEnabled({ timeout: 50000 });
  }

  async returnTitleOfPrevPage() {
    await this.commonPage.waitForElement(this.previous_step_button)
    await this.previous_step_button.click({ timeout: 2000 });
    await this.commonPage.waitForElement(this.installationTitle)
    const installation_title = await this.installationTitle.textContent();
    return installation_title;
  }

  async open_monacoEditor() {
    await this.commonPage.waitForElement(this.view_yaml)
    this.view_yaml.click({ timeout: 5000 })
    await this.commonPage.waitForElement(this.editor_title_element)
    const editor_title = await this.editor_title_element.textContent();
    return editor_title;
  }

  async clickContinueToApfAuthSetup() {
    await this.commonPage.waitForElement(this.continueToApfAuthSetup)
    await this.continueToApfAuthSetup.click();
  }

  async isContinueButtonDisable() {
    await this.commonPage.waitForElement(this.continueToApfAuthSetup)
    return await this.continueToApfAuthSetup.isDisabled({ timeout: 5000 });
  }

  async click_saveAndClose() {
    await this.commonPage.waitForElement(this.save_and_close)
    this.save_and_close.click({ timeout: 2000 })
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

}
export default NetworkingPage;