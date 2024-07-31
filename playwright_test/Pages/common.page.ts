import { Page, Locator } from '@playwright/test';

class CommonPage {
  page: Page;

  async getElementValue(element: Locator) {
    const elementValue = await element.getAttribute('value')
    return elementValue
  }

  async isElementHasValue(element: Locator) {
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
      await locator.waitFor({ timeout: 5000 });
      await this.page.waitForTimeout(500);
    } catch (error) {
    }
  }

}

export default CommonPage;