import { Page, Locator } from '@playwright/test';
import CommonPage from './common.page';

class LaunchConfigPage {
  page: Page;
  logLevel: Locator;
  fillLogLevel: Locator;
  continueToReviewPage: Locator;
  editor_title_element: Locator;
  view_yaml: Locator;
  view_job_output: Locator;
  close_button: Locator;
  validation: Locator;
  componentConfig: Locator;
  fillConfigLaunchValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.validation = page.getByLabel('Validation');
    this.logLevel = page.getByLabel('LogLevel');
    this.componentConfig = page.getByLabel('On Component Configure Fail');
    this.fillConfigLaunchValue = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div/div[2]/div/div/div/input')
    this.fillLogLevel = page.locator('//html/body/div/div[2]/div/div[4]/div/form/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div/div[1]/div/div/div/input')
    this.editor_title_element = page.locator('//h2[text()="Editor"]')
    this.view_yaml = page.locator('//button[contains(text(),"View/Edit Yaml")]')
    this.view_job_output = page.locator('//button[contains(text(), "View Job Output")]')
    this.close_button = page.locator('//button[contains(text(), "Close")]')
    this.continueToReviewPage = page.locator('//button[contains(text(), "Review")]')
  }

  commonPage = new CommonPage();

  async fillvalues(validation: string) {
    await this.page.fill('input[id="#/properties/configmgr/properties/validation"]', validation, { timeout: 10000 });
  }

  async fillvalues_logLevel(logLevel: string) {
    await this.commonPage.waitForElement(this.fillLogLevel)
    await this.fillLogLevel.clear({ timeout: 2000 })
    await this.fillLogLevel.fill(logLevel, { timeout: 10000 })
  }

  async fillvaluescomponentConfig(componentConfig: string) {
    await this.commonPage.waitForElement(this.fillConfigLaunchValue)
    await this.fillConfigLaunchValue.clear({ timeout: 2000 })
    await this.fillConfigLaunchValue.fill(componentConfig, { timeout: 10000 })
  }

  async get_validation_value() {
    const inputLocator = this.page.locator('input[id="#/properties/configmgr/properties/validation"]');
    await this.commonPage.waitForElement(inputLocator)
    const value = await inputLocator.inputValue();
    return value;
  }

  async get_validation_error_msg() {
    const errorText = await this.page.locator('//p[text()="is a required property"]').textContent();
    return errorText;
  }

  async get_logLevel_value() {
    await this.commonPage.waitForElement(this.fillLogLevel)
    const value = await this.fillLogLevel.inputValue();
    return value;
  }

  async get_componentConfig_value() {
    const value = await this.fillConfigLaunchValue.inputValue();
    return value;
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

  async clickContinueToReviewPage() {
    await this.commonPage.waitForElement(this.continueToReviewPage)
    await this.continueToReviewPage.click();
  }

  async isContinueButtonDisable() {
    await this.commonPage.waitForElement(this.continueToReviewPage)
    return await this.continueToReviewPage.isDisabled({ timeout: 5000 });
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

    return allText;
  }
}
export default LaunchConfigPage;