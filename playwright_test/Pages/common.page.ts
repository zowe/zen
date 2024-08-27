import { Page, Locator } from '@playwright/test';

class CommonPage {
  page: Page;
  pageTitle: Locator;
  previous_step_button: Locator;
  save_and_close_button: Locator;
  skip_button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.previous_step_button = page.locator("//button[text()='Previous step']")
    this.save_and_close_button = page.locator("//button[text()='Save & close']")
    this.skip_button = page.locator('//button[contains(text(),"Skip")]')
  }

  async getElementValue(element: Locator) {
    const elementValue = await element.getAttribute('value')
    return elementValue
  }

  async isElementHasValue(element: Locator): Promise<boolean> {
    const elementValue = await element.getAttribute('value')
    if (elementValue !== null && elementValue !== '') {
      return true
    } else {
      return false
    }
  }

  async validateElementValue(textBoxLocator: Locator, expectedValue: string): Promise<boolean> {
    const insertedValue = await textBoxLocator.inputValue();
    return insertedValue === expectedValue;
  }

  async waitForElement(locator: Locator) {
    try {
      await this.page.waitForTimeout(500);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.error('Error while checking visibility of locator', error);
      return false;
    }
  }

  async getPageTitle() {
    await this.waitForElement(this.pageTitle)
    return await this.pageTitle.textContent({ timeout: 2000 });
  }

  async isPreviousButtonEnable() {
    await this.waitForElement(this.previous_step_button)
    return await this.previous_step_button.isEnabled({ timeout: 5000 });
  }

  async clickPreviousStep() {
    await this.waitForElement(this.previous_step_button)
    await this.previous_step_button.click()
  }

  async clickSaveAndClose() {
    await this.waitForElement(this.save_and_close_button)
    this.save_and_close_button.click({ timeout: 2000 })
  }

  async isSkipButtonEnable() {
    await this.waitForElement(this.skip_button)
    return await this.skip_button.isEnabled({ timeout: 2000 });
  }

  async isSkipButtonDisable() {
    await this.waitForElement(this.skip_button)
    return await this.skip_button.isDisabled({ timeout: 2000 })
  }

  async clickSkipStep() {
    await this.waitForElement(this.skip_button)
    const isEnabled = await this.isSkipButtonEnable();
    if (isEnabled) {
      await this.skip_button.click({ timeout: 2000 });
    } else {
      throw new Error('Skip button is not enabled and cannot be clicked.');
    }
  }
}
export default CommonPage;