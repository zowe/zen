import { Page, Locator, expect } from '@playwright/test';

class CommonPage {
  page: Page;

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
      await this.page.waitForTimeout(1000);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.error('Error while checking visibility of locator', error);
      return false;
    }
    await this.page.waitForTimeout(2000);
  }

}

export default CommonPage;