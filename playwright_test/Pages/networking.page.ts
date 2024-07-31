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
  }

  commonPage = new CommonPage();

  async getPageTitle() {
    await this.commonPage.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async fillExternalDomainPort(port: string, p0: { timeout: number; }) {
    await this.commonPage.waitForElement(this.externalPort)
    await this.externalPort.clear({ timeout: 2000 })
    await this.externalPort.fill(port, { timeout: 10000 })
  }

  async fillMetricServicePort(port: string) {
    // Scroll down a bit
    await this.page.evaluate(() => {
      window.scrollBy(0, 200);
    });
    // Add a wait after scrolling
    await this.commonPage.waitForElement(this.metricServicePort)
    // await this.metricServicePort.clear({ timeout: 2000 })
    await this.metricServicePort.fill(port, { timeout: 10000 })
  }

  async get_metricServiceport_value() {
    await this.commonPage.waitForElement(this.metricServicePort)
    const value = await this.metricServicePort.inputValue();
    return value;
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

  async click_checkBox(n: string) {
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

  async isCheckboxCheckedAndBlue(nthChild: string) {
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
    await this.skip_button.click({ timeout: 2000 });
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