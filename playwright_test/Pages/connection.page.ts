import { Page,ElectronApplication, Locator,_electron as electron } from '@playwright/test';
let electronApp: ElectronApplication

class ConnectionPage{
  page: Page;
  host: Locator;
  port: Locator;
  userName: Locator;
  password: Locator;
  validateCredential: Locator;
  continueButton: Page;
  greenCheckIconSelector: Page


  constructor(page: Page) {
    this.page = page;
    this.host = page.locator('label:has-text("Host") + div input#standard-required')
    this.port = page.locator('#standard-number')
    this.userName = page.locator('label:has-text("User Name") + div input#standard-required')
    this.password = page.locator('#standard-password-input')
    this.validateCredential = page.locator("//button[contains(text(), 'Validate credentials')]")
    this.continueButton = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.greenCheckIconSelector = page.locator('.MuiContainer-root svg[data-testid="CheckCircleIcon"]')

  }
  async fillConnectionDetails(host: string, port: string, username: string, password: string){
    await this.host.fill(host)
    await this.port.fill(port)
    await this.userName.fill(username)
    await this.password.fill(password)
  }
  async SubmitValidateCredential(){
    await this.validateCredential.click()

  }
  async isContinueButtonVisible() {
    return await this.continueButton.isDisabled();
  }
  async clickContinueButton() {
    return await this.continueButton.click();
  }
 async isGreenCheckIconVisible() {
    return await this.greenCheckIconSelector.isHidden();
  }
}

  export default ConnectionPage;