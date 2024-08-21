import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class NetworkingPage {
  page: Page;
  pageTitle: Locator;
  logLevel: Locator;
  fillLogLevel: Locator;
  previous_step_button: Locator;
  continueToApfAuthSetup: Locator;
  editor_title_element: Locator;
  skip_button: Locator;
  view_yaml: Locator;
  view_job_output: Locator;
  save_and_close: Locator;
  close_button: Locator;
  addDomainField: Locator;
  domainName: Locator;
  deleteDomainName: Locator
  externalDomains: Locator;
  externalPort: Locator;
  getExternalPortValue: Locator;
  components: Locator;
  metricService: Locator;
  metricServicePort: Locator;
  zss: Locator;
  explorerUss: Locator;
  jobsApi: Locator;
  filesApi: Locator;
  filesApiDebug: Locator;
  explorerMvs: Locator;
  cloudGateway: Locator;
  explorerJes: Locator;
  apiCatalog: Locator;
  gateway: Locator;
  appServer: Locator;
  cachingService: Locator;
  discovery: Locator;
  explorerUSS_debug_checkbox: Locator;
  app_server_debug: Locator;
  metricService_debug_checkbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.addDomainField = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/p[1]/button');
    this.domainName = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[2]/div/div/input');
    this.deleteDomainName = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/div[2]/button');
    this.externalDomains = page.getByLabel('//p[text()="External Domains "]');
    this.externalPort = page.getByLabel('External Port');
    this.getExternalPortValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div[3]/div/input');
    this.components = page.locator('//p[text()="components"]');
    this.metricService = page.locator('//strong[text()="metrics-service"]');
    this.metricServicePort = page.locator('//input[@id=":rdd:"]');
    this.zss = page.getByLabel('zss');
    this.explorerUss = page.locator('//strong[text()="explorer-uss"]');
    this.jobsApi = page.locator('//strong[text()="jobs-api"]');
    this.filesApi = page.locator('//strong[text()="files-api"]');
    this.filesApiDebug = page.locator('//*[@id="zen-root-container"]/div[2]/div/div[4]/div/form/div/div[2]/label[8]');
    this.explorerMvs = page.locator('//strong[text()="explorer-mvs"]');
    this.cloudGateway = page.locator('//strong[text()="cloud-gateway"]');
    this.explorerJes = page.locator('//strong[text()="explorer-jes"]');
    this.apiCatalog = page.locator('//strong[text()="api-catalog"]');
    this.gateway = page.locator('//strong[text()="gateway"]');
    this.appServer = page.locator('//strong[text()="app-server"]');
    this.cachingService = page.locator('//strong[text()="caching-service"]');
    this.discovery = page.locator('//strong[text()="discovery"]');
    this.previous_step_button = page.locator('//button[contains(text(),"Previous step")]');
    this.skip_button = page.locator('//button[contains(text(),"Skip")]');
    this.editor_title_element = page.locator('//h2[text()="Editor"]');
    this.view_yaml = page.locator('//button[contains(text(),"View/Edit Yaml")]');
    this.view_job_output = page.locator('//button[contains(text(),"View Job Output")]');
    this.save_and_close = page.locator('//button[contains(text(),"Save & close")]');
    this.skip_button = page.locator('//button[contains(text(),"Skip")]');
    this.close_button = page.locator('//button[contains(text(), "Close")]');
    this.continueToApfAuthSetup = page.locator('//button[contains(text(), "Continue to APF Auth Setup")]');
    this.explorerUSS_debug_checkbox = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[4]/div[1]/label/span[1]/input');
    this.app_server_debug = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[11]/div[1]/label/span[1]/input');
    this.metricService_debug_checkbox = page.locator('//*[@id="container-box-id"]/form/div/div[2]/div[4]/div/div[1]/div[1]/label/span[1]/input');
  }

  commonPage = new CommonPage();

  async getPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async fillExternalDomainPort(port: string,  p0: { timeout: number; }) {
    await this.commonPage.waitForElement(this.externalPort)
    await this.externalPort.clear({ timeout: 2000 })
    await this.externalPort.fill(port, { timeout: 10000 })
  }

  async fillMetricServicePort(port: string) {
    await this.metricServicePort.waitFor({ state: 'visible', timeout: 10000 });
    await this.metricServicePort.fill(port, { timeout: 10000 });

  }

  async get_metricServiceport_value(): Promise<string> {
    await this.commonPage.waitForElement(this.metricServicePort)
    return await this.metricServicePort.inputValue();
  }

  async fillExternalDomainName(externalDomainName: string, p0: { timeout: number; }) {
    await this.commonPage.waitForElement(this.domainName)
    await this.domainName.clear({ timeout: 2000 })
    await this.domainName.fill(externalDomainName, { timeout: 10000 });
  }

  async fillexternal_domainvalues(externalDomainName: string, port: string) {
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
    try {
      const checkbox = await this.page.waitForSelector(xpath, { state: 'visible' });
      const isChecked = await checkbox.evaluate((input) => input.checked);
      if (!isChecked) {
        await checkbox.click();
      }
    }
    catch (error) {
      console.error(`Error checking checkbox with XPath "${xpath}":`, error);
    }
  }

  async isCheckboxCheckedAndBlue(xpath: string): Promise<boolean> {
    try {
      const checkbox = await this.page.waitForSelector(xpath);
      if (checkbox) {
        const isChecked = await checkbox.evaluate((input) => input.checked);
        return isChecked;
      } else {
        return false;
      }
    }
    catch (error) {
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

  async click_previewJob() {
    await this.commonPage.waitForElement(this.view_job_output)
    this.view_job_output.click({ timeout: 2000 })
  }

  async is_skipNetworkingButtonEnable() {
    await this.commonPage.waitForElement(this.skip_button)
    return await this.skip_button.isEnabled({ timeout: 5000 });
  }

  async click_skipNetworking() {
    await this.commonPage.waitForElement(this.skip_button)
    const isEnabled = await this.is_skipNetworkingButtonEnable();
    if (isEnabled) {
        await this.skip_button.click({ timeout: 2000 });
    } else {
        throw new Error('Skip button is not enabled and cannot be clicked.');
    }
  }

  async isPreviousButtonEnable() {
    await this.commonPage.waitForElement(this.previous_step_button)
    return await this.previous_step_button.isEnabled({ timeout: 50000 });
  }

  async click_PreviousStep() {
    await this.commonPage.waitForElement(this.previous_step_button)
    await this.previous_step_button.click({ timeout: 2000 });
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

    return allText;
  }

}
export default NetworkingPage;