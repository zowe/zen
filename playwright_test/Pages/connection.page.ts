import { Page,Locator } from '@playwright/test';

class ConnectionPage{
  page: Page;
  host: Locator;
  port: Locator;
  userName: Locator;
  password: Locator;
  validateCredential: Locator;
  connectionPageTitle: Locator
  continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.host = page.locator('label:has-text("Host") + div input#standard-required')
    this.port = page.locator('#standard-number')
    this.userName = page.locator('label:has-text("User Name") + div input#standard-required')
    this.password = page.locator('#standard-password-input')
    this.validateCredential = page.locator("//button[contains(text(), 'Validate credentials')]")
    this.connectionPageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.continueButton = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')

  }
  async fillConnectionDetails(host: string, port: string, username: string, password: string){
    await this.page.waitForTimeout(500);
    await this.host.fill(host)
    await this.page.waitForTimeout(500);
    await this.port.fill(port)
    await this.page.waitForTimeout(500);
    await this.userName.fill(username)
    await this.page.waitForTimeout(500);
    await this.password.fill(password)
  }

  async getConnectionPageTitle() {
    await this.page.waitForTimeout(1000);
    return await this.connectionPageTitle.textContent();
  }

  async SubmitValidateCredential(){
    await this.page.waitForTimeout(1000);
    await this.validateCredential.click()
  }

  async clickContinueButton() {
    await this.page.waitForTimeout(1000);
    return await this.continueButton.click();
  }

}

  export default ConnectionPage;