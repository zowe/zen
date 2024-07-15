import { Page, Locator } from '@playwright/test';
import CommonPage from '../Pages/common.page.ts';

class ConnectionPage {
  page: Page;
  host: Locator;
  port: Locator;
  userName: Locator;
  password: Locator;
  validateCredential: Locator;
  connectionPageTitle: Locator;
  continueButton: Locator;
  greenCheckIconSelector: Locator
  save_and_close: Locator;
  resumeProgress: Locator;

  constructor(page: Page) {
    this.page = page;
    this.host = page.locator('label:has-text("Host") + div input#standard-required')
    this.port = page.locator('#standard-number')
    this.userName = page.locator('label:has-text("User Name") + div input#standard-required')
    this.password = page.locator('#standard-password-input')
    this.validateCredential = page.locator("//button[contains(text(), 'Validate credentials')]")
    this.connectionPageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.continueButton = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.save_and_close = page.locator('//button[contains(text(),"Save & close")]')
    this.resumeProgress = page.locator('//button[contains(text(),"Resume Progress")]')
    this.greenCheckIconSelector = page.locator('.MuiContainer-root svg[data-testid="CheckCircleIcon"]')
  }

  commonPage = new CommonPage();

  async fillConnectionDetails(host: string, port: string, username: string, password: string) {
    await this.commonPage.waitForElement(this.host)
    await this.host.clear({ timeout: 2000 })
    await this.host.fill(host)
    await this.commonPage.validateElementValue(this.host, host)
    await this.commonPage.waitForElement(this.port)
    await this.port.clear({ timeout: 2000 })
    await this.port.fill(port)
    await this.commonPage.validateElementValue(this.port, port)
    await this.commonPage.waitForElement(this.userName)
    await this.userName.clear({ timeout: 2000 })
    await this.userName.fill(username)
    await this.commonPage.validateElementValue(this.userName, username)
    await this.commonPage.waitForElement(this.password)
    await this.password.clear({ timeout: 2000 })
    await this.password.fill(password)
    await this.commonPage.validateElementValue(this.password, password)
    return true
  }

  async performLogin(host: string, port: string, username: string, password: string) {
    const connectionDetailsFilled = await this.fillConnectionDetails(host, port, username, password);
    if (connectionDetailsFilled) {
      this.SubmitValidateCredential();
    } else {
      this.fillConnectionDetails(host, port, username, password);
      this.SubmitValidateCredential();
    }
  }

  async getHostValue() {
    await this.commonPage.waitForElement(this.host)
    const value = await this.host.inputValue();
    return value;
  }

  async getPortValue() {
    await this.commonPage.waitForElement(this.port)
    const value = await this.port.inputValue();
    return value;
  }

  async getUsernameValue() {
    await this.commonPage.waitForElement(this.userName)
    const value = await this.userName.inputValue();
    return value;
  }

  async getConnectionPageTitle() {
    await this.commonPage.waitForElement(this.connectionPageTitle)
    return await this.connectionPageTitle.textContent();
  }

  async SubmitValidateCredential() {
    await this.commonPage.waitForElement(this.validateCredential)
    await this.validateCredential.click()
  }

  async clickContinueButton() {
    await this.commonPage.waitForElement(this.continueButton)
    return await this.continueButton.click();
  }

  async click_saveAndClose() {
    await this.commonPage.waitForElement(this.save_and_close)
    this.save_and_close.click({ timeout: 5000 })
  }

  async isContinueButtonVisible() {
    await this.commonPage.waitForElement(this.continueButton)
    return await this.continueButton.isDisabled();
  }

  async isGreenCheckIconVisible() {
    await this.commonPage.waitForElement(this.greenCheckIconSelector)
    return await this.greenCheckIconSelector.isHidden();
  }

  async click_resumeProgress() {
    await this.commonPage.waitForElement(this.resumeProgress)
    this.resumeProgress.click({ timeout: 5000 })
  }

}

export default ConnectionPage;