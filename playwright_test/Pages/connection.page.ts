import { Page,Locator } from '@playwright/test';

class ConnectionPage{
  page: Page;
  host: Locator;
  port: Locator;
  userName: Locator;
  password: Locator;
  validateCredential: Locator;
  connectionPageTitle: Locator;
  continueButton: Locator;
  greenCheckIconSelector: Locator

  constructor(page: Page) {
    this.page = page;
    this.host = page.locator('label:has-text("Host") + div input#standard-required')
    this.port = page.locator('#standard-number')
    this.userName = page.locator('label:has-text("User Name") + div input#standard-required')
    this.password = page.locator('#standard-password-input')
    this.validateCredential = page.locator("//button[contains(text(), 'Validate credentials')]")
    this.connectionPageTitle = page.locator("//div[@class='MuiBox-root css-la96ob']/div")
    this.continueButton = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.continueButton = page.locator('.MuiButton-containedPrimary.MuiButton-sizeMedium')
    this.greenCheckIconSelector = page.locator('.MuiContainer-root svg[data-testid="CheckCircleIcon"]')
  }
  async fillConnectionDetails(host: string, port: string, username: string, password: string){
    console.log("Filling connection details...");
    await this.host.fill(host);
    await this.page.waitForTimeout(1000);
    await this.port.fill(port)
    await this.page.waitForTimeout(1000);
    await this.userName.fill(username)
    await this.page.waitForTimeout(1000);
    await this.password.fill(password);
	console.log("Connection details filled.");
  }

  async getHostValue(){
   const value = await this.host.inputValue();
   return value;
  }

  async getPortValue(){
   const value = await this.port.inputValue();
   return value;
  }

  async getUsernameValue(){
   const value = await this.userName.inputValue();
   return value;
  }

  async getConnectionPageTitle() {
    await this.page.waitForTimeout(1000);
    return await this.connectionPageTitle.textContent();
  }

  async fillPassword(password: string){
    await this.page.waitForTimeout(1000);
    await this.password.fill(password);
   }

  async SubmitValidateCredential(){
    console.log("Submitting credentials...");
    await this.page.waitForTimeout(1000);
    await this.validateCredential.click();
    console.log("Credentials submitted.");
  }

  async clickContinueButton() {
    await this.page.waitForTimeout(1000);
    return await this.continueButton.click();
  }

  async isContinueButtonVisible() {
    return await this.continueButton.isDisabled();
  }
  async isGreenCheckIconVisible() {
    return await this.greenCheckIconSelector.isHidden();
  }
}

export default ConnectionPage;